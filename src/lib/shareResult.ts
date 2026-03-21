import type { EligibilityResult, Verdict } from "@/types";

export interface ShareableData {
  verdict: Verdict;
  schemeName: string;
  reason?: string;
}

/**
 * Encode minimal result data (no PII) into a URL-safe base64 string.
 */
export function encodeShareData(data: ShareableData): string {
  const payload = {
    v: data.verdict,
    s: data.schemeName,
    r: data.reason ?? "",
  };
  return btoa(encodeURIComponent(JSON.stringify(payload)));
}

/**
 * Decode share data from URL param.
 */
export function decodeShareData(encoded: string): ShareableData | null {
  try {
    const payload = JSON.parse(decodeURIComponent(atob(encoded)));
    return {
      verdict: payload.v,
      schemeName: payload.s,
      reason: payload.r,
    };
  } catch {
    return null;
  }
}

/**
 * Build the shareable result URL with encoded verdict data.
 * Contains NO personally identifiable information.
 */
export function buildShareUrl(data: ShareableData): string {
  const encoded = encodeShareData(data);
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  return `${baseUrl}/results?share=${encoded}`;
}

/**
 * Copy a result share link to the clipboard.
 * Returns true on success.
 */
export async function copyShareLink(data: ShareableData): Promise<boolean> {
  const url = buildShareUrl(data);
  try {
    await navigator.clipboard.writeText(url);
    return true;
  } catch {
    // Fallback for older browsers
    try {
      const ta = document.createElement("textarea");
      ta.value = url;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * Get a human-readable verdict label.
 */
export function verdictLabel(verdict: Verdict): string {
  switch (verdict) {
    case "ELIGIBLE": return "Eligible ✅";
    case "NOT_ELIGIBLE": return "Not Eligible ❌";
    case "LIKELY_ELIGIBLE": return "Likely Eligible 🟡";
    case "NEED_MORE_INFO": return "More Info Needed ❓";
    default: return "Unknown";
  }
}
