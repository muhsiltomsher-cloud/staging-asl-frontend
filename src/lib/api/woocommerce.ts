import { cache } from "react";
import { siteConfig, API_BASE_CURRENCY, type Locale, type Currency } from "@/config/site";
import type {
  WCProduct,
  WCCategory,
  WCProductsResponse,
} from "@/types/woocommerce";
import type { BundlePricing } from "@/types/bundle";

const API_BASE = `${siteConfig.apiUrl}/wp-json/wc/store/v1`;

// Default currency for Store API requests - ensures prices are returned in the base currency
const DEFAULT_API_CURRENCY = API_BASE_CURRENCY;

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
  // Use default API currency (AED) if not specified to ensure consistent pricing
  const currencyToUse = currency || DEFAULT_API_CURRENCY;
  const separator = url.includes("?") ? "&" : "?";
  url = `${url}${separator}currency=${currencyToUse}`;

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
  // Use default API currency (AED) if not specified to ensure consistent pricing
  const currencyToUse = currency || DEFAULT_API_CURRENCY;
  const separator = url.includes("?") ? "&" : "?";
  url = `${url}${separator}currency=${currencyToUse}`;

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
  try {
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
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return {
      products: [],
      total: 0,
      totalPages: 0,
    };
  }
}

// Helper to check if a slug contains non-ASCII characters (e.g., Arabic)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function isNonAsciiSlug(slug: string): boolean {
  return /[^\x00-\x7F]/.test(slug);
}

