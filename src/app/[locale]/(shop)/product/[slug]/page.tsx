import { notFound, redirect } from "next/navigation";
import { getProductBySlug, getRelatedProducts, getProducts, getEnglishSlugForProduct, getBundleConfig, getFreeGiftProductIds, getHiddenProductIds, getCategoryBySlug, getEnglishSlugForCategory, getProductUpsellIds, getProductsByIds } from "@/lib/api/woocommerce";
import { getProductAddons } from "@/lib/api/wcpa";
import { generateMetadata as generateSeoMetadata, generateProductJsonLd } from "@/lib/utils/seo";
import { ProductDetail } from "./ProductDetail";
import { BuildYourOwnSetClient } from "../../build-your-own-set/BuildYourOwnSetClient";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { JsonLd } from "@/components/seo/JsonLd";
import { siteConfig, type Locale } from "@/config/site";
import { decodeHtmlEntities } from "@/lib/utils";
import type { Metadata } from "next";
import type { WCProduct } from "@/types/woocommerce";

// Helper to check if a slug contains non-ASCII characters (e.g., Arabic)
function isNonAsciiSlug(slug: string): boolean {
  return /[^\x00-\x7F]/.test(slug);
}

// Helper to generate product JSON-LD data from WCProduct
function getProductJsonLdData(product: WCProduct, locale: string, slug: string) {
  const minorUnit = product.prices.currency_minor_unit || 2;
  const divisor = Math.pow(10, minorUnit);
  const price = (parseInt(product.prices.price, 10) / divisor).toFixed(2);
  
  return generateProductJsonLd({
    name: decodeHtmlEntities(product.name),
    description: decodeHtmlEntities(product.short_description.replace(/<[^>]*>/g, "")).slice(0, 500),
    image: product.images[0]?.src || "",
    price,
    currency: product.prices.currency_code,
    sku: product.sku || undefined,
    availability: product.is_in_stock ? "InStock" : "OutOfStock",
    url: `${siteConfig.url}/${locale}/product/${slug}`,
  });
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

  // Fetch hidden product IDs (free gifts and products with catalog_visibility=hidden) in parallel
  const [hiddenGiftProductIds, hiddenCatalogProductIds] = await Promise.all([
    getFreeGiftProductIds(),
    getHiddenProductIds(),
  ]);
  
  // Check if this product is a hidden gift product or has hidden catalog visibility
  // If so, return 404 to prevent direct URL access
  if (hiddenGiftProductIds.includes(product.id) || hiddenCatalogProductIds.includes(product.id)) {
    notFound();
  }

  // Check if this product has a bundle configuration
  // Pass locale to get correct product/category IDs for the current language
  const bundleConfig = await getBundleConfig(slug, locale as Locale);
  
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
      <>
        <JsonLd data={getProductJsonLdData(product, locale, slug)} />
        <div className="container mx-auto px-4 py-8">
          <Breadcrumbs items={breadcrumbItems} locale={locale as Locale} />
          <BuildYourOwnSetClient
            products={bundleProducts}
            locale={locale as Locale}
            bundleProduct={product}
            bundleConfig={bundleConfig}
          />
        </div>
      </>
    );
  }

  // Fetch related products, addon forms, English product, and linked product IDs in parallel
  const [relatedProductsRaw, productAddons, englishProduct, linkedIds] = await Promise.all([
    getRelatedProducts(product, {
      per_page: 12,
      locale: locale as Locale,
    }),
    getProductAddons(product.id, { locale: locale as Locale }),
    getProductBySlug(slug, "en"),
    getProductUpsellIds(product.id, locale as Locale),
  ]);

  // Filter out hidden products from related products (free gifts and products with catalog_visibility=hidden)
  const hiddenProductIdsSet = new Set([...hiddenGiftProductIds, ...hiddenCatalogProductIds]);
  const relatedProducts = relatedProductsRaw.filter(
    (p) => !hiddenProductIdsSet.has(p.id)
  );

  // Fetch upsell products if any are configured in WooCommerce Linked Products
  const upsellProducts = linkedIds.upsell_ids.length > 0
    ? (await getProductsByIds(linkedIds.upsell_ids, locale as Locale)).filter(
        (p) => !hiddenProductIdsSet.has(p.id)
      )
    : [];

  // Get the English category slug from the English product
  // If the English product doesn't exist (WPML assigns different slugs per locale),
  // fall back to getting the English slug from the localized category ID
  let englishCategorySlug = englishProduct?.categories?.[0]?.slug || null;
  
  // If we couldn't get the English slug from the English product,
  // try to get it from the localized category using getEnglishSlugForCategory
  const primaryCategory = product.categories?.[0];
  if (!englishCategorySlug && primaryCategory?.id) {
    englishCategorySlug = await getEnglishSlugForCategory(primaryCategory.id, locale as Locale);
  }

  // Fetch the localized category to get the properly localized category name
  // The category name embedded in the product response may not be properly localized
  const localizedCategory = englishCategorySlug 
    ? await getCategoryBySlug(englishCategorySlug, locale as Locale)
    : null;
  const localizedCategoryName = localizedCategory?.name || primaryCategory?.name || null;

  return (
    <>
      <JsonLd data={getProductJsonLdData(product, locale, slug)} />
      <ProductDetail
        product={product}
        locale={locale as Locale}
        relatedProducts={relatedProducts}
        upsellProducts={upsellProducts}
        addonForms={productAddons?.forms}
        englishCategorySlug={englishCategorySlug}
        localizedCategoryName={localizedCategoryName}
        hiddenGiftProductIds={hiddenGiftProductIds}
      />
    </>
  );
}
