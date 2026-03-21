"use client";

import { useState } from "react";
import { useChatStore } from "@/store/chatStore";
import { useDocumentStore } from "@/store/documentStore";
import { SCHEMES } from "@/data/schemes";
import { cn } from "@/lib/utils";

export function SchemeSelector() {
  const [open, setOpen] = useState(false);
  const { activeSchemeId, setActiveScheme } = useChatStore();
  const { documents, activeDocumentIds } = useDocumentStore();

  const activeScheme = SCHEMES.find((s) => s.id === activeSchemeId);
  const activeDocs = documents.filter((d) => activeDocumentIds.includes(d.id));

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex items-center gap-2 rounded-xl border px-3 py-2 text-sm transition-all",
          activeScheme
            ? "border-brand-orange bg-brand-orange-light text-brand-orange font-semibold"
            : "border-sand bg-white text-muted hover:border-navy hover:text-navy"
        )}
      >
        <span>{activeScheme?.icon ?? "📋"}</span>
        <span className="hidden sm:block max-w-[160px] truncate">
          {activeScheme?.shortName ?? activeScheme?.name ?? "Select scheme"}
        </span>
        <span className="text-xs">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-30"
            onClick={() => setOpen(false)}
          />
          {/* Dropdown */}
          <div className="absolute left-0 top-full z-40 mt-1.5 w-72 rounded-2xl border border-sand bg-white shadow-modal overflow-hidden animate-fade-in">
            <div className="p-3 border-b border-sand">
              <p className="text-xs font-bold text-navy uppercase tracking-wide">Select a Scheme</p>
              <p className="text-2xs text-muted mt-0.5">The AI will focus on this scheme's criteria</p>
            </div>

            {/* None option */}
            <button
              onClick={() => { setActiveScheme(null); setOpen(false); }}
              className={cn(
                "flex w-full items-center gap-2 px-3 py-2.5 text-sm hover:bg-cream transition-colors",
                !activeSchemeId && "bg-cream font-semibold text-navy"
              )}
            >
              <span>🔍</span>
              <span>General / No specific scheme</span>
              {!activeSchemeId && <span className="ml-auto text-brand-orange text-xs">●</span>}
            </button>

            {/* Active documents as quick picks */}
            {activeDocs.length > 0 && (
              <>
                <div className="px-3 py-1.5 bg-sand">
                  <p className="text-2xs font-bold text-muted uppercase tracking-wide">From your documents</p>
                </div>
                {activeDocs.map((doc) => {
                  const match = SCHEMES.find((s) => doc.id.includes(s.id) || doc.name.toLowerCase().includes(s.shortName?.toLowerCase() ?? ""));
                  if (!match) return null;
                  return (
                    <button
                      key={match.id}
                      onClick={() => { setActiveScheme(match.id); setOpen(false); }}
                      className={cn(
                        "flex w-full items-center gap-2 px-3 py-2.5 text-sm hover:bg-cream transition-colors",
                        activeSchemeId === match.id && "bg-cream font-semibold text-navy"
                      )}
                    >
                      <span>{match.icon}</span>
                      <span className="truncate">{match.shortName ?? match.name}</span>
                      {activeSchemeId === match.id && <span className="ml-auto text-brand-orange text-xs">●</span>}
                    </button>
                  );
                })}
              </>
            )}

            {/* All schemes */}
            <div className="px-3 py-1.5 bg-sand">
              <p className="text-2xs font-bold text-muted uppercase tracking-wide">All schemes</p>
            </div>
            <div className="max-h-56 overflow-y-auto">
              {SCHEMES.map((scheme) => (
                <button
                  key={scheme.id}
                  onClick={() => { setActiveScheme(scheme.id); setOpen(false); }}
                  className={cn(
                    "flex w-full items-center gap-2 px-3 py-2.5 text-sm hover:bg-cream transition-colors",
                    activeSchemeId === scheme.id && "bg-cream font-semibold text-navy"
                  )}
                >
                  <span>{scheme.icon}</span>
                  <span className="truncate flex-1 text-left">{scheme.shortName ?? scheme.name}</span>
                  <span className="text-2xs text-light capitalize shrink-0">{scheme.category}</span>
                  {activeSchemeId === scheme.id && <span className="text-brand-orange text-xs ml-1">●</span>}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
