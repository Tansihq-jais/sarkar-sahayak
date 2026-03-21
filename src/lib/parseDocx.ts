"use client";

/**
 * Client-side DOCX text extraction using Mammoth.js.
 */
export async function parseDocx(file: File): Promise<string> {
  const mammoth = await import("mammoth");
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });

  if (!result.value || result.value.trim().length < 50) {
    throw new Error("Could not extract text from this document. Please check the file is not empty.");
  }

  return result.value;
}

/**
 * Parse a plain text file.
 */
export async function parseTxt(file: File): Promise<string> {
  const text = await file.text();
  if (text.trim().length < 10) {
    throw new Error("The text file appears to be empty.");
  }
  return text;
}
