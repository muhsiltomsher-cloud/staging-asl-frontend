import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatDate(date: string, locale: string = "en") {
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-SA" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date));
}

export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "");
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + "...";
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function getLocaleFromPath(pathname: string): "en" | "ar" {
  const segments = pathname.split("/").filter(Boolean);
  if (segments[0] === "ar") return "ar";
  return "en";
}

export function getPathWithoutLocale(pathname: string): string {
  const segments = pathname.split("/").filter(Boolean);
  if (segments[0] === "en" || segments[0] === "ar") {
    return "/" + segments.slice(1).join("/");
  }
  return pathname;
}

export function getLocalizedPath(pathname: string, locale: string): string {
  const pathWithoutLocale = getPathWithoutLocale(pathname);
  return `/${locale}${pathWithoutLocale}`;
}

export function decodeHtmlEntities(text: string): string {
  const entities: Record<string, string> = {
    "&amp;": "&",
    "&lt;": "<",
    "&gt;": ">",
    "&quot;": '"',
    "&#39;": "'",
    "&apos;": "'",
    "&nbsp;": " ",
  };
  
  return text.replace(/&(?:amp|lt|gt|quot|#39|apos|nbsp);/g, (match) => entities[match] || match);
}

/**
 * Extracts the product slug from a WooCommerce permalink URL.
 * The permalink typically contains the English slug regardless of the current locale.
 * Example: "https://example.com/product/white-bouquet/" -> "white-bouquet"
 * 
 * @param permalink - The full permalink URL from WooCommerce
 * @param fallbackSlug - The slug to return if extraction fails
 * @returns The extracted slug or the fallback slug
 */
export function getProductSlugFromPermalink(permalink: string, fallbackSlug: string): string {
  if (!permalink) return fallbackSlug;
  
  try {
    // Remove trailing slash and get the last path segment
    const url = new URL(permalink);
    const pathSegments = url.pathname.split('/').filter(Boolean);
    
    // The product slug is typically the last segment after "product"
    // e.g., /product/white-bouquet/ or /ar/product/white-bouquet/
    const productIndex = pathSegments.indexOf('product');
    if (productIndex !== -1 && productIndex < pathSegments.length - 1) {
      return pathSegments[productIndex + 1];
    }
    
    // Fallback: return the last segment if "product" not found
    if (pathSegments.length > 0) {
      return pathSegments[pathSegments.length - 1];
    }
  } catch {
    // If URL parsing fails, return the fallback
  }
  
  return fallbackSlug;
}

/**
 * Extracts the category slug from a WooCommerce category permalink URL.
 * The permalink contains the localized slug based on the current language.
 * Example: "https://example.com/product-category/fragrance-oils/" -> "fragrance-oils"
 * Example: "https://example.com/ar/product-category/زيوت-عطرية/" -> "زيوت-عطرية"
 * 
 * @param link - The full category link URL from WooCommerce
 * @param fallbackSlug - The slug to return if extraction fails
 * @returns The extracted slug or the fallback slug
 */
export function getCategorySlugFromLink(link: string, fallbackSlug: string): string {
  if (!link) return fallbackSlug;
  
  try {
    // Remove trailing slash and get the last path segment
    const url = new URL(link);
    const pathSegments = url.pathname.split('/').filter(Boolean);
    
    // The category slug is typically the last segment after "product-category"
    // e.g., /product-category/fragrance-oils/ or /ar/product-category/زيوت-عطرية/
    const categoryIndex = pathSegments.indexOf('product-category');
    if (categoryIndex !== -1 && categoryIndex < pathSegments.length - 1) {
      return decodeURIComponent(pathSegments[categoryIndex + 1]);
    }
    
    // Fallback: return the last segment if "product-category" not found
    if (pathSegments.length > 0) {
      return decodeURIComponent(pathSegments[pathSegments.length - 1]);
    }
  } catch {
    // If URL parsing fails, return the fallback
  }
  
  return fallbackSlug;
}
