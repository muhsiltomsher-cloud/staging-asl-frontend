"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Search, Loader2, X, TrendingUp } from "lucide-react";
import type { Dictionary } from "@/i18n";
import type { Locale } from "@/config/site";
import type { WCProduct } from "@/types/woocommerce";
import { getProducts } from "@/lib/api/woocommerce";
import { FormattedPrice } from "@/components/common/FormattedPrice";
import { cn } from "@/lib/utils";

interface DesktopSearchDropdownProps {
  locale: Locale;
  dictionary: Dictionary;
}

export function DesktopSearchDropdown({
  locale,
  dictionary,
}: DesktopSearchDropdownProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<WCProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
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
      setResults(response.products);
    } catch (error) {
      console.error("Search error:", error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [locale]);

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (query.trim()) {
      debounceRef.current = setTimeout(() => {
        handleSearch(query);
      }, 300);
    } else {
      setResults([]);
      setHasSearched(false);
    }

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query, handleSearch]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/${locale}/search?q=${encodeURIComponent(query.trim())}`);
      setIsOpen(false);
      setQuery("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) => 
          prev < results.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        if (highlightedIndex >= 0 && results[highlightedIndex]) {
          e.preventDefault();
          router.push(`/${locale}/product/${results[highlightedIndex].slug}`);
          setIsOpen(false);
          setQuery("");
        }
        break;
      case "Escape":
        setIsOpen(false);
        inputRef.current?.blur();
        break;
    }
  };

  const handleClear = () => {
    setQuery("");
    setResults([]);
    setHasSearched(false);
    inputRef.current?.focus();
  };

  const handleProductClick = () => {
    setIsOpen(false);
    setQuery("");
  };

  const showDropdown = isOpen && (query.trim().length > 0 || hasSearched);

  return (
    <div ref={containerRef} className="relative hidden md:block">
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder={dictionary.common.searchPlaceholder || "Search products..."}
            className={cn(
              "w-48 rounded-full border border-gray-200 bg-gray-50 py-2 text-sm text-gray-900 placeholder-gray-500 transition-all focus:w-64 focus:border-amber-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-800 lg:w-56 lg:focus:w-72",
              isRTL ? "pr-10 pl-10" : "pl-10 pr-10"
            )}
            dir={isRTL ? "rtl" : "ltr"}
          />
          <Search className={cn(
            "absolute top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400",
            isRTL ? "right-3" : "left-3"
          )} />
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className={cn(
                "absolute top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600",
                isRTL ? "left-2" : "right-2"
              )}
            >
              <X className="h-4 w-4" />
            </button>
          )}
          {loading && (
            <Loader2 className={cn(
              "absolute top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-gray-400",
              isRTL ? "left-8" : "right-8"
            )} />
          )}
        </div>
      </form>

      {showDropdown && (
        <div 
          className={cn(
            "absolute top-full z-50 mt-2 w-96 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl",
            isRTL ? "right-0" : "left-0"
          )}
          dir={isRTL ? "rtl" : "ltr"}
        >
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center gap-3">
                <div className="h-8 w-8 animate-spin rounded-full border-3 border-gray-200 border-t-amber-800" />
                <p className="text-sm text-gray-500">
                  {isRTL ? "جاري البحث..." : "Searching..."}
                </p>
              </div>
            </div>
          ) : hasSearched && results.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-4 rounded-full bg-gray-100 p-4">
                <Search className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-base font-medium text-gray-900">
                {dictionary.common.noResults || "No products found"}
              </p>
              <p className="mt-1 text-sm text-gray-500">
                {isRTL 
                  ? `لا توجد نتائج لـ "${query}"`
                  : `No results for "${query}"`
                }
              </p>
              <p className="mt-3 text-xs text-gray-400">
                {isRTL 
                  ? "جرب كلمات بحث مختلفة"
                  : "Try different search terms"
                }
              </p>
            </div>
          ) : results.length > 0 ? (
            <div>
              <div className="border-b border-gray-100 bg-gray-50 px-4 py-2">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  {isRTL ? "المنتجات" : "Products"}
                </p>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {results.map((product, index) => (
                  <Link
                    key={product.id}
                    href={`/${locale}/product/${product.slug}`}
                    onClick={handleProductClick}
                    className={cn(
                      "flex items-center gap-4 px-4 py-3 transition-all hover:bg-gray-50",
                      highlightedIndex === index && "bg-amber-50"
                    )}
                  >
                    {product.images[0] ? (
                      <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                        <Image
                          src={product.images[0].src}
                          alt={product.name}
                          fill
                          sizes="56px"
                          className="object-cover"
                          loading="lazy"
                        />
                      </div>
                    ) : (
                      <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-lg bg-gray-100">
                        <Search className="h-5 w-5 text-gray-400" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 truncate text-sm">
                        {product.name}
                      </h3>
                      <FormattedPrice
                        price={parseInt(product.prices.price) / Math.pow(10, product.prices.currency_minor_unit)}
                        className="text-sm font-semibold text-amber-800"
                        iconSize="xs"
                      />
                    </div>
                  </Link>
                ))}
              </div>
              
              <div className="border-t border-gray-100 bg-gray-50 p-3">
                <button
                  onClick={handleSubmit}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-gray-800"
                >
                  <TrendingUp className="h-4 w-4" />
                  {dictionary.common.viewAllResults || "View all results"}
                </button>
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
