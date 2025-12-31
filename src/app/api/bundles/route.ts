import { NextRequest, NextResponse } from "next/server";
import { siteConfig } from "@/config/site";
import type { BundleConfiguration } from "@/types/bundle";

const API_BASE = `${siteConfig.apiUrl}/wp-json/asl-bundles/v1`;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const productId = searchParams.get("productId");
  const bundleId = searchParams.get("bundleId");

  try {
    let endpoint = `${API_BASE}/bundles`;
    if (bundleId) {
      endpoint = `${API_BASE}/bundles/${bundleId}`;
    } else if (productId) {
      endpoint = `${API_BASE}/bundles?product_id=${productId}`;
    }

    const response = await fetch(endpoint, {
      headers: {
        "Content-Type": "application/json",
      },
      next: {
        revalidate: 60,
        tags: ["bundles"],
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(null);
      }
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Failed to fetch bundle configuration:", error);
    return NextResponse.json(
      { error: "Failed to fetch bundle configuration" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const config: BundleConfiguration = await request.json();

    const response = await fetch(`${API_BASE}/bundles`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: config.id,
        product_id: config.productId,
        title: config.title,
        bundle_type: config.bundleType,
        shipping_fee: config.shippingFee,
        is_enabled: config.isEnabled,
        items: config.items.map((item) => ({
          id: item.id,
          title: item.title,
          is_expanded: item.isExpanded,
          rule: {
            categories: item.rule.categories,
            exclude_categories: item.rule.excludeCategories,
            tags: item.rule.tags,
            exclude_tags: item.rule.excludeTags,
            products: item.rule.products,
            product_variations: item.rule.productVariations,
            exclude_products: item.rule.excludeProducts,
            exclude_product_variations: item.rule.excludeProductVariations,
          },
          display: {
            custom_title: item.display.customTitle,
            sort_by: item.display.sortBy,
            sort_order: item.display.sortOrder,
            is_default: item.display.isDefault,
            default_product_id: item.display.defaultProductId,
            quantity: item.display.quantity,
            quantity_min: item.display.quantityMin,
            quantity_max: item.display.quantityMax,
            discount_type: item.display.discountType,
            discount_value: item.display.discountValue,
            is_optional: item.display.isOptional,
            show_price: item.display.showPrice,
          },
        })),
        created_at: config.createdAt,
        updated_at: config.updatedAt,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API Error: ${response.status}`);
    }

    const savedConfig = await response.json();
    
    return NextResponse.json(transformApiResponse(savedConfig));
  } catch (error) {
    console.error("Failed to save bundle configuration:", error);
    return NextResponse.json(
      { error: "Failed to save bundle configuration" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const config: BundleConfiguration = await request.json();

    const response = await fetch(`${API_BASE}/bundles/${config.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: config.id,
        product_id: config.productId,
        title: config.title,
        bundle_type: config.bundleType,
        shipping_fee: config.shippingFee,
        is_enabled: config.isEnabled,
        items: config.items.map((item) => ({
          id: item.id,
          title: item.title,
          is_expanded: item.isExpanded,
          rule: {
            categories: item.rule.categories,
            exclude_categories: item.rule.excludeCategories,
            tags: item.rule.tags,
            exclude_tags: item.rule.excludeTags,
            products: item.rule.products,
            product_variations: item.rule.productVariations,
            exclude_products: item.rule.excludeProducts,
            exclude_product_variations: item.rule.excludeProductVariations,
          },
          display: {
            custom_title: item.display.customTitle,
            sort_by: item.display.sortBy,
            sort_order: item.display.sortOrder,
            is_default: item.display.isDefault,
            default_product_id: item.display.defaultProductId,
            quantity: item.display.quantity,
            quantity_min: item.display.quantityMin,
            quantity_max: item.display.quantityMax,
            discount_type: item.display.discountType,
            discount_value: item.display.discountValue,
            is_optional: item.display.isOptional,
            show_price: item.display.showPrice,
          },
        })),
        updated_at: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API Error: ${response.status}`);
    }

    const savedConfig = await response.json();
    
    return NextResponse.json(transformApiResponse(savedConfig));
  } catch (error) {
    console.error("Failed to update bundle configuration:", error);
    return NextResponse.json(
      { error: "Failed to update bundle configuration" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const bundleId = searchParams.get("bundleId");

  if (!bundleId) {
    return NextResponse.json(
      { error: "Bundle ID is required" },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(`${API_BASE}/bundles/${bundleId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete bundle configuration:", error);
    return NextResponse.json(
      { error: "Failed to delete bundle configuration" },
      { status: 500 }
    );
  }
}

interface ApiItem {
  id: string;
  title: string;
  is_expanded: boolean;
  rule: {
    categories: number[];
    exclude_categories: number[];
    tags: number[];
    exclude_tags: number[];
    products: number[];
    product_variations: number[];
    exclude_products: number[];
    exclude_product_variations: number[];
  };
  display: {
    custom_title: string;
    sort_by: string;
    sort_order: string;
    is_default: boolean;
    default_product_id: number | null;
    quantity: number;
    quantity_min: number;
    quantity_max: number;
    discount_type: string;
    discount_value: number;
    is_optional: boolean;
    show_price: boolean;
  };
}

interface ApiResponse {
  id: string;
  product_id: number | null;
  title: string;
  bundle_type: string;
  shipping_fee: string;
  is_enabled: boolean;
  items: ApiItem[];
  created_at: string;
  updated_at: string;
}

function transformApiResponse(apiResponse: ApiResponse): BundleConfiguration {
  return {
    id: apiResponse.id,
    productId: apiResponse.product_id,
    title: apiResponse.title,
    bundleType: apiResponse.bundle_type as BundleConfiguration["bundleType"],
    shippingFee: apiResponse.shipping_fee as BundleConfiguration["shippingFee"],
    isEnabled: apiResponse.is_enabled,
    items: apiResponse.items.map((item) => ({
      id: item.id,
      title: item.title,
      isExpanded: item.is_expanded,
      rule: {
        categories: item.rule.categories,
        excludeCategories: item.rule.exclude_categories,
        tags: item.rule.tags,
        excludeTags: item.rule.exclude_tags,
        products: item.rule.products,
        productVariations: item.rule.product_variations,
        excludeProducts: item.rule.exclude_products,
        excludeProductVariations: item.rule.exclude_product_variations,
      },
      display: {
        customTitle: item.display.custom_title,
        sortBy: item.display.sort_by as BundleConfiguration["items"][0]["display"]["sortBy"],
        sortOrder: item.display.sort_order as BundleConfiguration["items"][0]["display"]["sortOrder"],
        isDefault: item.display.is_default,
        defaultProductId: item.display.default_product_id,
        quantity: item.display.quantity,
        quantityMin: item.display.quantity_min,
        quantityMax: item.display.quantity_max,
        discountType: item.display.discount_type as BundleConfiguration["items"][0]["display"]["discountType"],
        discountValue: item.display.discount_value,
        isOptional: item.display.is_optional,
        showPrice: item.display.show_price,
      },
    })),
    createdAt: apiResponse.created_at,
    updatedAt: apiResponse.updated_at,
  };
}
