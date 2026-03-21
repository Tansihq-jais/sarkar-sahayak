"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { PageLayout } from "@/components/layout/PageLayout";
import { useChatStore } from "@/store/chatStore";
import { useDocumentStore } from "@/store/documentStore";
import { VerdictCard } from "@/components/chat/VerdictCard";
import { CriteriaBreakdown } from "@/components/results/CriteriaBreakdown";
import { DocumentChecklist } from "@/components/results/DocumentChecklist";
import { AppSteps } from "@/components/results/AppSteps";
import { SCHEMES } from "@/data/schemes";
import { copyShareLink, decodeShareData, verdictLabel } from "@/lib/shareResult";
import type { EligibilityResult, Verdict } from "@/types";

export default function ResultsPage() {
  const { result, verdict, messages } = useChatStore();
  const { documents, activeDocumentIds } = useDocumentStore();
  const activeSchemeId = useChatStore((s) => s.activeSchemeId);
  const searchParams = useSearchParams();

  const [copied, setCopied] = useState(false);
  const [sharedData, setSharedData] = useState<{ verdict: Verdict; schemeName: string; reason?: string } | null>(null);

  // Handle shared result URL
  useEffect(() => {
    const shareParam = searchParams.get("share");
    if (shareParam) {
      const decoded = decodeShareData(shareParam);
      if (decoded) setSharedData(decoded);
    }
  }, [searchParams]);

  const activeDocs = documents.filter((d) => activeDocumentIds.includes(d.id));
  const activeScheme = SCHEMES.find((s) => s.id === activeSchemeId);
  const activeSchemeName = activeScheme?.name ?? activeDocs[0]?.name ?? sharedData?.schemeName;

  const handleCopyLink = async () => {
    if (!verdict && !sharedData) return;
    const ok = await copyShareLink({
      verdict: (verdict ?? sharedData?.verdict) as Verdict,
      schemeName: activeSchemeName ?? "Unknown scheme",
      reason: result?.applicationSteps?.[0]?.action,
    });
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  // Shared result view (no local result in store)
  if (sharedData && !result) {
    return (
      <PageLayout>
        <div className="max-w-xl mx-auto py-10 text-center">
          <div className="card p-8">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted mb-2">Shared Result</p>
            <h1 className="text-2xl font-bold text-navy mb-1">{sharedData.schemeName}</h1>
            <div className={`mt-4 text-xl font-bold ${
              sharedData.verdict === "ELIGIBLE" ? "text-green-700"
              : sharedData.verdict === "NOT_ELIGIBLE" ? "text-red-700"
              : "text-yellow-700"
            }`}>
              {verdictLabel(sharedData.verdict)}
            </div>
            {sharedData.reason && (
              <p className="mt-3 text-sm text-muted">{sharedData.reason}</p>
            )}
            <div className="mt-8 flex flex-col gap-3">
              <Link href="/chat" className="rounded-xl bg-brand-orange px-6 py-3 text-sm font-semibold text-white hover:bg-brand-orange-dark transition-all">
                Check My Own Eligibility →
              </Link>
              <Link href="/schemes" className="rounded-xl border-2 border-navy px-6 py-3 text-sm font-semibold text-navy hover:bg-navy hover:text-white transition-all">
                Browse All Schemes
              </Link>
            </div>
          </div>
        </div>
      </PageLayout>
    );
  }

  // No result yet
  if (!result || !verdict) {
    return (
      <PageLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <div className="text-6xl mb-4">📋</div>
          <h1 className="text-2xl font-bold text-navy mb-3">No Results Yet</h1>
          <p className="text-muted max-w-md mb-8 leading-relaxed">
            Complete an eligibility chat session to see your results here.
          </p>
          <Link
            href="/chat"
            className="inline-flex items-center gap-2 rounded-xl bg-brand-orange px-6 py-3 text-sm font-semibold text-white hover:bg-brand-orange-dark transition-all"
          >
            Start Eligibility Check →
          </Link>
        </div>
      </PageLayout>
    );
  }

  const officialUrl = activeScheme?.officialUrl;

  return (
    <PageLayout>
      {/* Header */}
      <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold text-navy">Eligibility Report</h1>
          {activeSchemeName && (
            <p className="mt-1 text-muted">{activeSchemeName}</p>
          )}
        </div>
        <div className="flex gap-2 print:hidden">
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-2 rounded-xl border border-sand px-4 py-2 text-sm font-medium text-muted hover:text-navy hover:border-navy transition-all"
          >
            {copied ? "✓ Copied!" : "🔗 Share"}
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 rounded-xl border border-sand px-4 py-2 text-sm font-medium text-muted hover:text-navy hover:border-navy transition-all"
          >
            🖨️ Print
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Verdict */}
          <div className="[&>div]:mx-0">
            <VerdictCard result={result} schemeName={activeSchemeName} />
          </div>

          {/* Criteria breakdown */}
          {result.criteriaMet && result.criteriaMet.length > 0 && (
            <CriteriaBreakdown criteria={result.criteriaMet} />
          )}

          {/* Documents checklist */}
          {result.documentsNeeded && result.documentsNeeded.length > 0 && (
            <DocumentChecklist documents={result.documentsNeeded} />
          )}

          {/* Application steps */}
          {result.applicationSteps && result.applicationSteps.length > 0 && (
            <AppSteps steps={result.applicationSteps} officialUrl={officialUrl} />
          )}

          {/* Chat transcript */}
          {messages.length > 0 && (
            <div className="card p-5 print:hidden">
              <h2 className="text-base font-bold text-navy mb-4">💬 Chat Transcript</h2>
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {messages.map((msg) => (
                  <div key={msg.id} className={msg.role === "user" ? "text-right" : "text-left"}>
                    <span className="text-xs text-muted font-medium">
                      {msg.role === "user" ? "You" : "Sarkar Sahayak"}
                    </span>
                    <p className={`mt-1 inline-block rounded-xl px-4 py-2 text-sm max-w-[80%] ${
                      msg.role === "user" ? "bg-navy text-white" : "bg-cream border border-sand text-ink"
                    }`}>
                      {msg.content}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4 print:hidden">
          <div className="card p-5">
            <h3 className="font-bold text-navy mb-3 text-sm uppercase tracking-wide">Actions</h3>
            <div className="space-y-2">
              <Link
                href="/chat"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-orange px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-orange-dark transition-all"
              >
                New Chat →
              </Link>
              <Link
                href="/schemes"
                className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-navy px-4 py-2.5 text-sm font-semibold text-navy hover:bg-navy hover:text-white transition-all"
              >
                Browse More Schemes
              </Link>
              <button
                onClick={handleCopyLink}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-sand px-4 py-2.5 text-sm font-medium text-muted hover:text-navy hover:border-navy transition-all"
              >
                {copied ? "✓ Link Copied!" : "🔗 Share Result"}
              </button>
              <button
                onClick={() => window.print()}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-sand px-4 py-2.5 text-sm font-medium text-muted hover:text-navy hover:border-navy transition-all"
              >
                🖨️ Print Report
              </button>
            </div>
          </div>

          {/* Confidence score */}
          {result.confidenceScore !== undefined && (
            <div className="card p-5">
              <h3 className="font-bold text-navy mb-3 text-sm uppercase tracking-wide">Confidence</h3>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-2 rounded-full bg-sand overflow-hidden">
                  <div
                    className="h-full rounded-full bg-brand-orange transition-all"
                    style={{ width: `${Math.round(result.confidenceScore * 100)}%` }}
                  />
                </div>
                <span className="text-sm font-bold text-navy">
                  {Math.round(result.confidenceScore * 100)}%
                </span>
              </div>
              <p className="mt-2 text-xs text-muted leading-relaxed">
                Based on the information provided. Always verify at official portals.
              </p>
            </div>
          )}

          {/* Disclaimer */}
          <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4">
            <p className="text-xs text-yellow-800 leading-relaxed">
              ⚠️ This is an AI-assisted assessment. Always verify eligibility at official government portals before applying.
            </p>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
