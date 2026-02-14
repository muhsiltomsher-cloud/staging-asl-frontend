/**
 * Site Configuration
 * 
 * Main configuration file for the Aromatic Scents Lab frontend.
 * These values are read from environment variables when available,
 * with fallbacks for local development.
 */
export const siteConfig = {
  // Site name - displayed in browser title, meta tags, etc.
  name: "Aromatic Scents Lab",
  
  // Site description - used for SEO meta description
  description: "Premium fragrances and aromatic products",
  
  // Frontend URL - reads from NEXT_PUBLIC_SITE_URL environment variable
  // Fallback for local development: https://aromaticscentslab.com
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://aromaticscentslab.com",
  
  // Open Graph image URL - uses the site URL for the og image
  ogImage: `${process.env.NEXT_PUBLIC_SITE_URL || "https://aromaticscentslab.com"}/og.jpg`,
  
  // WordPress/WooCommerce Backend API URL - reads from NEXT_PUBLIC_WC_API_URL environment variable
  // Fallback for local development: https://staging.aromaticscentslab.com
  apiUrl: process.env.NEXT_PUBLIC_WC_API_URL || "https://staging.aromaticscentslab.com",
  
  // Social media links
  links: {
    instagram: "https://instagram.com/aromaticscentslab",
    facebook: "https://facebook.com/aromaticscentslab",
    twitter: "https://x.com/araboriginaloud",
  },
  
  // Default locale for the site (en = English, ar = Arabic)
  defaultLocale: "en" as const,
  
  // Supported locales - add more locales here if needed
  locales: ["en", "ar"] as const,
  
  // Default currency code
  defaultCurrency: "AED" as const,
};

export type Locale = (typeof siteConfig.locales)[number];

/**
 * Currency type - now dynamic from WordPress API
 * Using string type to allow any currency code from the backend
 */
export type Currency = string;

/**
 * Base currency used by the WooCommerce Store API.
 * The API returns prices in this currency, and we convert to the user's selected currency.
 */
export const API_BASE_CURRENCY = "AED" as const;

/**
 * Locale Configuration
 * 
 * Configuration for each supported locale.
 * - name: Display name of the language
 * - dir: Text direction (ltr = left-to-right, rtl = right-to-left)
 * - hrefLang: HTML lang attribute value
 */
export const localeConfig = {
  en: {
    name: "English",
    dir: "ltr" as const,
    hrefLang: "en",
  },
  ar: {
    name: "العربية",
    dir: "rtl" as const,
    hrefLang: "ar",
  },
} as const;

export const featureFlags = {
  enableCoupons: false,
} as const;
