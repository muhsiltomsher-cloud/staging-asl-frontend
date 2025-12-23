export const siteConfig = {
  name: "Aromatic Scents Lab",
  description: "Premium fragrances and aromatic products",
  url: "https://aromaticscentslab.com",
  ogImage: "https://aromaticscentslab.com/og.jpg",
  links: {
    instagram: "https://instagram.com/aromaticscentslab",
    facebook: "https://facebook.com/aromaticscentslab",
  },
  defaultLocale: "en" as const,
  locales: ["en", "ar"] as const,
  defaultCurrency: "SAR" as const,
};

export type Locale = (typeof siteConfig.locales)[number];
export type Currency = (typeof currencies)[number]["code"];

export const currencies = [
  { code: "BHD", label: "Bahrain (BHD)", symbol: "BD", decimals: 3 },
  { code: "KWD", label: "Kuwait (KWD)", symbol: "KD", decimals: 3 },
  { code: "OMR", label: "Oman (OMR)", symbol: "OMR", decimals: 3 },
  { code: "QAR", label: "Qatar (QAR)", symbol: "QR", decimals: 2 },
  { code: "SAR", label: "Saudi Arabia (SAR)", symbol: "SAR", decimals: 2 },
  { code: "USD", label: "United States (USD)", symbol: "$", decimals: 2 },
] as const;

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
