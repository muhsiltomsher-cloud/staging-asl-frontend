"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef } from "react";
import { WCProductCard } from "./WCProductCard";
import { cn } from "@/lib/utils";
import type { WCProduct } from "@/types/woocommerce";
import type { Locale } from "@/config/site";

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
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isRTL = locale === "ar";

  const filteredProducts = products.filter((p) => p.id !== currentProductId);

  if (filteredProducts.length === 0) {
    return null;
  }

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300;
      const actualDirection = isRTL
        ? direction === "left"
          ? scrollAmount
          : -scrollAmount
        : direction === "left"
          ? -scrollAmount
          : scrollAmount;
      scrollContainerRef.current.scrollBy({
        left: actualDirection,
        behavior: "smooth",
      });
    }
  };

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
            onClick={() => scroll("left")}
            className="rounded-full border border-amber-200 p-2 text-amber-700 transition-colors hover:bg-amber-50 hover:border-amber-300"
            aria-label={isRTL ? "التالي" : "Previous"}
          >
            {isRTL ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          </button>
          <button
            type="button"
            onClick={() => scroll("right")}
            className="rounded-full border border-amber-200 p-2 text-amber-700 transition-colors hover:bg-amber-50 hover:border-amber-300"
            aria-label={isRTL ? "السابق" : "Next"}
          >
            {isRTL ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <div
        ref={scrollContainerRef}
        className={cn(
          "flex gap-6 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory",
          "-mx-4 px-4"
        )}
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {filteredProducts.slice(0, 8).map((product) => (
          <div
            key={product.id}
            className="w-[calc(50%-12px)] flex-shrink-0 snap-start sm:w-[calc(33.333%-16px)] lg:w-[calc(25%-18px)]"
          >
            <WCProductCard product={product} locale={locale} />
          </div>
        ))}
      </div>
    </section>
  );
}
