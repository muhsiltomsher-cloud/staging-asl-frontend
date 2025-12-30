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

// Memoized version for request deduplication (used when same product is fetched multiple times in one request)
export const getProductBySlug = cache(async function getProductBySlug(
  slug: string,
  locale?: Locale,
  currency?: Currency
): Promise<WCProduct | null> {
  try {
    const products = await fetchAPI<WCProduct[]>(`/products?slug=${slug}`, {
      tags: ["products", `product-${slug}`],
      locale,
      currency,
    });

    return products.length > 0 ? products[0] : null;
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
