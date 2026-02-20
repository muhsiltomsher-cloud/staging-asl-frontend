"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Search, Loader2 } from "lucide-react";
import { BottomSheet } from "@/components/common/BottomSheet";
import { Skeleton } from "@/components/common/Skeleton";
import type { Dictionary } from "@/i18n";
import type { Locale } from "@/config/site";
import type { WCProduct } from "@/types/woocommerce";
import { getProducts } from "@/lib/api/woocommerce";
import { FormattedPrice } from "@/components/common/FormattedPrice";
import { getProductSlugFromPermalink, decodeHtmlEntities } from "@/lib/utils";
import { useFreeGift } from "@/contexts/FreeGiftContext";

interface SearchDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  locale: Locale;
  dictionary: Dictionary;
}

export function SearchDrawer({
  isOpen,
  onClose,
  locale,
  dictionary,
}: SearchDrawerProps) {
  const router = useRouter();
  const { getFreeGiftProductIds } = useFreeGift();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<WCProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const isRTL = locale === "ar";

  const handleSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    setLoading(true);
    setHasSearched(true);
    try {
      const response = await getProducts({
        search: searchQuery,
        per_page: 6,
        locale,
      });
      // Filter out free gift products from search results
      const freeGiftIds = getFreeGiftProductIds();
      const filteredProducts = response.products.filter(
        (product) => !freeGiftIds.includes(product.id)
      );
      setResults(filteredProducts);
    } catch (error) {
      console.error("Search error:", error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [locale, getFreeGiftProductIds]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/${locale}/shop?search=${encodeURIComponent(query.trim())}`);
      onClose();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    
    const timeoutId = setTimeout(() => {
      handleSearch(value);
    }, 300);

    return () => clearTimeout(timeoutId);
  };

    const handleClose = useCallback(() => {
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
      setQuery("");
      setResults([]);
      setHasSearched(false);
      onClose();
    }, [onClose]);

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={handleClose}
      title={dictionary.common.search}
      titleIcon={<Search className="h-5 w-5" />}
      maxHeight="85vh"
    >
      <div dir={isRTL ? "rtl" : "ltr"}>
        <div className="p-4">
          <form onSubmit={handleSubmit}>
            <div className="relative">
              <input
                type="text"
                value={query}
                onChange={handleInputChange}
                placeholder={dictionary.common.searchPlaceholder || "Search products..."}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 pl-12 text-base outline-none transition-all focus:border-black focus:ring-1 focus:ring-black"
                autoFocus
              />
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              {loading && (
                <Loader2 className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 animate-spin text-gray-400" />
              )}
            </div>
          </form>
        </div>

        <div className="px-2 pb-2">
          {loading ? (
            <div className="space-y-2 px-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 rounded-lg p-3">
                  <Skeleton className="h-16 w-16 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-3 w-1/3" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : hasSearched && results.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Search className="mb-4 h-12 w-12 text-gray-300" />
              <p className="text-gray-500">{dictionary.common.noResults || "No products found"}</p>
            </div>
          ) : results.length > 0 ? (
            <div className="space-y-2">
              {results.map((product) => {
                const productSlug = getProductSlugFromPermalink(product.permalink, product.slug);
                return (
                  <Link
                    key={product.id}
                    href={`/${locale}/product/${productSlug}`}
                    onClick={handleClose}
                    className="flex items-center gap-3 rounded-lg p-3 transition-all hover:bg-gray-100 active:scale-[0.98]"
                  >
                    {product.images[0] ? (
                      <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                        <Image
                          src={product.images[0].src}
                          alt={product.name}
                          fill
                          sizes="64px"
                          className="object-cover"
                          loading="lazy"
                        />
                      </div>
                    ) : (
                      <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-lg bg-gray-100">
                        <Search className="h-6 w-6 text-gray-400" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      {product.categories?.[0] && (
                        <p className="text-[10px] font-medium uppercase tracking-wider text-amber-600 truncate">
                          {decodeHtmlEntities(product.categories[0].name)}
                        </p>
                      )}
                      <h3 className="font-medium text-gray-900 truncate uppercase">{product.name}</h3>
                      <FormattedPrice
                        price={parseInt(product.prices.price) / Math.pow(10, product.prices.currency_minor_unit)}
                        className="text-sm font-semibold text-gray-700"
                        iconSize="xs"
                      />
                      {product.attributes && product.attributes.length > 0 && (
                        <p className="text-[10px] text-gray-500 truncate mt-0.5">
                          {product.attributes.slice(0, 2).map((attr) => 
                            `${attr.name}: ${attr.terms?.map(t => t.name).join(", ")}`
                          ).join(" | ")}
                        </p>
                      )}
                    </div>
                  </Link>
                );
              })}
              
              {query.trim() && (
                <button
                  onClick={handleSubmit}
                  className="mt-4 flex w-full items-center justify-center rounded-lg bg-black px-4 py-3 font-medium text-white transition-all hover:bg-gray-800 active:scale-[0.98]"
                >
                  {dictionary.common.viewAllResults || "View all results"}
                </button>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </BottomSheet>
  );
}
