import { NextRequest, NextResponse } from "next/server";
import { getProducts } from "@/lib/api/woocommerce";
import type { Locale } from "@/config/site";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  
  const page = parseInt(searchParams.get("page") || "1", 10);
  const per_page = parseInt(searchParams.get("per_page") || "24", 10);
  const category = searchParams.get("category") || undefined;
  const search = searchParams.get("search") || undefined;
  const orderby = searchParams.get("orderby") || undefined;
  const order = (searchParams.get("order") as "asc" | "desc") || undefined;
  const locale = (searchParams.get("locale") as Locale) || undefined;

  try {
    const result = await getProducts({
      page,
      per_page,
      category,
      search,
      orderby,
      order,
      locale,
    });

    return NextResponse.json(result, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}
