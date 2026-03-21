"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  duration?: number;
}

interface ToastProps {
  toast: ToastMessage;
  onDismiss: (id: string) => void;
}

const icons: Record<ToastType, string> = {
  success: "✅",
  error: "❌",
  warning: "⚠️",
  info: "ℹ️",
};

const styles: Record<ToastType, string> = {
  success: "border-scheme-green bg-scheme-green-bg text-scheme-green",
  error: "border-scheme-red bg-scheme-red-bg text-scheme-red",
  warning: "border-scheme-yellow bg-scheme-yellow-bg text-scheme-yellow",
  info: "border-navy bg-navy-50 text-navy",
};

function Toast({ toast, onDismiss }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(
      () => onDismiss(toast.id),
      toast.duration ?? 4000
    );
    return () => clearTimeout(timer);
  }, [toast, onDismiss]);

  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-xl border-2 p-4 shadow-card animate-fade-in min-w-[300px] max-w-[400px]",
        styles[toast.type]
      )}
    >
      <span className="text-lg shrink-0">{icons[toast.type]}</span>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm">{toast.title}</p>
        {toast.description && (
          <p className="text-xs mt-0.5 opacity-80">{toast.description}</p>
        )}
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        className="shrink-0 opacity-60 hover:opacity-100 transition-opacity text-sm"
      >
        ✕
      </button>
    </div>
  );
}

// ── Toast Container ───────────────────────────────────────

let globalDispatch: ((toast: Omit<ToastMessage, "id">) => void) | null = null;

export function toast(msg: Omit<ToastMessage, "id">) {
  globalDispatch?.(msg);
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    globalDispatch = (msg) => {
      setToasts((prev) => [...prev, { ...msg, id: crypto.randomUUID() }]);
    };
    return () => {
      globalDispatch = null;
    };
  }, []);

  const dismiss = (id: string) =>
    setToasts((prev) => prev.filter((t) => t.id !== id));

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
      {toasts.map((t) => (
        <Toast key={t.id} toast={t} onDismiss={dismiss} />
      ))}
    </div>
  );
}
