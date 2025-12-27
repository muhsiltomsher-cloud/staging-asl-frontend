"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Grid3X3, ArrowRight } from "lucide-react";
import type { Dictionary } from "@/i18n";
import type { Locale } from "@/config/site";
import type { WCCategory } from "@/types/woocommerce";
import { getCategories } from "@/lib/api/woocommerce";
import { decodeHtmlEntities, cn } from "@/lib/utils";

const categoriesCache: Record<string, { data: WCCategory[]; timestamp: number }> = {};
const CACHE_TTL = 5 * 60 * 1000;
const fetchPromise: Record<string, Promise<WCCategory[]> | null> = {};

interface MegaMenuProps {
  isOpen: boolean;
  onClose: () => void;
  locale: Locale;
  dictionary: Dictionary;
}

export function MegaMenu({
  isOpen,
  onClose,
  locale,
  dictionary,
}: MegaMenuProps) {
  const [categories, setCategories] = useState<WCCategory[]>(() => {
    const cached = categoriesCache[locale];
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data;
    }
    return [];
  });
  const [loading, setLoading] = useState(false);
  const hasFetchedRef = useRef(false);
  const isRTL = locale === "ar";
  const menuRef = useRef<HTMLDivElement>(null);

  const fetchCategoriesData = useCallback(async () => {
    const cached = categoriesCache[locale];
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      setCategories(cached.data);
      return;
    }

    if (fetchPromise[locale]) {
      try {
        const cats = await fetchPromise[locale];
        if (cats) {
          setCategories(cats);
        }
      } catch (error) {
        console.error(error);
      }
      return;
    }

    setLoading(true);
    try {
      fetchPromise[locale] = getCategories(locale).then((cats) => {
        const filtered = cats.filter((cat) => cat.count > 0);
        categoriesCache[locale] = { data: filtered, timestamp: Date.now() };
        return filtered;
      });

      const cats = await fetchPromise[locale];
      if (cats) {
        setCategories(cats);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      fetchPromise[locale] = null;
    }
  }, [locale]);

  useEffect(() => {
    const cached = categoriesCache[locale];
    const hasCachedData = cached && Date.now() - cached.timestamp < CACHE_TTL;
    
    if (isOpen && !hasCachedData && !hasFetchedRef.current) {
      hasFetchedRef.current = true;
      fetchCategoriesData();
    } else if (isOpen && hasCachedData && categories.length === 0) {
      setCategories(cached.data);
    }
  }, [isOpen, locale, fetchCategoriesData, categories.length]);

  useEffect(() => {
    hasFetchedRef.current = false;
  }, [locale]);

  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/20 z-40 transition-opacity duration-300"
        onClick={onClose}
        style={{ top: "132px" }}
      />
      
      <div
        ref={menuRef}
        className={cn(
          "absolute left-0 right-0 z-50 bg-white shadow-2xl transition-all duration-300 ease-out",
          "border-t border-gray-100",
          isOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4 pointer-events-none"
        )}
        style={{ top: "100%" }}
        dir={isRTL ? "rtl" : "ltr"}
        onMouseLeave={onClose}
      >
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center">
                <Grid3X3 className="h-5 w-5 text-amber-700" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  {dictionary.common.categories || "Shop by Category"}
                </h3>
                <p className="text-sm text-gray-500">
                  {dictionary.sections?.shopByCategory?.subtitle || "Explore our diverse collections"}
                </p>
              </div>
            </div>
            <Link
              href={`/${locale}/shop`}
              onClick={onClose}
              className="group flex items-center gap-2 text-sm font-semibold text-amber-700 hover:text-amber-800 transition-colors"
            >
              {dictionary.common.viewAll || "View All Products"}
              <ArrowRight className={cn(
                "h-4 w-4 transition-transform group-hover:translate-x-1",
                isRTL && "rotate-180 group-hover:-translate-x-1"
              )} />
            </Link>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="flex flex-col items-center gap-3">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-amber-100 border-t-amber-600" />
                <span className="text-sm text-gray-500">{dictionary.common.loading || "Loading..."}</span>
              </div>
            </div>
          ) : categories.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Grid3X3 className="mb-4 h-16 w-16 text-gray-200" />
              <p className="text-gray-400">No categories found</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {categories.map((category, index) => (
                <Link
                  key={category.id}
                  href={`/${locale}/shop?category=${category.slug}`}
                  onClick={onClose}
                  className={cn(
                    "group relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100",
                    "transition-all duration-300 hover:shadow-xl hover:-translate-y-1",
                    "border border-gray-100 hover:border-amber-200"
                  )}
                  style={{
                    animationDelay: `${index * 50}ms`,
                  }}
                >
                  <div className="aspect-square relative overflow-hidden">
                    {category.image ? (
                      <>
                        <Image
                          src={category.image.src}
                          alt={decodeHtmlEntities(category.name)}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                      </>
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-amber-50 to-amber-100">
                        <Grid3X3 className="h-12 w-12 text-amber-300" />
                      </div>
                    )}
                    
                    <div className="absolute inset-x-0 bottom-0 p-4">
                      <h4 className={cn(
                        "font-bold text-white text-sm leading-tight mb-1",
                        "drop-shadow-lg",
                        !category.image && "text-amber-800"
                      )}>
                        {decodeHtmlEntities(category.name)}
                      </h4>
                      <span className={cn(
                        "text-xs font-medium",
                        category.image ? "text-white/80" : "text-amber-600"
                      )}>
                        {category.count} {dictionary.sections?.products || "products"}
                      </span>
                    </div>

                    <div className={cn(
                      "absolute top-3 flex items-center justify-center",
                      "w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm",
                      "opacity-0 group-hover:opacity-100 transition-all duration-300",
                      "transform translate-y-2 group-hover:translate-y-0",
                      isRTL ? "left-3" : "right-3"
                    )}>
                      <ArrowRight className={cn(
                        "h-4 w-4 text-amber-700",
                        isRTL && "rotate-180"
                      )} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-gray-100">
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href={`/${locale}/shop?orderby=date`}
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-amber-700 hover:bg-amber-50 rounded-full transition-colors"
              >
                {dictionary.filters?.newest || "New Arrivals"}
              </Link>
              <Link
                href={`/${locale}/shop?orderby=popularity`}
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-amber-700 hover:bg-amber-50 rounded-full transition-colors"
              >
                {dictionary.filters?.bestSelling || "Best Sellers"}
              </Link>
              <Link
                href={`/${locale}/shop?on_sale=true`}
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 rounded-full transition-colors shadow-md"
              >
                Sale Items
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
