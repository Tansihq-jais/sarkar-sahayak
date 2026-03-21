import type { DocumentChunk } from "@/types";

const CHUNK_SIZE = 2000;
const OVERLAP = 200;

/**
 * Splits raw text into overlapping chunks, respecting sentence boundaries.
 * Each chunk is ~2000 chars with ~200 char overlap with the next chunk.
 */
export function chunkText(text: string): DocumentChunk[] {
  const chunks: DocumentChunk[] = [];
  const cleaned = text.replace(/\r\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();

  if (cleaned.length <= CHUNK_SIZE) {
    return [{ index: 0, text: cleaned, charStart: 0, charEnd: cleaned.length }];
  }

  let start = 0;
  let chunkIndex = 0;

  while (start < cleaned.length) {
    let end = start + CHUNK_SIZE;

    if (end >= cleaned.length) {
      // Last chunk — take everything remaining
      chunks.push({
        index: chunkIndex,
        text: cleaned.slice(start),
        charStart: start,
        charEnd: cleaned.length,
      });
      break;
    }

    // Try to break at a sentence boundary (. ! ?) near the end of the chunk
    const sentenceEnd = findSentenceBoundary(cleaned, end);
    if (sentenceEnd > start + CHUNK_SIZE / 2) {
      end = sentenceEnd;
    }

    chunks.push({
      index: chunkIndex,
      text: cleaned.slice(start, end).trim(),
      charStart: start,
      charEnd: end,
    });

    // Move start forward, but overlap with previous chunk
    start = Math.max(start + 1, end - OVERLAP);
    chunkIndex++;
  }

  return chunks;
}

/**
 * Find the nearest sentence boundary at or before the given position.
 */
function findSentenceBoundary(text: string, pos: number): number {
  const lookback = 200;
  const searchStart = Math.max(0, pos - lookback);
  const segment = text.slice(searchStart, pos);

  // Look for sentence endings backwards
  for (let i = segment.length - 1; i >= 0; i--) {
    const char = segment[i];
    const nextChar = segment[i + 1];
    if (
      (char === "." || char === "!" || char === "?") &&
      (nextChar === " " || nextChar === "\n" || nextChar === undefined)
    ) {
      return searchStart + i + 1;
    }
  }

  // Fall back to paragraph break
  const paraBreak = segment.lastIndexOf("\n\n");
  if (paraBreak !== -1) return searchStart + paraBreak + 2;

  // Fall back to newline
  const newline = segment.lastIndexOf("\n");
  if (newline !== -1) return searchStart + newline + 1;

  // Fall back to space
  const space = segment.lastIndexOf(" ");
  if (space !== -1) return searchStart + space + 1;

  return pos;
}

/** Estimate token count (rough: 1 token ≈ 4 chars for English) */
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

/** Get total token estimate for all chunks */
export function totalTokenEstimate(chunks: DocumentChunk[]): number {
  return chunks.reduce((sum, c) => sum + estimateTokens(c.text), 0);
}
