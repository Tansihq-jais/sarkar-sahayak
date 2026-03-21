import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

const ContentSecurityPolicy = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline' https://vercel.live;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  font-src 'self' https://fonts.gstatic.com;
  img-src 'self' blob: data: https:;
  connect-src 'self' https://openrouter.ai https://vitals.vercel-insights.com https://vercel.live;
  frame-ancestors 'none';
  base-uri 'self';
  form-action 'self';
`.replace(/\n/g, " ").trim();

const nextConfig: NextConfig = {
  // Security headers (#56)
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains; preload",
          },
          // CSP — relaxed in dev (hot reload needs unsafe-eval)
          ...(isDev
            ? []
            : [{ key: "Content-Security-Policy", value: ContentSecurityPolicy }]),
        ],
      },
    ];
  },

  async redirects() {
    return [];
  },

  // Image optimisation
  images: {
    formats: ["image/avif", "image/webp"],
  },

  // Compress output
  compress: true,

  // Remove X-Powered-By header
  poweredByHeader: false,
};

export default nextConfig;
