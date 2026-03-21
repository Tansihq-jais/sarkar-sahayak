import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-navy-dark text-blue-100 mt-auto">
      <div className="mx-auto max-w-7xl px-4 py-10 md:px-6">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">

          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">🏛️</span>
              <span className="font-bold text-white text-lg">Sarkar Sahayak</span>
            </div>
            <p className="text-sm leading-relaxed opacity-75">
              AI-powered platform to check your eligibility for Indian
              government welfare schemes — in minutes, not days.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-semibold text-white mb-3 text-sm uppercase tracking-wider">
              Explore
            </h3>
            <ul className="space-y-2 text-sm">
              {[
                { href: "/schemes", label: "Browse Schemes" },
                { href: "/upload", label: "Upload Documents" },
                { href: "/chat", label: "Check Eligibility" },
              ].map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="opacity-75 hover:opacity-100 hover:text-white transition-opacity"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Disclaimer */}
          <div>
            <h3 className="font-semibold text-white mb-3 text-sm uppercase tracking-wider">
              Disclaimer
            </h3>
            <p className="text-xs leading-relaxed opacity-60">
              Sarkar Sahayak is an unofficial tool. Always verify eligibility
              at the official government portal before applying. Information
              may not reflect the latest policy updates.
            </p>
          </div>
        </div>

        <div className="mt-8 border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs opacity-50">
          <p>© {new Date().getFullYear()} Sarkar Sahayak. For informational purposes only.</p>
          <p>Built with ❤️ for India</p>
        </div>
      </div>
    </footer>
  );
}
