import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  // Block all crawlers - staging site should not be indexed
  return {
    rules: [
      {
        userAgent: "*",
        disallow: "/",
      },
    ],
  };
}
