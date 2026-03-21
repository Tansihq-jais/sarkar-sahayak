"use client";

import { useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { NavBar } from "@/components/layout/NavBar";
import { ToastContainer } from "@/components/ui/Toast";
import { ChatMessage, TypingIndicator } from "@/components/chat/ChatMessage";
import { ChatInput } from "@/components/chat/ChatInput";
import { DocumentSidebar } from "@/components/chat/DocumentSidebar";
import { VerdictCard } from "@/components/chat/VerdictCard";
import { SchemeSelector } from "@/components/chat/SchemeSelector";
import { useChat } from "@/hooks/useChat";
import { useSession } from "@/hooks/useSession";
import { useChatStore } from "@/store/chatStore";
import { useDocumentStore } from "@/store/documentStore";
import { SCHEMES } from "@/data/schemes";

function WelcomePlaceholder({ hasDocuments }: { hasDocuments: boolean }) {
  const EXAMPLES = ["What is the income limit?", "Am I eligible for PM-KISAN?", "What documents do I need?"];
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 text-center">
      <div className="text-5xl mb-4">🏛️</div>
      <h2 className="text-xl font-bold text-navy mb-2">Welcome to Sarkar Sahayak</h2>
      <p className="text-sm text-muted max-w-sm leading-relaxed mb-6">
        {hasDocuments
          ? "Your documents are ready. Start chatting to check your eligibility."
          : "Upload a scheme PDF or add a preloaded scheme from the sidebar, then start chatting."}
      </p>
      <div className="flex flex-col gap-2 text-sm text-left w-full max-w-xs">
        {EXAMPLES.map((q) => (
          <div key={q} className="rounded-xl border border-sand bg-white px-4 py-2.5 text-muted text-xs">
            💬 &ldquo;{q}&rdquo;
          </div>
        ))}
      </div>
    </div>
  );
}

function ChatPageInner() {
  const searchParams = useSearchParams();
  const scrollRef = useRef<HTMLDivElement>(null);
  useSession();

  const { sendMessage, stopStreaming, isStreaming, messages, streamingContent } = useChat();
  const { result, verdict, clearChat, setActiveScheme } = useChatStore();
  const { documents, activeDocumentIds } = useDocumentStore();
  const activeSchemeId = useChatStore((s) => s.activeSchemeId);

  const activeDocs = documents.filter((d) => activeDocumentIds.includes(d.id));
  const activeSchemeName =
    SCHEMES.find((s) => s.id === activeSchemeId)?.name ?? activeDocs[0]?.name;

  // Auto-select scheme from ?scheme= query param (e.g. from scheme detail page)
  useEffect(() => {
    const schemeId = searchParams.get("scheme");
    if (schemeId) setActiveScheme(schemeId);
  }, [searchParams, setActiveScheme]);

  // Auto-scroll to bottom on new content
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, streamingContent]);

  const hasMessages = messages.length > 0;
  const hasDocuments = activeDocs.length > 0;

  return (
    <div className="flex h-screen flex-col bg-cream overflow-hidden">
      <NavBar />

      <div className="flex flex-1 overflow-hidden">

        {/* Main chat column */}
        <div className="flex flex-1 flex-col overflow-hidden min-w-0">

          {/* Chat header bar */}
          <div className="flex items-center justify-between gap-3 border-b border-sand bg-white px-4 py-3 shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <SchemeSelector />
              {activeSchemeName && (
                <span className="hidden md:block text-xs text-muted truncate max-w-[200px]">
                  Checking: <span className="font-semibold text-navy">{activeSchemeName}</span>
                </span>
              )}
            </div>
            {hasMessages && (
              <button
                onClick={clearChat}
                className="text-xs text-light hover:text-scheme-red transition-colors font-medium shrink-0"
              >
                Clear chat
              </button>
            )}
          </div>

          {/* Messages scroll area */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto py-4 space-y-1">
            {!hasMessages ? (
              <WelcomePlaceholder hasDocuments={hasDocuments} />
            ) : (
              <>
                {messages.map((msg) => (
                  <ChatMessage key={msg.id} message={msg} />
                ))}

                {/* Verdict card after final assistant message */}
                {verdict && result && !isStreaming && (
                  <VerdictCard result={result} schemeName={activeSchemeName} />
                )}

                {/* Live streaming message */}
                {isStreaming && streamingContent && (
                  <ChatMessage
                    message={{
                      id: "streaming",
                      role: "assistant",
                      content: streamingContent,
                      createdAt: new Date().toISOString(),
                      sequenceNum: messages.length,
                    }}
                    isStreaming
                  />
                )}

                {/* Typing dots before first chunk */}
                {isStreaming && !streamingContent && <TypingIndicator />}
              </>
            )}
          </div>

          {/* Input */}
          <div className="shrink-0">
            <ChatInput
              onSend={sendMessage}
              onStop={stopStreaming}
              isStreaming={isStreaming}
              placeholder={hasDocuments ? "Ask about your eligibility…" : "Add a document first, or ask a general question…"}
            />
          </div>
        </div>

        {/* Document sidebar — desktop only */}
        <aside className="hidden lg:flex w-64 xl:w-72 shrink-0 flex-col border-l border-sand bg-white overflow-hidden">
          <div className="shrink-0 px-4 py-3 border-b border-sand">
            <h2 className="text-xs font-bold text-navy uppercase tracking-wide">Documents & Usage</h2>
          </div>
          <div className="flex-1 overflow-y-auto">
            <DocumentSidebar />
          </div>
        </aside>

      </div>

      <ToastContainer />
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center bg-cream">
        <div className="text-center">
          <div className="text-4xl mb-3">🏛️</div>
          <p className="text-muted text-sm">Loading…</p>
        </div>
      </div>
    }>
      <ChatPageInner />
    </Suspense>
  );
}
