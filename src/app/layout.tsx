import type { Metadata } from "next";
import { Noto_Sans, Tiro_Devanagari_Hindi, Geist_Mono } from "next/font/google";
import "@/styles/globals.css";

const notoSans = Noto_Sans({
  subsets: ["latin", "devanagari"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-noto-sans",
  display: "swap",
});

const tiroDevanagari = Tiro_Devanagari_Hindi({
  subsets: ["devanagari", "latin"],
  weight: ["400"],
  variable: "--font-tiro-devanagari",
  display: "swap",
  style: ["normal", "italic"],
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Sarkar Sahayak — Government Policy Navigator",
    template: "%s | Sarkar Sahayak",
  },
  description:
    "Check your eligibility for 500+ Indian government schemes in minutes. Upload policy documents and get instant AI-powered answers.",
  keywords: [
    "government schemes India",
    "PM Awas Yojana eligibility",
    "Ayushman Bharat",
    "PM Kisan",
    "government benefits checker",
    "sarkar sahayak",
  ],
  authors: [{ name: "Sarkar Sahayak Team" }],
  creator: "Sarkar Sahayak",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
  ),
  openGraph: {
    type: "website",
    locale: "en_IN",
    title: "Sarkar Sahayak — Government Policy Navigator",
    description:
      "Find out which Indian government schemes you qualify for in under 3 minutes.",
    siteName: "Sarkar Sahayak",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sarkar Sahayak",
    description: "AI-powered Indian government scheme eligibility checker",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${notoSans.variable} ${tiroDevanagari.variable} ${geistMono.variable}`}
    >
      <body className="min-h-screen bg-cream font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
