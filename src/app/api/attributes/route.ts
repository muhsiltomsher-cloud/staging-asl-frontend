import { NextRequest, NextResponse } from "next/server";
import { API_BASE, backendHeaders, safeJsonResponse, noCacheUrl } from "@/lib/utils/backendFetch";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const locale = searchParams.get("locale") || "en";

  try {
    const url = `${API_BASE}/wp-json/wc/v3/products/attributes?lang=${locale}`;
    const response = await fetch(noCacheUrl(url), {
      headers: {
        ...backendHeaders(),
        Authorization: `Basic ${Buffer.from(`${process.env.WC_CONSUMER_KEY}:${process.env.WC_CONSUMER_SECRET}`).toString("base64")}`,
      },
    });

    const data = await safeJsonResponse(response);

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: { code: "attributes_error", message: "Failed to fetch attributes" } },
        { status: response.status }
      );
    }

    const attributes = Array.isArray(data)
      ? data.map((attr: Record<string, unknown>) => ({
          id: attr.id,
          name: attr.name,
          slug: attr.slug,
          type: attr.type,
          order_by: attr.order_by,
          has_archives: attr.has_archives,
        }))
      : [];

    return NextResponse.json(
      { success: true, attributes },
      { headers: { "Cache-Control": "public, s-maxage=600, stale-while-revalidate=1200" } }
    );
  } catch (error) {
    console.error("Error fetching attributes:", error);
    return NextResponse.json(
      { success: false, error: { code: "network_error", message: "Failed to fetch attributes" } },
      { status: 500 }
    );
  }
}
