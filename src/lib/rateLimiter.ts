/**
 * Server-side rate limiter using Vercel KV.
 * Falls back gracefully if KV is not configured (local dev without KV).
 *
 * Limit: 20 requests per session per hour.
 */

const LIMIT = 20;
const WINDOW_SECONDS = 60 * 60; // 1 hour

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number; // Unix timestamp ms
}

export async function checkRateLimit(sessionId: string): Promise<RateLimitResult> {
  // If KV is not configured, allow all requests (local dev)
  if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
    return { allowed: true, remaining: LIMIT - 1, resetAt: Date.now() + WINDOW_SECONDS * 1000 };
  }

  try {
    const { kv } = await import("@vercel/kv");
    const key = `rl:${sessionId}`;

    const count = await kv.incr(key);

    if (count === 1) {
      // First request — set TTL
      await kv.expire(key, WINDOW_SECONDS);
    }

    const ttl = await kv.ttl(key);
    const resetAt = Date.now() + Math.max(ttl, 0) * 1000;

    if (count > LIMIT) {
      return { allowed: false, remaining: 0, resetAt };
    }

    return { allowed: true, remaining: LIMIT - count, resetAt };
  } catch (err) {
    // KV error — fail open (allow request) to avoid blocking users
    console.warn("Rate limiter KV error, failing open:", err);
    return { allowed: true, remaining: LIMIT, resetAt: Date.now() + WINDOW_SECONDS * 1000 };
  }
}
