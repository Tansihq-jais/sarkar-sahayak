import type { DocumentChunk } from "@/types";

const MAX_CONTEXT_CHARS = 24000; // ~6000 tokens at 4 chars/token

interface PromptBuilderOptions {
  documentChunks: DocumentChunk[];
  schemeName?: string;
}

/**
 * Builds the Claude system prompt.
 *
 * Structure:
 *  Block 1 — Role definition
 *  Block 2 — Policy document context (injected chunks)
 *  Block 3 — Conversation rules
 *  Block 4 — Output format
 *  Block 5 — Safety disclaimer
 */
export function buildSystemPrompt(options: PromptBuilderOptions): string {
  const { documentChunks, schemeName } = options;

  // ── Block 1: Role ──────────────────────────────────────
  const roleBlock = `You are Sarkar Sahayak, an expert Indian government policy assistant.
Your job is to help Indian citizens check their eligibility for government welfare schemes.
You are knowledgeable, patient, and speak in clear and simple language.
${schemeName ? `The user is checking eligibility for: ${schemeName}` : "The user may ask about one or more government schemes."}`;

  // ── Block 2: Policy document context ──────────────────
  const contextBlock = buildContextBlock(documentChunks, schemeName);

  // ── Block 3: Conversation rules ───────────────────────
  const rulesBlock = `CONVERSATION RULES:
- Ask 3 to 5 targeted follow-up questions before giving a final verdict. Gather: income, land/assets, family size, state of residence, caste category (SC/ST/OBC/General), employment type, and any other criteria specific to this scheme.
- Ask one or two questions at a time — do not overwhelm the user.
- Base ALL eligibility answers strictly on the policy document provided. Never guess or invent criteria.
- If a criterion is not covered in the documents, say clearly: "I don't have enough information about this criterion in the uploaded document."
- Use simple language. Avoid bureaucratic jargon. If you must use a term like "EWS" or "LIG", explain it briefly.
- Be encouraging but accurate. Do not give false hope.
- If the user's situation is borderline, acknowledge the uncertainty clearly.`;

  // ── Block 4: Output format ────────────────────────────
  const formatBlock = `OUTPUT FORMAT:
When you have gathered enough information to make a determination, end your response with a verdict block in EXACTLY this format:

---VERDICT---
STATUS: [ELIGIBLE | NOT_ELIGIBLE | LIKELY_ELIGIBLE | NEED_MORE_INFO]
REASON: [One clear paragraph explaining why, referencing specific criteria from the document]
DOCUMENTS_NEEDED: [Comma-separated list of documents the user must gather, e.g. Aadhaar card, income certificate, land records]
APPLY_AT: [Official portal URL if known, otherwise "Visit your nearest Common Service Centre (CSC)"]
---END_VERDICT---

Only include the verdict block when you are ready to give a final answer. During the information-gathering phase, just ask questions naturally.`;

  // ── Block 5: Safety ───────────────────────────────────
  const safetyBlock = `IMPORTANT: Always end responses that contain a verdict with: "Please verify this at the official government portal before applying, as policies may have changed."`;

  return [roleBlock, contextBlock, rulesBlock, formatBlock, safetyBlock]
    .filter(Boolean)
    .join("\n\n---\n\n");
}

function buildContextBlock(
  chunks: DocumentChunk[],
  schemeName?: string
): string {
  if (chunks.length === 0) {
    return `POLICY DOCUMENTS: No documents have been uploaded yet. 
Ask the user to upload the official scheme PDF or use the preloaded library. 
You can still provide general guidance about common Indian government schemes from your training knowledge, but make clear you are speaking generally and not from the official document.`;
  }

  // Fit as many chunks as possible within the token budget
  const selectedChunks: DocumentChunk[] = [];
  let totalChars = 0;

  for (const chunk of chunks) {
    if (totalChars + chunk.text.length > MAX_CONTEXT_CHARS) break;
    selectedChunks.push(chunk);
    totalChars += chunk.text.length;
  }

  const docText = selectedChunks.map((c) => c.text).join("\n\n");
  const truncated = selectedChunks.length < chunks.length;

  return `POLICY DOCUMENT${schemeName ? ` — ${schemeName}` : ""}:
The following is the official policy document text. Base all eligibility answers on this content only.
${truncated ? `(Note: Document was truncated to fit context. Showing ${selectedChunks.length} of ${chunks.length} sections.)\n` : ""}
=== DOCUMENT START ===
${docText}
=== DOCUMENT END ===`;
}
