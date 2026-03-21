"use client";

import { parsePdf } from "./parsePdf";
import { parseDocx, parseTxt } from "./parseDocx";
import { chunkText } from "./chunker";
import { generateId, formatFileSize } from "./utils";
import type { UploadedDocument } from "@/types";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const ALLOWED_TYPES: Record<string, string> = {
  "application/pdf": "pdf",
  "text/plain": "txt",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
};

export interface ParseResult {
  document: UploadedDocument;
  error?: string;
}

/** Validate file before parsing */
export function validateFile(file: File): string | null {
  if (!ALLOWED_TYPES[file.type]) {
    return `Unsupported file type: ${file.type || "unknown"}. Please upload a PDF, TXT, or DOCX file.`;
  }
  if (file.size > MAX_FILE_SIZE) {
    return `File is too large (${formatFileSize(file.size)}). Maximum size is ${formatFileSize(MAX_FILE_SIZE)}.`;
  }
  if (file.size === 0) {
    return "File is empty.";
  }
  return null;
}

/** Parse a file and return a ready-to-store UploadedDocument */
export async function parseDocument(file: File): Promise<ParseResult> {
  const validationError = validateFile(file);
  if (validationError) {
    return {
      document: makeErrorDoc(file, validationError),
      error: validationError,
    };
  }

  try {
    let rawText = "";

    if (file.type === "application/pdf") {
      rawText = await parsePdf(file);
    } else if (file.type === "text/plain") {
      rawText = await parseTxt(file);
    } else {
      rawText = await parseDocx(file);
    }

    const chunks = chunkText(rawText);

    const document: UploadedDocument = {
      id: generateId(),
      name: file.name.replace(/\.[^/.]+$/, ""), // strip extension
      originalFilename: file.name,
      mimeType: file.type,
      sizeBytes: file.size,
      charCount: rawText.length,
      chunks,
      status: "indexed",
      isPreloaded: false,
      language: "en",
      createdAt: new Date().toISOString(),
    };

    return { document };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to parse document.";
    return {
      document: makeErrorDoc(file, message),
      error: message,
    };
  }
}

function makeErrorDoc(file: File, errorMessage: string): UploadedDocument {
  return {
    id: generateId(),
    name: file.name,
    originalFilename: file.name,
    mimeType: file.type,
    sizeBytes: file.size,
    charCount: 0,
    chunks: [],
    status: "failed",
    isPreloaded: false,
    language: "en",
    createdAt: new Date().toISOString(),
    errorMessage,
  };
}
