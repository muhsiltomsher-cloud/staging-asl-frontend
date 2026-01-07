import { Suspense } from "react";
import { ProductGridSkeleton } from "@/components/common/Skeleton";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { getDictionary } from "@/i18n";
import { generateMetadata as generateSeoMetadata } from "@/lib/utils/seo";
import { getProducts, getFreeGiftProductIds } from "@/lib/api/woocommerce";
import type { Locale } from "@/config/site";
import type { Metadata } from "next";
import { ShopClient } from "./ShopClient";

// Increased revalidate time for better cache hit rates (5 minutes instead of 60 seconds)
export const revalidate = 300;

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

  // Fetch products and gift product IDs in parallel
  // Load 12 products initially for faster page load, more will load on scroll
  const [productsResult, giftProductIds] = await Promise.all([
    getProducts({ per_page: 12, locale: locale as Locale }),
    getFreeGiftProductIds(),
  ]);

  // Filter out gift products from the shop listing
  const filteredProducts = productsResult.products.filter(
    (product) => !giftProductIds.includes(product.id)
  );
  
  // Adjust total count to exclude gift products
  const filteredTotal = productsResult.total - (productsResult.products.length - filteredProducts.length);

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

      <Suspense fallback={<ProductGridSkeleton count={12} />}>
        <ShopClient 
          products={filteredProducts} 
          locale={locale as Locale}
          initialTotal={filteredTotal}
          initialTotalPages={productsResult.totalPages}
          giftProductIds={giftProductIds}
        />
      </Suspense>
    </div>
  );
}
