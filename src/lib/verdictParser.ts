import type { Verdict, EligibilityCriterion, DocumentNeeded, ApplicationStep, EligibilityResult } from "@/types";
import { generateId } from "./utils";

const VERDICT_START = "---VERDICT---";
const VERDICT_END = "---END_VERDICT---";

export interface ParsedVerdict {
  verdict: Verdict;
  reason: string;
  documentsNeeded: DocumentNeeded[];
  applyAt: string;
}

/**
 * Checks if a message contains a verdict block.
 */
export function hasVerdict(text: string): boolean {
  return text.includes(VERDICT_START) && text.includes(VERDICT_END);
}

/**
 * Extracts and parses the structured verdict block from an AI response.
 * Returns null if no verdict block is found.
 */
export function parseVerdict(text: string): ParsedVerdict | null {
  const start = text.indexOf(VERDICT_START);
  const end = text.indexOf(VERDICT_END);

  if (start === -1 || end === -1) return null;

  const block = text.slice(start + VERDICT_START.length, end).trim();
  const lines = block.split("\n").map((l) => l.trim()).filter(Boolean);

  let verdict: Verdict = null;
  let reason = "";
  let documentsRaw = "";
  let applyAt = "";

  for (const line of lines) {
    if (line.startsWith("STATUS:")) {
      const raw = line.replace("STATUS:", "").trim().toUpperCase();
      if (isValidVerdict(raw)) verdict = raw as Verdict;
    } else if (line.startsWith("REASON:")) {
      reason = line.replace("REASON:", "").trim();
    } else if (line.startsWith("DOCUMENTS_NEEDED:")) {
      documentsRaw = line.replace("DOCUMENTS_NEEDED:", "").trim();
    } else if (line.startsWith("APPLY_AT:")) {
      applyAt = line.replace("APPLY_AT:", "").trim();
    }
  }

  if (!verdict) return null;

  const documentsNeeded: DocumentNeeded[] = documentsRaw
    .split(",")
    .map((d) => d.trim())
    .filter(Boolean)
    .map((name, i) => ({
      name,
      description: "",
      mandatory: true,
    }));

  return { verdict, reason, documentsNeeded, applyAt };
}

/**
 * Strip the raw verdict block from the message text for display.
 * The UI shows a structured result card instead of the raw block.
 */
export function stripVerdictBlock(text: string): string {
  const start = text.indexOf(VERDICT_START);
  if (start === -1) return text;
  return text.slice(0, start).trim();
}

/**
 * Convert a ParsedVerdict into a full EligibilityResult for storage/display.
 */
export function buildEligibilityResult(
  parsed: ParsedVerdict,
  sessionId: string,
  schemeId: string
): EligibilityResult {
  const steps: ApplicationStep[] =
    parsed.applyAt && parsed.applyAt !== "N/A"
      ? [
          { stepNum: 1, action: "Gather all required documents listed above." },
          { stepNum: 2, action: "Visit the official portal to apply online.", url: parsed.applyAt.startsWith("http") ? parsed.applyAt : undefined },
          { stepNum: 3, action: "Fill the application form with accurate details." },
          { stepNum: 4, action: "Submit the form and note your application reference number." },
        ]
      : [
          { stepNum: 1, action: "Gather all required documents listed above." },
          { stepNum: 2, action: "Visit your nearest Common Service Centre (CSC) or Gram Panchayat." },
          { stepNum: 3, action: "Submit the application with supporting documents." },
        ];

  const confidenceScore =
    parsed.verdict === "ELIGIBLE" ? 0.9
    : parsed.verdict === "LIKELY_ELIGIBLE" ? 0.7
    : parsed.verdict === "NOT_ELIGIBLE" ? 0.9
    : 0.5;

  return {
    id: generateId(),
    sessionId,
    schemeId,
    verdict: parsed.verdict,
    confidenceScore,
    criteriaMet: [],
    documentsNeeded: parsed.documentsNeeded,
    applicationSteps: steps,
    createdAt: new Date().toISOString(),
  };
}

function isValidVerdict(v: string): v is NonNullable<Verdict> {
  return ["ELIGIBLE", "NOT_ELIGIBLE", "LIKELY_ELIGIBLE", "NEED_MORE_INFO"].includes(v);
}
