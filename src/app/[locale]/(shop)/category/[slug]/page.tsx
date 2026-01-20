import { Suspense } from "react";
import { notFound } from "next/navigation";
import { ProductGridSkeleton } from "@/components/common/Skeleton";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { getDictionary } from "@/i18n";
import { generateMetadata as generateSeoMetadata } from "@/lib/utils/seo";
import { getCategoryBySlug, getProductsByCategory, getCategories, getFreeGiftProductInfo, getBundleEnabledProductSlugs } from "@/lib/api/woocommerce";
import { siteConfig, type Locale } from "@/config/site";
import type { Metadata } from "next";
import { CategoryClient } from "./CategoryClient";
import { decodeHtmlEntities } from "@/lib/utils";

// Increased revalidate time for better cache hit rates (5 minutes instead of 60 seconds)
export const revalidate = 300;

// Pre-render all categories at build time for better performance
export async function generateStaticParams() {
  try {
    // Fetch categories for each locale to handle translated slugs
    const allParams: { locale: string; slug: string }[] = [];
    
    for (const locale of siteConfig.locales) {
      const categories = await getCategories(locale as Locale);
      for (const category of categories) {
        allParams.push({ locale, slug: category.slug });
      }
    }
    
    return allParams;
  } catch {
    // Return empty array if fetch fails - pages will be generated on-demand
    return [];
  }
}

interface CategoryPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const category = await getCategoryBySlug(slug, locale as Locale);
  const categoryName = decodeHtmlEntities(category?.name || slug.charAt(0).toUpperCase() + slug.slice(1));
  
  return generateSeoMetadata({
    title: categoryName,
    description:
      locale === "ar"
        ? `تصفح منتجات ${categoryName}`
        : `Browse ${categoryName} products`,
    locale: locale as Locale,
    pathname: `/category/${slug}`,
  });
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { locale, slug } = await params;
  const dictionary = await getDictionary(locale as Locale);

  // Fetch category and products from WooCommerce API
  const category = await getCategoryBySlug(slug, locale as Locale);
  
  if (!category) {
    notFound();
  }

  // Fetch products, gift product info (IDs and slugs), and bundle product slugs in parallel
  const [{ products: allProducts }, giftProductInfo, bundleProductSlugs] = await Promise.all([
    getProductsByCategory(slug, { per_page: 24, locale: locale as Locale }),
    getFreeGiftProductInfo(),
    getBundleEnabledProductSlugs(),
  ]);

  // Filter out gift products from the category listing
  // Use both ID and slug matching to handle WPML translations (different IDs per locale)
  const giftProductSlugsSet = new Set(giftProductInfo.slugs);
  const giftProductIdsSet = new Set(giftProductInfo.ids);
  const products = allProducts.filter(
    (product) => !giftProductIdsSet.has(product.id) && !giftProductSlugsSet.has(product.slug)
  );

    const breadcrumbItems = [
      { name: dictionary.common.shop, href: `/${locale}/shop` },
      { name: decodeHtmlEntities(category.name), href: `/${locale}/category/${slug}` },
    ];

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumbs items={breadcrumbItems} locale={locale as Locale} />

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">{decodeHtmlEntities(category.name)}</h1>
        {category.description && (
          <div className="mt-4 bg-gradient-to-r from-[#f8f5f0] to-[#faf8f5] rounded-xl p-6 border border-[#e8e4df] shadow-sm">
            <div 
              className="text-gray-700 leading-relaxed category-description [&_strong]:block [&_strong]:text-lg [&_strong]:text-gray-900 [&_strong]:font-semibold [&_strong]:mb-2 [&_a]:text-primary [&_a]:font-semibold [&_a]:underline [&_a]:underline-offset-2 [&_a]:decoration-primary/50 [&_a]:hover:decoration-primary [&_a]:transition-colors"
              dangerouslySetInnerHTML={{ __html: category.description }}
            />
          </div>
        )}
      </div>

      <Suspense fallback={<ProductGridSkeleton count={12} />}>
        <CategoryClient products={products} locale={locale as Locale} bundleProductSlugs={bundleProductSlugs} />
      </Suspense>
    </div>
  );
}
