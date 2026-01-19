"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { ProductListing } from "@/components/shop/ProductListing";
import type { WCProduct, WCProductsResponse } from "@/types/woocommerce";
import type { Locale } from "@/config/site";

// DEV MODE: Cache disabled for faster development - uncomment when done
// const PRODUCTS_CACHE_KEY = "asl_products_cache";
// const CACHE_TTL_MS = 5 * 60 * 1000;
// Reduced from 24 to 12 for faster scroll loading and reduced API weight
const PER_PAGE = 12;

// Interface kept for type safety even when cache is disabled
interface CachedProducts {
  products: WCProduct[];
  total: number;
  totalPages: number;
  timestamp: number;
  locale: string;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function getCachedProducts(_locale: string): CachedProducts | null {
  // DEV MODE: Cache disabled for faster development
  return null;
}

function setCachedProducts(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _products: WCProduct[],
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _total: number,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _totalPages: number,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _locale: string
): void {
  // DEV MODE: Cache disabled for faster development - do nothing
}

interface ShopClientProps {
  products: WCProduct[];
  locale: Locale;
  initialTotal?: number;
  initialTotalPages?: number;
  giftProductIds?: number[];
  giftProductSlugs?: string[];
  bundleProductSlugs?: string[];
}

export function ShopClient({ 
  products: initialProducts, 
  locale,
  initialTotal = 0,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  initialTotalPages = 1,
  giftProductIds = [],
  giftProductSlugs = [],
  bundleProductSlugs = [],
}: ShopClientProps) {
  const [products, setProducts] = useState<WCProduct[]>(initialProducts);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(initialTotal);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const isInitialMount = useRef(true);

  useEffect(() => {
    // DEV MODE: Cache disabled - always use initial products
    setProducts(initialProducts);
    setTotal(initialTotal);
    setHasMore(initialProducts.length < initialTotal);
    isInitialMount.current = false;
  }, [initialProducts, initialTotal, locale]);

  const loadMoreProducts = useCallback(async () => {
    if (isLoading || !hasMore) return;
    
    setIsLoading(true);
    const nextPage = currentPage + 1;
    
    try {
      // Use lightweight=true to reduce API payload size (strips unnecessary fields)
      const response = await fetch(
        `/api/products?page=${nextPage}&per_page=${PER_PAGE}&locale=${locale}&lightweight=true`
      );
      
      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }
      
      const data: WCProductsResponse = await response.json();
      
      if (data.products.length === 0) {
        setHasMore(false);
      } else {
        // Filter out gift products from the fetched data
        // Use both ID and slug matching to handle WPML translations (different IDs per locale)
        const giftIdsSet = new Set(giftProductIds);
        const giftSlugsSet = new Set(giftProductSlugs);
        const filteredNewProducts = data.products.filter(
          (product: WCProduct) => !giftIdsSet.has(product.id) && !giftSlugsSet.has(product.slug)
        );
        
        const newProducts = [...products, ...filteredNewProducts];
        const uniqueProducts = newProducts.filter(
          (product, index, self) =>
            index === self.findIndex((p) => p.id === product.id)
        );
        
        setProducts(uniqueProducts);
        setCurrentPage(nextPage);
        // Adjust total to account for filtered gift products
        const adjustedTotal = data.total - (data.products.length - filteredNewProducts.length);
        setTotal(adjustedTotal);
        setHasMore(uniqueProducts.length < adjustedTotal);
        
        setCachedProducts(uniqueProducts, adjustedTotal, data.totalPages, locale);
      }
    } catch (error) {
      console.error("Error loading more products:", error);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, hasMore, currentPage, products, locale, giftProductIds, giftProductSlugs]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && hasMore && !isLoading) {
          loadMoreProducts();
        }
      },
      {
        root: null,
        rootMargin: "200px",
        threshold: 0,
      }
    );

    const currentRef = loadMoreRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [hasMore, isLoading, loadMoreProducts]);

  return (
    <div>
      <ProductListing
        products={products}
        locale={locale}
        showToolbar={true}
        bundleProductSlugs={bundleProductSlugs}
      />
      
      <div ref={loadMoreRef} className="py-8 flex justify-center">
        {isLoading && (
          <div className="flex items-center gap-2 text-gray-500">
            <svg
              className="animate-spin h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>{locale === "ar" ? "جاري التحميل..." : "Loading more..."}</span>
          </div>
        )}
        
        {!hasMore && products.length > 0 && (
          <p className="text-gray-500 text-sm">
            {locale === "ar" 
              ? `عرض جميع المنتجات (${total})` 
              : `Showing all ${total} products`}
          </p>
        )}
      </div>
    </div>
  );
}
