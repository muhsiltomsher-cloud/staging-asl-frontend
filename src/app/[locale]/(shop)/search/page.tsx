import { Suspense } from "react";
import { generateMetadata as generateSeoMetadata } from "@/lib/utils/seo";
import type { Locale } from "@/config/site";
import type { Metadata } from "next";
import { SearchResultsClient } from "./SearchResultsClient";
import { ProductGridSkeleton } from "@/components/common/Skeleton";
import { getFreeGiftProductIds, getBundleEnabledProductSlugs } from "@/lib/api/woocommerce";

interface SearchPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({
  params,
  searchParams,
}: SearchPageProps): Promise<Metadata> {
  const { locale } = await params;
  const { q } = await searchParams;
  const query = typeof q === "string" ? q : "";
  
  return generateSeoMetadata({
    title: locale === "ar" 
      ? query ? `نتائج البحث عن: ${query}` : "البحث"
      : query ? `Search results for: ${query}` : "Search",
    description:
      locale === "ar"
        ? "ابحث في مجموعتنا من العطور والمنتجات العطرية الفاخرة"
        : "Search our collection of premium fragrances and aromatic products",
    locale: locale as Locale,
    pathname: "/search",
  });
}

export default async function SearchPage({ params, searchParams }: SearchPageProps) {
  const { locale } = await params;
  const { q } = await searchParams;
  const query = typeof q === "string" ? q : "";

  // Fetch hidden gift product IDs and bundle product slugs in parallel
  const [hiddenGiftProductIds, bundleProductSlugs] = await Promise.all([
    getFreeGiftProductIds(),
    getBundleEnabledProductSlugs(),
  ]);

  return (
    <Suspense fallback={<SearchPageSkeleton />}>
      <SearchResultsClient 
        locale={locale as Locale} 
        initialQuery={query}
        hiddenGiftProductIds={hiddenGiftProductIds}
        bundleProductSlugs={bundleProductSlugs}
      />
    </Suspense>
  );
}

function SearchPageSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="h-10 w-64 animate-pulse rounded-lg bg-gray-200" />
          <div className="mt-2 h-5 w-48 animate-pulse rounded bg-gray-200" />
        </div>
        <ProductGridSkeleton count={12} />
      </div>
    </div>
  );
}
