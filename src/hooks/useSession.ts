"use client";

import { useEffect } from "react";
import { useSessionStore } from "@/store/sessionStore";
import { useChatStore } from "@/store/chatStore";

/**
 * Fetches or creates an anonymous session on first render.
 * Stores the session ID in both sessionStore and chatStore.
 */
export function useSession() {
  const { sessionId, setSessionId } = useSessionStore();
  const setSessionIdInChat = useChatStore((s) => s.setSessionId);

  useEffect(() => {
    if (sessionId) return; // already have one

    fetch("/api/session")
      .then((r) => r.json())
      .then(({ sessionId: id }: { sessionId: string }) => {
        setSessionId(id);
        setSessionIdInChat(id);
      })
      .catch(() => {
        // Fallback: generate client-side UUID if API call fails
        const fallback = crypto.randomUUID();
        setSessionId(fallback);
        setSessionIdInChat(fallback);
      });
  }, [sessionId, setSessionId, setSessionIdInChat]);

  return sessionId;
}
