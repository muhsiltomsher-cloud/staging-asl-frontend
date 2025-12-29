import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "adminasl.stagingndemo.com",
        pathname: "/wp-content/uploads/**",
      },
    ],
  },
  // Enable experimental features for better caching
  experimental: {
    // Configure stale times for dynamic and static content
    staleTimes: {
      dynamic: 30, // 30 seconds for dynamic routes
      static: 180, // 3 minutes for static routes
    },
  },
  // Configure headers for better caching
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
