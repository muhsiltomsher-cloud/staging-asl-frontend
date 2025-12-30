import { Suspense } from "react";
import { ProductGridSkeleton } from "@/components/common/Skeleton";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { generateMetadata as generateSeoMetadata } from "@/lib/utils/seo";
import { getProducts, getProductBySlug } from "@/lib/api/woocommerce";
import type { Locale } from "@/config/site";
import type { Metadata } from "next";
import { BuildYourOwnSetClient } from "./BuildYourOwnSetClient";

export const revalidate = 300;

interface BuildYourOwnSetPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: BuildYourOwnSetPageProps): Promise<Metadata> {
  const { locale } = await params;
  const isRTL = locale === "ar";

  return generateSeoMetadata({
    title: isRTL ? "اصنع مجموعتك الخاصة" : "Build Your Own Set",
    description: isRTL
      ? "أنشئ مجموعة عطور فريدة من اختيارك. اختر 3 منتجات أو أكثر من العطور والزيوت واللوشن ومعطرات المنزل."
      : "Create a unique fragrance set of your choice. Pick 3 or more products from perfumes, oils, lotions, or home fragrances.",
    locale: locale as Locale,
    pathname: "/build-your-own-set",
  });
}

export default async function BuildYourOwnSetPage({
  params,
}: BuildYourOwnSetPageProps) {
  const { locale } = await params;
  const isRTL = locale === "ar";

  const breadcrumbItems = [
    {
      name: isRTL ? "المتجر" : "Shop",
      href: `/${locale}/shop`,
    },
    {
      name: isRTL ? "اصنع مجموعتك الخاصة" : "Build Your Own Set",
      href: `/${locale}/build-your-own-set`,
    },
  ];

  // Fetch all products for selection
  const { products } = await getProducts({
    per_page: 100,
    locale: locale as Locale,
  });

  // Fetch the bundle product to get its price
  const bundleProduct = await getProductBySlug(
    "build-your-own-set",
    locale as Locale
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumbs items={breadcrumbItems} locale={locale as Locale} />

      <Suspense fallback={<ProductGridSkeleton count={1} />}>
        <BuildYourOwnSetClient
          products={products}
          locale={locale as Locale}
          bundleProduct={bundleProduct}
        />
      </Suspense>
    </div>
  );
}
