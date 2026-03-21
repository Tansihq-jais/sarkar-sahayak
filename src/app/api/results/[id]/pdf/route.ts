import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

/**
 * GET /api/results/[id]/pdf
 * Generates a printable HTML report for an eligibility result.
 * Returns HTML that the browser can print to PDF (Ctrl+P → Save as PDF).
 * 
 * Note: For server-side PDF generation, install @puppeteer/browsers or use
 * a service like html-pdf-node. For MVP, we return styled HTML.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  const supabase = createServerClient();
  const { data: result, error } = await supabase
    .from("eligibility_results")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !result) {
    return NextResponse.json({ error: "Result not found" }, { status: 404 });
  }

  const verdictColor =
    result.verdict === "ELIGIBLE" ? "#2E7D5E"
    : result.verdict === "NOT_ELIGIBLE" ? "#C0392B"
    : result.verdict === "LIKELY_ELIGIBLE" ? "#B7860B"
    : "#1565C0";

  const verdictLabel =
    result.verdict === "ELIGIBLE" ? "✅ ELIGIBLE"
    : result.verdict === "NOT_ELIGIBLE" ? "❌ NOT ELIGIBLE"
    : result.verdict === "LIKELY_ELIGIBLE" ? "🟡 LIKELY ELIGIBLE"
    : "❓ NEED MORE INFO";

  const docsNeeded = (result.documents_needed as { name: string; mandatory: boolean }[]) ?? [];
  const steps = (result.application_steps as { stepNum: number; action: string; url?: string }[]) ?? [];
  const criteria = (result.criteria_met as { criterion: string; status: string; detail: string }[]) ?? [];

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Eligibility Report — ${result.scheme_name ?? "Government Scheme"}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', Arial, sans-serif; color: #1C1C1E; background: #fff; padding: 40px; max-width: 800px; margin: 0 auto; }
    .header { border-bottom: 3px solid #E8622A; padding-bottom: 20px; margin-bottom: 28px; }
    .logo { font-size: 24px; font-weight: 800; color: #1A3C6E; }
    .subtitle { font-size: 13px; color: #6B6860; margin-top: 4px; }
    .scheme-name { font-size: 20px; font-weight: 700; color: #1A3C6E; margin-top: 16px; }
    .verdict-banner { border-radius: 12px; padding: 20px 24px; margin: 24px 0; border: 2px solid ${verdictColor}; background: ${verdictColor}15; }
    .verdict-label { font-size: 22px; font-weight: 800; color: ${verdictColor}; }
    .verdict-date { font-size: 12px; color: #6B6860; margin-top: 6px; }
    .confidence { display: inline-block; margin-top: 8px; font-size: 13px; color: #6B6860; }
    h2 { font-size: 16px; font-weight: 700; color: #1A3C6E; margin: 28px 0 12px; padding-bottom: 6px; border-bottom: 1px solid #EDE8DF; }
    .criterion { display: flex; gap: 10px; padding: 10px 0; border-bottom: 1px solid #F5F5F5; }
    .criterion-icon { font-size: 16px; flex-shrink: 0; }
    .criterion-label { font-size: 14px; font-weight: 600; }
    .criterion-detail { font-size: 12px; color: #6B6860; margin-top: 2px; }
    .doc-item { display: flex; align-items: center; gap: 10px; padding: 8px 0; border-bottom: 1px solid #F5F5F5; }
    .doc-checkbox { width: 16px; height: 16px; border: 2px solid #ccc; border-radius: 3px; flex-shrink: 0; }
    .doc-name { font-size: 14px; }
    .doc-required { font-size: 11px; color: #E8622A; margin-left: 6px; font-weight: 600; }
    .step { display: flex; gap: 12px; margin-bottom: 12px; }
    .step-num { width: 28px; height: 28px; border-radius: 50%; background: #1A3C6E; color: #fff; font-size: 13px; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .step-text { font-size: 14px; padding-top: 4px; }
    .step-url { font-size: 12px; color: #E8622A; }
    .disclaimer { margin-top: 32px; padding: 14px; border-radius: 8px; background: #FEF9E7; border: 1px solid #B7860B40; font-size: 12px; color: #6B6860; }
    .footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #EDE8DF; font-size: 11px; color: #A8A39A; display: flex; justify-content: space-between; }
    @media print { body { padding: 20px; } }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">🏛️ Sarkar Sahayak</div>
    <div class="subtitle">Government Scheme Eligibility Report</div>
    <div class="scheme-name">${result.scheme_name ?? "Government Scheme"}</div>
  </div>

  <div class="verdict-banner">
    <div class="verdict-label">${verdictLabel}</div>
    <div class="verdict-date">Generated on ${new Date(result.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</div>
    ${result.confidence_score ? `<div class="confidence">Confidence: ${Math.round((result.confidence_score as number) * 100)}%</div>` : ""}
  </div>

  ${criteria.length > 0 ? `
  <h2>📊 Eligibility Criteria</h2>
  ${criteria.map((c) => `
    <div class="criterion">
      <div class="criterion-icon">${c.status === "pass" ? "✅" : c.status === "fail" ? "❌" : "❓"}</div>
      <div>
        <div class="criterion-label">${c.criterion}</div>
        ${c.detail ? `<div class="criterion-detail">${c.detail}</div>` : ""}
      </div>
    </div>
  `).join("")}` : ""}

  ${docsNeeded.length > 0 ? `
  <h2>📁 Documents Needed</h2>
  ${docsNeeded.map((d) => `
    <div class="doc-item">
      <div class="doc-checkbox"></div>
      <div class="doc-name">${d.name}${d.mandatory ? '<span class="doc-required">Required</span>' : ""}</div>
    </div>
  `).join("")}` : ""}

  ${steps.length > 0 ? `
  <h2>🗂️ How to Apply</h2>
  ${steps.map((s) => `
    <div class="step">
      <div class="step-num">${s.stepNum}</div>
      <div>
        <div class="step-text">${s.action}</div>
        ${s.url ? `<div class="step-url">${s.url}</div>` : ""}
      </div>
    </div>
  `).join("")}` : ""}

  <div class="disclaimer">
    ⚠️ This is an AI-assisted assessment for informational purposes only. Always verify eligibility and requirements at official government portals before applying.
  </div>

  <div class="footer">
    <span>Sarkar Sahayak — Government Policy Navigator</span>
    <span>Report ID: ${result.id.slice(0, 8).toUpperCase()}</span>
  </div>
</body>
</html>`;

  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Content-Disposition": `inline; filename="eligibility-report-${id.slice(0, 8)}.html"`,
    },
  });
}
