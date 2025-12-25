"use client";

import { useState, useSyncExternalStore, useCallback } from "react";
import { WCProductGrid } from "./WCProductGrid";
import { WCProductListCard } from "./WCProductListCard";
import { ProductViewToggle, type ViewMode, type GridColumns } from "./ProductViewToggle";
import { ProductGridSkeleton } from "@/components/common/Skeleton";
import { cn } from "@/lib/utils";
import type { WCProduct } from "@/types/woocommerce";
import type { Locale } from "@/config/site";

const STORAGE_KEY = "asl_product_view_preference";

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
}

function getDefaultPreference(): ViewPreference {
  return {
    viewMode: "grid",
    gridColumns: 5,
  };
}

function savePreference(preference: ViewPreference): void {
  if (typeof window === "undefined") return;
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(preference));
  } catch {
    // Ignore localStorage errors
  }
}

function subscribeToStorage(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

function getStoredPreference(): ViewPreference {
  if (typeof window === "undefined") {
    return getDefaultPreference();
  }
  
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
  
  return getDefaultPreference();
}

function useIsHydrated() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}

export function ProductListing({
  products,
  locale,
  isLoading = false,
  className,
  showToolbar = true,
  toolbarClassName,
}: ProductListingProps) {
  const isHydrated = useIsHydrated();
  
  const storedPreference = useSyncExternalStore(
    subscribeToStorage,
    getStoredPreference,
    getDefaultPreference
  );
  
  const [localPreference, setLocalPreference] = useState<ViewPreference | null>(null);
  
  const preference = localPreference ?? storedPreference;
  const viewMode = preference.viewMode;
  const gridColumns = preference.gridColumns;

  const handleViewModeChange = useCallback((mode: ViewMode) => {
    const newPreference = { viewMode: mode, gridColumns };
    setLocalPreference(newPreference);
    savePreference(newPreference);
  }, [gridColumns]);

  const handleGridColumnsChange = useCallback((columns: GridColumns) => {
    const newPreference = { viewMode, gridColumns: columns };
    setLocalPreference(newPreference);
    savePreference(newPreference);
  }, [viewMode]);

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
          />
        </div>
      )}

      {!isHydrated ? (
        <ProductGridSkeleton count={10} />
      ) : viewMode === "grid" ? (
        <WCProductGrid
          products={products}
          locale={locale}
          columns={gridColumns}
        />
      ) : (
        <div className="space-y-4">
          {products.map((product) => (
            <WCProductListCard
              key={product.id}
              product={product}
              locale={locale}
            />
          ))}
        </div>
      )}
    </div>
  );
}
