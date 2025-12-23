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
};

export default nextConfig;
