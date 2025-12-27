"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Grid3X3 } from "lucide-react";
import type { Dictionary } from "@/i18n";
import type { Locale } from "@/config/site";
import type { WCCategory, WCProduct } from "@/types/woocommerce";
import { getCategories, getProducts } from "@/lib/api/woocommerce";
import { decodeHtmlEntities, cn } from "@/lib/utils";
import { FormattedPrice } from "@/components/common/FormattedPrice";

const categoriesCache: Record<string, { data: WCCategory[]; timestamp: number }> = {};
const productsCache: Record<string, { data: WCProduct[]; timestamp: number }> = {};
const CACHE_TTL = 5 * 60 * 1000;
const fetchPromise: Record<string, Promise<WCCategory[]> | null> = {};
const productsFetchPromise: Record<string, Promise<WCProduct[]> | null> = {};

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
  const [featuredProducts, setFeaturedProducts] = useState<WCProduct[]>(() => {
    const cached = productsCache[locale];
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data;
    }
    return [];
  });
  const [loading, setLoading] = useState(false);
  const [productsLoading, setProductsLoading] = useState(false);
  const hasFetchedRef = useRef(false);
  const hasProductsFetchedRef = useRef(false);
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

  const fetchFeaturedProducts = useCallback(async () => {
    const cached = productsCache[locale];
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      setFeaturedProducts(cached.data);
      return;
    }

    if (productsFetchPromise[locale]) {
      try {
        const prods = await productsFetchPromise[locale];
        if (prods) {
          setFeaturedProducts(prods);
        }
      } catch (error) {
        console.error(error);
      }
      return;
    }

    setProductsLoading(true);
    try {
      productsFetchPromise[locale] = getProducts({
        per_page: 4,
        orderby: "date",
        order: "desc",
        locale,
      }).then((response) => {
        const products = response.products;
        productsCache[locale] = { data: products, timestamp: Date.now() };
        return products;
      });

      const prods = await productsFetchPromise[locale];
      if (prods) {
        setFeaturedProducts(prods);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setProductsLoading(false);
      productsFetchPromise[locale] = null;
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
    const cached = productsCache[locale];
    const hasCachedData = cached && Date.now() - cached.timestamp < CACHE_TTL;
    
    if (isOpen && !hasCachedData && !hasProductsFetchedRef.current) {
      hasProductsFetchedRef.current = true;
      fetchFeaturedProducts();
    } else if (isOpen && hasCachedData && featuredProducts.length === 0) {
      setFeaturedProducts(cached.data);
    }
  }, [isOpen, locale, fetchFeaturedProducts, featuredProducts.length]);

  useEffect(() => {
    hasFetchedRef.current = false;
    hasProductsFetchedRef.current = false;
  }, [locale]);

  if (!isOpen) return null;

  const hierarchicalCategories = organizeCategoriesByHierarchy(categories);

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
              {/* Left Side - Categories with Images */}
              <div className={cn("flex-1", isRTL ? "order-2" : "order-1")}>
                <div className="grid grid-cols-4 gap-8">
                  {hierarchicalCategories.slice(0, 4).map((category) => (
                    <div key={category.id} className="flex flex-col">
                      {/* Category Header with Image */}
                      <Link
                        href={`/${locale}/shop?category=${category.slug}`}
                        onClick={onClose}
                        className="flex items-center gap-2 mb-3 group"
                      >
                        {category.image?.src ? (
                          <div className="relative h-8 w-8 flex-shrink-0 overflow-hidden rounded-md bg-gray-100">
                            <Image
                              src={category.image.src}
                              alt={decodeHtmlEntities(category.name)}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md bg-amber-50">
                            <Grid3X3 className="h-4 w-4 text-amber-400" />
                          </div>
                        )}
                        <span className="text-sm font-bold text-gray-900 uppercase tracking-wide group-hover:text-[#7a3205] transition-colors">
                          {decodeHtmlEntities(category.name)}
                        </span>
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
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4">
                  {isRTL ? "وصل حديثاً" : "New Arrivals"}
                </h3>
                {productsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#7a3205]/20 border-t-[#7a3205]" />
                  </div>
                ) : featuredProducts.length > 0 ? (
                  <div className="grid grid-cols-2 gap-4">
                    {featuredProducts.slice(0, 4).map((product) => (
                      <Link
                        key={product.id}
                        href={`/${locale}/product/${product.slug}`}
                        onClick={onClose}
                        className="group block"
                      >
                        <div className="relative aspect-square overflow-hidden rounded-lg bg-gradient-to-b from-[#e8e4dc] to-[#d4cfc5]">
                          {product.images?.[0]?.src ? (
                            <Image
                              src={product.images[0].src}
                              alt={product.name}
                              fill
                              className="object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <Grid3X3 className="h-12 w-12 text-[#8b7355]" />
                            </div>
                          )}
                        </div>
                        <div className="mt-2">
                          <h4 className="text-xs font-medium text-gray-900 group-hover:text-[#7a3205] transition-colors line-clamp-2 break-words min-w-0">
                            {product.name}
                          </h4>
                          <p className="text-xs text-[#7a3205] font-medium mt-1">
                            <FormattedPrice 
                              price={parseInt(product.prices.price) / Math.pow(10, product.prices.currency_minor_unit)} 
                              iconSize="xs" 
                            />
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <Grid3X3 className="mb-2 h-8 w-8 text-gray-200" />
                    <p className="text-xs text-gray-400">{isRTL ? "لا توجد منتجات" : "No products"}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
