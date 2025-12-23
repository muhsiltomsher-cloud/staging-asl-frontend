import { Suspense } from "react";
import { ProductGrid } from "@/components/shop/ProductGrid";
import { ProductGridSkeleton } from "@/components/common/Skeleton";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { getDictionary } from "@/i18n";
import { generateMetadata as generateSeoMetadata } from "@/lib/utils/seo";
import type { Locale } from "@/config/site";
import type { Metadata } from "next";

interface CategoryPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  // In production, fetch category data from GraphQL
  const categoryName = slug.charAt(0).toUpperCase() + slug.slice(1);
  
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

  // Placeholder category data - in production, fetch from GraphQL
  const category = {
    name: slug.charAt(0).toUpperCase() + slug.slice(1),
    slug: slug,
    description: isRTL
      ? "اكتشف مجموعتنا المميزة من المنتجات"
      : "Discover our featured collection of products",
  };

  const breadcrumbItems = [
    { name: dictionary.common.shop, href: `/${locale}/shop` },
    { name: category.name, href: `/${locale}/category/${slug}` },
  ];

  // TODO: Fetch products from GraphQL
  const products: never[] = [];

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
        <ProductGrid products={products} locale={locale as Locale} />
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
