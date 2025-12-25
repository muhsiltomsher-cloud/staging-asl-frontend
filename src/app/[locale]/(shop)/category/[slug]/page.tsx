import { Suspense } from "react";
import { notFound } from "next/navigation";
import { WCProductGrid } from "@/components/shop/WCProductGrid";
import { ProductGridSkeleton } from "@/components/common/Skeleton";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { getDictionary } from "@/i18n";
import { generateMetadata as generateSeoMetadata } from "@/lib/utils/seo";
import { getCategoryBySlug, getProductsByCategory } from "@/lib/api/woocommerce";
import type { Locale } from "@/config/site";
import type { Metadata } from "next";

export const revalidate = 60;

interface CategoryPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const category = await getCategoryBySlug(slug);
  const categoryName = category?.name || slug.charAt(0).toUpperCase() + slug.slice(1);
  
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
  const isRTL = locale === "ar";

  // Fetch category and products from WooCommerce API
  const category = await getCategoryBySlug(slug);
  
  if (!category) {
    notFound();
  }

  const { products } = await getProductsByCategory(slug, { per_page: 24 });

  const breadcrumbItems = [
    { name: dictionary.common.shop, href: `/${locale}/shop` },
    { name: category.name, href: `/${locale}/category/${slug}` },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumbs items={breadcrumbItems} locale={locale as Locale} />

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{category.name}</h1>
        {category.description && (
          <p className="mt-2 text-gray-600">{category.description}</p>
        )}
      </div>

      <Suspense fallback={<ProductGridSkeleton count={12} />}>
        <WCProductGrid products={products} locale={locale as Locale} />
      </Suspense>

      {products.length === 0 && (
        <div className="py-12 text-center">
          <p className="text-gray-500">
            {isRTL
              ? "لا توجد منتجات في هذه الفئة حالياً."
              : "No products in this category at the moment."}
          </p>
        </div>
      )}
    </div>
  );
}
