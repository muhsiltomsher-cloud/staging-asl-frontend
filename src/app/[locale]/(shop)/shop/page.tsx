import { Suspense } from "react";
import { WCProductGrid } from "@/components/shop/WCProductGrid";
import { ProductGridSkeleton } from "@/components/common/Skeleton";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { getDictionary } from "@/i18n";
import { generateMetadata as generateSeoMetadata } from "@/lib/utils/seo";
import { getProducts } from "@/lib/api/woocommerce";
import type { Locale } from "@/config/site";
import type { Metadata } from "next";

export const revalidate = 60;

interface ShopPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({
  params,
}: ShopPageProps): Promise<Metadata> {
  const { locale } = await params;
  return generateSeoMetadata({
    title: locale === "ar" ? "المتجر" : "Shop",
    description:
      locale === "ar"
        ? "تصفح مجموعتنا الكاملة من العطور والمنتجات العطرية الفاخرة"
        : "Browse our complete collection of premium fragrances and aromatic products",
    locale: locale as Locale,
    pathname: "/shop",
  });
}

export default async function ShopPage({ params }: ShopPageProps) {
  const { locale } = await params;
  const dictionary = await getDictionary(locale as Locale);
  const isRTL = locale === "ar";

  const breadcrumbItems = [
    { name: dictionary.common.shop, href: `/${locale}/shop` },
  ];

  // Fetch products from WooCommerce API
  const { products } = await getProducts({ per_page: 24 });

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumbs items={breadcrumbItems} locale={locale as Locale} />

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          {dictionary.common.shop}
        </h1>
        <p className="mt-2 text-gray-600">
          {isRTL
            ? "اكتشف مجموعتنا الكاملة من المنتجات"
            : "Discover our complete collection of products"}
        </p>
      </div>

      {/* Filters will be added here */}
      <div className="mb-8">
        {/* ProductFilters component */}
      </div>

      <Suspense fallback={<ProductGridSkeleton count={12} />}>
        <WCProductGrid products={products} locale={locale as Locale} />
      </Suspense>

      {products.length === 0 && (
        <div className="py-12 text-center">
          <p className="text-gray-500">
            {isRTL
              ? "لا توجد منتجات متاحة حالياً. يرجى التحقق لاحقاً."
              : "No products available at the moment. Please check back later."}
          </p>
        </div>
      )}
    </div>
  );
}
