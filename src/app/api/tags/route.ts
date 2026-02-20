import { NextRequest, NextResponse } from "next/server";
import { API_BASE, backendHeaders, safeJsonResponse, noCacheUrl } from "@/lib/utils/backendFetch";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const locale = searchParams.get("locale") || "en";
  const perPage = searchParams.get("per_page") || "100";

  try {
    const url = `${API_BASE}/wp-json/wc/v3/products/tags?per_page=${perPage}&lang=${locale}`;
    const response = await fetch(noCacheUrl(url), {
      headers: {
        ...backendHeaders(),
        Authorization: `Basic ${Buffer.from(`${process.env.WC_CONSUMER_KEY}:${process.env.WC_CONSUMER_SECRET}`).toString("base64")}`,
      },
    });

    const data = await safeJsonResponse(response);

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: { code: "tags_error", message: "Failed to fetch tags" } },
        { status: response.status }
      );
    }

    const tags = Array.isArray(data)
      ? data.map((tag: Record<string, unknown>) => ({
          id: tag.id,
          name: tag.name,
          slug: tag.slug,
          count: tag.count,
        }))
      : [];

    return NextResponse.json(
      { success: true, tags },
      { headers: { "Cache-Control": "public, s-maxage=600, stale-while-revalidate=1200" } }
    );
  } catch (error) {
    console.error("Error fetching tags:", error);
    return NextResponse.json(
      { success: false, error: { code: "network_error", message: "Failed to fetch tags" } },
      { status: 500 }
    );
  }
}
