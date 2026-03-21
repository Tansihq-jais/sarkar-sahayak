import Link from "next/link";
import { notFound } from "next/navigation";
import { PageLayout } from "@/components/layout/PageLayout";
import { getSchemeBySlug, SCHEMES } from "@/data/schemes";

interface Props {
  params: { slug: string };
}

// Generate static params for all schemes
export function generateStaticParams() {
  return SCHEMES.map((s) => ({ slug: s.slug }));
}

export function generateMetadata({ params }: Props) {
  const scheme = getSchemeBySlug(params.slug);
  if (!scheme) return {};
  return {
    title: scheme.name,
    description: scheme.description,
  };
}

export default function SchemeDetailPage({ params }: Props) {
  const scheme = getSchemeBySlug(params.slug);
  if (!scheme) notFound();

  return (
    <PageLayout>
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-muted">
        <Link href="/schemes" className="hover:text-navy transition-colors">Schemes</Link>
        <span>›</span>
        <span className="text-ink font-medium truncate">{scheme.shortName ?? scheme.name}</span>
      </nav>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">

        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">

          {/* Header card */}
          <div className="card p-6">
            <div className="flex items-start gap-5">
              <div className="text-5xl shrink-0">{scheme.icon}</div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap gap-2 mb-2">
                  <span className="badge badge-mvp capitalize">{scheme.category}</span>
                  {scheme.isActive && (
                    <span className="badge badge-eligible">● Active</span>
                  )}
                </div>
                <h1 className="text-2xl font-bold text-navy leading-tight">{scheme.name}</h1>
                {scheme.ministry && (
                  <p className="mt-1 text-sm text-muted">{scheme.ministry}</p>
                )}
              </div>
            </div>
            <p className="mt-4 text-sm text-ink leading-relaxed">{scheme.description}</p>
          </div>

          {/* Eligibility */}
          {scheme.eligibilitySummary && (
            <div className="card p-6">
              <h2 className="text-lg font-bold text-navy mb-4 flex items-center gap-2">
                <span>✅</span> Eligibility Criteria
              </h2>
              <div className="rounded-lg bg-scheme-green-bg border border-scheme-green/20 p-4">
                <p className="text-sm text-ink leading-relaxed">{scheme.eligibilitySummary}</p>
              </div>
              <p className="mt-3 text-xs text-muted">
                * This is a summary. Upload the official PDF for a precise AI-powered eligibility check.
              </p>
            </div>
          )}

          {/* Official link */}
          {scheme.officialUrl && (
            <div className="card p-6">
              <h2 className="text-lg font-bold text-navy mb-4 flex items-center gap-2">
                <span>🔗</span> Official Resources
              </h2>
              <a
                href={scheme.officialUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-brand-orange bg-brand-orange-light px-4 py-2.5 text-sm font-semibold text-brand-orange hover:bg-brand-orange hover:text-white transition-all"
              >
                Visit Official Portal ↗
              </a>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-5">

          {/* CTA */}
          <div className="rounded-2xl bg-hero-gradient p-6 text-white text-center">
            <div className="text-4xl mb-3">{scheme.icon}</div>
            <h3 className="font-bold text-lg mb-2">Check Your Eligibility</h3>
            <p className="text-blue-100 text-sm mb-5 leading-relaxed">
              Upload the official {scheme.shortName ?? "scheme"} PDF and get an AI-powered eligibility verdict in minutes.
            </p>
            <Link
              href={`/chat?scheme=${scheme.id}`}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-orange px-5 py-3 text-sm font-semibold text-white hover:bg-brand-orange-dark transition-all active:scale-95"
            >
              Check Now →
            </Link>
            <Link
              href="/upload"
              className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white/10 border border-white/20 px-5 py-3 text-sm font-semibold text-white hover:bg-white/20 transition-all"
            >
              Upload Document First
            </Link>
          </div>

          {/* Quick facts */}
          <div className="card p-5 space-y-3">
            <h3 className="font-bold text-navy text-sm uppercase tracking-wide">Quick Facts</h3>
            {[
              { label: "Category", value: scheme.category },
              { label: "Ministry", value: scheme.ministry ?? "—" },
              { label: "Last Updated", value: scheme.lastPolicyUpdate ?? "—" },
              { label: "Status", value: scheme.isActive ? "Active" : "Inactive" },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between items-start gap-3">
                <span className="text-xs text-muted shrink-0">{label}</span>
                <span className="text-xs font-medium text-ink text-right capitalize">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