// Memoized version for request deduplication (used when same product is fetched multiple times in one request)
// WPML uses different product IDs for each language translation, so we must fetch by slug WITH locale
// to get the correct translated product directly. Fetching by ID with lang parameter does NOT work
// because the ID refers to a specific language version of the product.
export const getProductBySlug = cache(async function getProductBySlug(
  slug: string,
  locale?: Locale,
  currency?: Currency
): Promise<WCProduct | null> {
  try {
    // URL encode the slug to handle non-ASCII characters (e.g., Arabic slugs)
    const encodedSlug = encodeURIComponent(slug);
    
    // Always fetch by slug with locale to get the correct translated product
    // WPML keeps the same slug across languages but returns different product IDs
    // and localized content based on the lang parameter
    if (locale) {
      const localizedProducts = await fetchAPI<WCProduct[]>(`/products?slug=${encodedSlug}`, {
        tags: ["products", `product-${slug}-${locale}`],
        locale,
        currency,
      });
      
      if (localizedProducts.length > 0) {
        return localizedProducts[0];
      }
    }
    
    // Fallback: fetch without locale (for cases where locale is not specified)
    const products = await fetchAPI<WCProduct[]>(`/products?slug=${encodedSlug}`, {
      tags: ["products", `product-${slug}`],
      currency,
    });

    if (products.length === 0) {
      return null;
    }
    
    return products[0];
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

// Get the English slug for a category by its localized name (used for URL generation)
// This ensures category URLs always use English slugs regardless of current locale
// Note: WPML assigns different category IDs for different locales, so we match by
// finding the English category at the same position/index in the category list
export const getEnglishSlugForCategory = cache(async function getEnglishSlugForCategory(
  localizedCategoryId: number,
  locale?: Locale
): Promise<string | null> {
  try {
    // Fetch categories for both locales
    const [localizedCategories, englishCategories] = await Promise.all([
      getCategories(locale),
      getCategories("en"),
    ]);
    
    // Find the localized category by ID
    const localizedCategory = localizedCategories.find((cat) => cat.id === localizedCategoryId);
    if (!localizedCategory) {
      return null;
    }
    
    // First, try to use the slug mapping (most reliable for known categories)
    const englishSlugFromMapping = getEnglishSlugFromLocalizedSlug(localizedCategory.slug);
    if (englishSlugFromMapping) {
      return englishSlugFromMapping;
    }
    
    // Find the index of the localized category among root categories
    const localizedRootCategories = localizedCategories.filter((cat) => cat.parent === 0);
    const englishRootCategories = englishCategories.filter((cat) => cat.parent === 0);
    
    const localizedIndex = localizedRootCategories.findIndex((cat) => cat.id === localizedCategoryId);
    
    // If found at same index in English categories, return that slug
    if (localizedIndex !== -1 && localizedIndex < englishRootCategories.length) {
      return englishRootCategories[localizedIndex].slug;
    }
    
    // Fallback: try to match by similar slug pattern (for subcategories)
    // This handles cases where the category order might differ
    const englishCategory = englishCategories.find((cat) => cat.id === localizedCategoryId);
    return englishCategory?.slug || null;
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

export async function getProductsByIds(
  ids: number[],
  locale?: Locale,
  currency?: Currency
): Promise<WCProduct[]> {
  if (ids.length === 0) {
    return [];
  }

  try {
    const products = await fetchAPI<WCProduct[]>(
      `/products?include=${ids.join(",")}`,
      {
        tags: ["products", ...ids.map((id) => `product-${id}`)],
        locale,
        currency,
      }
    );

    return products;
  } catch {
    return [];
  }
}

// Categories API - Memoized for request deduplication
export const getCategories = cache(async function getCategories(locale?: Locale, currency?: Currency): Promise<WCCategory[]> {
  try {
    const categories = await fetchAPI<WCCategory[]>("/products/categories", {
      tags: ["categories"],
      locale,
      currency,
      revalidate: 600, // Cache categories longer as they change less frequently
    });

    return categories;
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    return [];
  }
});

// Mapping of English category slugs to Arabic category slugs
// This is needed because WPML assigns different slugs for each language
// and the API returns categories in different orders, making position-based matching unreliable
const ENGLISH_TO_ARABIC_CATEGORY_SLUGS: Record<string, string> = {
  "perfumes": "%d8%a7%d9%84%d8%b9%d8%b7%d9%88%d8%b1",
  "perfumes-oils": "%d8%a7%d9%84%d8%b9%d8%b7%d9%88%d8%b1-%d9%88%d8%a7%d9%84%d8%b2%d9%8a%d9%88%d8%aa",
  "home-fragrances": "%d9%85%d8%b9%d8%b7%d8%b1%d8%a7%d8%aa-%d8%a7%d9%84%d9%85%d9%86%d8%b2%d9%84",
  "personal-care": "%d8%a7%d9%84%d8%b9%d9%86%d8%a7%d9%8a%d8%a9-%d8%a7%d9%84%d8%b4%d8%ae%d8%b5%d9%8a%d8%a9",
  "gifts-set": "%d8%a3%d8%b7%d9%82%d9%85-%d8%a7%d9%84%d9%87%d8%af%d8%a7%d9%8a%d8%a7",
  "fragrance-oils": "%d8%b2%d9%8a%d9%88%d8%aa-%d8%b9%d8%b7%d8%b1%d9%8a%d8%a9",
  "hair-body-mist": "%d8%b9%d8%b7%d9%88%d8%b1-%d8%a7%d9%84%d8%b4%d8%b9%d8%b1-%d9%88%d8%a7%d9%84%d8%ac%d8%b3%d9%85",
  "hand-body-lotion": "%d9%84%d9%88%d8%b4%d9%86-%d8%a7%d9%84%d8%ac%d8%b3%d9%85-%d9%88%d8%a7%d9%84%d9%8a%d8%af%d9%8a%d9%86",
  "air-fresheners": "%d9%85%d8%b9%d8%b7%d8%b1%d8%a7%d8%aa-%d8%a7%d9%84%d8%ac%d9%88",
  "reed-diffusers": "%d9%85%d9%88%d8%b2%d8%b9-%d8%a7%d9%84%d8%b9%d8%b7%d8%b1",
};

// Create a reverse mapping from Arabic slugs to English slugs
// This is used to convert Arabic category slugs back to English slugs for URL generation
const ARABIC_TO_ENGLISH_CATEGORY_SLUGS: Record<string, string> = Object.fromEntries(
  Object.entries(ENGLISH_TO_ARABIC_CATEGORY_SLUGS).map(([en, ar]) => [ar, en])
);

// Helper function to get English slug from an Arabic/localized category slug
// Uses the reverse mapping for reliable slug conversion
function getEnglishSlugFromLocalizedSlug(localizedSlug: string): string | null {
  // If the slug is already in English (exists in the English-to-Arabic mapping), return it
  if (ENGLISH_TO_ARABIC_CATEGORY_SLUGS[localizedSlug]) {
    return localizedSlug;
  }
  
  // Try to find the English slug from the reverse mapping
  // The localized slug might be URL-encoded or decoded, so try both
  const englishSlug = ARABIC_TO_ENGLISH_CATEGORY_SLUGS[localizedSlug];
  if (englishSlug) {
    return englishSlug;
  }
  
  // Try with URL-decoded version (in case the slug is already encoded)
  try {
    const decodedSlug = decodeURIComponent(localizedSlug);
    // Check if decoded slug matches any Arabic slug pattern
    for (const [arabicSlug, enSlug] of Object.entries(ARABIC_TO_ENGLISH_CATEGORY_SLUGS)) {
      const decodedArabicSlug = decodeURIComponent(arabicSlug);
      if (decodedSlug === decodedArabicSlug) {
        return enSlug;
      }
    }
  } catch {
    // Ignore decoding errors
  }
  
  return null;
}

// Memoized version for request deduplication
// Handles the case where URLs use English slugs but the locale is non-English (e.g., Arabic)
// WPML assigns different slugs for each language, so we need to map English slugs to localized categories
export const getCategoryBySlug = cache(async function getCategoryBySlug(
  slug: string,
  locale?: Locale,
  currency?: Currency
): Promise<WCCategory | null> {
  try {
    const categories = await getCategories(locale, currency);
    
    // First, try to find by exact slug match
    const exactMatch = categories.find((cat) => cat.slug === slug);
    if (exactMatch) {
      return exactMatch;
    }
    
    // If no exact match and locale is Arabic, try to map English slug to Arabic slug
    if (locale === "ar") {
      const arabicSlug = ENGLISH_TO_ARABIC_CATEGORY_SLUGS[slug];
      if (arabicSlug) {
        const arabicMatch = categories.find((cat) => cat.slug === arabicSlug);
        if (arabicMatch) {
          return arabicMatch;
        }
      }
    }
    
    // Fallback: If locale is not English, try to find by matching with English categories
    // This handles cases where the mapping might be incomplete
    if (locale && locale !== "en") {
      const englishCategories = await getCategories("en", currency);
      
      // Find the English category with this slug
      const englishCategory = englishCategories.find((cat) => cat.slug === slug);
      if (englishCategory) {
        // Try to find a localized category with the same parent structure
        // For subcategories, find the parent first and then match by position
        if (englishCategory.parent !== 0) {
          const englishParent = englishCategories.find((cat) => cat.id === englishCategory.parent);
          if (englishParent) {
            // Find the Arabic parent using the slug mapping
            const arabicParentSlug = ENGLISH_TO_ARABIC_CATEGORY_SLUGS[englishParent.slug];
            if (arabicParentSlug) {
              const localizedParent = categories.find((cat) => cat.slug === arabicParentSlug);
              if (localizedParent) {
                // Find subcategories of this parent
                const englishSubcategories = englishCategories.filter((cat) => cat.parent === englishParent.id);
                const localizedSubcategories = categories.filter((cat) => cat.parent === localizedParent.id);
                
                const subIndex = englishSubcategories.findIndex((cat) => cat.slug === slug);
                if (subIndex !== -1 && subIndex < localizedSubcategories.length) {
                  return localizedSubcategories[subIndex];
                }
              }
            }
          }
        }
      }
    }
    
    return null;
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

// Slot-specific configuration for bundle builder
export interface SlotConfig {
  id: string | number;
  title?: string;
  is_optional?: boolean;
  eligible_categories?: number[];
  eligible_products?: number[];
  exclude_categories?: number[];
  exclude_products?: number[];
}

// Bundle Configuration API (from ASL Bundles Creator plugin)
export interface BundleConfig {
  product_id: number;
  bundle_id?: string;
  bundle_type?: string;
  eligible_categories?: number[];
  exclude_categories?: number[];
  eligible_products: number[];
  exclude_products?: number[];
  unique_products: number[];
  total_slots: number;
  required_slots: number;
  optional_slots?: number;
  with_box_price?: number;
  shipping_fee?: string;
  slot_labels?: Record<string, string>;
  enabled?: boolean;
  title?: string;
  pricing_mode?: "sum" | "fixed";
  fixed_price?: number;
  discount_type?: "none" | "percentage" | "fixed";
  discount_value?: number;
  show_individual_prices?: boolean;
  pricing?: BundlePricing;
  slots?: SlotConfig[];
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

    const text = await response.text();
    if (!text || text === 'null' || text.trim() === '') {
      return null;
    }

    const data = JSON.parse(text);
    return data;
  } catch {
    return null;
  }
}

// Fetch free gift product IDs from the backend
// Used to filter out gift products from shop listings
// Only returns product IDs where hide_from_shop is true
export interface FreeGiftInfo {
  ids: number[];
  slugs: string[];
}

export async function getFreeGiftProductIds(currency?: string): Promise<number[]> {
  const info = await getFreeGiftProductInfo(currency);
  return info.ids;
}

// Get both IDs and slugs for free gift products
// Slugs are needed for filtering across WPML locales since product IDs differ per locale
export async function getFreeGiftProductInfo(currency?: string): Promise<FreeGiftInfo> {
  try {
    let url = `${siteConfig.apiUrl}/wp-json/asl-free-gifts/v1/rules`;
    if (currency) {
      url += `?currency=${encodeURIComponent(currency)}`;
    }

    const response = await fetch(url, {
      next: {
        revalidate: 60,
        tags: ["free-gifts"],
      },
    });

    if (!response.ok) {
      return { ids: [], slugs: [] };
    }

    const data = await response.json();
    
    if (data.rules && Array.isArray(data.rules)) {
      // Return ALL free gift product IDs to hide them from shop listings
      // Free gift products (including password-protected ones) should only be
      // accessible through the free gift system, not through normal browsing
      const allRules = data.rules;
      
      const ids = allRules.map((rule: { product_id: number }) => rule.product_id);
      
      // Try to get slugs from the rules first (if API provides them)
      // The API returns slugs in rule.product.slug (nested object)
      let slugs = allRules
        .map((rule: { product?: { slug?: string }; product_slug?: string }) => 
          rule.product?.slug || rule.product_slug
        )
        .filter((slug: string | undefined): slug is string => !!slug);
      
      // If no slugs from rules, fetch product details to get slugs
      // This is needed because WPML assigns different product IDs per locale,
      // but slugs remain consistent across translations
      if (slugs.length === 0 && ids.length > 0) {
        const productSlugs = await Promise.all(
          ids.map(async (id: number) => {
            try {
              const product = await getProductById(id, "en");
              return product?.slug;
            } catch {
              return undefined;
            }
          })
        );
        slugs = productSlugs.filter((slug): slug is string => !!slug);
      }
      
      return { ids, slugs };
    }
    
    return { ids: [], slugs: [] };
  } catch {
    return { ids: [], slugs: [] };
  }
}

// Fetch all bundle-enabled product slugs from the backend
// Used to identify bundle products in shop listings
export async function getBundleEnabledProductSlugs(): Promise<string[]> {
  try {
    const response = await fetch(
      `${siteConfig.apiUrl}/wp-json/asl-bundles/v1/enabled-products`,
      {
        next: {
          revalidate: 60,
          tags: ["bundle-enabled-products"],
        },
      }
    );

    if (!response.ok) {
      // Fallback: try to get from bundles list
      const bundlesResponse = await fetch(
        `${siteConfig.apiUrl}/wp-json/asl-bundles/v1/bundles`,
        {
          next: {
            revalidate: 60,
            tags: ["bundles"],
          },
        }
      );

      if (!bundlesResponse.ok) {
        return [];
      }

      const bundles = await bundlesResponse.json();
      if (Array.isArray(bundles)) {
        // Filter enabled bundles
        const enabledBundles = bundles.filter(
          (bundle: { is_enabled?: boolean; enabled?: boolean }) => 
            bundle.is_enabled || bundle.enabled
        );

        // First try to extract slugs directly if available
        const directSlugs = enabledBundles
          .map((bundle: { product_slug?: string; slug?: string }) => 
            bundle.product_slug || bundle.slug
          )
          .filter((slug: string | undefined): slug is string => !!slug);

        if (directSlugs.length > 0) {
          return directSlugs;
        }

        // If no slugs available, fetch product slugs from product IDs
        const productIds = enabledBundles
          .map((bundle: { product_id?: number }) => bundle.product_id)
          .filter((id: number | undefined): id is number => typeof id === 'number');

        if (productIds.length > 0) {
          // Fetch product slugs from WooCommerce API
          const slugPromises = productIds.map(async (productId: number) => {
            try {
              const product = await getProductById(productId);
              return product?.slug || null;
            } catch {
              return null;
            }
          });

          const slugs = await Promise.all(slugPromises);
          return slugs.filter((slug): slug is string => slug !== null);
        }
      }
      return [];
    }

    const data = await response.json();
    if (Array.isArray(data)) {
      return data;
    }
    if (data.slugs && Array.isArray(data.slugs)) {
      return data.slugs;
    }
    return [];
  } catch {
    return [];
  }
}

// Get new products (ordered by date, newest first)
export async function getNewProducts(params?: {
  page?: number;
  per_page?: number;
  locale?: Locale;
  currency?: Currency;
}): Promise<WCProductsResponse> {
  return getProducts({
    ...params,
    orderby: "date",
    order: "desc",
  });
}

// Get featured products
// Note: WooCommerce Store API doesn't have a direct featured filter,
// so we fetch from the custom endpoint or use a workaround
export async function getFeaturedProducts(params?: {
  page?: number;
  per_page?: number;
  locale?: Locale;
  currency?: Currency;
}): Promise<WCProductsResponse> {
  try {
    // Try to fetch featured products from custom endpoint
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set("page", params.page.toString());
    if (params?.per_page) searchParams.set("per_page", params.per_page.toString());
    if (params?.locale) searchParams.set("lang", params.locale);
    
    const queryString = searchParams.toString();
    const url = `${siteConfig.apiUrl}/wp-json/wc/v3/products?featured=true${queryString ? `&${queryString}` : ""}`;
    
    const response = await fetch(url, {
      headers: {
        Authorization: `Basic ${Buffer.from(`${process.env.WC_CONSUMER_KEY}:${process.env.WC_CONSUMER_SECRET}`).toString("base64")}`,
      },
      next: {
        revalidate: 300,
        tags: ["products", "featured-products"],
      },
    });

    if (!response.ok) {
      // Fallback to regular products if featured endpoint fails
      return getProducts(params);
    }

    const products = await response.json();
    const total = parseInt(response.headers.get("X-WP-Total") || "0", 10);
    const totalPages = parseInt(response.headers.get("X-WP-TotalPages") || "1", 10);

    // Transform WC REST API v3 products to Store API format
    const transformedProducts: WCProduct[] = products.map((product: Record<string, unknown>) => ({
      id: product.id,
      name: product.name,
      slug: product.slug,
      parent: product.parent_id || 0,
      type: product.type || "simple",
      variation: "",
      permalink: product.permalink,
      sku: product.sku || "",
      short_description: product.short_description || "",
      description: product.description || "",
      on_sale: product.on_sale || false,
      prices: {
        price: String(Math.round(parseFloat(String(product.price || "0")) * 100)),
        regular_price: String(Math.round(parseFloat(String(product.regular_price || "0")) * 100)),
        sale_price: product.sale_price ? String(Math.round(parseFloat(String(product.sale_price)) * 100)) : "",
        price_range: null,
        currency_code: "AED",
        currency_symbol: "AED",
        currency_minor_unit: 2,
        currency_decimal_separator: ".",
        currency_thousand_separator: ",",
        currency_prefix: "",
        currency_suffix: " AED",
      },
      price_html: product.price_html || "",
      average_rating: product.average_rating || "0",
      review_count: product.rating_count || 0,
      images: Array.isArray(product.images) ? (product.images as Array<Record<string, unknown>>).map((img) => ({
        id: img.id || 0,
        src: img.src || "",
        thumbnail: img.src || "",
        srcset: "",
        sizes: "",
        name: img.name || "",
        alt: img.alt || "",
      })) : [],
      categories: Array.isArray(product.categories) ? (product.categories as Array<Record<string, unknown>>).map((cat) => ({
        id: cat.id || 0,
        name: cat.name || "",
        slug: cat.slug || "",
        link: "",
      })) : [],
      tags: [],
      brands: [],
      attributes: [],
      variations: [],
      grouped_products: [],
      has_options: false,
      is_purchasable: product.purchasable !== false,
      is_in_stock: product.stock_status === "instock",
      is_on_backorder: product.stock_status === "onbackorder",
      low_stock_remaining: null,
      stock_availability: {
        text: product.stock_status === "instock" ? "In Stock" : "Out of Stock",
        class: product.stock_status === "instock" ? "in-stock" : "out-of-stock",
      },
      sold_individually: product.sold_individually || false,
      add_to_cart: {
        text: "Add to Cart",
        description: "",
        url: "",
        single_text: "Add to Cart",
        minimum: 1,
        maximum: 9999,
        multiple_of: 1,
      },
      extensions: {},
    }));

    return {
      products: transformedProducts,
      total,
      totalPages,
    };
  } catch (error) {
    console.error("Failed to fetch featured products:", error);
    // Fallback to regular products
    return getProducts(params);
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
