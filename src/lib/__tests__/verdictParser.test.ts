import { describe, it, expect } from "vitest";
import { hasVerdict, parseVerdict, stripVerdictBlock, buildEligibilityResult } from "@/lib/verdictParser";

const ELIGIBLE_BLOCK = `
Based on your information, you appear to meet all criteria.

---VERDICT---
STATUS: ELIGIBLE
REASON: You meet the income criteria (below ₹1.5 lakh/year), hold agricultural land, and have a valid Aadhaar and bank account. All three instalments of ₹2,000 should be credited to your account.
DOCUMENTS_NEEDED: Aadhaar card, Land ownership records, Bank passbook, Mobile number linked to Aadhaar
APPLY_AT: https://pmkisan.gov.in
---END_VERDICT---

Please verify this at the official government portal.
`;

const NOT_ELIGIBLE_BLOCK = `
I'm sorry, but based on the criteria:

---VERDICT---
STATUS: NOT_ELIGIBLE
REASON: Your annual income of ₹8 lakh exceeds the EWS limit of ₹3 lakh specified in the scheme document.
DOCUMENTS_NEEDED: None required
APPLY_AT: N/A
---END_VERDICT---
`;

const NO_VERDICT = `I need a few more details. What is your annual household income?`;

describe("hasVerdict", () => {
  it("returns true when verdict block is present", () => {
    expect(hasVerdict(ELIGIBLE_BLOCK)).toBe(true);
  });

  it("returns false when no verdict block", () => {
    expect(hasVerdict(NO_VERDICT)).toBe(false);
  });

  it("returns false for empty string", () => {
    expect(hasVerdict("")).toBe(false);
  });
});

describe("parseVerdict", () => {
  it("correctly parses ELIGIBLE verdict", () => {
    const result = parseVerdict(ELIGIBLE_BLOCK);
    expect(result).not.toBeNull();
    expect(result!.verdict).toBe("ELIGIBLE");
    expect(result!.reason).toContain("income criteria");
    expect(result!.documentsNeeded).toHaveLength(4);
    expect(result!.documentsNeeded[0].name).toBe("Aadhaar card");
    expect(result!.applyAt).toBe("https://pmkisan.gov.in");
  });

  it("correctly parses NOT_ELIGIBLE verdict", () => {
    const result = parseVerdict(NOT_ELIGIBLE_BLOCK);
    expect(result).not.toBeNull();
    expect(result!.verdict).toBe("NOT_ELIGIBLE");
    expect(result!.reason).toContain("income");
  });

  it("returns null when no verdict block", () => {
    expect(parseVerdict(NO_VERDICT)).toBeNull();
  });

  it("parses LIKELY_ELIGIBLE status", () => {
    const text = `---VERDICT---\nSTATUS: LIKELY_ELIGIBLE\nREASON: Likely eligible.\nDOCUMENTS_NEEDED: Aadhaar\nAPPLY_AT: https://example.gov.in\n---END_VERDICT---`;
    const result = parseVerdict(text);
    expect(result!.verdict).toBe("LIKELY_ELIGIBLE");
  });

  it("parses NEED_MORE_INFO status", () => {
    const text = `---VERDICT---\nSTATUS: NEED_MORE_INFO\nREASON: Need land records.\nDOCUMENTS_NEEDED: Land records\nAPPLY_AT: N/A\n---END_VERDICT---`;
    const result = parseVerdict(text);
    expect(result!.verdict).toBe("NEED_MORE_INFO");
  });

  it("handles invalid STATUS gracefully", () => {
    const text = `---VERDICT---\nSTATUS: INVALID_STATUS\nREASON: Test\nDOCUMENTS_NEEDED: None\nAPPLY_AT: N/A\n---END_VERDICT---`;
    expect(parseVerdict(text)).toBeNull();
  });

  it("marks all parsed documents as mandatory", () => {
    const result = parseVerdict(ELIGIBLE_BLOCK);
    result!.documentsNeeded.forEach((doc) => {
      expect(doc.mandatory).toBe(true);
    });
  });
});

describe("stripVerdictBlock", () => {
  it("removes the verdict block from message text", () => {
    const stripped = stripVerdictBlock(ELIGIBLE_BLOCK);
    expect(stripped).not.toContain("---VERDICT---");
    expect(stripped).not.toContain("STATUS:");
    expect(stripped).toContain("Based on your information");
  });

  it("returns text unchanged when no verdict block", () => {
    expect(stripVerdictBlock(NO_VERDICT)).toBe(NO_VERDICT);
  });
});

describe("buildEligibilityResult", () => {
  it("builds a valid result from parsed verdict", () => {
    const parsed = parseVerdict(ELIGIBLE_BLOCK)!;
    const result = buildEligibilityResult(parsed, "session-123", "pm-kisan");
    expect(result.id).toBeDefined();
    expect(result.sessionId).toBe("session-123");
    expect(result.schemeId).toBe("pm-kisan");
    expect(result.verdict).toBe("ELIGIBLE");
    expect(result.confidenceScore).toBe(0.9);
    expect(result.applicationSteps.length).toBeGreaterThan(0);
    expect(result.documentsNeeded).toHaveLength(4);
  });

  it("assigns lower confidence to LIKELY_ELIGIBLE", () => {
    const parsed = parseVerdict(
      `---VERDICT---\nSTATUS: LIKELY_ELIGIBLE\nREASON: Likely.\nDOCUMENTS_NEEDED: Aadhaar\nAPPLY_AT: N/A\n---END_VERDICT---`
    )!;
    const result = buildEligibilityResult(parsed, "s", "scheme");
    expect(result.confidenceScore).toBe(0.7);
  });
});
