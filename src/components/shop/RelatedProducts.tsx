"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, FreeMode } from "swiper/modules";
import { WCProductCard } from "./WCProductCard";
import type { WCProduct } from "@/types/woocommerce";
import type { Locale } from "@/config/site";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/free-mode";

interface RelatedProductsProps {
  products: WCProduct[];
  currentProductId: number;
  locale: Locale;
}

export function RelatedProducts({
  products,
  currentProductId,
  locale,
}: RelatedProductsProps) {
  const isRTL = locale === "ar";

  const filteredProducts = products.filter((p) => p.id !== currentProductId);

  if (filteredProducts.length === 0) {
    return null;
  }

  return (
    <section className="mt-16 border-t border-amber-100 pt-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-amber-900">
            {isRTL ? "منتجات ذات صلة" : "Related Products"}
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            {isRTL ? "قد يعجبك أيضاً" : "You may also like"}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            className="related-slider-prev rounded-full border border-amber-200 p-2 text-amber-700 transition-all duration-300 hover:bg-amber-50 hover:border-amber-300 hover:shadow-md disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label={isRTL ? "التالي" : "Previous"}
          >
            {isRTL ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          </button>
          <button
            type="button"
            className="related-slider-next rounded-full border border-amber-200 p-2 text-amber-700 transition-all duration-300 hover:bg-amber-50 hover:border-amber-300 hover:shadow-md disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label={isRTL ? "السابق" : "Next"}
          >
            {isRTL ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <div className="relative -mx-4 px-4">
        <Swiper
          modules={[Navigation, FreeMode]}
          spaceBetween={24}
          slidesPerView={2}
          freeMode={{
            enabled: true,
            sticky: false,
            momentumRatio: 0.5,
            momentumVelocityRatio: 0.5,
          }}
          navigation={{
            prevEl: ".related-slider-prev",
            nextEl: ".related-slider-next",
          }}
          breakpoints={{
            640: {
              slidesPerView: 2,
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
          className="related-products-slider !overflow-visible"
        >
          {filteredProducts.slice(0, 8).map((product) => (
            <SwiperSlide key={product.id}>
              <WCProductCard product={product} locale={locale} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}
