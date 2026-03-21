"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error for debugging; replace with Sentry when added
    console.error("Global error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        <div className="text-6xl mb-4">⚠️</div>
        <h1 className="text-2xl font-bold text-navy mb-2">Something went wrong</h1>
        <p className="text-muted mb-6 leading-relaxed">
          An unexpected error occurred. Your data is safe — please try again.
        </p>
        {error?.digest && (
          <p className="mb-4 text-xs font-mono text-muted bg-sand rounded px-3 py-1 inline-block">
            Error ID: {error.digest}
          </p>
        )}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="rounded-xl bg-brand-orange px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-orange-dark transition-all"
          >
            Try again
          </button>
          <Link
            href="/"
            className="rounded-xl border-2 border-navy px-6 py-2.5 text-sm font-semibold text-navy hover:bg-navy hover:text-white transition-all"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}
