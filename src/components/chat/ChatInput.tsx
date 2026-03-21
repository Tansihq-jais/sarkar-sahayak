"use client";

import { useState, useRef, useCallback, KeyboardEvent } from "react";
import { cn } from "@/lib/utils";

const QUICK_QUESTIONS = [
  "Am I eligible for this scheme?",
  "What documents do I need?",
  "What is the income limit?",
  "How do I apply?",
  "Is there an age limit?",
];

interface Props {
  onSend: (message: string) => void;
  onStop?: () => void;
  isStreaming: boolean;
  disabled?: boolean;
  placeholder?: string;
}

export function ChatInput({ onSend, onStop, isStreaming, disabled, placeholder }: Props) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = useCallback(() => {
    const trimmed = value.trim();
    if (!trimmed || isStreaming || disabled) return;
    onSend(trimmed);
    setValue("");
    // Reset textarea height
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  }, [value, isStreaming, disabled, onSend]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  };

  const handleQuick = (q: string) => {
    if (isStreaming || disabled) return;
    onSend(q);
  };

  return (
    <div className="border-t border-sand bg-white px-4 pb-4 pt-3">
      {/* Quick question chips */}
      <div className="mb-3 flex flex-wrap gap-2">
        {QUICK_QUESTIONS.map((q) => (
          <button
            key={q}
            onClick={() => handleQuick(q)}
            disabled={isStreaming || disabled}
            className="rounded-full border border-sand-dark bg-cream px-3 py-1 text-xs font-medium text-muted hover:border-navy hover:text-navy transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input row */}
      <div className={cn(
        "flex items-end gap-2 rounded-2xl border-2 bg-cream px-4 py-2 transition-colors",
        isStreaming ? "border-brand-orange/40" : "border-sand-dark focus-within:border-navy"
      )}>
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onInput={handleInput}
          disabled={isStreaming || disabled}
          placeholder={placeholder ?? "Ask about your eligibility…"}
          rows={1}
          className="flex-1 resize-none bg-transparent text-sm text-ink placeholder:text-light outline-none disabled:cursor-not-allowed py-1.5"
          style={{ maxHeight: 160 }}
        />

        {/* Send / Stop button */}
        {isStreaming ? (
          <button
            onClick={onStop}
            className="mb-1 shrink-0 flex h-9 w-9 items-center justify-center rounded-xl bg-brand-orange text-white hover:bg-brand-orange-dark transition-colors"
            title="Stop"
          >
            ⏹
          </button>
        ) : (
          <button
            onClick={handleSend}
            disabled={!value.trim() || disabled}
            className="mb-1 shrink-0 flex h-9 w-9 items-center justify-center rounded-xl bg-navy text-white hover:bg-navy-dark transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            title="Send (Enter)"
          >
            ↑
          </button>
        )}
      </div>
      <p className="mt-1.5 text-center text-2xs text-light">
        Press Enter to send · Shift+Enter for new line
      </p>
    </div>
  );
}
