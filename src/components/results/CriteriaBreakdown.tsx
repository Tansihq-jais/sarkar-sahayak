"use client";

import type { EligibilityCriterion } from "@/types";

interface CriteriaBreakdownProps {
  criteria: EligibilityCriterion[];
}

const STATUS_CONFIG = {
  pass: {
    icon: "✅",
    label: "Met",
    bg: "bg-green-50",
    border: "border-green-200",
    text: "text-green-800",
    badge: "bg-green-100 text-green-700",
  },
  fail: {
    icon: "❌",
    label: "Not met",
    bg: "bg-red-50",
    border: "border-red-200",
    text: "text-red-800",
    badge: "bg-red-100 text-red-700",
  },
  unknown: {
    icon: "❓",
    label: "Unclear",
    bg: "bg-yellow-50",
    border: "border-yellow-200",
    text: "text-yellow-800",
    badge: "bg-yellow-100 text-yellow-700",
  },
};

export function CriteriaBreakdown({ criteria }: CriteriaBreakdownProps) {
  if (!criteria || criteria.length === 0) return null;

  const passed = criteria.filter((c) => c.status === "pass").length;
  const failed = criteria.filter((c) => c.status === "fail").length;
  const unknown = criteria.filter((c) => c.status === "unknown").length;

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-bold text-navy">📊 Eligibility Criteria</h2>
        <div className="flex gap-2 text-xs">
          {passed > 0 && (
            <span className="rounded-full bg-green-100 px-2 py-0.5 text-green-700 font-medium">
              {passed} met
            </span>
          )}
          {failed > 0 && (
            <span className="rounded-full bg-red-100 px-2 py-0.5 text-red-700 font-medium">
              {failed} not met
            </span>
          )}
          {unknown > 0 && (
            <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-yellow-700 font-medium">
              {unknown} unclear
            </span>
          )}
        </div>
      </div>

      <div className="space-y-2">
        {criteria.map((item, i) => {
          const cfg = STATUS_CONFIG[item.status] ?? STATUS_CONFIG.unknown;
          return (
            <div
              key={i}
              className={`flex items-start gap-3 rounded-lg border p-3 ${cfg.bg} ${cfg.border}`}
            >
              <span className="text-base flex-shrink-0 mt-0.5">{cfg.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-sm font-semibold ${cfg.text}`}>
                    {item.criterion}
                  </span>
                  <span className={`text-xs rounded-full px-2 py-0.5 font-medium ${cfg.badge}`}>
                    {cfg.label}
                  </span>
                </div>
                {item.detail && (
                  <p className="mt-1 text-xs text-muted leading-relaxed">
                    {item.detail}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
