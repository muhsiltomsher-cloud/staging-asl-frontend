/**
 * Site Configuration
 * 
 * Main configuration file for the Aromatic Scents Lab frontend.
 * Update these values when deploying to different environments.
 */
export const siteConfig = {
  // Site name - displayed in browser title, meta tags, etc.
  name: "Aromatic Scents Lab",
  
  // Site description - used for SEO meta description
  description: "Premium fragrances and aromatic products",
  
  // Frontend URL - update this when deploying to production
  // Local: http://localhost:3000
  // Production: https://app.aromaticscentslab.com
  url: "https://app.aromaticscentslab.com",
  
  // Open Graph image URL - used for social media sharing
  ogImage: "https://app.aromaticscentslab.com/og.jpg",
  
  // WordPress/WooCommerce Backend API URL
  // Staging: https://staging.aromaticscentslab.com
  // Production: https://aromaticscentslab.com (or your production backend)
  apiUrl: "https://staging.aromaticscentslab.com",
  
  // Social media links
  links: {
    instagram: "https://instagram.com/aromaticscentslab",
    facebook: "https://facebook.com/aromaticscentslab",
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
