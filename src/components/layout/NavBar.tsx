"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useAuthStore } from "@/store/authStore";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/schemes", label: "Schemes" },
  { href: "/upload", label: "Upload" },
  { href: "/chat", label: "Chat" },
  { href: "/history", label: "History" },
];

export function NavBar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const { isLoggedIn, logout } = useAuthStore();

  return (
    <header className="sticky top-0 z-50 border-b border-sand bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-navy">
          <span className="text-xl">🏛️</span>
          <span className="hidden sm:inline text-base">Sarkar Sahayak</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                pathname === link.href
                  ? "bg-navy text-white"
                  : "text-muted hover:text-navy hover:bg-sand"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Auth button */}
        <div className="hidden md:flex items-center gap-2">
          {isLoggedIn ? (
            <button
              onClick={() => logout()}
              className="rounded-lg px-3 py-1.5 text-sm font-medium text-muted hover:text-navy hover:bg-sand transition-colors"
            >
              Sign Out
            </button>
          ) : (
            <Link
              href="/auth"
              className="rounded-xl bg-brand-orange px-4 py-1.5 text-sm font-semibold text-white hover:bg-brand-orange-dark transition-all"
            >
              Sign In
            </Link>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 rounded-lg text-muted hover:text-navy hover:bg-sand transition-colors"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          {menuOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-sand bg-white px-4 pb-4 pt-2">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className={`block rounded-lg px-3 py-2.5 text-sm font-medium transition-colors mb-1 ${
                pathname === link.href
                  ? "bg-navy text-white"
                  : "text-muted hover:text-navy hover:bg-sand"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <div className="mt-2 pt-2 border-t border-sand">
            {isLoggedIn ? (
              <button
                onClick={() => { logout(); setMenuOpen(false); }}
                className="block w-full text-left rounded-lg px-3 py-2.5 text-sm font-medium text-muted hover:text-navy hover:bg-sand"
              >
                Sign Out
              </button>
            ) : (
              <Link
                href="/auth"
                onClick={() => setMenuOpen(false)}
                className="block rounded-xl bg-brand-orange px-4 py-2.5 text-sm font-semibold text-white text-center"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
