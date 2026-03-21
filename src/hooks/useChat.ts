"use client";

import { useCallback, useRef } from "react";
import { useChatStore } from "@/store/chatStore";
import { useDocumentStore } from "@/store/documentStore";
import { useSessionStore } from "@/store/sessionStore";
import { hasVerdict, parseVerdict, buildEligibilityResult } from "@/lib/verdictParser";
import { generateId } from "@/lib/utils";
import { toast } from "@/components/ui/Toast";
import type { ChatMessage } from "@/types";

const MAX_RETRIES = 2;
const TIMEOUT_MS = 30_000;

function anySignal(signals: AbortSignal[]): AbortSignal {
  const controller = new AbortController();
  for (const sig of signals) {
    if (sig.aborted) { controller.abort(); break; }
    sig.addEventListener("abort", () => controller.abort(), { once: true });
  }
  return controller.signal;
}

async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs: number): Promise<Response> {
  const timeoutController = new AbortController();
  const timer = setTimeout(() => timeoutController.abort(), timeoutMs);
  const signal = options.signal
    ? anySignal([options.signal as AbortSignal, timeoutController.signal])
    : timeoutController.signal;
  try {
    return await fetch(url, { ...options, signal });
  } finally {
    clearTimeout(timer);
  }
}

export function useChat() {
  const abortRef = useRef<AbortController | null>(null);

  const {
    messages, sessionId, isStreaming, streamingContent, activeSchemeId,
    addMessage, setStreaming, appendStreamChunk, finaliseStreamMessage,
    setVerdict, setResult, setError,
  } = useChatStore();

  const { getActiveDocuments } = useDocumentStore();
  const { incrementQueryCount, checkRateLimit, setRateLimitReset } = useSessionStore();

  const doFetch = useCallback(
    async (
      apiMessages: { role: "user" | "assistant"; content: string }[],
      documentChunks: unknown[],
      schemeName: string | undefined,
      attempt: number
    ): Promise<void> => {
      abortRef.current = new AbortController();

      let response: Response;
      try {
        response = await fetchWithTimeout(
          "/api/chat",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            signal: abortRef.current.signal,
            body: JSON.stringify({ messages: apiMessages, documentChunks, schemeName, sessionId }),
          },
          TIMEOUT_MS
        );
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          if (attempt < MAX_RETRIES) {
            toast({ type: "error", title: "Taking too long…", description: `Retrying (${attempt + 1}/${MAX_RETRIES})` });
            return doFetch(apiMessages, documentChunks, schemeName, attempt + 1);
          }
          toast({ type: "error", title: "Request timed out", description: "The server is not responding. Please try again." });
        } else {
          if (attempt < MAX_RETRIES) {
            return doFetch(apiMessages, documentChunks, schemeName, attempt + 1);
          }
          toast({ type: "error", title: "Connection error", description: "Could not reach the server. Check your connection." });
          setError(err instanceof Error ? err.message : "Unknown error");
        }
        setStreaming(false);
        return;
      }

      if (!response.ok) {
        const errData = await response.json().catch(() => ({ error: "Unknown error" }));

        if (response.status === 429) {
          const retryAfter = errData.retryAfter ?? 3600;
          setRateLimitReset(new Date(Date.now() + retryAfter * 1000).toISOString());
          const mins = Math.ceil(retryAfter / 60);
          toast({ type: "error", title: "Rate limit reached", description: `Try again in ${mins} min.` });
        } else if (response.status === 500 && errData.code === "NO_API_KEY") {
          toast({ type: "error", title: "API key missing", description: "Add OPENROUTER_API_KEY to .env.local and restart." });
        } else if (response.status >= 500 && attempt < MAX_RETRIES) {
          toast({ type: "error", title: "Server error", description: `Retrying… (${attempt + 1}/${MAX_RETRIES})` });
          return doFetch(apiMessages, documentChunks, schemeName, attempt + 1);
        } else {
          toast({ type: "error", title: "Error", description: errData.error ?? "Something went wrong." });
        }
        setStreaming(false);
        return;
      }

      const reader = response.body?.getReader();
      if (!reader) { setStreaming(false); return; }

      const decoder = new TextDecoder();
      let fullText = "";

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const raw = decoder.decode(value, { stream: true });
          for (const line of raw.split("\n")) {
            if (!line.startsWith("data: ")) continue;
            const data = line.slice(6).trim();
            if (data === "[DONE]") break;
            try {
              const parsed = JSON.parse(data) as { text?: string; error?: string };
              if (parsed.error) { toast({ type: "error", title: "Stream error", description: parsed.error }); break; }
              if (parsed.text) { fullText += parsed.text; appendStreamChunk(parsed.text); }
            } catch { /* ignore */ }
          }
        }
      } catch (readErr) {
        if (readErr instanceof Error && readErr.name !== "AbortError") {
          console.error("Stream read error:", readErr);
        }
      }

      if (hasVerdict(fullText)) {
        const parsed = parseVerdict(fullText);
        if (parsed) {
          setVerdict(parsed.verdict);
          const result = buildEligibilityResult(parsed, sessionId ?? "local", activeSchemeId ?? "unknown");
          setResult(result);
        }
      }
      finaliseStreamMessage();
    },
    [sessionId, activeSchemeId, setStreaming, appendStreamChunk, finaliseStreamMessage, setVerdict, setResult, setError, setRateLimitReset]
  );

  const sendMessage = useCallback(async (content: string) => {
    if (isStreaming || !content.trim()) return;
    if (checkRateLimit()) {
      toast({ type: "error", title: "Rate limit reached", description: "You've used all 20 queries this hour." });
      return;
    }
    const userMsg: ChatMessage = {
      id: generateId(), role: "user", content: content.trim(),
      createdAt: new Date().toISOString(), sequenceNum: messages.length,
    };
    addMessage(userMsg);
    setStreaming(true);
    setError(null);

    const activeDocs = getActiveDocuments();
    const documentChunks = activeDocs.flatMap((d) => d.chunks);
    const schemeName = activeDocs[0]?.name;
    const apiMessages = [
      ...messages.map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
      { role: "user" as const, content: content.trim() },
    ];
    incrementQueryCount();
    await doFetch(apiMessages, documentChunks, schemeName, 0);
  }, [isStreaming, messages, addMessage, setStreaming, setError, getActiveDocuments, checkRateLimit, incrementQueryCount, doFetch]);

  const stopStreaming = useCallback(() => {
    abortRef.current?.abort();
    finaliseStreamMessage();
  }, [finaliseStreamMessage]);

  return { sendMessage, stopStreaming, isStreaming, messages, streamingContent };
}
