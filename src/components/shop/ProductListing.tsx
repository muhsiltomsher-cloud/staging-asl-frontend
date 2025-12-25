"use client";

import { useState, useCallback, useReducer } from "react";
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

const DEFAULT_PREFERENCE: ViewPreference = {
  viewMode: "grid",
  gridColumns: 5,
};

function getInitialPreference(): ViewPreference {
  if (typeof window === "undefined") {
    return DEFAULT_PREFERENCE;
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
  
  return DEFAULT_PREFERENCE;
}

function savePreference(preference: ViewPreference): void {
  if (typeof window === "undefined") return;
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(preference));
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
}: ProductListingProps) {
  const [preference, setPreference] = useState<ViewPreference>(() => getInitialPreference());
  const [, forceUpdate] = useReducer(x => x + 1, 0);
  const isHydrated = typeof window !== "undefined";

  const viewMode = preference.viewMode;
  const gridColumns = preference.gridColumns;

  const handleViewModeChange = useCallback((mode: ViewMode) => {
    const newPreference = { viewMode: mode, gridColumns };
    setPreference(newPreference);
    savePreference(newPreference);
    forceUpdate();
  }, [gridColumns]);

  const handleGridColumnsChange = useCallback((columns: GridColumns) => {
    const newPreference = { viewMode, gridColumns: columns };
    setPreference(newPreference);
    savePreference(newPreference);
    forceUpdate();
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
            productCount={products.length}
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
