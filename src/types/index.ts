// ── Scheme Types ──────────────────────────────────────────
export type SchemeCategory =
  | "housing"
  | "health"
  | "agriculture"
  | "finance"
  | "education"
  | "other";

export interface Scheme {
  id: string;
  name: string;
  slug: string;
  shortName?: string;
  category: SchemeCategory;
  ministry?: string;
  description: string;
  eligibilitySummary?: string;
  icon: string;
  officialUrl?: string;
  isActive: boolean;
  lastPolicyUpdate?: string;
}

// ── Document Types ────────────────────────────────────────
export type DocStatus = "uploading" | "parsing" | "indexed" | "failed";

export interface DocumentChunk {
  index: number;
  text: string;
  charStart: number;
  charEnd: number;
}

export interface UploadedDocument {
  id: string;
  name: string;
  originalFilename: string;
  mimeType: string;
  sizeBytes: number;
  charCount: number;
  chunks: DocumentChunk[];
  status: DocStatus;
  isPreloaded: boolean;
  language: string;
  createdAt: string;
  errorMessage?: string;
}

// ── Chat Types ────────────────────────────────────────────
export type MessageRole = "user" | "assistant" | "system";
export type Verdict =
  | "ELIGIBLE"
  | "NOT_ELIGIBLE"
  | "LIKELY_ELIGIBLE"
  | "NEED_MORE_INFO"
  | null;

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  createdAt: string;
  tokenCount?: number;
  sequenceNum: number;
}

export interface EligibilityCriterion {
  criterion: string;
  status: "pass" | "fail" | "unknown";
  detail: string;
}

export interface DocumentNeeded {
  name: string;
  description: string;
  mandatory: boolean;
}

export interface ApplicationStep {
  stepNum: number;
  action: string;
  url?: string;
}

export interface EligibilityResult {
  id: string;
  sessionId: string;
  schemeId: string;
  verdict: Verdict;
  confidenceScore: number;
  criteriaMet: EligibilityCriterion[];
  documentsNeeded: DocumentNeeded[];
  applicationSteps: ApplicationStep[];
  createdAt: string;
}

// ── Session Types ─────────────────────────────────────────
export interface SessionState {
  sessionId: string | null;
  queryCount: number;
  queryLimit: number;
  resetAt: string | null;
  isRateLimited: boolean;
}

// ── API Types ─────────────────────────────────────────────
export interface ChatRequest {
  messages: Array<{ role: MessageRole; content: string }>;
  documentIds: string[];
  sessionId: string;
  schemeId?: string;
}

export interface ApiError {
  error: string;
  code: string;
  retryAfter?: number;
}
