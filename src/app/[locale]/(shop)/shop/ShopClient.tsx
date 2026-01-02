"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { ProductListing } from "@/components/shop/ProductListing";
import type { WCProduct, WCProductsResponse } from "@/types/woocommerce";
import type { Locale } from "@/config/site";

// DEV MODE: Cache disabled for faster development - uncomment when done
// const PRODUCTS_CACHE_KEY = "asl_products_cache";
// const CACHE_TTL_MS = 5 * 60 * 1000;
const PER_PAGE = 24;

// DEV MODE: Cache functions disabled for faster development
// interface CachedProducts {
//   products: WCProduct[];
//   total: number;
//   totalPages: number;
//   timestamp: number;
//   locale: string;
// }

function getCachedProducts(_locale: string): null {
  // DEV MODE: Cache disabled for faster development
  return null;
}

function setCachedProducts(
  _products: WCProduct[],
  _total: number,
  _totalPages: number,
  _locale: string
): void {
  // DEV MODE: Cache disabled for faster development - do nothing
}

interface ShopClientProps {
  products: WCProduct[];
  locale: Locale;
  initialTotal?: number;
  initialTotalPages?: number;
}

export function ShopClient({ 
  products: initialProducts, 
  locale,
  initialTotal = 0,
  initialTotalPages = 1,
}: ShopClientProps) {
  const [products, setProducts] = useState<WCProduct[]>(initialProducts);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(initialTotal);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const isInitialMount = useRef(true);

  useEffect(() => {
    const cached = getCachedProducts(locale);
    if (cached && cached.products.length > initialProducts.length) {
      setProducts(cached.products);
      setTotal(cached.total);
      setCurrentPage(Math.ceil(cached.products.length / PER_PAGE));
      setHasMore(cached.products.length < cached.total);
    } else {
      setProducts(initialProducts);
      setTotal(initialTotal);
      setHasMore(initialProducts.length < initialTotal);
      
      if (initialProducts.length > 0) {
        setCachedProducts(initialProducts, initialTotal, initialTotalPages, locale);
      }
    }
    isInitialMount.current = false;
  }, [initialProducts, initialTotal, initialTotalPages, locale]);

  const loadMoreProducts = useCallback(async () => {
    if (isLoading || !hasMore) return;
    
    setIsLoading(true);
    const nextPage = currentPage + 1;
    
    try {
      const response = await fetch(
        `/api/products?page=${nextPage}&per_page=${PER_PAGE}&locale=${locale}`
      );
      
      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }
      
      const data: WCProductsResponse = await response.json();
      
      if (data.products.length === 0) {
        setHasMore(false);
      } else {
        const newProducts = [...products, ...data.products];
        const uniqueProducts = newProducts.filter(
          (product, index, self) =>
            index === self.findIndex((p) => p.id === product.id)
        );
        
        setProducts(uniqueProducts);
        setCurrentPage(nextPage);
        setTotal(data.total);
        setHasMore(uniqueProducts.length < data.total);
        
        setCachedProducts(uniqueProducts, data.total, data.totalPages, locale);
      }
    } catch (error) {
      console.error("Error loading more products:", error);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, hasMore, currentPage, products, locale]);

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
