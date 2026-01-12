import { NextResponse } from "next/server";
import { siteConfig } from "@/config/site";

const API_BASE = `${siteConfig.apiUrl}/wp-json/asl-bundles/v1`;

export async function GET() {
  try {
    const response = await fetch(`${API_BASE}/enabled-products`, {
      next: {
        revalidate: 60,
        tags: ["bundle-enabled-products"],
      },
    });

    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data)) {
        return NextResponse.json({ slugs: data });
      }
      if (data.slugs && Array.isArray(data.slugs)) {
        return NextResponse.json({ slugs: data.slugs });
      }
    }

    const bundlesResponse = await fetch(`${API_BASE}/bundles`, {
      next: {
        revalidate: 60,
        tags: ["bundles"],
      },
    });

    if (!bundlesResponse.ok) {
      return NextResponse.json({ slugs: [] });
    }

    const bundles = await bundlesResponse.json();
    if (Array.isArray(bundles)) {
      const slugs = bundles
        .filter(
          (bundle: { is_enabled?: boolean; enabled?: boolean }) =>
            bundle.is_enabled || bundle.enabled
        )
        .map(
          (bundle: { product_slug?: string; slug?: string }) =>
            bundle.product_slug || bundle.slug
        )
        .filter((slug: string | undefined): slug is string => !!slug);
      return NextResponse.json({ slugs });
    }

    return NextResponse.json({ slugs: [] });
  } catch (error) {
    console.error("Failed to fetch bundle slugs:", error);
    return NextResponse.json({ slugs: [] });
  }
}
