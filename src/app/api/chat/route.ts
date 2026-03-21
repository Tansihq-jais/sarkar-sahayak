import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { cookies } from "next/headers";
import { buildSystemPrompt } from "@/lib/promptBuilder";
import { checkRateLimit } from "@/lib/rateLimiter";
import { saveMessages, createChatSession } from "@/lib/saveChat";
import type { DocumentChunk } from "@/types";

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL ?? "http://localhost:11434";
const OLLAMA_URL = `${OLLAMA_BASE_URL}/api/chat`;
const MODEL = process.env.OLLAMA_MODEL ?? "gemma2:2b";
const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:8000";
const PINECONE_API_KEY = process.env.PINECONE_API_KEY ?? "";
const PINECONE_INDEX = process.env.PINECONE_INDEX_NAME ?? "sarkar-sahayak";

const MessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1).max(10000),
});

const ChatRequestSchema = z.object({
  messages: z.array(MessageSchema).min(1).max(50),
  documentChunks: z.array(z.object({
    index: z.number(),
    text: z.string(),
    charStart: z.number(),
    charEnd: z.number(),
  })).max(200),
  schemeName: z.string().optional(),
  sessionId: z.string().optional(),
  schemeId: z.string().optional(),
  useRag: z.boolean().optional().default(false),
});

// ── RAG: fetch relevant chunks from backend ───────────────
async function fetchRagChunks(
  query: string,
  documentIds: string[],
  topK: number = 5
): Promise<DocumentChunk[]> {
  if (!PINECONE_API_KEY || !documentIds.length) return [];

  try {
    const res = await fetch(`${BACKEND_URL}/documents/query`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, document_ids: documentIds, top_k: topK }),
      signal: AbortSignal.timeout(5000),
    });

    if (!res.ok) return [];

    const data = await res.json();
    return (data.chunks ?? []).map((c: { chunk_index: number; text: string; score: number }, i: number) => ({
      index: c.chunk_index ?? i,
      text: c.text,
      charStart: 0,
      charEnd: c.text.length,
    }));
  } catch {
    return [];
  }
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: "Invalid JSON", code: "INVALID_JSON" }, { status: 400 }); }

  const parsed = ChatRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request", code: "VALIDATION_ERROR" }, { status: 400 });
  }

  const { messages, documentChunks, schemeName, sessionId: bodySessionId, schemeId, useRag } = parsed.data;

  const cookieStore = await cookies();
  const sessionId = cookieStore.get("ss_session")?.value ?? bodySessionId ?? "anonymous";

  const rateLimit = await checkRateLimit(sessionId);
  if (!rateLimit.allowed) {
    return NextResponse.json({
      error: "Rate limit exceeded. You can send 20 messages per hour.",
      code: "RATE_LIMITED",
      retryAfter: Math.ceil((rateLimit.resetAt - Date.now()) / 1000),
    }, { status: 429 });
  }

  // ── RAG: try to get better chunks from Pinecone ──────────
  let finalChunks = documentChunks as DocumentChunk[];
  if (useRag && schemeId) {
    const lastUserMsg = [...messages].reverse().find(m => m.role === "user");
    if (lastUserMsg) {
      const ragChunks = await fetchRagChunks(lastUserMsg.content, [schemeId]);
      if (ragChunks.length > 0) {
        finalChunks = ragChunks;
      }
    }
  }

  const systemPrompt = buildSystemPrompt({
    documentChunks: finalChunks,
    schemeName,
  });

  // ── Persist user message to Supabase (fire and forget) ───
  const userMessage = messages[messages.length - 1];
  if (userMessage?.role === "user") {
    saveMessages({
      sessionId,
      schemeId: schemeId ?? null,
      schemeName: schemeName ?? null,
      messages: [{ role: "user", content: userMessage.content, sequenceNum: messages.length - 1 }],
    }).catch(console.error);
  }

  // ── Call Ollama ───────────────────────────────────────────
  try {
    const ollamaResponse = await fetch(OLLAMA_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: MODEL,
        stream: true,
        options: { temperature: 0.1, num_predict: 1500 },
        messages: [
          { role: "system", content: systemPrompt },
          ...messages.map((m) => ({ role: m.role, content: m.content })),
        ],
      }),
    });

    if (!ollamaResponse.ok) {
      if (ollamaResponse.status === 404) {
        return NextResponse.json(
          { error: `Model "${MODEL}" not found. Run: ollama pull ${MODEL}`, code: "MODEL_NOT_FOUND" },
          { status: 500 }
        );
      }
      return NextResponse.json(
        { error: "Ollama error. Make sure Ollama is running: ollama serve", code: "AI_ERROR" },
        { status: 502 }
      );
    }

    let fullAssistantResponse = "";

    const readable = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        const reader = ollamaResponse.body!.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() ?? "";

            for (const line of lines) {
              const trimmed = line.trim();
              if (!trimmed) continue;
              try {
                const json = JSON.parse(trimmed);
                const text = json.message?.content;
                if (text) {
                  fullAssistantResponse += text;
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
                }
                if (json.done === true) {
                  // Persist assistant response to Supabase
                  if (fullAssistantResponse) {
                    saveMessages({
                      sessionId,
                      schemeId: schemeId ?? null,
                      schemeName: schemeName ?? null,
                      messages: [{ role: "assistant", content: fullAssistantResponse, sequenceNum: messages.length }],
                    }).catch(console.error);
                  }
                  controller.enqueue(encoder.encode("data: [DONE]\n\n"));
                  controller.close();
                  return;
                }
              } catch { /* ignore */ }
            }
          }
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        } catch (err) {
          const msg = err instanceof Error ? err.message : "Stream error";
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: msg })}\n\n`));
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "X-RateLimit-Remaining": String(rateLimit.remaining),
        "X-RateLimit-Reset": String(rateLimit.resetAt),
      },
    });
  } catch (err) {
    console.error("Ollama fetch error:", err);
    const isConnectionRefused = err instanceof Error &&
      (err.message.includes("ECONNREFUSED") || err.message.includes("fetch failed"));
    if (isConnectionRefused) {
      return NextResponse.json(
        { error: "Ollama is not running. Start it with: ollama serve", code: "OLLAMA_NOT_RUNNING" },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: "Failed to reach Ollama. Is it running?", code: "AI_ERROR" },
      { status: 500 }
    );
  }
}
