"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { X, Grid3X3, ChevronRight } from "lucide-react";
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
  const isRTL = locale === "ar";

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
                {categories.map((category) => (
                  <li key={category.id}>
                    <Link
                      href={`/${locale}/shop?category=${category.slug}`}
                      onClick={onClose}
                      className="flex items-center gap-3 rounded-lg px-4 py-3 text-gray-700 transition-all hover:bg-gray-100 hover:text-gray-900 active:scale-[0.98]"
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
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gray-100">
                          <Grid3X3 className="h-5 w-5 text-gray-400" />
                        </div>
                      )}
                                            <div className="flex-1 min-w-0">
                                              <span className="font-medium block truncate">{decodeHtmlEntities(category.name)}</span>
                                              <span className="text-sm text-gray-500">{category.count} products</span>
                                            </div>
                      <ChevronRight className={`h-5 w-5 flex-shrink-0 text-gray-400 ${isRTL ? "rotate-180" : ""}`} />
                    </Link>
                  </li>
                ))}
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
