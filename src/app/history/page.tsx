"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PageLayout } from "@/components/layout/PageLayout";
import { useAuthStore } from "@/store/authStore";
import { supabase } from "@/lib/supabase";

interface HistorySession {
  id: string;
  scheme_name: string | null;
  scheme_id: string | null;
  verdict: string | null;
  turn_count: number;
  created_at: string;
  updated_at: string;
}

const VERDICT_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  ELIGIBLE: { label: "Eligible", color: "text-green-700", bg: "bg-green-100" },
  NOT_ELIGIBLE: { label: "Not Eligible", color: "text-red-700", bg: "bg-red-100" },
  LIKELY_ELIGIBLE: { label: "Likely Eligible", color: "text-yellow-700", bg: "bg-yellow-100" },
  NEED_MORE_INFO: { label: "Need More Info", color: "text-blue-700", bg: "bg-blue-100" },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export default function HistoryPage() {
  const { isLoggedIn, user } = useAuthStore();
  const [sessions, setSessions] = useState<HistorySession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isLoggedIn) { setLoading(false); return; }

    async function fetchHistory() {
      try {
        const { data, error } = await supabase
          .from("chat_sessions")
          .select("id, scheme_name, scheme_id, verdict, turn_count, created_at, updated_at")
          .order("created_at", { ascending: false })
          .limit(50);

        if (error) throw error;
        setSessions(data ?? []);
      } catch (err) {
        setError("Failed to load history. Please try again.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchHistory();
  }, [isLoggedIn]);

  // Not logged in
  if (!isLoggedIn) {
    return (
      <PageLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold text-navy mb-3">Sign In to View History</h1>
          <p className="text-muted max-w-md mb-8 leading-relaxed">
            Your chat history is saved when you're signed in. Create a free account to access your past eligibility checks.
          </p>
          <Link
            href="/auth"
            className="inline-flex items-center gap-2 rounded-xl bg-brand-orange px-6 py-3 text-sm font-semibold text-white hover:bg-brand-orange-dark transition-all"
          >
            Sign In →
          </Link>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-navy">Chat History</h1>
        <p className="mt-1 text-muted">Your past eligibility checks — {user?.phone}</p>
      </div>

      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card p-5 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-sand flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-48 rounded bg-sand" />
                  <div className="h-3 w-32 rounded bg-sand" />
                </div>
                <div className="h-6 w-20 rounded-full bg-sand" />
              </div>
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {!loading && !error && sessions.length === 0 && (
        <div className="flex flex-col items-center justify-center min-h-[40vh] text-center">
          <div className="text-6xl mb-4">💬</div>
          <h2 className="text-xl font-bold text-navy mb-2">No History Yet</h2>
          <p className="text-muted mb-6">Start a chat to check your eligibility for government schemes.</p>
          <Link
            href="/chat"
            className="inline-flex items-center gap-2 rounded-xl bg-brand-orange px-6 py-3 text-sm font-semibold text-white hover:bg-brand-orange-dark transition-all"
          >
            Start Chat →
          </Link>
        </div>
      )}

      {!loading && sessions.length > 0 && (
        <div className="space-y-3">
          {sessions.map((session) => {
            const verdict = session.verdict ? VERDICT_CONFIG[session.verdict] : null;
            return (
              <div key={session.id} className="card p-5 hover:border-navy/30 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-navy/10 flex items-center justify-center text-xl flex-shrink-0">
                    🏛️
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-navy truncate">
                      {session.scheme_name ?? "Unknown Scheme"}
                    </p>
                    <p className="text-xs text-muted mt-0.5">
                      {session.turn_count} message{session.turn_count !== 1 ? "s" : ""} · {formatDate(session.created_at)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    {verdict && (
                      <span className={`text-xs font-semibold rounded-full px-3 py-1 ${verdict.bg} ${verdict.color}`}>
                        {verdict.label}
                      </span>
                    )}
                    {!verdict && (
                      <span className="text-xs text-muted rounded-full px-3 py-1 bg-sand">
                        In Progress
                      </span>
                    )}
                    <Link
                      href={`/chat?session=${session.id}`}
                      className="text-xs font-semibold text-brand-orange hover:underline"
                    >
                      View →
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </PageLayout>
  );
}
