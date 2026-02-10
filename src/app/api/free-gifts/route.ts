import { NextRequest, NextResponse } from "next/server";
import { API_BASE, backendHeaders, noCacheUrl } from "@/lib/utils/backendFetch";

const FREE_GIFTS_CACHE_TTL = 5 * 60 * 1000;
interface CachedRules {
  data: { success: boolean; rules: unknown[] };
  timestamp: number;
}
const rulesCache = new Map<string, CachedRules>();

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const currency = searchParams.get("currency");
    const locale = searchParams.get("locale");

    const cacheKey = `${currency || ""}_${locale || ""}`;
    const cached = rulesCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < FREE_GIFTS_CACHE_TTL) {
      return NextResponse.json(cached.data, {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        },
      });
    }

    let url = `${API_BASE}/wp-json/asl-free-gifts/v1/rules`;
    const params: string[] = [];
    if (currency) {
      params.push(`currency=${encodeURIComponent(currency)}`);
    }
    if (locale) {
      params.push(`lang=${encodeURIComponent(locale)}`);
    }
    if (params.length > 0) {
      url += `?${params.join("&")}`;
    }

    const response = await fetch(noCacheUrl(url), {
      method: "GET",
      headers: backendHeaders(),
      next: {
        revalidate: 60,
        tags: ["free-gifts"],
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "api_error",
            message: "Failed to fetch free gift rules",
          },
        },
        { status: response.status }
      );
    }

    const text = await response.text();
    let data: Record<string, unknown>;
    try {
      data = JSON.parse(text) as Record<string, unknown>;
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "invalid_response",
            message: "Backend returned non-JSON response. If using LiteSpeed Cache, exclude /wp-json/* paths from caching.",
          },
        },
        { status: 502 }
      );
    }

    const responseData = { success: true, rules: (data.rules as unknown[]) || [] };
    rulesCache.set(cacheKey, { data: responseData, timestamp: Date.now() });

    return NextResponse.json(responseData, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "network_error",
          message: error instanceof Error ? error.message : "Network error occurred",
        },
      },
      { status: 500 }
    );
  }
}
