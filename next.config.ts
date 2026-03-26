import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // F-10: Suppress X-Powered-By header to prevent technology disclosure
  poweredByHeader: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "staging.aromaticscentslab.com",
        pathname: "/wp-content/uploads/**",
      },
      {
        protocol: "https",
        hostname: "aromaticscentslab.com",
        pathname: "/wp-content/uploads/**",
      },
      {
        protocol: "https",
        hostname: "flagcdn.com",
        pathname: "/**",
      },
    ],
  },
  // Increase static page generation timeout to handle slow API responses during build
  staticPageGenerationTimeout: 120,
  // Enable experimental features for better caching
  experimental: {
    // Configure stale times for dynamic and static content
    staleTimes: {
      dynamic: 30, // 30 seconds for dynamic routes
      static: 180, // 3 minutes for static routes
    },
  },
  async rewrites() {
    const apiUrl = process.env.NEXT_PUBLIC_WC_API_URL || "https://staging.aromaticscentslab.com";
    return [
      {
        source: '/cms-media/:path*',
        destination: `${apiUrl}/wp-content/uploads/:path*`,
      },
    ];
  },
  async headers() {
    // Content Security Policy — whitelist all known third-party script/connect/image sources
    const cspDirectives = [
      "default-src 'self'",
      // Scripts: Next.js inline scripts + analytics + payment widgets + Google Sign-In
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://analytics.tiktok.com https://sc-static.net https://cdn.tamara.co https://accounts.google.com https://www.recaptcha.net https://www.gstatic.com",
      // Styles: Next.js inline styles + Google Fonts + Google Sign-In
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://accounts.google.com",
      // Images: self + WordPress backend + analytics pixels + flag CDN
      "img-src 'self' data: blob: https://staging.aromaticscentslab.com https://aromaticscentslab.com https://www.facebook.com https://www.google-analytics.com https://analytics.google.com https://flagcdn.com https://www.googletagmanager.com https://tr.snapchat.com",
      // Fonts: self + Google Fonts
      "font-src 'self' https://fonts.gstatic.com data:",
      // Connect: API calls + analytics endpoints
      "connect-src 'self' https://staging.aromaticscentslab.com https://aromaticscentslab.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com https://analytics.tiktok.com https://sc-static.net https://accounts.google.com https://oauth2.googleapis.com https://region1.google-analytics.com https://region1.analytics.google.com",
      // Frames: restrict to self and payment provider redirects
      "frame-src 'self' https://www.google.com https://www.recaptcha.net https://accounts.google.com https://td.doubleclick.net",
      // Prevent the site from being embedded in iframes on other sites (clickjacking protection)
      "frame-ancestors 'none'",
      // Forms can only submit to self
      "form-action 'self'",
      // Base URI restriction
      "base-uri 'self'",
      // Upgrade HTTP to HTTPS
      "upgrade-insecure-requests",
    ];

    const securityHeaders = [
      {
        key: "X-Robots-Tag",
        value: "noindex, nofollow, noarchive, nosnippet",
      },
      {
        key: "X-Frame-Options",
        value: "DENY",
      },
      {
        key: "X-Content-Type-Options",
        value: "nosniff",
      },
      {
        key: "X-XSS-Protection",
        value: "1; mode=block",
      },
      {
        key: "Referrer-Policy",
        value: "strict-origin-when-cross-origin",
      },
      {
        key: "Permissions-Policy",
        value: "camera=(), microphone=(), geolocation=(self), interest-cohort=()",
      },
      {
        key: "Strict-Transport-Security",
        value: "max-age=63072000; includeSubDomains; preload",
      },
      {
        key: "X-DNS-Prefetch-Control",
        value: "on",
      },
      {
        key: "Content-Security-Policy",
        value: cspDirectives.join("; "),
      },
    ];

    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
      {
        source: "/wp-content/uploads/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/api/products",
        headers: [
          {
            key: "Cache-Control",
            value: "public, s-maxage=300, stale-while-revalidate=600",
          },
        ],
      },
      {
        source: "/api/categories",
        headers: [
          {
            key: "Cache-Control",
            value: "public, s-maxage=600, stale-while-revalidate=1200",
          },
        ],
      },
    ];
  },
};


export default nextConfig;
