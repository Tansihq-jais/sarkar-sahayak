"use client";

/**
 * Client-side PDF text extraction using PDF.js.
 * The PDF never leaves the browser — parsed entirely in memory.
 */
export async function parsePdf(file: File): Promise<string> {
  // Dynamically import pdfjs-dist to avoid SSR issues
  const pdfjsLib = await import("pdfjs-dist");

  // Set worker source
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.mjs",
    import.meta.url
  ).toString();

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  const pages: string[] = [];

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const content = await page.getTextContent();
    const pageText = content.items
      .map((item) => ("str" in item ? item.str : ""))
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();

    if (pageText) {
      pages.push(pageText);
    }
  }

  const fullText = pages.join("\n\n");

  if (fullText.trim().length < 50) {
    throw new Error(
      "Could not extract text from this PDF. It may be a scanned image. Please try a text-based PDF."
    );
  }

  return fullText;
}
