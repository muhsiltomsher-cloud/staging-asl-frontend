"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Grid3X3 } from "lucide-react";
import type { Dictionary } from "@/i18n";
import type { Locale } from "@/config/site";
import type { WCCategory } from "@/types/woocommerce";
import { getCategories } from "@/lib/api/woocommerce";
import { decodeHtmlEntities, cn } from "@/lib/utils";

const categoriesCache: Record<string, { data: WCCategory[]; timestamp: number }> = {};
const CACHE_TTL = 5 * 60 * 1000;
const fetchPromise: Record<string, Promise<WCCategory[]> | null> = {};

export interface CategoryWithChildren extends WCCategory {
  children: WCCategory[];
}

export function organizeCategoriesByHierarchy(categories: WCCategory[]): CategoryWithChildren[] {
  const parentCategories = categories.filter(cat => cat.parent === 0);
  const childCategories = categories.filter(cat => cat.parent !== 0);
  
  return parentCategories.map(parent => ({
    ...parent,
    children: childCategories.filter(child => child.parent === parent.id)
  }));
}

export async function preloadCategoriesCache(locale: Locale): Promise<void> {
  const cached = categoriesCache[locale];
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return;
  }

  if (fetchPromise[locale]) {
    await fetchPromise[locale];
    return;
  }

  try {
    fetchPromise[locale] = getCategories(locale).then((cats) => {
      const filtered = cats.filter((cat) => cat.count > 0);
      categoriesCache[locale] = { data: filtered, timestamp: Date.now() };
      return filtered;
    });
    await fetchPromise[locale];
  } catch (error) {
    console.error("Failed to preload categories cache:", error);
  } finally {
    fetchPromise[locale] = null;
  }
}

export function getCachedCategories(locale: string): WCCategory[] | null {
  const cached = categoriesCache[locale];
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  return null;
}

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

  const hierarchicalCategories = organizeCategoriesByHierarchy(categories);

  const featuredProducts = [
    {
      id: 1,
      title: isRTL ? "مجموعة الهدايا" : "Gift Sets",
      subtitle: isRTL ? "خصم 30%" : "30% off",
      image: "/images/featured-1.jpg",
      href: `/${locale}/shop?category=gifts-set`,
    },
    {
      id: 2,
      title: isRTL ? "العطور الجديدة" : "New Fragrances",
      subtitle: isRTL ? "وصل حديثاً" : "Just Arrived",
      image: "/images/featured-2.jpg",
      href: `/${locale}/shop?orderby=date`,
    },
  ];

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
        <div className="container mx-auto px-6 py-8">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="flex flex-col items-center gap-3">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#7a3205]/20 border-t-[#7a3205]" />
                <span className="text-sm text-gray-500">{dictionary.common.loading || "Loading..."}</span>
              </div>
            </div>
          ) : hierarchicalCategories.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Grid3X3 className="mb-4 h-16 w-16 text-gray-200" />
              <p className="text-gray-400">No categories found</p>
            </div>
          ) : (
            <div className="flex gap-8">
              {/* Left Side - Categories */}
              <div className={cn("flex-1", isRTL ? "order-2" : "order-1")}>
                <div className="grid grid-cols-4 gap-8">
                  {hierarchicalCategories.slice(0, 4).map((category) => (
                    <div key={category.id} className="flex flex-col">
                      {/* Category Header */}
                      <Link
                        href={`/${locale}/shop?category=${category.slug}`}
                        onClick={onClose}
                        className="text-sm font-bold text-gray-900 uppercase tracking-wide hover:text-[#7a3205] transition-colors mb-3"
                      >
                        {decodeHtmlEntities(category.name)}
                      </Link>
                      
                      {/* Subcategories */}
                      <div className="space-y-2">
                        {category.children.slice(0, 8).map((child) => (
                          <Link
                            key={child.id}
                            href={`/${locale}/shop?category=${child.slug}`}
                            onClick={onClose}
                            className="block text-sm text-gray-600 hover:text-[#7a3205] transition-colors"
                          >
                            {decodeHtmlEntities(child.name)}
                          </Link>
                        ))}
                        {category.children.length > 8 && (
                          <Link
                            href={`/${locale}/shop?category=${category.slug}`}
                            onClick={onClose}
                            className="block text-sm font-medium text-[#7a3205] hover:text-[#5a2504] transition-colors"
                          >
                            {isRTL ? "عرض الكل..." : "View all..."}
                          </Link>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Side - Featured Products */}
              <div className={cn("w-[340px] flex-shrink-0", isRTL ? "order-1" : "order-2")}>
                <div className="grid grid-cols-2 gap-4">
                  {featuredProducts.map((product) => (
                    <Link
                      key={product.id}
                      href={product.href}
                      onClick={onClose}
                      className="group block"
                    >
                      <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-gradient-to-b from-[#e8e4dc] to-[#d4cfc5]">
                        {hierarchicalCategories[product.id - 1]?.image?.src ? (
                          <Image
                            src={hierarchicalCategories[product.id - 1]?.image?.src || ""}
                            alt={product.title}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Grid3X3 className="h-12 w-12 text-[#8b7355]" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      </div>
                      <div className="mt-2">
                        <h4 className="text-sm font-semibold text-gray-900 group-hover:text-[#7a3205] transition-colors">
                          {product.title}
                        </h4>
                        <p className="text-xs text-[#7a3205] font-medium">
                          {product.subtitle}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
