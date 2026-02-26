import type { MetadataRoute } from "next";

// Return empty sitemap - staging site should not be indexed by search engines
export default function sitemap(): MetadataRoute.Sitemap {
  return [];
}
