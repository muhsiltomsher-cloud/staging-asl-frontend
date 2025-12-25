"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Search, X, Grid3X3, LayoutGrid, ArrowLeft, Sparkles } from "lucide-react";
import type { Locale } from "@/config/site";
import type { WCProduct } from "@/types/woocommerce";
import { getProducts } from "@/lib/api/woocommerce";
import { WCProductGrid } from "@/components/shop/WCProductGrid";
import { ProductGridSkeleton } from "@/components/common/Skeleton";
import { cn } from "@/lib/utils";

interface SearchResultsClientProps {
  locale: Locale;
  initialQuery: string;
}

export function SearchResultsClient({
  locale,
  initialQuery,
}: SearchResultsClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(initialQuery);
  const [inputValue, setInputValue] = useState(initialQuery);
  const [products, setProducts] = useState<WCProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [gridColumns, setGridColumns] = useState<2 | 3 | 4>(4);
  const isRTL = locale === "ar";

  const fetchProducts = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setProducts([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await getProducts({
        search: searchQuery,
        per_page: 24,
        locale,
      });
      setProducts(response.products);
    } catch (error) {
      console.error("Search error:", error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [locale]);

  useEffect(() => {
    const q = searchParams.get("q") || "";
    setQuery(q);
    setInputValue(q);
    fetchProducts(q);
  }, [searchParams, fetchProducts]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      router.push(`/${locale}/search?q=${encodeURIComponent(inputValue.trim())}`);
    }
  };

  const handleClearSearch = () => {
    setInputValue("");
    router.push(`/${locale}/search`);
  };

  const translations = {
    en: {
      searchResults: "Search Results",
      resultsFor: "Results for",
      noResults: "No products found",
      noResultsDesc: "We couldn't find any products matching your search.",
      tryDifferent: "Try different keywords or browse our categories",
      searchPlaceholder: "Search for products...",
      productsFound: "products found",
      productFound: "product found",
      browseAll: "Browse All Products",
      backToShop: "Back to Shop",
      gridView: "Grid view",
      startSearching: "Start Searching",
      startSearchingDesc: "Enter a search term to find products",
      popularCategories: "Popular Categories",
    },
    ar: {
      searchResults: "نتائج البحث",
      resultsFor: "نتائج البحث عن",
      noResults: "لم يتم العثور على منتجات",
      noResultsDesc: "لم نتمكن من العثور على أي منتجات تطابق بحثك.",
      tryDifferent: "جرب كلمات مختلفة أو تصفح الفئات",
      searchPlaceholder: "ابحث عن المنتجات...",
      productsFound: "منتج تم العثور عليه",
      productFound: "منتج تم العثور عليه",
      browseAll: "تصفح جميع المنتجات",
      backToShop: "العودة للمتجر",
      gridView: "عرض الشبكة",
      startSearching: "ابدأ البحث",
      startSearchingDesc: "أدخل كلمة بحث للعثور على المنتجات",
      popularCategories: "الفئات الشائعة",
    },
  };

  const t = translations[locale];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white" dir={isRTL ? "rtl" : "ltr"}>
      {/* Hero Search Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-amber-900 via-amber-800 to-amber-900">
        <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10" />
        <div className="container mx-auto px-4 py-12 md:py-16">
          <div className="relative z-10 mx-auto max-w-3xl text-center">
            <h1 className="mb-6 text-3xl font-bold text-white md:text-4xl">
              {query ? (
                <>
                  <span className="text-amber-200">{t.resultsFor}</span>{" "}
                  <span className="italic">&ldquo;{query}&rdquo;</span>
                </>
              ) : (
                t.searchResults
              )}
            </h1>
            
            {/* Search Form */}
            <form onSubmit={handleSearch} className="relative mx-auto max-w-2xl">
              <div className="relative">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={t.searchPlaceholder}
                  className={cn(
                    "w-full rounded-2xl border-0 bg-white/95 py-4 text-lg text-gray-900 shadow-xl backdrop-blur placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400",
                    isRTL ? "pr-14 pl-14" : "pl-14 pr-14"
                  )}
                />
                <Search className={cn(
                  "absolute top-1/2 h-6 w-6 -translate-y-1/2 text-gray-400",
                  isRTL ? "right-5" : "left-5"
                )} />
                {inputValue && (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className={cn(
                      "absolute top-1/2 -translate-y-1/2 rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600",
                      isRTL ? "left-3" : "right-3"
                    )}
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>
            </form>

            {/* Results Count */}
            {query && !loading && (
              <p className="mt-4 text-amber-100">
                {products.length} {products.length === 1 ? t.productFound : t.productsFound}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Toolbar */}
        {query && products.length > 0 && (
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <Link
              href={`/${locale}/shop`}
              className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 transition-colors hover:text-amber-800"
            >
              <ArrowLeft className={cn("h-4 w-4", isRTL && "rotate-180")} />
              {t.backToShop}
            </Link>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">{t.gridView}:</span>
              <div className="flex rounded-lg border border-gray-200 bg-white p-1">
                <button
                  onClick={() => setGridColumns(2)}
                  className={cn(
                    "rounded-md p-2 transition-colors",
                    gridColumns === 2 ? "bg-amber-100 text-amber-800" : "text-gray-400 hover:text-gray-600"
                  )}
                >
                  <Grid3X3 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setGridColumns(4)}
                  className={cn(
                    "rounded-md p-2 transition-colors",
                    gridColumns === 4 ? "bg-amber-100 text-amber-800" : "text-gray-400 hover:text-gray-600"
                  )}
                >
                  <LayoutGrid className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="py-8">
            <ProductGridSkeleton count={12} />
          </div>
        )}

        {/* Empty Query State */}
        {!loading && !query && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-6 rounded-full bg-amber-100 p-6">
              <Sparkles className="h-12 w-12 text-amber-600" />
            </div>
            <h2 className="mb-2 text-2xl font-bold text-gray-900">{t.startSearching}</h2>
            <p className="mb-8 max-w-md text-gray-500">{t.startSearchingDesc}</p>
            <Link
              href={`/${locale}/shop`}
              className="inline-flex items-center gap-2 rounded-full bg-amber-800 px-8 py-3 font-medium text-white transition-all hover:bg-amber-900"
            >
              {t.browseAll}
            </Link>
          </div>
        )}

        {/* No Results State */}
        {!loading && query && products.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-6 rounded-full bg-gray-100 p-6">
              <Search className="h-12 w-12 text-gray-400" />
            </div>
            <h2 className="mb-2 text-2xl font-bold text-gray-900">{t.noResults}</h2>
            <p className="mb-2 text-gray-500">{t.noResultsDesc}</p>
            <p className="mb-8 text-sm text-gray-400">{t.tryDifferent}</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href={`/${locale}/shop`}
                className="inline-flex items-center gap-2 rounded-full bg-amber-800 px-8 py-3 font-medium text-white transition-all hover:bg-amber-900"
              >
                {t.browseAll}
              </Link>
            </div>
          </div>
        )}

        {/* Results Grid */}
        {!loading && query && products.length > 0 && (
          <WCProductGrid 
            products={products} 
            locale={locale} 
            columns={gridColumns}
          />
        )}
      </div>
    </div>
  );
}
