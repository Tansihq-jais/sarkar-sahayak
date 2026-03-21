"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import type { EligibilityResult, Verdict } from "@/types";

interface Props {
  result: EligibilityResult;
  schemeName?: string;
}

const VERDICT_CONFIG: Record<
  NonNullable<Verdict>,
  { label: string; icon: string; bg: string; border: string; text: string; badge: string }
> = {
  ELIGIBLE: {
    label: "Eligible ✓",
    icon: "🎉",
    bg: "bg-scheme-green-bg",
    border: "border-scheme-green",
    text: "text-scheme-green",
    badge: "bg-scheme-green text-white",
  },
  LIKELY_ELIGIBLE: {
    label: "Likely Eligible",
    icon: "👍",
    bg: "bg-scheme-teal-bg",
    border: "border-scheme-teal",
    text: "text-scheme-teal",
    badge: "bg-scheme-teal text-white",
  },
  NOT_ELIGIBLE: {
    label: "Not Eligible",
    icon: "❌",
    bg: "bg-scheme-red-bg",
    border: "border-scheme-red",
    text: "text-scheme-red",
    badge: "bg-scheme-red text-white",
  },
  NEED_MORE_INFO: {
    label: "More Info Needed",
    icon: "❓",
    bg: "bg-scheme-yellow-bg",
    border: "border-scheme-yellow",
    text: "text-scheme-yellow",
    badge: "bg-scheme-yellow text-white",
  },
};

export function VerdictCard({ result, schemeName }: Props) {
  if (!result.verdict) return null;

  const config = VERDICT_CONFIG[result.verdict];

  return (
    <div
      className={cn(
        "mx-4 my-3 rounded-2xl border-2 p-5 animate-fade-in",
        config.bg,
        config.border
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <span className="text-3xl">{config.icon}</span>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={cn("rounded-full px-3 py-1 text-xs font-bold", config.badge)}>
              {config.label}
            </span>
            {result.confidenceScore && (
              <span className="text-xs text-muted">
                {Math.round(result.confidenceScore * 100)}% confidence
              </span>
            )}
          </div>
          {schemeName && (
            <p className="text-sm font-semibold text-navy mt-1">{schemeName}</p>
          )}
        </div>
      </div>

      {/* Documents needed */}
      {result.documentsNeeded.length > 0 && (
        <div className="mb-4">
          <h4 className="text-xs font-bold text-navy uppercase tracking-wide mb-2">
            📋 Documents to Gather
          </h4>
          <ul className="space-y-1.5">
            {result.documentsNeeded.map((doc, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-ink">
                <span className="text-scheme-green mt-0.5 shrink-0">✓</span>
                <span>
                  {doc.name}
                  {doc.mandatory && (
                    <span className="ml-1 text-2xs text-scheme-red font-semibold">Required</span>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Application steps */}
      {result.applicationSteps.length > 0 && (
        <div className="mb-4">
          <h4 className="text-xs font-bold text-navy uppercase tracking-wide mb-2">
            🚀 How to Apply
          </h4>
          <ol className="space-y-2">
            {result.applicationSteps.map((step) => (
              <li key={step.stepNum} className="flex items-start gap-3 text-sm text-ink">
                <span className="shrink-0 h-5 w-5 rounded-full bg-navy text-white text-xs flex items-center justify-center font-bold mt-0.5">
                  {step.stepNum}
                </span>
                <span>
                  {step.action}
                  {step.url && (
                    <a
                      href={step.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-1 text-brand-orange hover:underline text-xs font-semibold"
                    >
                      Visit portal ↗
                    </a>
                  )}
                </span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Disclaimer */}
      <div className="rounded-lg bg-white/60 px-3 py-2 text-xs text-muted leading-relaxed border border-white">
        ⚠️ Please verify this at the official government portal before applying, as policies may have changed.
      </div>

      {/* Actions */}
      <div className="mt-4 flex gap-3 flex-wrap">
        <Link
          href="/results"
          className="inline-flex items-center gap-1.5 rounded-lg bg-navy px-4 py-2 text-xs font-semibold text-white hover:bg-navy-dark transition-colors"
        >
          View Full Report →
        </Link>
        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-1.5 rounded-lg border border-sand bg-white px-4 py-2 text-xs font-semibold text-muted hover:text-navy hover:border-navy transition-colors"
        >
          🖨️ Print / Save
        </button>
      </div>
    </div>
  );
}
