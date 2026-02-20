import { NextRequest, NextResponse } from "next/server";
import { API_BASE, backendHeaders, safeJsonResponse, noCacheUrl } from "@/lib/utils/backendFetch";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const locale = searchParams.get("locale") || "en";

  try {
    const url = `${API_BASE}/wp-json/wc/v3/products/attributes`;
    const response = await fetch(noCacheUrl(url), {
      headers: {
        ...backendHeaders(),
        Authorization: `Basic ${Buffer.from(`${process.env.WC_CONSUMER_KEY}:${process.env.WC_CONSUMER_SECRET}`).toString("base64")}`,
      },
    });

    const attributes = await safeJsonResponse(response);

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: { code: "brands_error", message: "Failed to fetch brands" } },
        { status: response.status }
      );
    }

    const brandAttr = Array.isArray(attributes)
      ? attributes.find((attr: Record<string, unknown>) => {
          const name = String(attr.name || "").toLowerCase();
          return name === "brand" || name === "brands" || name === "pa_brand";
        })
      : null;

    if (!brandAttr) {
      return NextResponse.json({
        success: true,
        brands: [],
        message: "No brand attribute found",
      });
    }

    const termsUrl = `${API_BASE}/wp-json/wc/v3/products/attributes/${brandAttr.id}/terms?per_page=100&lang=${locale}`;
    const termsResponse = await fetch(noCacheUrl(termsUrl), {
      headers: {
        ...backendHeaders(),
        Authorization: `Basic ${Buffer.from(`${process.env.WC_CONSUMER_KEY}:${process.env.WC_CONSUMER_SECRET}`).toString("base64")}`,
      },
    });

    const terms = await safeJsonResponse(termsResponse);

    if (!termsResponse.ok) {
      return NextResponse.json({
        success: true,
        brands: [],
        message: "Failed to fetch brand terms",
      });
    }

    const brands = Array.isArray(terms)
      ? terms.map((term: Record<string, unknown>) => ({
          id: term.id,
          name: term.name,
          slug: term.slug,
          count: term.count,
        }))
      : [];

    return NextResponse.json(
      { success: true, brands },
      { headers: { "Cache-Control": "public, s-maxage=600, stale-while-revalidate=1200" } }
    );
  } catch (error) {
    console.error("Error fetching brands:", error);
    return NextResponse.json(
      { success: false, error: { code: "network_error", message: "Failed to fetch brands" } },
      { status: 500 }
    );
  }
}
