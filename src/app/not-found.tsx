import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        <div className="text-7xl mb-4">🗺️</div>
        <h1 className="text-4xl font-bold text-navy mb-2">404</h1>
        <h2 className="text-xl font-semibold text-ink mb-3">Page not found</h2>
        <p className="text-muted mb-8 leading-relaxed">
          The page you are looking for does not exist or may have been moved.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="rounded-xl bg-brand-orange px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-orange-dark transition-all"
          >
            Go Home
          </Link>
          <Link
            href="/schemes"
            className="rounded-xl border-2 border-navy px-6 py-2.5 text-sm font-semibold text-navy hover:bg-navy hover:text-white transition-all"
          >
            Browse Schemes
          </Link>
        </div>
      </div>
    </div>
  );
}
