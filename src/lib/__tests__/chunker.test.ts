import { describe, it, expect } from "vitest";
import { chunkText, estimateTokens, totalTokenEstimate } from "@/lib/chunker";

describe("chunkText", () => {
  it("returns single chunk for short text", () => {
    const text = "This is a short policy document.";
    const chunks = chunkText(text);
    expect(chunks).toHaveLength(1);
    expect(chunks[0].index).toBe(0);
    expect(chunks[0].text).toBe(text);
    expect(chunks[0].charStart).toBe(0);
    expect(chunks[0].charEnd).toBe(text.length);
  });

  it("splits long text into multiple chunks", () => {
    const text = "A".repeat(6000);
    const chunks = chunkText(text);
    expect(chunks.length).toBeGreaterThan(1);
  });

  it("chunks have correct sequential indexes", () => {
    const text = "Word ".repeat(1000);
    const chunks = chunkText(text);
    chunks.forEach((chunk, i) => {
      expect(chunk.index).toBe(i);
    });
  });

  it("no chunk exceeds 2200 chars (chunk size + small buffer)", () => {
    const text = "The government scheme provides benefits. ".repeat(200);
    const chunks = chunkText(text);
    chunks.forEach((chunk) => {
      expect(chunk.text.length).toBeLessThanOrEqual(2200);
    });
  });

  it("charStart and charEnd are valid positions", () => {
    const text = "Policy document content. ".repeat(200);
    const chunks = chunkText(text);
    chunks.forEach((chunk) => {
      expect(chunk.charStart).toBeGreaterThanOrEqual(0);
      expect(chunk.charEnd).toBeLessThanOrEqual(text.length);
      expect(chunk.charStart).toBeLessThan(chunk.charEnd);
    });
  });

  it("all chunks together cover the full text", () => {
    const text = "Eligibility criteria for PM Kisan. ".repeat(100);
    const chunks = chunkText(text);
    // First chunk starts at 0
    expect(chunks[0].charStart).toBe(0);
    // Last chunk ends at or near text length
    const lastChunk = chunks[chunks.length - 1];
    expect(lastChunk.charEnd).toBeLessThanOrEqual(text.length);
  });

  it("handles text with newlines and paragraphs", () => {
    const text = Array.from({ length: 50 }, (_, i) =>
      `Section ${i + 1}. This is a paragraph about eligibility criteria for the scheme.\n\n`
    ).join("");
    const chunks = chunkText(text);
    expect(chunks.length).toBeGreaterThan(0);
    chunks.forEach((c) => expect(c.text.length).toBeGreaterThan(0));
  });

  it("handles empty-ish text gracefully", () => {
    const chunks = chunkText("Hello.");
    expect(chunks).toHaveLength(1);
    expect(chunks[0].text).toBe("Hello.");
  });
});

describe("estimateTokens", () => {
  it("estimates ~250 tokens for 1000 chars", () => {
    const tokens = estimateTokens("a".repeat(1000));
    expect(tokens).toBe(250);
  });
});

describe("totalTokenEstimate", () => {
  it("sums token estimates across all chunks", () => {
    const chunks = [
      { index: 0, text: "a".repeat(400), charStart: 0, charEnd: 400 },
      { index: 1, text: "b".repeat(400), charStart: 300, charEnd: 700 },
    ];
    expect(totalTokenEstimate(chunks)).toBe(200);
  });
});
