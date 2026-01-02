import { cache } from "react";
import { siteConfig, type Locale, type Currency } from "@/config/site";
import type {
  WCProduct,
  WCCategory,
  WCProductsResponse,
} from "@/types/woocommerce";

const API_BASE = `${siteConfig.apiUrl}/wp-json/wc/store/v1`;

interface FetchOptions {
  revalidate?: number;
  tags?: string[];
  locale?: Locale;
  currency?: Currency;
}

interface FetchAPIResponse<T> {
  data: T;
  total: number;
  totalPages: number;
}

async function fetchAPI<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const { revalidate = 60, tags, locale, currency } = options;

  let url = `${API_BASE}${endpoint}`;
  
  // Add locale parameter for WPML language support
  if (locale) {
    const separator = url.includes("?") ? "&" : "?";
    url = `${url}${separator}lang=${locale}`;
  }
  
  // Add currency parameter for WPML multicurrency support
  if (currency) {
    const separator = url.includes("?") ? "&" : "?";
    url = `${url}${separator}currency=${currency}`;
  }

  const response = await fetch(url, {
    next: {
      revalidate,
      tags,
    },
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

async function fetchAPIWithPagination<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<FetchAPIResponse<T>> {
  const { revalidate = 60, tags, locale, currency } = options;

  let url = `${API_BASE}${endpoint}`;
  
  // Add locale parameter for WPML language support
  if (locale) {
    const separator = url.includes("?") ? "&" : "?";
    url = `${url}${separator}lang=${locale}`;
  }
  
  // Add currency parameter for WPML multicurrency support
  if (currency) {
    const separator = url.includes("?") ? "&" : "?";
    url = `${url}${separator}currency=${currency}`;
  }

  const response = await fetch(url, {
    next: {
      revalidate,
      tags,
    },
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  const total = parseInt(response.headers.get("X-WP-Total") || "0", 10);
  const totalPages = parseInt(response.headers.get("X-WP-TotalPages") || "1", 10);

  return { data, total, totalPages };
}

// Products API
export async function getProducts(params?: {
  page?: number;
  per_page?: number;
  category?: string;
  search?: string;
  orderby?: string;
  order?: "asc" | "desc";
  locale?: Locale;
  currency?: Currency;
}): Promise<WCProductsResponse> {
  const searchParams = new URLSearchParams();

  if (params?.page) searchParams.set("page", params.page.toString());
  if (params?.per_page) searchParams.set("per_page", params.per_page.toString());
  if (params?.category) searchParams.set("category", params.category);
  if (params?.search) searchParams.set("search", params.search);
  if (params?.orderby) searchParams.set("orderby", params.orderby);
  if (params?.order) searchParams.set("order", params.order);

  const queryString = searchParams.toString();
  const endpoint = `/products${queryString ? `?${queryString}` : ""}`;

  const { data: products, total, totalPages } = await fetchAPIWithPagination<WCProduct[]>(endpoint, {
    tags: ["products"],
    locale: params?.locale,
    currency: params?.currency,
    revalidate: 300,
  });

  return {
    products,
    total,
    totalPages,
  };
}

// Helper to check if a slug contains non-ASCII characters (e.g., Arabic)
function isNonAsciiSlug(slug: string): boolean {
  return /[^\x00-\x7F]/.test(slug);
}

// Memoized version for request deduplication (used when same product is fetched multiple times in one request)
// Two-step approach for localized content:
// 1. First fetch by slug (without locale) to get the product ID reliably
// 2. Then fetch by ID with locale to get the localized name, description, and categories
export const getProductBySlug = cache(async function getProductBySlug(
  slug: string,
  locale?: Locale,
  currency?: Currency
): Promise<WCProduct | null> {
  try {
    // URL encode the slug to handle non-ASCII characters (e.g., Arabic slugs)
    const encodedSlug = encodeURIComponent(slug);
    
    // For non-ASCII slugs (e.g., Arabic), try with locale first since they may only exist in that language
    if (isNonAsciiSlug(slug) && locale) {
      const localizedProducts = await fetchAPI<WCProduct[]>(`/products?slug=${encodedSlug}`, {
        tags: ["products", `product-${slug}-${locale}`],
        locale,
        currency,
      });
      
      if (localizedProducts.length > 0) {
        return localizedProducts[0];
      }
    }
    
    // For English slugs, use two-step approach:
    // Step 1: Fetch by slug without locale to get the product ID
    const products = await fetchAPI<WCProduct[]>(`/products?slug=${encodedSlug}`, {
      tags: ["products", `product-${slug}`],
      currency,
    });

    if (products.length === 0) {
      return null;
    }
    
    const product = products[0];
    
    // Step 2: If locale is specified and different from default, fetch by ID with locale
    // to get localized name, description, and categories
    if (locale && locale !== "en") {
      const localizedProduct = await fetchAPI<WCProduct>(`/products/${product.id}`, {
        tags: ["products", `product-${product.id}-${locale}`],
        locale,
        currency,
      });
      return localizedProduct;
    }
    
    return product;
  } catch {
    return null;
  }
});

// Get the English slug for a product (used for URL generation)
// This ensures URLs always use English slugs regardless of current locale
export const getEnglishSlugForProduct = cache(async function getEnglishSlugForProduct(
  productId: number
): Promise<string | null> {
  try {
    const product = await fetchAPI<WCProduct>(`/products/${productId}`, {
      tags: ["products", `product-${productId}`],
      locale: "en", // Always fetch with English locale to get English slug
    });
    return product.slug;
  } catch {
    return null;
  }
});

export async function getProductById(
  id: number,
  locale?: Locale,
  currency?: Currency
): Promise<WCProduct | null> {
  try {
    const product = await fetchAPI<WCProduct>(`/products/${id}`, {
      tags: ["products", `product-${id}`],
      locale,
      currency,
    });

    return product;
  } catch {
    return null;
  }
}

// Categories API - Memoized for request deduplication
export const getCategories = cache(async function getCategories(locale?: Locale, currency?: Currency): Promise<WCCategory[]> {
  const categories = await fetchAPI<WCCategory[]>("/products/categories", {
    tags: ["categories"],
    locale,
    currency,
    revalidate: 600, // Cache categories longer as they change less frequently
  });

  return categories;
});

// Memoized version for request deduplication
export const getCategoryBySlug = cache(async function getCategoryBySlug(
  slug: string,
  locale?: Locale,
  currency?: Currency
): Promise<WCCategory | null> {
  try {
    const categories = await getCategories(locale, currency);
    return categories.find((cat) => cat.slug === slug) || null;
  } catch {
    return null;
  }
});

export async function getProductsByCategory(
  categorySlug: string,
  params?: {
    page?: number;
    per_page?: number;
    locale?: Locale;
    currency?: Currency;
  }
): Promise<WCProductsResponse> {
  const category = await getCategoryBySlug(categorySlug, params?.locale, params?.currency);

  if (!category) {
    return { products: [], total: 0, totalPages: 0 };
  }

  return getProducts({
    category: category.id.toString(),
    ...params,
  });
}

// Get related products by category - Memoized for request deduplication
export const getRelatedProducts = cache(async function getRelatedProducts(
  product: WCProduct,
  params?: {
    per_page?: number;
    locale?: Locale;
    currency?: Currency;
  }
): Promise<WCProduct[]> {
  const categoryId = product.categories?.[0]?.id;
  
  if (!categoryId) {
    return [];
  }

  try {
    const { products } = await getProducts({
      category: categoryId.toString(),
      per_page: params?.per_page || 8,
      locale: params?.locale,
      currency: params?.currency,
    });

    return products.filter((p) => p.id !== product.id);
  } catch {
    return [];
  }
});

// Get related products by category ID directly (for parallel fetching when category ID is known)
export const getRelatedProductsByCategoryId = cache(async function getRelatedProductsByCategoryId(
  categoryId: number,
  excludeProductId: number,
  params?: {
    per_page?: number;
    locale?: Locale;
    currency?: Currency;
  }
): Promise<WCProduct[]> {
  try {
    const { products } = await getProducts({
      category: categoryId.toString(),
      per_page: params?.per_page || 8,
      locale: params?.locale,
      currency: params?.currency,
    });

    return products.filter((p) => p.id !== excludeProductId);
  } catch {
    return [];
  }
});

// Bundle Configuration API (from ASL Bundle Manager plugin)
export interface BundleConfig {
  product_id: number;
  bundle_id?: number;
  bundle_type?: string;
  eligible_categories?: number[];
  exclude_categories?: number[];
  eligible_products: number[];
  unique_products: number[];
  total_slots: number;
  required_slots: number;
  shipping_fee?: string;
  slot_labels?: Record<string, string>;
  enabled?: boolean;
  title?: string;
}

export async function getBundleConfig(
  productSlug: string
): Promise<BundleConfig | null> {
  try {
    const response = await fetch(
      `${siteConfig.apiUrl}/wp-json/asl-bundles/v1/config?slug=${productSlug}`,
      {
        next: {
          revalidate: 60,
          tags: ["bundle-config", `bundle-config-${productSlug}`],
        },
      }
    );

    if (!response.ok) {
      return null;
    }

    return response.json();
  } catch {
    return null;
  }
}

// Helper function to format price from WooCommerce
export function formatWCPrice(prices: WCProduct["prices"]): string {
  const price = parseInt(prices.price) / Math.pow(10, prices.currency_minor_unit);
  const formatted = price.toLocaleString("en-US", {
    minimumFractionDigits: prices.currency_minor_unit,
    maximumFractionDigits: prices.currency_minor_unit,
  });

  if (prices.currency_prefix) {
    return `${prices.currency_prefix}${formatted}`;
  }

  if (prices.currency_suffix) {
    return `${formatted}${prices.currency_suffix}`;
  }

  return `${prices.currency_symbol}${formatted}`;
}
