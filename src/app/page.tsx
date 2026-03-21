import Link from "next/link";
import { PageLayout } from "@/components/layout/PageLayout";
import { SCHEMES } from "@/data/schemes";

const STATS = [
  { value: "500+", label: "Government Schemes" },
  { value: "3 min", label: "Average Check Time" },
  { value: "85%+", label: "Accuracy Rate" },
  { value: "Free", label: "Always & Forever" },
];

const HOW_IT_WORKS = [
  { step: "1", icon: "📋", title: "Browse Schemes", desc: "Explore 500+ central and state government schemes across housing, health, agriculture, and more." },
  { step: "2", icon: "📤", title: "Upload Policy Docs", desc: "Upload the official scheme PDF or use our preloaded library. Parsed instantly in your browser." },
  { step: "3", icon: "🤖", title: "Chat with AI", desc: "Answer a few questions. Our AI reads the policy document and checks your eligibility in real time." },
  { step: "4", icon: "✅", title: "Get Your Result", desc: "Receive a clear verdict with documents needed, eligibility criteria met, and how to apply." },
];

const POPULAR_IDS = ["pm-kisan", "ayushman-bharat", "pmay-urban", "pm-jan-dhan", "pm-ujjwala", "mudra-yojana"];
const POPULAR_SCHEMES = SCHEMES.filter((s) => POPULAR_IDS.includes(s.id));

export default function HomePage() {
  return (
    <PageLayout fullWidth className="p-0">

      {/* Hero */}
      <section className="bg-hero-gradient px-4 py-16 md:py-24 text-white">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium text-blue-100 border border-white/20">
            <span className="h-2 w-2 rounded-full bg-scheme-green animate-pulse" />
            AI-Powered · Free · Instant Results
          </div>
          <h1 className="mt-6 text-4xl font-bold leading-tight md:text-6xl text-balance">
            Find Government Schemes
            <span className="block text-brand-orange mt-1">You Actually Qualify For</span>
          </h1>
          <p className="mt-6 text-lg text-blue-100 max-w-2xl mx-auto leading-relaxed">
            Stop spending hours reading dense policy documents. Upload the PDF, answer a few questions, and get a clear eligibility verdict in under 3 minutes.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/chat" className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-orange px-8 py-4 text-base font-semibold text-white shadow-orange hover:bg-brand-orange-dark transition-all active:scale-95">
              Check My Eligibility →
            </Link>
            <Link href="/schemes" className="inline-flex items-center justify-center gap-2 rounded-xl bg-white/10 border border-white/20 px-8 py-4 text-base font-semibold text-white hover:bg-white/20 transition-all">
              Browse All Schemes
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white border-b border-sand">
        <div className="mx-auto max-w-7xl px-4 py-6 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {STATS.map(({ value, label }) => (
              <div key={label} className="text-center">
                <div className="text-3xl font-bold text-navy">{value}</div>
                <div className="text-sm text-muted mt-1">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-7xl px-4 py-16 md:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-navy">How It Works</h2>
          <p className="mt-3 text-muted max-w-xl mx-auto">From zero to eligibility verdict in four simple steps.</p>
        </div>
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {HOW_IT_WORKS.map(({ step, icon, title, desc }) => (
            <div key={step} className="relative text-center group">
              <div className="hidden lg:block absolute top-8 left-[calc(50%+2.5rem)] right-0 h-0.5 bg-sand-dark" />
              <div className="relative inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-navy-50 text-3xl mb-4 group-hover:bg-brand-orange-light transition-colors">
                {icon}
                <span className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-brand-orange text-white text-xs font-bold flex items-center justify-center">{step}</span>
              </div>
              <h3 className="font-bold text-navy text-lg mb-2">{title}</h3>
              <p className="text-sm text-muted leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Popular Schemes */}
      <section className="bg-white px-4 py-16 md:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold text-navy">Popular Schemes</h2>
              <p className="mt-2 text-muted">Most-checked schemes by citizens like you.</p>
            </div>
            <Link href="/schemes" className="text-sm font-semibold text-brand-orange hover:underline hidden sm:block">View all {SCHEMES.length} schemes →</Link>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {POPULAR_SCHEMES.map((scheme) => (
              <Link key={scheme.id} href={`/schemes/${scheme.slug}`} className="card p-5 group block">
                <div className="flex items-start gap-4">
                  <div className="text-3xl shrink-0 mt-0.5">{scheme.icon}</div>
                  <div className="flex-1 min-w-0">
                    <span className="badge badge-mvp text-xs mb-1 inline-block">{scheme.shortName ?? scheme.category}</span>
                    <h3 className="font-bold text-navy text-sm leading-snug group-hover:text-brand-orange transition-colors">{scheme.name}</h3>
                    <p className="mt-1.5 text-xs text-muted line-clamp-2 leading-relaxed">{scheme.description}</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-xs text-muted">{scheme.ministry}</span>
                  <span className="text-xs font-semibold text-brand-orange group-hover:translate-x-1 transition-transform inline-block">Check →</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-hero-gradient px-4 py-16 md:px-6 text-white text-center">
        <div className="mx-auto max-w-2xl">
          <div className="text-4xl mb-4">🚀</div>
          <h2 className="text-3xl font-bold mb-4">Ready to check your eligibility?</h2>
          <p className="text-blue-100 mb-8 text-lg">No registration needed. Upload a document or pick a scheme and start chatting right now.</p>
          <Link href="/chat" className="inline-flex items-center gap-2 rounded-xl bg-brand-orange px-8 py-4 text-base font-semibold text-white shadow-orange hover:bg-brand-orange-dark transition-all active:scale-95">
            Start Free Check →
          </Link>
        </div>
      </section>

    </PageLayout>
  );
}
