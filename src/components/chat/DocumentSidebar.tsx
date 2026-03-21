"use client";

import Link from "next/link";
import { useDocumentStore } from "@/store/documentStore";
import { useSessionStore } from "@/store/sessionStore";
import { formatFileSize } from "@/lib/utils";
import { cn } from "@/lib/utils";

export function DocumentSidebar() {
  const { documents, activeDocumentIds, toggleActiveDocument } = useDocumentStore();
  const { queryCount, queryLimit, isRateLimited } = useSessionStore();

  const remaining = queryLimit - queryCount;
  const pct = (queryCount / queryLimit) * 100;

  return (
    <div className="flex h-full flex-col gap-4 overflow-y-auto p-4">

      {/* Rate limit meter */}
      <div className="rounded-xl border border-sand bg-white p-3">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-semibold text-navy">Queries used</span>
          <span className={cn("text-xs font-bold", isRateLimited ? "text-scheme-red" : remaining <= 5 ? "text-scheme-yellow" : "text-scheme-green")}>
            {queryCount} / {queryLimit}
          </span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-sand overflow-hidden">
          <div
            className={cn("h-full rounded-full transition-all duration-500", pct >= 100 ? "bg-scheme-red" : pct >= 75 ? "bg-scheme-yellow" : "bg-scheme-green")}
            style={{ width: `${Math.min(pct, 100)}%` }}
          />
        </div>
        {isRateLimited && (
          <p className="mt-1.5 text-2xs text-scheme-red">Limit reached. Resets in 1 hour.</p>
        )}
        {!isRateLimited && remaining <= 5 && remaining > 0 && (
          <p className="mt-1.5 text-2xs text-scheme-yellow">{remaining} queries left this hour.</p>
        )}
      </div>

      {/* Active documents */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-navy uppercase tracking-wide">Documents</span>
          {documents.length === 0 && (
            <Link href="/upload" className="text-2xs font-semibold text-brand-orange hover:underline">
              + Add
            </Link>
          )}
        </div>

        {documents.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-sand-dark p-4 text-center">
            <p className="text-xs text-muted mb-2">No documents yet</p>
            <Link
              href="/upload"
              className="inline-flex items-center gap-1 text-xs font-semibold text-brand-orange hover:underline"
            >
              📤 Upload or add a preloaded scheme
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {documents.map((doc) => {
              const isActive = activeDocumentIds.includes(doc.id);
              return (
                <button
                  key={doc.id}
                  onClick={() => toggleActiveDocument(doc.id)}
                  className={cn(
                    "w-full rounded-xl border p-3 text-left transition-all",
                    isActive
                      ? "border-scheme-green bg-scheme-green-bg"
                      : "border-sand bg-white opacity-60 hover:opacity-80"
                  )}
                >
                  <div className="flex items-start gap-2">
                    <span className="text-base shrink-0">📄</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-ink truncate">{doc.name}</p>
                      <p className="text-2xs text-muted">
                        {formatFileSize(doc.sizeBytes)} · {doc.chunks.length} chunks
                      </p>
                    </div>
                    <span className={cn("text-xs shrink-0 font-bold", isActive ? "text-scheme-green" : "text-light")}>
                      {isActive ? "●" : "○"}
                    </span>
                  </div>
                </button>
              );
            })}
            <Link
              href="/upload"
              className="flex items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-sand-dark py-2 text-xs font-medium text-muted hover:border-navy hover:text-navy transition-colors"
            >
              + Add another document
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
