"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { PageLayout } from "@/components/layout/PageLayout";
import { Chip } from "@/components/ui/Chip";
import { SchemeCardSkeleton } from "@/components/ui/Skeleton";
import { SCHEMES, CATEGORIES } from "@/data/schemes";
import type { Scheme } from "@/types";

function SchemeCard({ scheme }: { scheme: Scheme }) {
  return (
    <Link href={`/schemes/${scheme.slug}`} className="card p-5 group block">
      <div className="flex items-start gap-4">
        <div className="text-3xl shrink-0 mt-0.5">{scheme.icon}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="badge badge-mvp">{scheme.shortName ?? scheme.category}</span>
            {scheme.ministry && (
              <span className="text-2xs text-light truncate hidden sm:block">
                {scheme.ministry}
              </span>
            )}
          </div>
          <h2 className="font-bold text-navy text-sm leading-snug group-hover:text-brand-orange transition-colors">
            {scheme.name}
          </h2>
          <p className="mt-1.5 text-xs text-muted line-clamp-2 leading-relaxed">
            {scheme.description}
          </p>
        </div>
      </div>

      {scheme.eligibilitySummary && (
        <div className="mt-3 rounded-lg bg-cream px-3 py-2">
          <p className="text-2xs text-muted font-medium uppercase tracking-wide mb-0.5">Eligibility at a glance</p>
          <p className="text-xs text-ink line-clamp-2">{scheme.eligibilitySummary}</p>
        </div>
      )}

      <div className="mt-3 flex items-center justify-between">
        <span className="text-2xs text-light">
          {scheme.lastPolicyUpdate && `Updated ${scheme.lastPolicyUpdate}`}
        </span>
        <span className="text-xs font-semibold text-brand-orange group-hover:translate-x-1 transition-transform inline-block">
          Check eligibility →
        </span>
      </div>
    </Link>
  );
}

export default function SchemesPage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    return SCHEMES.filter((s) => {
      const matchesCategory = activeCategory === "all" || s.category === activeCategory;
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        s.name.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.shortName?.toLowerCase().includes(q) ||
        s.ministry?.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, search]);

  return (
    <PageLayout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-navy">Government Schemes</h1>
        <p className="mt-2 text-muted">
          Browse and filter {SCHEMES.length} preloaded central government schemes.
        </p>
      </div>

      {/* Search */}
      <div className="mb-5">
        <div className="relative max-w-md">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted text-base">🔍</span>
          <input
            type="text"
            placeholder="Search schemes, ministries..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-sand-dark bg-white py-2.5 pl-10 pr-4 text-sm text-ink placeholder:text-light focus:border-navy focus:outline-none focus:ring-2 focus:ring-navy/20 transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-light hover:text-muted text-sm"
            >✕</button>
          )}
        </div>
      </div>

      {/* Category filters */}
      <div className="mb-8 flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => (
          <Chip
            key={cat.value}
            label={cat.label}
            icon={cat.icon}
            active={activeCategory === cat.value}
            onClick={() => setActiveCategory(cat.value)}
          />
        ))}
      </div>

      {/* Results count */}
      <p className="text-sm text-muted mb-5">
        Showing <span className="font-semibold text-navy">{filtered.length}</span> schemes
        {activeCategory !== "all" && ` in ${CATEGORIES.find(c => c.value === activeCategory)?.label}`}
        {search && ` matching "${search}"`}
      </p>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">🔍</div>
          <h3 className="text-lg font-bold text-navy mb-2">No schemes found</h3>
          <p className="text-muted text-sm">Try a different search term or category.</p>
          <button
            onClick={() => { setSearch(""); setActiveCategory("all"); }}
            className="mt-4 text-sm font-semibold text-brand-orange hover:underline"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((scheme) => (
            <SchemeCard key={scheme.id} scheme={scheme} />
          ))}
        </div>
      )}
    </PageLayout>
  );
}
