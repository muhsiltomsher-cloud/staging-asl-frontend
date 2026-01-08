"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { X, Grid3X3, ChevronRight, ChevronDown } from "lucide-react";
import MuiDrawer from "@mui/material/Drawer";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import type { Dictionary } from "@/i18n";
import type { Locale } from "@/config/site";
import type { WCCategory } from "@/types/woocommerce";
import { getCategories } from "@/lib/api/woocommerce";
import { decodeHtmlEntities } from "@/lib/utils";

// DEV MODE: Cache disabled for faster development - uncomment when done
// const categoriesCache: Record<string, { data: WCCategory[]; timestamp: number }> = {};
// const CACHE_TTL = 5 * 60 * 1000; // 5 minutes cache TTL
const fetchPromise: Record<string, Promise<WCCategory[]> | null> = {};

interface CategoriesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  locale: Locale;
  dictionary: Dictionary;
}

export function CategoriesDrawer({
  isOpen,
  onClose,
  locale,
  dictionary,
}: CategoriesDrawerProps) {
  // DEV MODE: Cache disabled for faster development
  const [categories, setCategories] = useState<WCCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const hasFetchedRef = useRef(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set());
  const isRTL = locale === "ar";

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

  // Organize categories into parent/child structure
  const parentCategories = categories.filter(cat => cat.parent === 0);
  const getChildCategories = (parentId: number) =>
    categories.filter(cat => cat.parent === parentId);

  const fetchCategoriesData = useCallback(async () => {
    // DEV MODE: Cache disabled for faster development
    // If already fetching, wait for the existing promise
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
      // Create a shared promise for concurrent requests
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
    if (isOpen && !hasFetchedRef.current) {
      hasFetchedRef.current = true;
      fetchCategoriesData();
    }
  }, [isOpen, locale, fetchCategoriesData]);

  // Reset fetch ref when locale changes
  useEffect(() => {
    hasFetchedRef.current = false;
  }, [locale]);

  return (
    <MuiDrawer
      anchor={isRTL ? "right" : "left"}
      open={isOpen}
      onClose={onClose}
      keepMounted
      PaperProps={{
        sx: {
          width: { xs: "100%", sm: 320 },
          maxWidth: "100%",
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
        }}
        dir={isRTL ? "rtl" : "ltr"}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid",
            borderColor: "divider",
            px: 2,
            py: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Grid3X3 className="h-5 w-5" />
            <Typography variant="h6" component="h2" sx={{ fontWeight: 600 }}>
              {dictionary.common.categories || "Categories"}
            </Typography>
          </Box>
          <IconButton
            onClick={onClose}
            aria-label="Close drawer"
            sx={{ color: "text.secondary" }}
          >
            <X className="h-5 w-5" />
          </IconButton>
        </Box>

        <Box sx={{ flex: 1, overflow: "auto" }}>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-black" />
            </div>
          ) : categories.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Grid3X3 className="mb-4 h-12 w-12 text-gray-300" />
              <p className="text-gray-500">No categories found</p>
            </div>
          ) : (
            <nav className="p-4">
              <ul className="space-y-1">
header                {parentCategories.map((category) => {
                  const childCategories = getChildCategories(category.id);
                  const hasChildren = childCategories.length > 0;
                  const isExpanded = expandedCategories.has(category.id);

                  return (
                    <li key={category.id}>
                      <div className="flex items-center">
                        <Link
                          href={`/${locale}/shop?category=${category.slug}`}
                          onClick={onClose}
                          className="flex flex-1 items-center gap-3 rounded-lg px-4 py-3 text-gray-900 font-semibold transition-all hover:bg-gray-100 active:scale-[0.98]"
                        >
                          {category.image ? (
                            <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                              <Image
                                src={category.image.src}
                                alt={decodeHtmlEntities(category.name)}
                                fill
                                className="object-cover"
                              />
                            </div>
                          ) : (
                            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-amber-50">
                              <Grid3X3 className="h-5 w-5 text-amber-600" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <span className="block truncate">{decodeHtmlEntities(category.name)}</span>
                          </div>
                          {hasChildren && (
                            <span className="text-xs text-gray-400 font-normal">
                              {childCategories.length}
                            </span>
                          )}
                        </Link>
                        {hasChildren && (
                          <button
                            type="button"
                            onClick={(e) => toggleCategory(category.id, e)}
                            className="p-2 rounded-md hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-700"
                            aria-label={isExpanded ? "Collapse" : "Expand"}
                          >
                            <ChevronDown
                              className={`h-5 w-5 transition-transform duration-200 ${
                                isExpanded ? "rotate-180" : ""
                              }`}
                            />
                          </button>
                        )}
                        {!hasChildren && (
                          <ChevronRight className={`h-5 w-5 flex-shrink-0 text-gray-400 mr-2 ${isRTL ? "rotate-180" : ""}`} />
                        )}
                      </div>

                      {hasChildren && isExpanded && (
                        <ul className={`mt-1 space-y-1 ${isRTL ? "mr-14" : "ml-14"}`}>
                          {childCategories.map((child) => (
                            <li key={child.id}>
                              <Link
                                href={`/${locale}/shop?category=${child.slug}`}
                                onClick={onClose}
                                className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-600 transition-all hover:bg-amber-50 hover:text-amber-700"
                              >
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-300" />
                                <span className="flex-1">{decodeHtmlEntities(child.name)}</span>
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  );
                })}
              </ul>
            </nav>
          )}
        </Box>

        <div className="border-t p-4">
          <Link
            href={`/${locale}/shop`}
            onClick={onClose}
            className="flex w-full items-center justify-center rounded-lg bg-black px-4 py-3 font-medium text-white transition-all hover:bg-gray-800 active:scale-[0.98]"
          >
            {dictionary.common.viewAll || "View All Products"}
          </Link>
        </div>
      </Box>
    </MuiDrawer>
  );
}
