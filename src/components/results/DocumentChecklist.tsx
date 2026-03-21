"use client";

import { useState } from "react";
import type { DocumentNeeded } from "@/types";

interface DocumentChecklistProps {
  documents: DocumentNeeded[];
}

export function DocumentChecklist({ documents }: DocumentChecklistProps) {
  const [checked, setChecked] = useState<Record<number, boolean>>({});

  if (!documents || documents.length === 0) return null;

  const toggle = (i: number) =>
    setChecked((prev) => ({ ...prev, [i]: !prev[i] }));

  const collectedCount = Object.values(checked).filter(Boolean).length;
  const totalCount = documents.length;
  const allDone = collectedCount === totalCount;

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-bold text-navy">📁 Documents Needed</h2>
        <div className="flex items-center gap-2">
          <div className="text-xs text-muted">
            {collectedCount}/{totalCount} collected
          </div>
          {allDone && (
            <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">
              ✓ All ready!
            </span>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-4 h-1.5 w-full rounded-full bg-sand overflow-hidden">
        <div
          className="h-full rounded-full bg-brand-orange transition-all duration-500"
          style={{ width: `${totalCount ? (collectedCount / totalCount) * 100 : 0}%` }}
        />
      </div>

      <div className="space-y-2 print:space-y-3">
        {documents.map((doc, i) => (
          <label
            key={i}
            className={`flex items-start gap-3 rounded-lg border p-3 cursor-pointer transition-all ${
              checked[i]
                ? "border-green-200 bg-green-50"
                : "border-sand bg-white hover:border-navy/30"
            } print:cursor-default`}
          >
            <input
              type="checkbox"
              checked={!!checked[i]}
              onChange={() => toggle(i)}
              className="mt-0.5 h-4 w-4 rounded accent-brand-orange flex-shrink-0 print:hidden"
            />
            {/* Print-only checkbox */}
            <span className="hidden print:inline-block w-4 h-4 border-2 border-gray-400 rounded flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={`text-sm font-medium ${
                    checked[i] ? "line-through text-muted" : "text-ink"
                  }`}
                >
                  {doc.name}
                </span>
                {doc.mandatory && (
                  <span className="text-xs rounded bg-orange-100 px-1.5 py-0.5 text-orange-700 font-medium">
                    Required
                  </span>
                )}
                {!doc.mandatory && (
                  <span className="text-xs rounded bg-gray-100 px-1.5 py-0.5 text-gray-500">
                    Optional
                  </span>
                )}
              </div>
              {doc.description && (
                <p className="mt-0.5 text-xs text-muted">{doc.description}</p>
              )}
            </div>
          </label>
        ))}
      </div>

      <p className="mt-3 text-xs text-muted print:hidden">
        ✓ Check off each document as you collect it.
      </p>
    </div>
  );
}
