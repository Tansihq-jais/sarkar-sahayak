import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import type { ChatMessage, Verdict, EligibilityResult } from "@/types";

interface ChatState {
  // State
  messages: ChatMessage[];
  sessionId: string | null;
  isStreaming: boolean;
  streamingContent: string;
  activeDocumentIds: string[];
  activeSchemeId: string | null;
  verdict: Verdict;
  result: EligibilityResult | null;
  error: string | null;

  // Actions
  setSessionId: (id: string) => void;
  addMessage: (message: ChatMessage) => void;
  setStreaming: (streaming: boolean) => void;
  appendStreamChunk: (chunk: string) => void;
  finaliseStreamMessage: () => void;
  setActiveDocuments: (ids: string[]) => void;
  setActiveScheme: (id: string | null) => void;
  setVerdict: (verdict: Verdict) => void;
  setResult: (result: EligibilityResult) => void;
  setError: (error: string | null) => void;
  clearChat: () => void;
  resetSession: () => void;
}

export const useChatStore = create<ChatState>()(
  devtools(
    (set, get) => ({
      messages: [],
      sessionId: null,
      isStreaming: false,
      streamingContent: "",
      activeDocumentIds: [],
      activeSchemeId: null,
      verdict: null,
      result: null,
      error: null,

      setSessionId: (id) => set({ sessionId: id }, false, "setSessionId"),

      addMessage: (message) =>
        set(
          (state) => ({ messages: [...state.messages, message] }),
          false,
          "addMessage"
        ),

      setStreaming: (streaming) =>
        set(
          { isStreaming: streaming, streamingContent: streaming ? "" : get().streamingContent },
          false,
          "setStreaming"
        ),

      appendStreamChunk: (chunk) =>
        set(
          (state) => ({ streamingContent: state.streamingContent + chunk }),
          false,
          "appendStreamChunk"
        ),

      finaliseStreamMessage: () => {
        const { streamingContent, messages } = get();
        if (!streamingContent) return;
        const assistantMsg: ChatMessage = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: streamingContent,
          createdAt: new Date().toISOString(),
          sequenceNum: messages.length,
        };
        set(
          { messages: [...messages, assistantMsg], streamingContent: "", isStreaming: false },
          false,
          "finaliseStreamMessage"
        );
      },

      setActiveDocuments: (ids) =>
        set({ activeDocumentIds: ids }, false, "setActiveDocuments"),

      setActiveScheme: (id) =>
        set({ activeSchemeId: id }, false, "setActiveScheme"),

      setVerdict: (verdict) => set({ verdict }, false, "setVerdict"),

      setResult: (result) => set({ result }, false, "setResult"),

      setError: (error) => set({ error }, false, "setError"),

      clearChat: () =>
        set(
          {
            messages: [],
            streamingContent: "",
            isStreaming: false,
            verdict: null,
            result: null,
            error: null,
          },
          false,
          "clearChat"
        ),

      resetSession: () =>
        set(
          {
            messages: [],
            sessionId: null,
            isStreaming: false,
            streamingContent: "",
            activeDocumentIds: [],
            activeSchemeId: null,
            verdict: null,
            result: null,
            error: null,
          },
          false,
          "resetSession"
        ),
    }),
    { name: "ChatStore" }
  )
);
