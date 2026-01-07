"use client";

import { useState, useCallback, useMemo, useSyncExternalStore } from "react";
import { WCProductGrid } from "./WCProductGrid";
import { WCProductListCard } from "./WCProductListCard";
import { ProductViewToggle, type ViewMode, type GridColumns, type SortOption } from "./ProductViewToggle";
import { ProductGridSkeleton } from "@/components/common/Skeleton";
import { cn } from "@/lib/utils";
import type { WCProduct } from "@/types/woocommerce";
import type { Locale } from "@/config/site";

const STORAGE_KEY = "asl_product_view_preference";
const PREFERENCE_CHANGE_EVENT = "asl_preference_change";

function getProductPrice(product: WCProduct): number {
  const priceStr = product.prices?.price || "0";
  const price = parseFloat(priceStr);
  return isNaN(price) ? 0 : price;
}

function sortProducts(products: WCProduct[], sortBy: SortOption): WCProduct[] {
  if (sortBy === "default") {
    return products;
  }

  const sorted = [...products];

  switch (sortBy) {
    case "price-asc":
      sorted.sort((a, b) => getProductPrice(a) - getProductPrice(b));
      break;
    case "price-desc":
      sorted.sort((a, b) => getProductPrice(b) - getProductPrice(a));
      break;
    case "name-asc":
      sorted.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
      break;
    case "name-desc":
      sorted.sort((a, b) => (b.name || "").localeCompare(a.name || ""));
      break;
    case "date-desc":
      sorted.sort((a, b) => b.id - a.id);
      break;
    default:
      break;
  }

  return sorted;
}

interface ViewPreference {
  viewMode: ViewMode;
  gridColumns: GridColumns;
}

interface ProductListingProps {
  products: WCProduct[];
  locale: Locale;
  isLoading?: boolean;
  className?: string;
  showToolbar?: boolean;
  toolbarClassName?: string;
  bundleProductSlugs?: string[];
}

const DEFAULT_PREFERENCE: ViewPreference = {
  viewMode: "grid",
  gridColumns: 5,
};

function getPreferenceSnapshot(): ViewPreference {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as ViewPreference;
      if (
        (parsed.viewMode === "grid" || parsed.viewMode === "list") &&
        [2, 3, 4, 5].includes(parsed.gridColumns)
      ) {
        return parsed;
      }
    }
  } catch {
    // Ignore localStorage errors
  }
  return DEFAULT_PREFERENCE;
}

function getServerSnapshot(): ViewPreference {
  return DEFAULT_PREFERENCE;
}

function subscribeToPreference(callback: () => void): () => void {
  const handleStorageChange = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) {
      callback();
    }
  };
  const handlePreferenceChange = () => callback();
  
  window.addEventListener("storage", handleStorageChange);
  window.addEventListener(PREFERENCE_CHANGE_EVENT, handlePreferenceChange);
  
  return () => {
    window.removeEventListener("storage", handleStorageChange);
    window.removeEventListener(PREFERENCE_CHANGE_EVENT, handlePreferenceChange);
  };
}

function savePreference(preference: ViewPreference): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(preference));
    window.dispatchEvent(new Event(PREFERENCE_CHANGE_EVENT));
  } catch {
    // Ignore localStorage errors
  }
}

export function ProductListing({
  products,
  locale,
  isLoading = false,
  className,
  showToolbar = true,
  toolbarClassName,
  bundleProductSlugs = [],
}: ProductListingProps) {
  const preference = useSyncExternalStore(
    subscribeToPreference,
    getPreferenceSnapshot,
    getServerSnapshot
  );
  const [sortBy, setSortBy] = useState<SortOption>("default");

  const viewMode = preference.viewMode;
  const gridColumns = preference.gridColumns;

  const sortedProducts = useMemo(() => sortProducts(products, sortBy), [products, sortBy]);

  const handleViewModeChange = useCallback((mode: ViewMode) => {
    const newPreference = { viewMode: mode, gridColumns };
    savePreference(newPreference);
  }, [gridColumns]);

  const handleGridColumnsChange = useCallback((columns: GridColumns) => {
    const newPreference = { viewMode, gridColumns: columns };
    savePreference(newPreference);
  }, [viewMode]);

  const handleSortChange = useCallback((sort: SortOption) => {
    setSortBy(sort);
  }, []);

  if (isLoading) {
    return <ProductGridSkeleton count={10} />;
  }

  if (products.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-gray-500">
          {locale === "ar" ? "لا توجد منتجات" : "No products found"}
        </p>
      </div>
    );
  }

  return (
    <div className={className}>
      {showToolbar && (
        <div className={cn("mb-6", toolbarClassName)}>
          <ProductViewToggle
            viewMode={viewMode}
            gridColumns={gridColumns}
            onViewModeChange={handleViewModeChange}
            onGridColumnsChange={handleGridColumnsChange}
            locale={locale}
            productCount={sortedProducts.length}
            sortBy={sortBy}
            onSortChange={handleSortChange}
          />
        </div>
      )}

      {viewMode === "grid" ? (
        <WCProductGrid
          products={sortedProducts}
          locale={locale}
          columns={gridColumns}
          bundleProductSlugs={bundleProductSlugs}
        />
      ) : (
        <div className="space-y-4">
          {sortedProducts.map((product) => (
            <WCProductListCard
              key={product.id}
              product={product}
              locale={locale}
              bundleProductSlugs={bundleProductSlugs}
            />
          ))}
        </div>
      )}
    </div>
  );
}
