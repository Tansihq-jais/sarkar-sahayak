import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/stories/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // ── Brand Colors ──────────────────────────────────
      colors: {
        navy: {
          DEFAULT: "#1A3C6E",
          dark: "#0F2347",
          50: "#E8EEF8",
          100: "#C5D4EC",
          200: "#9FB8DF",
          300: "#789BD1",
          400: "#5B84C7",
          500: "#1A3C6E",
          600: "#163460",
          700: "#112A50",
          800: "#0D2040",
          900: "#081630",
        },
        brand: {
          orange: "#E8622A",
          "orange-light": "#FDE8DC",
          "orange-dark": "#C44E1A",
        },
        scheme: {
          green: "#2E7D5E",
          "green-bg": "#EAF5EF",
          "green-dark": "#1B5E3B",
          purple: "#6B3FA0",
          "purple-bg": "#F3EEFB",
          teal: "#1A6E6E",
          "teal-bg": "#E0F4F4",
          red: "#C0392B",
          "red-bg": "#FDEAEA",
          yellow: "#B7860B",
          "yellow-bg": "#FEF9E7",
        },
        // Neutral palette
        cream: "#FAF7F2",
        sand: {
          DEFAULT: "#EDE8DF",
          dark: "#D8D0C4",
        },
        ink: "#1C1C1E",
        muted: "#6B6860",
        light: "#A8A39A",
      },

      // ── Typography ────────────────────────────────────
      fontFamily: {
        sans: ["var(--font-noto-sans)", "system-ui", "sans-serif"],
        devanagari: ["var(--font-tiro-devanagari)", "serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
      fontSize: {
        "2xs": ["0.625rem", { lineHeight: "0.875rem" }],
        xs: ["0.75rem", { lineHeight: "1rem" }],
        sm: ["0.875rem", { lineHeight: "1.25rem" }],
        base: ["1rem", { lineHeight: "1.5rem" }],
        lg: ["1.125rem", { lineHeight: "1.75rem" }],
        xl: ["1.25rem", { lineHeight: "1.75rem" }],
        "2xl": ["1.5rem", { lineHeight: "2rem" }],
        "3xl": ["1.875rem", { lineHeight: "2.25rem" }],
        "4xl": ["2.25rem", { lineHeight: "2.5rem" }],
        "5xl": ["3rem", { lineHeight: "1.16" }],
      },

      // ── Spacing ───────────────────────────────────────
      spacing: {
        "18": "4.5rem",
        "22": "5.5rem",
        "30": "7.5rem",
        "header": "56px",
        "breadcrumb": "36px",
      },

      // ── Border Radius ─────────────────────────────────
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
      },

      // ── Box Shadows ───────────────────────────────────
      boxShadow: {
        card: "0 2px 16px rgba(0,0,0,0.07)",
        "card-hover": "0 6px 24px rgba(0,0,0,0.12)",
        chat: "0 1px 8px rgba(0,0,0,0.08)",
        navbar: "0 2px 12px rgba(0,0,0,0.25)",
        orange: "0 4px 20px rgba(232,98,42,0.4)",
      },

      // ── Animations ────────────────────────────────────
      keyframes: {
        "fade-in": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in-right": {
          from: { opacity: "0", transform: "translateX(16px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        "bounce-dot": {
          "0%, 80%, 100%": { transform: "scale(0)" },
          "40%": { transform: "scale(1)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.3s ease forwards",
        "slide-in-right": "slide-in-right 0.3s ease forwards",
        "bounce-dot": "bounce-dot 1.2s infinite",
        shimmer: "shimmer 1.8s infinite linear",
      },

      // ── Background patterns ───────────────────────────
      backgroundImage: {
        "hero-gradient":
          "linear-gradient(135deg, #0F2347 0%, #1A3C6E 60%, #254d8c 100%)",
        "card-gradient": "linear-gradient(135deg, #FAF7F2, #EDE8DF)",
        shimmer:
          "linear-gradient(90deg, #f0ede8 25%, #e8e4de 50%, #f0ede8 75%)",
      },

      // ── Screens ───────────────────────────────────────
      screens: {
        xs: "375px",
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
        "2xl": "1536px",
      },
    },
  },
  plugins: [],
};

export default config;
