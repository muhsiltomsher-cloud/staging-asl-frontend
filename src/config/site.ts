/**
 * Site Configuration
 * 
 * Main configuration file for the Aromatic Scents Lab frontend.
 * Update these values when deploying to different environments.
 * 
 * Test change for verification - can be removed.
 */
export const siteConfig = {
  // Site name - displayed in browser title, meta tags, etc.
  name: "Aromatic Scents Lab",
  
  // Site description - used for SEO meta description
  description: "Premium fragrances and aromatic products",
  
  // Frontend URL - update this when deploying to production
  // Local: http://localhost:3000
  // Production: https://asl-frontend-seven.vercel.app
  url: "https://asl-frontend-seven.vercel.app",
  
  // Open Graph image URL - used for social media sharing
  ogImage: "https://asl-frontend-seven.vercel.app/og.jpg",
  
  // WordPress/WooCommerce Backend API URL
  // Staging: https://adminasl.stagingndemo.com
  // Production: https://aromaticscentslab.com (or your production backend)
  apiUrl: "https://adminasl.stagingndemo.com",
  
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
export type Currency = (typeof currencies)[number]["code"];

/**
 * Supported Currencies
 * 
 * List of currencies supported by the store.
 * Each currency has: code, label, symbol, decimal places, and exchange rate from AED.
 * Exchange rates are based on WCML Multicurrency settings (1 AED = X currency).
 */
export const currencies = [
  { code: "AED", label: "UAE (AED)", symbol: "د.إ", decimals: 2, rateFromAED: 1 },
  { code: "BHD", label: "Bahrain (BHD)", symbol: "BD", decimals: 3, rateFromAED: 0.103 },
  { code: "KWD", label: "Kuwait (KWD)", symbol: "KD", decimals: 3, rateFromAED: 0.083 },
  { code: "OMR", label: "Oman (OMR)", symbol: "OMR", decimals: 3, rateFromAED: 0.105 },
  { code: "QAR", label: "Qatar (QAR)", symbol: "QR", decimals: 2, rateFromAED: 0.99 },
  { code: "SAR", label: "Saudi Arabia (SAR)", symbol: "SAR", decimals: 2, rateFromAED: 1.02 },
  { code: "USD", label: "United States (USD)", symbol: "$", decimals: 2, rateFromAED: 0.27 },
] as const;

/**
 * Base currency used by the WooCommerce Store API.
 * The API returns prices in this currency, and we convert to the user's selected currency.
 */
export const API_BASE_CURRENCY = "USD" as const;

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
