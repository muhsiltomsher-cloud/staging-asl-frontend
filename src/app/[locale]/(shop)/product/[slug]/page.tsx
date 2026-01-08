import { notFound, redirect } from "next/navigation";
import { getProductBySlug, getRelatedProducts, getProducts, getEnglishSlugForProduct, getBundleConfig, getFreeGiftProductIds } from "@/lib/api/woocommerce";
import { getProductAddons } from "@/lib/api/wcpa";
import { generateMetadata as generateSeoMetadata } from "@/lib/utils/seo";
import { ProductDetail } from "./ProductDetail";
import { BuildYourOwnSetClient } from "../../build-your-own-set/BuildYourOwnSetClient";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { siteConfig, type Locale } from "@/config/site";
import { decodeHtmlEntities } from "@/lib/utils";
import type { Metadata } from "next";

// Helper to check if a slug contains non-ASCII characters (e.g., Arabic)
function isNonAsciiSlug(slug: string): boolean {
  return /[^\x00-\x7F]/.test(slug);
}

// Increased revalidate time for better cache hit rates (5 minutes instead of 60 seconds)
export const revalidate = 300;

// Pre-render top products at build time for better performance
// Always use English slugs for URLs regardless of locale
export async function generateStaticParams() {
  try {
    // Fetch products with English locale to get English slugs
    const { products } = await getProducts({ per_page: 50, locale: "en" });
    const allParams: { locale: string; slug: string }[] = [];
    
    // Generate params for all locales but always use English slugs
    for (const locale of siteConfig.locales) {
      for (const product of products) {
        allParams.push({ locale, slug: product.slug });
      }
    }
    
    return allParams;
  } catch {
    // Return empty array if fetch fails - pages will be generated on-demand
    return [];
  }
}

interface ProductPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const product = await getProductBySlug(slug, locale as Locale);

  if (!product) {
    return generateSeoMetadata({
      title: "Product Not Found",
      description: "The requested product could not be found.",
      locale: locale as Locale,
      pathname: `/product/${slug}`,
    });
  }

  return generateSeoMetadata({
    title: decodeHtmlEntities(product.name),
    description: decodeHtmlEntities(product.short_description.replace(/<[^>]*>/g, "")).slice(0, 160),
    locale: locale as Locale,
    pathname: `/product/${slug}`,
    image: product.images[0]?.src,
  });
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { locale, slug } = await params;
  
  // If the URL contains a non-ASCII slug (e.g., Arabic), find the product and redirect to English slug
  if (isNonAsciiSlug(slug)) {
    // Try to find the product using the Arabic slug
    const product = await getProductBySlug(slug, locale as Locale);
    if (product) {
      // Get the English slug for this product
      const englishSlug = await getEnglishSlugForProduct(product.id);
      if (englishSlug && englishSlug !== slug) {
        // Redirect to the English slug URL
        redirect(`/${locale}/product/${englishSlug}`);
      }
      // If no English slug available, fall through to render the product with Arabic slug
      // This handles cases where WPML doesn't have an English translation
    } else {
      // Product not found with Arabic slug
      notFound();
    }
  }
  
  // For English slugs, fetch the product with the current locale for localized content
  const product = await getProductBySlug(slug, locale as Locale);

  if (!product) {
    notFound();
  }

  // Check if this product is a hidden gift product
  // If so, return 404 to prevent direct URL access
  const hiddenGiftProductIds = await getFreeGiftProductIds();
  if (hiddenGiftProductIds.includes(product.id)) {
    notFound();
  }

  // Check if this product has a bundle configuration
  const bundleConfig = await getBundleConfig(slug);
  
  // If bundle is enabled for this product, show the bundle builder inline
  if (bundleConfig && bundleConfig.enabled) {
    const isRTL = locale === "ar";
    
    // Fetch all products for bundle selection
    const { products: bundleProducts } = await getProducts({
      per_page: 100,
      locale: locale as Locale,
    });
    
    const breadcrumbItems = [
      {
        name: isRTL ? "المتجر" : "Shop",
        href: `/${locale}/shop`,
      },
      {
        name: product.name,
        href: `/${locale}/product/${slug}`,
      },
    ];
    
    return (
      <div className="container mx-auto px-4 py-8">
        <Breadcrumbs items={breadcrumbItems} locale={locale as Locale} />
        <BuildYourOwnSetClient
          products={bundleProducts}
          locale={locale as Locale}
          bundleProduct={product}
          bundleConfig={bundleConfig}
        />
      </div>
    );
  }

  // Fetch related products, addon forms, and English product (for English category slug) in parallel
  const [relatedProducts, productAddons, englishProduct] = await Promise.all([
    getRelatedProducts(product, {
      per_page: 8,
      locale: locale as Locale,
    }),
    getProductAddons(product.id, { locale: locale as Locale }),
    // Fetch the same product with English locale to get English category slug
    getProductBySlug(slug, "en"),
  ]);

  // Get the English category slug from the English product
  const englishCategorySlug = englishProduct?.categories?.[0]?.slug || null;

  return (
    <ProductDetail
      product={product}
      locale={locale as Locale}
      relatedProducts={relatedProducts}
      addonForms={productAddons?.forms}
      englishCategorySlug={englishCategorySlug}
    />
  );
}
