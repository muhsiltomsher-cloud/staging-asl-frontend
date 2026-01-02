"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Grid3X3, ChevronDown } from "lucide-react";
import type { Dictionary } from "@/i18n";
import type { Locale } from "@/config/site";
import type { WCCategory } from "@/types/woocommerce";
import { getCategories } from "@/lib/api/woocommerce";
import { decodeHtmlEntities, cn } from "@/lib/utils";
import { organizeCategoriesByHierarchy } from "./MegaMenu";

// DEV MODE: Cache disabled for faster development - uncomment when done
// const categoriesCache: Record<string, { data: WCCategory[]; timestamp: number }> = {};
// const CACHE_TTL = 5 * 60 * 1000;
const fetchPromise: Record<string, Promise<WCCategory[]> | null> = {};

interface MobileCategoryMenuProps {
  locale: Locale;
  dictionary: Dictionary;
  onNavigate: () => void;
}

export function MobileCategoryMenu({
  locale,
  dictionary,
  onNavigate,
}: MobileCategoryMenuProps) {
  // DEV MODE: Cache disabled for faster development
  const [categories, setCategories] = useState<WCCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set());
  const hasFetchedRef = useRef(false);
  const isRTL = locale === "ar";

  const fetchCategoriesData = useCallback(async () => {
    // DEV MODE: Cache disabled for faster development
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
    // DEV MODE: Cache disabled for faster development - always fetch fresh data
    if (!hasFetchedRef.current) {
      hasFetchedRef.current = true;
      fetchCategoriesData();
    }
  }, [locale, fetchCategoriesData]);

  useEffect(() => {
    hasFetchedRef.current = false;
  }, [locale]);

  const toggleCategory = (categoryId: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  const hierarchicalCategories = organizeCategoriesByHierarchy(categories);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-4">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-200 border-t-amber-600" />
      </div>
    );
  }

  if (hierarchicalCategories.length === 0) {
    return null;
  }

  return (
    <div className="border-t border-gray-200 pt-2" dir={isRTL ? "rtl" : "ltr"}>
      <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
        {dictionary.common.categories || "Categories"}
      </div>
      <div className="space-y-1">
        {hierarchicalCategories.map((category) => (
          <div key={category.id}>
            <div className="flex items-center">
              <Link
                href={`/${locale}/shop?category=${category.slug}`}
                onClick={onNavigate}
                className={cn(
                  "flex-1 flex items-center gap-3 rounded-md px-3 py-2",
                  "text-base font-bold text-[#7a3205]",
                  "hover:bg-gray-100 hover:text-[#5a2504]",
                  "transition-colors"
                )}
              >
                {category.image ? (
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
                <span className="flex-1">{decodeHtmlEntities(category.name)}</span>
                <span className="text-xs text-gray-400 font-normal">
                  {category.count}
                </span>
              </Link>
              {category.children.length > 0 && (
                <button
                  type="button"
                  onClick={(e) => toggleCategory(category.id, e)}
                  className={cn(
                    "p-2 rounded-md hover:bg-gray-100 transition-colors",
                    "text-gray-500 hover:text-gray-700"
                  )}
                  aria-label={expandedCategories.has(category.id) ? "Collapse" : "Expand"}
                >
                  <ChevronDown
                    className={cn(
                      "h-5 w-5 transition-transform duration-200",
                      expandedCategories.has(category.id) && "rotate-180"
                    )}
                  />
                </button>
              )}
            </div>

            {category.children.length > 0 && expandedCategories.has(category.id) && (
              <div className={cn(
                "mt-1 space-y-1",
                isRTL ? "mr-11" : "ml-11"
              )}>
                {category.children.map((child) => (
                  <Link
                    key={child.id}
                    href={`/${locale}/shop?category=${child.slug}`}
                    onClick={onNavigate}
                    className={cn(
                      "flex items-center gap-2 rounded-md px-3 py-2",
                      "text-sm text-gray-600",
                      "hover:bg-amber-50 hover:text-amber-700",
                      "transition-colors"
                    )}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-300" />
                    <span className="flex-1">{decodeHtmlEntities(child.name)}</span>
                    <span className="text-xs text-gray-400">
                      {child.count}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div className="mt-3 px-3">
        <Link
          href={`/${locale}/shop`}
          onClick={onNavigate}
          className={cn(
            "flex items-center justify-center gap-2 w-full",
            "rounded-md bg-[#7a3205] px-4 py-2.5",
            "text-sm font-medium text-white",
            "hover:bg-[#5a2504] transition-colors"
          )}
        >
          {dictionary.common.viewAll || "View All Products"}
        </Link>
      </div>
    </div>
  );
}
