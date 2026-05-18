import { NextRequest, NextResponse } from "next/server";
import { getWcCredentials } from "@/lib/utils/loadEnv";
import { API_BASE as BASE_URL, backendHeaders, noCacheUrl } from "@/lib/utils/backendFetch";

interface WCCoupon {
  id: number;
  code: string;
  amount: string;
  discount_type: "percent" | "fixed_cart" | "fixed_product";
  description: string;
  date_expires: string | null;
  usage_count: number;
  usage_limit: number | null;
  usage_limit_per_user: number | null;
  minimum_amount: string;
  maximum_amount: string;
  individual_use: boolean;
  exclude_sale_items: boolean;
  free_shipping: boolean;
  product_ids: number[];
  excluded_product_ids: number[];
  product_categories: number[];
  excluded_product_categories: number[];
}

const API_BASE = `${BASE_URL}/wp-json/wc/v3`;

function getBasicAuthParams(): string {
  const { consumerKey, consumerSecret } = getWcCredentials();
  return `consumer_key=${consumerKey}&consumer_secret=${consumerSecret}`;
}

interface StoreApiProduct {
  id: number;
  slug: string;
  categories: { id: number; name: string; slug: string }[];
  prices: { price: string; regular_price: string; sale_price: string };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, product_ids, product_slugs } = body as {
      code: string;
      product_ids: number[];
      product_slugs?: { id: number; slug: string }[];
    };

    if (!code || !product_ids || !Array.isArray(product_ids)) {
      return NextResponse.json(
        { success: false, error: { code: "invalid_request", message: "Missing code or product_ids" } },
        { status: 400 }
      );
    }

    const couponUrl = `${API_BASE}/coupons?${getBasicAuthParams()}&code=${encodeURIComponent(code)}`;
    const couponResponse = await fetch(noCacheUrl(couponUrl), {
      method: "GET",
      headers: backendHeaders(),
    });

    const coupons = await couponResponse.json();

    if (!couponResponse.ok || !Array.isArray(coupons) || coupons.length === 0) {
      return NextResponse.json(
        { success: false, error: { code: "invalid_coupon", message: "Invalid coupon code" } },
        { status: 404 }
      );
    }

    const coupon = coupons[0] as WCCoupon;

    const now = new Date();
    if (coupon.date_expires) {
      const expiryDate = new Date(coupon.date_expires);
      if (expiryDate < now) {
        return NextResponse.json(
          { success: false, error: { code: "expired_coupon", message: "This coupon has expired" } },
          { status: 400 }
        );
      }
    }
    if (coupon.usage_limit && coupon.usage_count >= coupon.usage_limit) {
      return NextResponse.json(
        { success: false, error: { code: "usage_limit", message: "This coupon has reached its usage limit" } },
        { status: 400 }
      );
    }

    const hasProductRestrictions = (coupon.product_ids?.length > 0) || (coupon.excluded_product_ids?.length > 0);
    const hasCategoryRestrictions = (coupon.product_categories?.length > 0) || (coupon.excluded_product_categories?.length > 0);

    if (!hasProductRestrictions && !hasCategoryRestrictions) {
      return NextResponse.json({
        success: true,
        valid: true,
        coupon: {
          code: coupon.code,
          description: coupon.description,
          discount_type: coupon.discount_type,
          amount: coupon.amount,
          minimum_amount: coupon.minimum_amount,
          maximum_amount: coupon.maximum_amount,
          individual_use: coupon.individual_use,
          exclude_sale_items: coupon.exclude_sale_items,
          free_shipping: coupon.free_shipping,
          product_ids: coupon.product_ids || [],
          excluded_product_ids: coupon.excluded_product_ids || [],
          product_categories: coupon.product_categories || [],
          excluded_product_categories: coupon.excluded_product_categories || [],
          eligible_product_ids: product_ids,
        },
      });
    }

    let eligibleProductIds = [...product_ids];

    if (coupon.excluded_product_ids?.length > 0) {
      const excludedSet = new Set(coupon.excluded_product_ids);
      eligibleProductIds = eligibleProductIds.filter(id => !excludedSet.has(id));
      if (eligibleProductIds.length === 0) {
        return NextResponse.json(
          { success: false, error: { code: "excluded_products", message: "This coupon is not applicable to the products in your cart" } },
          { status: 400 }
        );
      }
    }

    if (coupon.product_ids?.length > 0) {
      const allowedSet = new Set(coupon.product_ids);
      eligibleProductIds = eligibleProductIds.filter(id => allowedSet.has(id));
      if (eligibleProductIds.length === 0) {
        return NextResponse.json(
          { success: false, error: { code: "product_restriction", message: "This coupon is not applicable to the products in your cart" } },
          { status: 400 }
        );
      }
    }

    if (hasCategoryRestrictions) {
      const productCategoryMap = new Map<number, number[]>();
      const productPriceMap = new Map<number, string>();

      // Use slug-based lookup via WC Store API to handle WPML translated IDs
      if (product_slugs && product_slugs.length > 0) {
        const validSlugs = product_slugs.filter(s => s.slug && s.slug !== "");
        const slugsParam = validSlugs.map(s => s.slug).join(",");
        const storeUrl = `${BASE_URL}/wp-json/wc/store/v1/products?slug=${encodeURIComponent(slugsParam)}&per_page=100`;
        const storeResponse = await fetch(noCacheUrl(storeUrl), {
          method: "GET",
          headers: backendHeaders(),
        });

        if (storeResponse.ok) {
          const products = (await storeResponse.json()) as StoreApiProduct[];
          // Build slug->cartId map for reverse lookup
          const slugToCartId = new Map<string, number>();
          for (const entry of validSlugs) {
            slugToCartId.set(entry.slug, entry.id);
          }
          for (const product of products) {
            const cartId = slugToCartId.get(product.slug) ?? product.id;
            const categoryIds = product.categories.map(c => c.id);
            productCategoryMap.set(cartId, categoryIds);
            productPriceMap.set(cartId, product.prices?.price || "0");
          }
        }
      } else {
        // Fallback: ID-based lookup via WC REST API v3
        const uniqueProductIds = [...new Set(product_ids)];
        const batchSize = 10;
        for (let i = 0; i < uniqueProductIds.length; i += batchSize) {
          const batch = uniqueProductIds.slice(i, i + batchSize);
          const ids = batch.join(",");
          const productUrl = `${API_BASE}/products?${getBasicAuthParams()}&include=${ids}&per_page=${batch.length}`;
          const productResponse = await fetch(noCacheUrl(productUrl), {
            method: "GET",
            headers: backendHeaders(),
          });

          if (productResponse.ok) {
            const products = (await productResponse.json()) as StoreApiProduct[];
            for (const product of products) {
              const categoryIds = product.categories.map(c => c.id);
              productCategoryMap.set(product.id, categoryIds);
              productPriceMap.set(product.id, product.prices?.price || "0");
            }
          }
        }
      }

      const paidProductIds = product_ids.filter(id => {
        const price = productPriceMap.get(id);
        return price !== undefined && parseFloat(price) > 0;
      });
      const idsForCategoryCheck = paidProductIds.length > 0 ? paidProductIds : product_ids;

      if (coupon.excluded_product_categories?.length > 0) {
        const excludedCatSet = new Set(coupon.excluded_product_categories);
        const categoryEligible = idsForCategoryCheck.filter(id => {
          const cats = productCategoryMap.get(id) || [];
          return !cats.some(catId => excludedCatSet.has(catId));
        });
        if (categoryEligible.length === 0) {
          return NextResponse.json(
            { success: false, error: { code: "excluded_category", message: "This coupon is not applicable to the products in your cart" } },
            { status: 400 }
          );
        }
        eligibleProductIds = eligibleProductIds.filter(id => categoryEligible.includes(id));
      }

      if (coupon.product_categories?.length > 0) {
        const allowedCatSet = new Set(coupon.product_categories);
        const categoryAllowed = idsForCategoryCheck.filter(id => {
          const cats = productCategoryMap.get(id) || [];
          return cats.some(catId => allowedCatSet.has(catId));
        });
        if (categoryAllowed.length === 0) {
          return NextResponse.json(
            { success: false, error: { code: "category_restriction", message: "This coupon is not applicable to the products in your cart" } },
            { status: 400 }
          );
        }
        eligibleProductIds = eligibleProductIds.filter(id => categoryAllowed.includes(id));
      }
    }

    return NextResponse.json({
      success: true,
      valid: true,
      coupon: {
        code: coupon.code,
        description: coupon.description,
        discount_type: coupon.discount_type,
        amount: coupon.amount,
        minimum_amount: coupon.minimum_amount,
        maximum_amount: coupon.maximum_amount,
        individual_use: coupon.individual_use,
        exclude_sale_items: coupon.exclude_sale_items,
        free_shipping: coupon.free_shipping,
        product_ids: coupon.product_ids || [],
        excluded_product_ids: coupon.excluded_product_ids || [],
        product_categories: coupon.product_categories || [],
        excluded_product_categories: coupon.excluded_product_categories || [],
        eligible_product_ids: eligibleProductIds,
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
