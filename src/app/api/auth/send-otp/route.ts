import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createServerClient } from "@/lib/supabase";

const Schema = z.object({
  email: z.string().email("Enter a valid email address"),
});

const OTP_WINDOW_MINUTES = 10;
const OTP_MAX_REQUESTS = 3;

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message ?? "Invalid email" },
      { status: 400 }
    );
  }

  const { email } = parsed.data;
  const supabase = createServerClient();

  // Check OTP rate limit using email as identifier
  const windowStart = new Date(Date.now() - OTP_WINDOW_MINUTES * 60 * 1000).toISOString();
  const { count } = await supabase
    .from("otp_requests")
    .select("*", { count: "exact", head: true })
    .eq("phone", email)  // reusing phone column for email
    .gte("created_at", windowStart);

  if ((count ?? 0) >= OTP_MAX_REQUESTS) {
    return NextResponse.json(
      { error: `Too many requests. Please wait ${OTP_WINDOW_MINUTES} minutes.` },
      { status: 429 }
    );
  }

  // Send OTP via Supabase Auth email (completely free)
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: true,
    },
  });

  if (error) {
    console.error("Email OTP send error:", error);
    return NextResponse.json(
      { error: "Failed to send OTP email. Please try again." },
      { status: 500 }
    );
  }

  // Log for rate limiting
  await supabase.from("otp_requests").insert({ phone: email });

  return NextResponse.json({ ok: true, message: `OTP sent to ${email}` });
}
