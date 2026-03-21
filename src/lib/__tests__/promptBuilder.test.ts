import { describe, it, expect } from "vitest";
import { buildSystemPrompt } from "@/lib/promptBuilder";
import type { DocumentChunk } from "@/types";

const SAMPLE_CHUNKS: DocumentChunk[] = [
  { index: 0, text: "PM-KISAN Scheme: Annual income support of ₹6,000 to farmer families.", charStart: 0, charEnd: 70 },
  { index: 1, text: "Eligibility: The beneficiary must own cultivable land. Income tax payers are excluded.", charStart: 70, charEnd: 155 },
];

describe("buildSystemPrompt", () => {
  it("includes role definition", () => {
    const prompt = buildSystemPrompt({ documentChunks: [] });
    expect(prompt).toContain("Sarkar Sahayak");
    expect(prompt).toContain("eligibility");
  });

  it("includes scheme name when provided", () => {
    const prompt = buildSystemPrompt({ documentChunks: [], schemeName: "PM-KISAN" });
    expect(prompt).toContain("PM-KISAN");
  });

  it("includes document text when chunks provided", () => {
    const prompt = buildSystemPrompt({ documentChunks: SAMPLE_CHUNKS });
    expect(prompt).toContain("₹6,000");
    expect(prompt).toContain("cultivable land");
    expect(prompt).toContain("DOCUMENT START");
    expect(prompt).toContain("DOCUMENT END");
  });

  it("includes no-document message when chunks empty", () => {
    const prompt = buildSystemPrompt({ documentChunks: [] });
    expect(prompt).toContain("No documents");
  });

  it("includes verdict format instructions", () => {
    const prompt = buildSystemPrompt({ documentChunks: [] });
    expect(prompt).toContain("---VERDICT---");
    expect(prompt).toContain("STATUS:");
    expect(prompt).toContain("ELIGIBLE");
    expect(prompt).toContain("NOT_ELIGIBLE");
  });

  it("includes safety disclaimer", () => {
    const prompt = buildSystemPrompt({ documentChunks: [] });
    expect(prompt).toContain("official government portal");
  });

  it("handles very large document gracefully (respects char limit)", () => {
    const bigChunks: DocumentChunk[] = Array.from({ length: 100 }, (_, i) => ({
      index: i,
      text: "Policy content. ".repeat(200), // ~3200 chars per chunk
      charStart: i * 3200,
      charEnd: (i + 1) * 3200,
    }));
    const prompt = buildSystemPrompt({ documentChunks: bigChunks });
    // Should not include all 100 chunks
    expect(prompt).toContain("truncated");
    // Should still be under a reasonable size
    expect(prompt.length).toBeLessThan(30000);
  });
});
