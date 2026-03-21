"use client";

import type { ApplicationStep } from "@/types";

interface AppStepsProps {
  steps: ApplicationStep[];
  officialUrl?: string;
}

export function AppSteps({ steps, officialUrl }: AppStepsProps) {
  if (!steps || steps.length === 0) return null;

  return (
    <div className="card p-5">
      <h2 className="text-base font-bold text-navy mb-4">🗂️ How to Apply</h2>

      <ol className="space-y-3">
        {steps.map((step, i) => (
          <li key={i} className="flex gap-3 items-start">
            <div className="flex-shrink-0 w-7 h-7 rounded-full bg-navy text-white text-xs font-bold flex items-center justify-center mt-0.5">
              {step.stepNum}
            </div>
            <div className="flex-1 pt-0.5">
              <p className="text-sm text-ink leading-relaxed">{step.action}</p>
              {step.url && (
                <a
                  href={step.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-brand-orange hover:underline"
                >
                  Open portal →
                </a>
              )}
            </div>
          </li>
        ))}
      </ol>

      {officialUrl && (
        <div className="mt-4 pt-4 border-t border-sand">
          <a
            href={officialUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-navy px-4 py-2.5 text-sm font-semibold text-white hover:bg-navy/90 transition-all"
          >
            🌐 Open Official Portal
          </a>
        </div>
      )}

      <p className="mt-3 text-xs text-muted">
        ⚠️ Always verify eligibility requirements at official government portals before applying.
      </p>
    </div>
  );
}
