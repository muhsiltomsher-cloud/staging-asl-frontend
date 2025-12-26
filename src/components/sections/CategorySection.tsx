import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/common/Button";
import { Skeleton } from "@/components/common/Skeleton";
import type { WCCategory } from "@/types/woocommerce";
import type { Locale } from "@/config/site";
import type { CategorySectionSettings } from "@/types/wordpress";
import { decodeHtmlEntities } from "@/lib/utils";

interface CategorySectionProps {
  settings: CategorySectionSettings;
  categories: WCCategory[];
  locale: Locale;
  isRTL?: boolean;
  viewAllText?: string;
  productsText?: string;
  className?: string;
  isLoading?: boolean;
}

function CategoryCardSkeleton() {
  return (
    <div className="flex flex-col">
      <Skeleton className="aspect-[3/2] w-full rounded-xl" />
      <div className="mt-3 space-y-2 text-center">
        <Skeleton className="mx-auto h-5 w-3/4" />
        <Skeleton className="mx-auto h-4 w-1/2" />
      </div>
    </div>
  );
}

export function CategorySectionSkeleton({ count = 4 }: { count?: number }) {
  return (
    <section className="bg-[#f7f6f2] py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="mb-8 text-center md:mb-10">
          <Skeleton className="mx-auto h-8 w-48 md:h-9" />
          <Skeleton className="mx-auto mt-2 h-5 w-64" />
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
          {Array.from({ length: count }).map((_, i) => (
            <CategoryCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

export function CategorySection({
  settings,
  categories,
  locale,
  isRTL = false,
  viewAllText = "View All",
  className = "",
  isLoading = false,
}: CategorySectionProps) {
  if (isLoading) {
    return <CategorySectionSkeleton count={settings.categories_count || 4} />;
  }

  if (!settings.enabled || categories.length === 0) {
    return null;
  }

  const displayCategories = categories
    .filter((cat) => cat.parent === 0 && cat.slug !== "uncategorized")
    .slice(0, settings.categories_count);

  if (displayCategories.length === 0) {
    return null;
  }

  return (
    <section className={`bg-stone-50 py-12 md:py-16 ${className}`}>
      <div className="container mx-auto px-4">
        <div className="mb-8 flex items-center justify-between md:mb-10">
          <div className="text-center w-full md:text-left md:w-auto">
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
              href={`/${locale}/shop`}
              className="hidden items-center text-sm font-medium text-amber-900 hover:text-amber-700 hover:underline md:flex"
            >
              {viewAllText}
              <ArrowRight className={`ml-1 h-4 w-4 ${isRTL ? "rotate-180" : ""}`} />
            </Link>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
          {displayCategories.map((category) => (
            <Link
              key={category.slug}
              href={`/${locale}/category/${category.slug}`}
              className="group flex flex-col"
            >
              <div className="relative aspect-[3/2] overflow-hidden rounded-xl bg-white transition-shadow duration-300 hover:shadow-lg">
                {category.image?.src ? (
                                    <Image
                                      src={category.image.src}
                                      alt={category.image.alt || decodeHtmlEntities(category.name)}
                                      fill
                                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 25vw"
                                      className="object-contain transition-transform duration-300 group-hover:scale-105"
                                      loading="lazy"
                                    />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-stone-200">
                    <span className="text-stone-400">No image</span>
                  </div>
                )}
              </div>
              <div className="mt-3 text-center">
                                <h3 className="text-base font-semibold text-amber-900 transition-colors group-hover:text-amber-700 md:text-lg">
                                  {decodeHtmlEntities(category.name)}
                                </h3>
              </div>
            </Link>
          ))}
        </div>

        {settings.show_view_all && (
          <div className="mt-8 text-center md:hidden">
            <Button variant="outline" className="border-amber-900 text-amber-900 hover:bg-amber-900 hover:text-white" asChild>
              <Link href={`/${locale}/shop`}>{viewAllText}</Link>
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
