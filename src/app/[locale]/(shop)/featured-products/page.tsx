import { Suspense } from "react";
import { ProductGridSkeleton } from "@/components/common/Skeleton";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { getDictionary } from "@/i18n";
import { generateMetadata as generateSeoMetadata } from "@/lib/utils/seo";
import { getFeaturedProducts, getFreeGiftProductIds, getBundleEnabledProductSlugs } from "@/lib/api/woocommerce";
import type { Locale } from "@/config/site";
import type { Metadata } from "next";
import { FeaturedProductsClient } from "./FeaturedProductsClient";

export const revalidate = 300;

interface FeaturedProductsPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: FeaturedProductsPageProps): Promise<Metadata> {
  const { locale } = await params;
  return generateSeoMetadata({
    title: locale === "ar" ? "منتجات مميزة" : "Featured Products",
    description:
      locale === "ar"
        ? "اكتشف منتجاتنا المميزة من العطور والمنتجات العطرية"
        : "Discover our featured fragrances and aromatic products",
    locale: locale as Locale,
    pathname: "/featured-products",
  });
}

export default async function FeaturedProductsPage({ params }: FeaturedProductsPageProps) {
  const { locale } = await params;
  const dictionary = await getDictionary(locale as Locale);
  const isRTL = locale === "ar";

  const breadcrumbItems = [
    { name: dictionary.common.shop, href: `/${locale}/shop` },
    { name: dictionary.sections.featuredProducts.title, href: `/${locale}/featured-products` },
  ];

  const [productsResult, giftProductIds, bundleProductSlugs] = await Promise.all([
    getFeaturedProducts({ per_page: 24, locale: locale as Locale }),
    getFreeGiftProductIds(),
    getBundleEnabledProductSlugs(),
  ]);

  const filteredProducts = productsResult.products.filter(
    (product) => !giftProductIds.includes(product.id)
  );

  const filteredTotal = productsResult.total - (productsResult.products.length - filteredProducts.length);

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumbs items={breadcrumbItems} locale={locale as Locale} />

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          {dictionary.sections.featuredProducts.title}
        </h1>
        <p className="mt-2 text-gray-600">
          {isRTL
            ? "اكتشف منتجاتنا المميزة"
            : "Discover our best sellers"}
        </p>
      </div>

      <Suspense fallback={<ProductGridSkeleton count={12} />}>
        <FeaturedProductsClient
          products={filteredProducts}
          locale={locale as Locale}
          initialTotal={filteredTotal}
          initialTotalPages={productsResult.totalPages}
          giftProductIds={giftProductIds}
          bundleProductSlugs={bundleProductSlugs}
        />
      </Suspense>
    </div>
  );
}
