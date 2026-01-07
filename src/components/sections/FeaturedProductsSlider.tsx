"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation } from "swiper/modules";
import { WCProductCard } from "@/components/shop/WCProductCard";
import { Button } from "@/components/common/Button";
import { Skeleton } from "@/components/common/Skeleton";
import type { WCProduct } from "@/types/woocommerce";
import type { Locale } from "@/config/site";
import type { FeaturedProductsSettings } from "@/types/wordpress";

import "swiper/css";
import "swiper/css/navigation";

interface FeaturedProductsSliderProps {
  settings: FeaturedProductsSettings;
  products: WCProduct[];
  locale: Locale;
  isRTL?: boolean;
  viewAllText?: string;
  className?: string;
  isLoading?: boolean;
  bundleProductSlugs?: string[];
}

function FeaturedProductCardSkeleton() {
  return (
    <div className="flex flex-col">
      <Skeleton className="aspect-square w-full rounded-lg" />
      <div className="mt-3 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </div>
  );
}

export function FeaturedProductsSliderSkeleton() {
  return (
    <section className="bg-[#f7f6f2] py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="mb-8 md:mb-10">
          <Skeleton className="h-8 w-48 md:h-9" />
          <Skeleton className="mt-2 h-5 w-64" />
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <FeaturedProductCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

export function FeaturedProductsSlider({
  settings,
  products,
  locale,
  isRTL = false,
  viewAllText = "View All",
  className = "",
  isLoading = false,
  bundleProductSlugs = [],
}: FeaturedProductsSliderProps) {
  if (isLoading) {
    return <FeaturedProductsSliderSkeleton />;
  }

  if (!settings.enabled || products.length === 0) {
    return null;
  }

  const displayProducts = products.slice(0, settings.products_count);

  // Handle visibility based on hide_on_mobile and hide_on_desktop settings
  const getVisibilityClass = () => {
    if (settings.hide_on_mobile && settings.hide_on_desktop) {
      return "hidden"; // Hide on both
    }
    if (settings.hide_on_mobile) {
      return "hidden md:block"; // Hide on mobile only
    }
    if (settings.hide_on_desktop) {
      return "md:hidden"; // Hide on desktop only
    }
    return ""; // Show on both
  };

  return (
    <section className={`bg-stone-50 py-12 md:py-16 ${className} ${getVisibilityClass()}`}>
      <div className="container mx-auto px-4">
        <div className="mb-8 flex items-center justify-between md:mb-10">
          <div>
            <h2 className="mb-2 text-2xl font-bold text-amber-900 md:text-3xl">
              {settings.section_title}
            </h2>
            {settings.section_subtitle && (
              <p className="text-amber-700/70">
                {settings.section_subtitle}
              </p>
            )}
          </div>
          <Link
            href={`/${locale}/shop`}
            className="hidden items-center text-sm font-medium text-amber-900 hover:text-amber-700 hover:underline md:flex"
          >
            {viewAllText}
            <ArrowRight className={`ml-1 h-4 w-4 ${isRTL ? "rotate-180" : ""}`} />
          </Link>
        </div>

        <div className="relative">
          <Swiper
            modules={[Autoplay, Navigation]}
            spaceBetween={16}
            slidesPerView={2}
            loop={displayProducts.length > 4}
            autoplay={
              settings.autoplay
                ? {
                    delay: settings.autoplay_delay || 4000,
                    disableOnInteraction: false,
                  }
                : false
            }
            navigation={{
              prevEl: ".featured-slider-prev",
              nextEl: ".featured-slider-next",
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
            className="featured-products-slider"
          >
            {displayProducts.map((product) => (
              <SwiperSlide key={product.id}>
                <WCProductCard product={product} locale={locale} bundleProductSlugs={bundleProductSlugs} />
              </SwiperSlide>
            ))}
          </Swiper>

          {displayProducts.length > 4 && (
            <>
              <button
                type="button"
                className="featured-slider-prev absolute -left-4 top-[calc(50%-2.5rem)] z-10 hidden -translate-y-1/2 rounded-full bg-white p-3 shadow-lg transition-all hover:bg-stone-100 lg:block"
                aria-label="Previous products"
              >
                <svg className="h-5 w-5 text-amber-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                type="button"
                className="featured-slider-next absolute -right-4 top-[calc(50%-2.5rem)] z-10 hidden -translate-y-1/2 rounded-full bg-white p-3 shadow-lg transition-all hover:bg-stone-100 lg:block"
                aria-label="Next products"
              >
                <svg className="h-5 w-5 text-amber-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}
        </div>

        <div className="mt-8 text-center md:hidden">
          <Button variant="outline" className="border-amber-900 text-amber-900 hover:bg-amber-900 hover:text-white" asChild>
            <Link href={`/${locale}/shop`}>{viewAllText}</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
