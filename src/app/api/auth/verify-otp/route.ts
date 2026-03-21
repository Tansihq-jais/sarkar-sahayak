import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createServerClient } from "@/lib/supabase";

const Schema = z.object({
  email: z.string().email("Enter a valid email address"),
  token: z.string().length(6, "OTP must be 6 digits").regex(/^\d{6}$/),
});

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
      { error: parsed.error.errors[0]?.message ?? "Invalid OTP" },
      { status: 400 }
    );
  }

  const { email, token } = parsed.data;
  const supabase = createServerClient();

  // Verify email OTP with Supabase Auth
  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: "email",
  });

  if (error || !data.user) {
    console.error("Email OTP verify error:", error);
    return NextResponse.json(
      { error: "Invalid or expired OTP. Please try again." },
      { status: 401 }
    );
  }

  const user = data.user;

  // Upsert user in our users table using email
  await supabase.from("users").upsert(
    {
      id: user.id,
      phone: email,  // storing email in phone column for now
      last_login_at: new Date().toISOString(),
    },
    { onConflict: "id" }
  );

  const response = NextResponse.json({
    ok: true,
    userId: user.id,
    accessToken: data.session?.access_token,
  });

  if (data.session) {
    response.cookies.set("sb_access_token", data.session.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: data.session.expires_in,
      path: "/",
    });
    response.cookies.set("sb_refresh_token", data.session.refresh_token!, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });
  }

  return response;
}
