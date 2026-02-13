"use client";

import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

interface IngredientItem {
  key: string;
  title: string;
  excerpt: string;
  image: string;
  link?: string;
}

interface IngredientsCarouselProps {
  items: IngredientItem[];
  isRTL?: boolean;
}

export function IngredientsCarousel({
  items,
  isRTL = false,
}: IngredientsCarouselProps) {
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <div className="relative">
      <Swiper
        modules={[Autoplay, Navigation, Pagination]}
        spaceBetween={24}
        slidesPerView={1}
        loop={items.length > 3}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
        }}
        pagination={{
          clickable: true,
          bulletClass: "swiper-pagination-bullet !bg-amber-300 !opacity-50",
          bulletActiveClass: "!bg-amber-600 !opacity-100",
        }}
        navigation={{
          prevEl: ".ingredients-slider-prev",
          nextEl: ".ingredients-slider-next",
        }}
        breakpoints={{
          640: {
            slidesPerView: 2,
            spaceBetween: 20,
          },
          1024: {
            slidesPerView: 3,
            spaceBetween: 24,
          },
        }}
        className="ingredients-carousel pb-12"
        dir={isRTL ? "rtl" : "ltr"}
      >
        {items.map((item) => (
          <SwiperSlide key={item.key}>
            <div className="overflow-hidden rounded-2xl bg-white shadow-lg">
              <div className="relative aspect-square overflow-hidden">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="mb-3 text-xl font-bold text-amber-900">
                  {item.title}
                </h3>
                <p className="line-clamp-3 text-sm leading-relaxed text-amber-700/70">
                  {item.excerpt}
                </p>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Navigation Buttons */}
      {items.length > 3 && (
        <>
          <button
            type="button"
            className="ingredients-slider-prev absolute -left-4 top-[40%] z-10 hidden -translate-y-1/2 rounded-full bg-white p-3 shadow-lg transition-all hover:bg-amber-50 hover:shadow-xl lg:block"
            aria-label="Previous ingredient"
          >
            <svg
              className="h-5 w-5 text-amber-900"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <button
            type="button"
            className="ingredients-slider-next absolute -right-4 top-[40%] z-10 hidden -translate-y-1/2 rounded-full bg-white p-3 shadow-lg transition-all hover:bg-amber-50 hover:shadow-xl lg:block"
            aria-label="Next ingredient"
          >
            <svg
              className="h-5 w-5 text-amber-900"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </>
      )}
    </div>
  );
}
