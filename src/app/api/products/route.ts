import { NextRequest, NextResponse } from "next/server";
import { getProducts } from "@/lib/api/woocommerce";
import type { Locale } from "@/config/site";
import type { WCProduct, WCProductLightweight } from "@/types/woocommerce";

const PRODUCTS_CACHE_TTL = 5 * 60 * 1000;
interface CachedProducts {
  data: { products: WCProduct[]; total: number; totalPages: number };
  timestamp: number;
}
const productsCache = new Map<string, CachedProducts>();

/**
 * Transform a full WCProduct into a lightweight version
 * This significantly reduces payload size for product listings
 * by only including fields needed for ProductCard/ProductListCard
 */
function toProductLightweight(product: WCProduct): WCProductLightweight {
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    permalink: product.permalink,
    short_description: product.short_description,
    on_sale: product.on_sale,
    prices: {
      price: product.prices.price,
      regular_price: product.prices.regular_price,
      currency_minor_unit: product.prices.currency_minor_unit,
    },
    images: product.images.slice(0, 1).map((img) => ({
      src: img.src,
      alt: img.alt,
    })),
    categories: product.categories.slice(0, 1).map((cat) => ({
      id: cat.id,
      name: cat.name,
    })),
    is_in_stock: product.is_in_stock,
    is_purchasable: product.is_purchasable,
  };
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  
  const page = parseInt(searchParams.get("page") || "1", 10);
  const per_page = parseInt(searchParams.get("per_page") || "12", 10);
  const category = searchParams.get("category") || undefined;
  const search = searchParams.get("search") || undefined;
  const orderby = searchParams.get("orderby") || undefined;
  const order = (searchParams.get("order") as "asc" | "desc") || undefined;
  const locale = (searchParams.get("locale") as Locale) || undefined;
  const lightweight = searchParams.get("lightweight") === "true";

  try {
    const cacheKey = JSON.stringify({ page, per_page, category, search, orderby, order, locale });
    const cached = productsCache.get(cacheKey);
    let result: { products: WCProduct[]; total: number; totalPages: number };

    if (cached && Date.now() - cached.timestamp < PRODUCTS_CACHE_TTL) {
      result = cached.data;
    } else {
      result = await getProducts({
        page,
        per_page,
        category,
        search,
        orderby,
        order,
        locale,
      });
      productsCache.set(cacheKey, { data: result, timestamp: Date.now() });
    }

    const response = lightweight
      ? {
          products: result.products.map(toProductLightweight),
          total: result.total,
          totalPages: result.totalPages,
        }
      : result;

    return NextResponse.json(response, {
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
