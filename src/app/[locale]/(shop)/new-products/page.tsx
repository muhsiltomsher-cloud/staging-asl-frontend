import { Suspense } from "react";
import { ProductGridSkeleton } from "@/components/common/Skeleton";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { getDictionary } from "@/i18n";
import { generateMetadata as generateSeoMetadata } from "@/lib/utils/seo";
import { getNewProducts, getFreeGiftProductIds, getBundleEnabledProductSlugs } from "@/lib/api/woocommerce";
import type { Locale } from "@/config/site";
import type { Metadata } from "next";
import { NewProductsClient } from "./NewProductsClient";

export const revalidate = 300;

interface NewProductsPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: NewProductsPageProps): Promise<Metadata> {
  const { locale } = await params;
  return generateSeoMetadata({
    title: locale === "ar" ? "منتجات جديدة" : "New Products",
    description:
      locale === "ar"
        ? "اكتشف أحدث منتجاتنا من العطور والمنتجات العطرية"
        : "Discover our latest fragrances and aromatic products",
    locale: locale as Locale,
    pathname: "/new-products",
  });
}

export default async function NewProductsPage({ params }: NewProductsPageProps) {
  const { locale } = await params;
  const dictionary = await getDictionary(locale as Locale);
  const isRTL = locale === "ar";

  const breadcrumbItems = [
    { name: dictionary.common.shop, href: `/${locale}/shop` },
    { name: dictionary.sections.newProducts.title, href: `/${locale}/new-products` },
  ];

  const [productsResult, giftProductIds, bundleProductSlugs] = await Promise.all([
    getNewProducts({ per_page: 24, locale: locale as Locale }),
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
          {dictionary.sections.newProducts.title}
        </h1>
        <p className="mt-2 text-gray-600">
          {isRTL
            ? "اكتشف أحدث منتجاتنا"
            : "Discover our latest arrivals"}
        </p>
      </div>

      <Suspense fallback={<ProductGridSkeleton count={12} />}>
        <NewProductsClient
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
