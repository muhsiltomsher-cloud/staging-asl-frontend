import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
    return [
      {
        // Cache product images aggressively
        source: "/wp-content/uploads/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        // Cache API responses with stale-while-revalidate
        source: "/api/products",
        headers: [
          {
            key: "Cache-Control",
            value: "public, s-maxage=300, stale-while-revalidate=600",
          },
        ],
      },
      {
        // Cache category data longer
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
