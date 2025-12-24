"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { X, Search, Loader2 } from "lucide-react";
import MuiDrawer from "@mui/material/Drawer";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import type { Dictionary } from "@/i18n";
import type { Locale } from "@/config/site";
import type { WCProduct } from "@/types/woocommerce";
import { getProducts } from "@/lib/api/woocommerce";
import { FormattedPrice } from "@/components/common/FormattedPrice";

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
      setResults(response.products);
    } catch (error) {
      console.error("Search error:", error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [locale]);

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

  const handleClose = () => {
    setQuery("");
    setResults([]);
    setHasSearched(false);
    onClose();
  };

  return (
    <MuiDrawer
      anchor="top"
      open={isOpen}
      onClose={handleClose}
      PaperProps={{
        sx: {
          width: "100%",
          maxHeight: "80vh",
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
            <Search className="h-5 w-5" />
            <Typography variant="h6" component="h2" sx={{ fontWeight: 600 }}>
              {dictionary.common.search}
            </Typography>
          </Box>
          <IconButton
            onClick={handleClose}
            aria-label="Close drawer"
            sx={{ color: "text.secondary" }}
          >
            <X className="h-5 w-5" />
          </IconButton>
        </Box>

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

        <Box sx={{ flex: 1, overflow: "auto", px: 2, pb: 2 }}>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-black" />
            </div>
          ) : hasSearched && results.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Search className="mb-4 h-12 w-12 text-gray-300" />
              <p className="text-gray-500">{dictionary.common.noResults || "No products found"}</p>
            </div>
          ) : results.length > 0 ? (
            <div className="space-y-2">
              {results.map((product) => (
                <Link
                  key={product.id}
                  href={`/${locale}/product/${product.slug}`}
                  onClick={handleClose}
                  className="flex items-center gap-3 rounded-lg p-3 transition-all hover:bg-gray-100 active:scale-[0.98]"
                >
                  {product.images[0] ? (
                    <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                      <Image
                        src={product.images[0].src}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-lg bg-gray-100">
                      <Search className="h-6 w-6 text-gray-400" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 truncate">{product.name}</h3>
                    <FormattedPrice
                      price={parseInt(product.prices.price) / Math.pow(10, product.prices.currency_minor_unit)}
                      className="text-sm font-semibold text-gray-700"
                      iconSize="xs"
                    />
                  </div>
                </Link>
              ))}
              
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
        </Box>
      </Box>
    </MuiDrawer>
  );
}
