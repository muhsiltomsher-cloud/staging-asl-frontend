"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, FreeMode } from "swiper/modules";
import { WCProductCard } from "./WCProductCard";
import { useRecentlyViewed } from "@/hooks";
import { getProductsByIds } from "@/lib/api/woocommerce";
import type { WCProduct } from "@/types/woocommerce";
import type { Locale } from "@/config/site";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/free-mode";

interface RecentlyViewedProps {
  currentProductId: number;
  locale: Locale;
  bundleProductSlugs?: string[];
}

export function RecentlyViewed({
  currentProductId,
  locale,
  bundleProductSlugs = [],
}: RecentlyViewedProps) {
  const isRTL = locale === "ar";
  const { getRecentlyViewedIds, addToRecentlyViewed, isLoaded } = useRecentlyViewed();
  const [products, setProducts] = useState<WCProduct[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);

  useEffect(() => {
    if (currentProductId) {
      addToRecentlyViewed(currentProductId);
    }
  }, [currentProductId, addToRecentlyViewed]);

  useEffect(() => {
    async function fetchProducts() {
      if (!isLoaded) return;

      const recentIds = getRecentlyViewedIds(currentProductId);
      
      if (recentIds.length === 0) {
        setProducts([]);
        setIsLoadingProducts(false);
        return;
      }

      try {
        const fetchedProducts = await getProductsByIds(recentIds, locale);
        const orderedProducts = recentIds
          .map((id) => fetchedProducts.find((p) => p.id === id))
          .filter((p): p is WCProduct => p !== undefined);
        setProducts(orderedProducts);
      } catch (error) {
        console.error("Failed to fetch recently viewed products:", error);
        setProducts([]);
      } finally {
        setIsLoadingProducts(false);
      }
    }

    fetchProducts();
  }, [isLoaded, getRecentlyViewedIds, currentProductId, locale]);

  if (isLoadingProducts || products.length === 0) {
    return null;
  }

  return (
    <section className="mt-16 border-t border-amber-100 pt-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-amber-900">
            {isRTL ? "شوهدت مؤخراً" : "Recently Viewed"}
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            {isRTL ? "المنتجات التي شاهدتها مؤخراً" : "Products you recently viewed"}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            className="recently-viewed-slider-prev rounded-full border border-amber-200 p-2 text-amber-700 transition-all duration-300 hover:bg-amber-50 hover:border-amber-300 hover:shadow-md disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label={isRTL ? "التالي" : "Previous"}
          >
            {isRTL ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          </button>
          <button
            type="button"
            className="recently-viewed-slider-next rounded-full border border-amber-200 p-2 text-amber-700 transition-all duration-300 hover:bg-amber-50 hover:border-amber-300 hover:shadow-md disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label={isRTL ? "السابق" : "Next"}
          >
            {isRTL ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <div className="relative overflow-hidden">
        <Swiper
          modules={[Navigation, FreeMode]}
          spaceBetween={16}
          slidesPerView={1.5}
          freeMode={{
            enabled: true,
            sticky: false,
            momentumRatio: 0.5,
            momentumVelocityRatio: 0.5,
          }}
          navigation={{
            prevEl: ".recently-viewed-slider-prev",
            nextEl: ".recently-viewed-slider-next",
          }}
          breakpoints={{
            480: {
              slidesPerView: 2,
              spaceBetween: 12,
            },
            640: {
              slidesPerView: 2.5,
              spaceBetween: 16,
            },
            768: {
              slidesPerView: 3,
              spaceBetween: 20,
            },
            1024: {
              slidesPerView: 4,
              spaceBetween: 24,
            },
          }}
          className="recently-viewed-slider"
        >
          {products.slice(0, 8).map((product) => (
            <SwiperSlide key={product.id}>
              <WCProductCard product={product} locale={locale} bundleProductSlugs={bundleProductSlugs} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}
