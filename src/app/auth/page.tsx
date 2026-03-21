"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Step = "email" | "otp" | "success";

export default function AuthPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resendTimer, setResendTimer] = useState(0);

  const startResendTimer = () => {
    setResendTimer(60);
    const interval = setInterval(() => {
      setResendTimer((t) => {
        if (t <= 1) { clearInterval(interval); return 0; }
        return t - 1;
      });
    }, 1000);
  };

  const handleSendOtp = async () => {
    if (!email || !email.includes("@")) {
      setError("Enter a valid email address");
      return;
    }
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to send OTP");
        return;
      }
      setStep("otp");
      startResendTimer();
    } catch {
      setError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      setError("Enter the 6-digit OTP");
      return;
    }
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token: otp }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Invalid OTP");
        return;
      }
      setStep("success");
      setTimeout(() => router.push("/chat"), 1500);
    } catch {
      setError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">🏛️</div>
          <h1 className="text-2xl font-bold text-navy">Sarkar Sahayak</h1>
          <p className="text-sm text-muted mt-1">Sign in to save your eligibility history</p>
        </div>

        <div className="card p-6">

          {/* Step: Email */}
          {step === "email" && (
            <>
              <h2 className="text-lg font-bold text-navy mb-1">Enter your email</h2>
              <p className="text-sm text-muted mb-5">
                We'll send a 6-digit OTP to verify your identity
              </p>

              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendOtp()}
                autoComplete="email"
                className="w-full rounded-xl border-2 border-sand focus:border-navy outline-none px-4 py-2.5 text-sm text-ink bg-white transition-colors mb-3"
              />

              {error && <p className="text-xs text-red-600 mb-3">{error}</p>}

              <button
                onClick={handleSendOtp}
                disabled={loading || !email.includes("@")}
                className="w-full rounded-xl bg-brand-orange py-2.5 text-sm font-semibold text-white hover:bg-brand-orange-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Sending OTP…" : "Send OTP →"}
              </button>

              <p className="mt-4 text-xs text-muted text-center">
                Free — no SMS charges. OTP delivered via email instantly.
              </p>
            </>
          )}

          {/* Step: OTP */}
          {step === "otp" && (
            <>
              <h2 className="text-lg font-bold text-navy mb-1">Check your email</h2>
              <p className="text-sm text-muted mb-1">
                OTP sent to <span className="font-semibold text-navy">{email}</span>
              </p>
              <button
                onClick={() => { setStep("email"); setOtp(""); setError(""); }}
                className="text-xs text-brand-orange underline mb-5"
              >
                Use a different email
              </button>

              <input
                type="text"
                inputMode="numeric"
                placeholder="000000"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                onKeyDown={(e) => e.key === "Enter" && handleVerifyOtp()}
                maxLength={6}
                className="w-full rounded-xl border-2 border-sand focus:border-navy outline-none px-4 py-2.5 text-center text-2xl font-bold tracking-widest text-ink bg-white transition-colors mb-3"
              />

              {error && <p className="text-xs text-red-600 mb-3">{error}</p>}

              <button
                onClick={handleVerifyOtp}
                disabled={loading || otp.length < 6}
                className="w-full rounded-xl bg-brand-orange py-2.5 text-sm font-semibold text-white hover:bg-brand-orange-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Verifying…" : "Verify OTP →"}
              </button>

              <div className="mt-3 text-center">
                {resendTimer > 0 ? (
                  <p className="text-xs text-muted">Resend OTP in {resendTimer}s</p>
                ) : (
                  <button
                    onClick={() => { setOtp(""); setError(""); handleSendOtp(); }}
                    className="text-xs text-navy underline"
                  >
                    Resend OTP
                  </button>
                )}
              </div>

              <p className="mt-3 text-xs text-muted text-center">
                Check your spam folder if you don't see the email.
              </p>
            </>
          )}

          {/* Step: Success */}
          {step === "success" && (
            <div className="text-center py-4">
              <div className="text-5xl mb-3">✅</div>
              <h2 className="text-lg font-bold text-navy mb-1">Verified!</h2>
              <p className="text-sm text-muted">Redirecting to chat…</p>
            </div>
          )}
        </div>

        <p className="mt-4 text-center text-xs text-muted">
          <Link href="/" className="hover:text-navy">← Continue without signing in</Link>
        </p>
      </div>
    </div>
  );
}
