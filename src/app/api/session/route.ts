import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { generateId } from "@/lib/utils";

const SESSION_COOKIE = "ss_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24; // 24 hours

/**
 * GET /api/session
 * Returns existing session ID or creates a new one.
 */
export async function GET() {
  const cookieStore = await cookies();
  const existing = cookieStore.get(SESSION_COOKIE);

  if (existing?.value) {
    return NextResponse.json({ sessionId: existing.value });
  }

  const sessionId = generateId();
  const response = NextResponse.json({ sessionId });

  response.cookies.set(SESSION_COOKIE, sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: SESSION_TTL_SECONDS,
    path: "/",
  });

  return response;
}

/**
 * DELETE /api/session
 * Clears the session cookie.
 */
export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.delete(SESSION_COOKIE);
  return response;
}
