"use client";

import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import type { HeroSliderSettings } from "@/types/wordpress";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

interface HeroSliderProps {
  settings: HeroSliderSettings;
}

export function HeroSlider({ settings }: HeroSliderProps) {
  if (!settings.enabled || settings.slides.length === 0) {
    return null;
  }

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

  const SlideContent = ({ slide, index }: { slide: HeroSliderSettings["slides"][0]; index: number }) => {
    const imageContent = (
      <div className="relative h-[50vh] min-h-[400px] w-full md:h-[70vh] md:min-h-[500px]">
        {slide.image?.url ? (
          <>
            <Image
              src={slide.image.url}
              alt={slide.image.alt || `Slide ${index + 1}`}
              fill
              priority={index === 0}
              sizes="100vw"
              className="hidden object-cover md:block"
            />
            <Image
              src={slide.mobile_image?.url || slide.image.url}
              alt={slide.mobile_image?.alt || slide.image.alt || `Slide ${index + 1}`}
              fill
              priority={index === 0}
              sizes="100vw"
              className="object-cover md:hidden"
            />
          </>
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gray-200">
            <span className="text-gray-400">No image</span>
          </div>
        )}
      </div>
    );

    if (slide.link?.url) {
      return (
        <Link href={slide.link.url} target={slide.link.target || "_self"} className="block">
          {imageContent}
        </Link>
      );
    }

    return imageContent;
  };

  return (
    <section className={`relative w-full ${getVisibilityClass()}`}>
      <Swiper
        modules={[Autoplay, Pagination, Navigation]}
        effect="slide"
        spaceBetween={0}
        slidesPerView={1}
        loop={true}
        autoplay={
          settings.autoplay
            ? {
                delay: settings.autoplay_delay || 5000,
                disableOnInteraction: false,
              }
            : false
        }
        pagination={{
          clickable: true,
          bulletClass: "swiper-pagination-bullet !bg-white !opacity-50",
          bulletActiveClass: "swiper-pagination-bullet-active !opacity-100",
        }}
        navigation={{
          prevEl: ".hero-slider-prev",
          nextEl: ".hero-slider-next",
        }}
        className="hero-slider"
      >
        {settings.slides.map((slide, index) => (
          <SwiperSlide key={index}>
            <SlideContent slide={slide} index={index} />
          </SwiperSlide>
        ))}
      </Swiper>

      {settings.slides.length > 1 && (
        <>
          <button
            type="button"
            className="hero-slider-prev absolute left-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/80 p-3 shadow-lg transition-all hover:bg-white"
            aria-label="Previous slide"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            type="button"
            className="hero-slider-next absolute right-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/80 p-3 shadow-lg transition-all hover:bg-white"
            aria-label="Next slide"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      <style jsx global>{`
        .hero-slider .swiper-pagination {
          bottom: 20px !important;
        }
        .hero-slider .swiper-pagination-bullet {
          width: 12px;
          height: 12px;
          margin: 0 6px !important;
        }
      `}</style>
    </section>
  );
}
