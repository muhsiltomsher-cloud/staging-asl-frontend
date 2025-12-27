import { Suspense } from "react";
import { notFound } from "next/navigation";
import { ProductGridSkeleton } from "@/components/common/Skeleton";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { getDictionary } from "@/i18n";
import { generateMetadata as generateSeoMetadata } from "@/lib/utils/seo";
import { getCategoryBySlug, getProductsByCategory, getCategories } from "@/lib/api/woocommerce";
import { siteConfig, type Locale } from "@/config/site";
import type { Metadata } from "next";
import { CategoryClient } from "./CategoryClient";
import { decodeHtmlEntities } from "@/lib/utils";

// Increased revalidate time for better cache hit rates (5 minutes instead of 60 seconds)
export const revalidate = 300;

// Pre-render all categories at build time for better performance
export async function generateStaticParams() {
  try {
    const categories = await getCategories();
    
    // Generate params for each locale and category combination
    return categories.flatMap((category) =>
      siteConfig.locales.map((locale) => ({
        locale,
        slug: category.slug,
      }))
    );
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
  const category = await getCategoryBySlug(slug);
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
  const category = await getCategoryBySlug(slug);
  
  if (!category) {
    notFound();
  }

  const { products } = await getProductsByCategory(slug, { per_page: 24 });

    const breadcrumbItems = [
      { name: dictionary.common.shop, href: `/${locale}/shop` },
      { name: decodeHtmlEntities(category.name), href: `/${locale}/category/${slug}` },
    ];

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumbs items={breadcrumbItems} locale={locale as Locale} />

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{decodeHtmlEntities(category.name)}</h1>
        {category.description && (
          <p className="mt-2 text-gray-600">{category.description}</p>
        )}
      </div>

      <Suspense fallback={<ProductGridSkeleton count={12} />}>
        <CategoryClient products={products} locale={locale as Locale} />
      </Suspense>
    </div>
  );
}
