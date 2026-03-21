"use client";

import { useEffect, useState } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { supabase } from "@/lib/supabase";

interface SchemeRow {
  id: string;
  name: string;
  category: string;
  is_active: boolean;
  created_at: string;
}

const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD ?? "admin123";

export default function AdminSchemesPage() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [schemes, setSchemes] = useState<SchemeRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ total: 0, active: 0, sessions: 0, results: 0 });

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) setAuthed(true);
    else alert("Wrong password");
  };

  useEffect(() => {
    if (!authed) return;
    setLoading(true);

    Promise.all([
      supabase.from("schemes").select("id, name, category, is_active, created_at").order("name"),
      supabase.from("chat_sessions").select("*", { count: "exact", head: true }),
      supabase.from("eligibility_results").select("*", { count: "exact", head: true }),
    ]).then(([schemesRes, sessionsRes, resultsRes]) => {
      setSchemes(schemesRes.data ?? []);
      setStats({
        total: schemesRes.data?.length ?? 0,
        active: schemesRes.data?.filter((s) => s.is_active).length ?? 0,
        sessions: sessionsRes.count ?? 0,
        results: resultsRes.count ?? 0,
      });
    }).finally(() => setLoading(false));
  }, [authed]);

  const toggleActive = async (id: string, current: boolean) => {
    await supabase.from("schemes").update({ is_active: !current }).eq("id", id);
    setSchemes((prev) => prev.map((s) => s.id === id ? { ...s, is_active: !current } : s));
  };

  if (!authed) {
    return (
      <PageLayout>
        <div className="max-w-sm mx-auto mt-20">
          <div className="card p-8 text-center">
            <div className="text-4xl mb-4">🔐</div>
            <h1 className="text-xl font-bold text-navy mb-6">Admin Access</h1>
            <input
              type="password"
              placeholder="Enter admin password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              className="w-full rounded-xl border-2 border-sand px-4 py-2.5 text-sm outline-none focus:border-navy mb-3"
            />
            <button
              onClick={handleLogin}
              className="w-full rounded-xl bg-navy py-2.5 text-sm font-semibold text-white hover:bg-navy/90 transition-all"
            >
              Login →
            </button>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-navy">Admin Dashboard</h1>
        <p className="mt-1 text-muted">Scheme management and platform stats</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Schemes", value: stats.total, icon: "📋" },
          { label: "Active Schemes", value: stats.active, icon: "✅" },
          { label: "Chat Sessions", value: stats.sessions, icon: "💬" },
          { label: "Results Generated", value: stats.results, icon: "📊" },
        ].map((stat) => (
          <div key={stat.label} className="card p-5">
            <div className="text-2xl mb-2">{stat.icon}</div>
            <div className="text-2xl font-bold text-navy">{stat.value}</div>
            <div className="text-xs text-muted mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Schemes table */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-sand">
          <h2 className="font-bold text-navy">Schemes</h2>
          <span className="text-xs text-muted">{stats.active}/{stats.total} active</span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-muted text-sm">Loading…</div>
        ) : (
          <div className="divide-y divide-sand">
            {schemes.map((scheme) => (
              <div key={scheme.id} className="flex items-center gap-4 px-5 py-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-ink truncate">{scheme.name}</p>
                  <p className="text-xs text-muted capitalize">{scheme.category}</p>
                </div>
                <span className={`text-xs rounded-full px-2.5 py-1 font-semibold ${
                  scheme.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                }`}>
                  {scheme.is_active ? "Active" : "Inactive"}
                </span>
                <button
                  onClick={() => toggleActive(scheme.id, scheme.is_active)}
                  className="text-xs text-muted hover:text-navy border border-sand rounded-lg px-3 py-1 hover:border-navy transition-all"
                >
                  {scheme.is_active ? "Disable" : "Enable"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageLayout>
  );
}
