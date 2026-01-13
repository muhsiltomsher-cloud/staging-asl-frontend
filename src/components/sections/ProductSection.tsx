"use client";

import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import { WCProductCard } from "@/components/shop/WCProductCard";
import { Button } from "@/components/common/Button";
import { Skeleton } from "@/components/common/Skeleton";
import type { WCProduct } from "@/types/woocommerce";
import type { Locale } from "@/config/site";
import type { ProductSectionSettings } from "@/types/wordpress";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

interface ProductSectionProps {
  settings: ProductSectionSettings;
  products: WCProduct[];
  locale: Locale;
  isRTL?: boolean;
  viewAllText?: string;
  className?: string;
  isLoading?: boolean;
  bundleProductSlugs?: string[];
}

function ProductCardSkeleton() {
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

export function ProductSectionSkeleton({ count = 5 }: { count?: number }) {
  return (
    <section className="bg-[#f7f6f2] py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="mb-8 md:mb-10">
          <Skeleton className="h-8 w-48 md:h-9" />
          <Skeleton className="mt-2 h-5 w-64" />
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 md:gap-6">
          {Array.from({ length: count }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

export function ProductSection({
  settings,
  products,
  locale,
  isRTL = false,
  viewAllText = "View All",
  className = "",
  isLoading = false,
  bundleProductSlugs = [],
}: ProductSectionProps) {
  if (isLoading) {
    return <ProductSectionSkeleton count={settings.products_count || 4} />;
  }

  if (!settings.enabled || products.length === 0) {
    return null;
  }

  const viewAllLink = settings.view_all_link || `/${locale}/shop`;

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
    <section className={`bg-[#eae5d9] py-12 md:py-16 ${className} ${getVisibilityClass()}`}>
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
          {settings.show_view_all && (
            <Link
              href={viewAllLink}
              className="hidden items-center text-sm font-medium text-amber-900 hover:text-amber-700 hover:underline md:flex"
            >
              {viewAllText}
              <ArrowRight className={`ml-1 h-4 w-4 ${isRTL ? "rotate-180" : ""}`} />
            </Link>
          )}
        </div>

        {/* Swiper Slider for Products */}
        <div className="relative product-section-slider">
          <Swiper
            modules={[Navigation, Pagination]}
            spaceBetween={16}
            slidesPerView={2}
            navigation={{
              prevEl: `.product-slider-prev-${settings.section_title?.replace(/\s+/g, '-').toLowerCase() || 'default'}`,
              nextEl: `.product-slider-next-${settings.section_title?.replace(/\s+/g, '-').toLowerCase() || 'default'}`,
            }}
            pagination={{
              clickable: true,
              bulletClass: "swiper-pagination-bullet !bg-amber-900/30",
              bulletActiveClass: "swiper-pagination-bullet-active !bg-amber-900",
            }}
            breakpoints={{
              640: {
                slidesPerView: 3,
                spaceBetween: 20,
              },
              768: {
                slidesPerView: 3,
                spaceBetween: 20,
              },
              1024: {
                slidesPerView: 4,
                spaceBetween: 24,
              },
              1280: {
                slidesPerView: 5,
                spaceBetween: 24,
              },
            }}
            className="!pb-12"
            dir={isRTL ? "rtl" : "ltr"}
          >
            {products.slice(0, settings.products_count).map((product) => (
              <SwiperSlide key={product.id}>
                <WCProductCard product={product} locale={locale} bundleProductSlugs={bundleProductSlugs} />
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Navigation Arrows - positioned to center on product image area */}
          {products.length > 2 && (
            <>
              <button
                type="button"
                className={`product-slider-prev-${settings.section_title?.replace(/\s+/g, '-').toLowerCase() || 'default'} absolute ${isRTL ? 'right-0' : 'left-0'} top-[32%] z-10 -translate-y-1/2 -translate-x-2 rounded-full bg-white p-2 shadow-lg transition-all hover:bg-amber-50 disabled:opacity-50 hidden md:flex items-center justify-center`}
                aria-label="Previous"
              >
                <ChevronLeft className={`h-5 w-5 text-amber-900 ${isRTL ? 'rotate-180' : ''}`} />
              </button>
              <button
                type="button"
                className={`product-slider-next-${settings.section_title?.replace(/\s+/g, '-').toLowerCase() || 'default'} absolute ${isRTL ? 'left-0' : 'right-0'} top-[32%] z-10 -translate-y-1/2 translate-x-2 rounded-full bg-white p-2 shadow-lg transition-all hover:bg-amber-50 disabled:opacity-50 hidden md:flex items-center justify-center`}
                aria-label="Next"
              >
                <ChevronRight className={`h-5 w-5 text-amber-900 ${isRTL ? 'rotate-180' : ''}`} />
              </button>
            </>
          )}
        </div>

        {settings.show_view_all && (
          <div className="mt-4 text-center md:hidden">
            <Button variant="outline" className="border-amber-900 text-amber-900 hover:bg-amber-900 hover:text-white" asChild>
              <Link href={viewAllLink}>{viewAllText}</Link>
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
