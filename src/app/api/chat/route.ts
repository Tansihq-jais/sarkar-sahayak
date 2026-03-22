import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { cookies } from "next/headers";
import { buildSystemPrompt } from "@/lib/promptBuilder";
import { checkRateLimit } from "@/lib/rateLimiter";
import { saveMessages } from "@/lib/saveChat";
import type { DocumentChunk } from "@/types";

// Groq — free API, very fast, no credit card needed
// Get key at: https://console.groq.com
// Free models: llama-3.3-70b-versatile, llama-3.1-8b-instant, gemma2-9b-it
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_API_KEY = process.env.GROQ_API_KEY ?? "";
const MODEL = process.env.GROQ_MODEL ?? "llama-3.3-70b-versatile";
const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:8000";

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

async function fetchRagChunks(query: string, documentIds: string[], topK = 5): Promise<DocumentChunk[]> {
  if (!documentIds.length) return [];
  try {
    const res = await fetch(`${BACKEND_URL}/documents/query`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, document_ids: documentIds, top_k: topK }),
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.chunks ?? []).map((c: { chunk_index: number; text: string }, i: number) => ({
      index: c.chunk_index ?? i, text: c.text, charStart: 0, charEnd: c.text.length,
    }));
  } catch { return []; }
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

  if (!GROQ_API_KEY) {
    return NextResponse.json(
      { error: "Groq API key not configured. Add GROQ_API_KEY to .env.local", code: "NO_API_KEY" },
      { status: 500 }
    );
  }

  // RAG: get relevant chunks from Pinecone if available
  let finalChunks = documentChunks as DocumentChunk[];
  if (useRag && schemeId) {
    const lastUserMsg = [...messages].reverse().find(m => m.role === "user");
    if (lastUserMsg) {
      const ragChunks = await fetchRagChunks(lastUserMsg.content, [schemeId]);
      if (ragChunks.length > 0) finalChunks = ragChunks;
    }
  }

  const systemPrompt = buildSystemPrompt({ documentChunks: finalChunks, schemeName });

  try {
    const groqResponse = await fetch(GROQ_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        stream: true,
        max_tokens: 1500,
        temperature: 0.1,
        messages: [
          { role: "system", content: systemPrompt },
          ...messages.map((m) => ({ role: m.role, content: m.content })),
        ],
      }),
    });

    if (!groqResponse.ok) {
      const errBody = await groqResponse.json().catch(() => ({}));
      console.error("Groq error:", groqResponse.status, errBody);
      if (groqResponse.status === 401) {
        return NextResponse.json({ error: "Invalid Groq API key.", code: "INVALID_API_KEY" }, { status: 401 });
      }
      if (groqResponse.status === 429) {
        return NextResponse.json({ error: "Groq rate limit reached. Please wait.", code: "UPSTREAM_RATE_LIMITED" }, { status: 429 });
      }
      return NextResponse.json({ error: "Groq API error. Please try again.", code: "AI_ERROR" }, { status: 502 });
    }

    // Stream Groq SSE response to client (OpenAI-compatible format)
    const readable = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        const reader = groqResponse.body!.getReader();
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
              if (!trimmed || trimmed === "data: [DONE]") continue;
              if (!trimmed.startsWith("data: ")) continue;
              try {
                const json = JSON.parse(trimmed.slice(6));
                const text = json.choices?.[0]?.delta?.content;
                if (text) {
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
                }
              } catch { /* ignore malformed lines */ }
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
    console.error("Groq fetch error:", err);
    return NextResponse.json(
      { error: "Failed to reach Groq API. Check your internet connection.", code: "AI_ERROR" },
      { status: 500 }
    );
  }
}