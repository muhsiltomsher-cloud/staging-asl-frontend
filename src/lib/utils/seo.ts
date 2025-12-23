import type { Metadata } from "next";
import { siteConfig, type Locale } from "@/config/site";

interface GenerateMetadataParams {
  title?: string;
  description?: string;
  image?: string;
  locale: Locale;
  pathname: string;
  noIndex?: boolean;
}

export function generateMetadata({
  title,
  description,
  image,
  locale,
  pathname,
  noIndex = false,
}: GenerateMetadataParams): Metadata {
  const fullTitle = title ? `${title} | ${siteConfig.name}` : siteConfig.name;
  const fullDescription = description || siteConfig.description;
  const ogImage = image || siteConfig.ogImage;
  const url = `${siteConfig.url}/${locale}${pathname}`;

  // alternateLocale used for hreflang tags
  const _alternateLocale = locale === "en" ? "ar" : "en";

  return {
    title: fullTitle,
    description: fullDescription,
    metadataBase: new URL(siteConfig.url),
    alternates: {
      canonical: url,
      languages: {
        en: `${siteConfig.url}/en${pathname}`,
        ar: `${siteConfig.url}/ar${pathname}`,
        "x-default": `${siteConfig.url}/en${pathname}`,
      },
    },
    openGraph: {
      title: fullTitle,
      description: fullDescription,
      url,
      siteName: siteConfig.name,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: fullTitle,
        },
      ],
      locale: locale === "ar" ? "ar_SA" : "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description: fullDescription,
      images: [ogImage],
    },
    robots: noIndex
      ? {
          index: false,
          follow: false,
        }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-video-preview": -1,
            "max-image-preview": "large",
            "max-snippet": -1,
          },
        },
  };
}

export function generateProductJsonLd(product: {
  name: string;
  description: string;
  image: string;
  price: string;
  currency: string;
  sku?: string;
  availability: "InStock" | "OutOfStock";
  url: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.image,
    sku: product.sku,
    offers: {
      "@type": "Offer",
      price: product.price,
      priceCurrency: product.currency,
      availability: `https://schema.org/${product.availability}`,
      url: product.url,
    },
  };
}

export function generateBreadcrumbJsonLd(
  items: { name: string; url: string }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function generateOrganizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    url: siteConfig.url,
    logo: `${siteConfig.url}/logo.png`,
    sameAs: [siteConfig.links.instagram, siteConfig.links.facebook],
  };
}
