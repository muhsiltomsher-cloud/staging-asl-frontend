import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { WCProductGrid } from "@/components/shop/WCProductGrid";
import { Button } from "@/components/common/Button";
import { Skeleton } from "@/components/common/Skeleton";
import type { WCProduct } from "@/types/woocommerce";
import type { Locale } from "@/config/site";
import type { ProductSectionSettings } from "@/types/wordpress";

interface ProductSectionProps {
  settings: ProductSectionSettings;
  products: WCProduct[];
  locale: Locale;
  isRTL?: boolean;
  viewAllText?: string;
  className?: string;
  isLoading?: boolean;
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

export function ProductSectionSkeleton({ count = 4 }: { count?: number }) {
  return (
    <section className="bg-[#f7f6f2] py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="mb-8 md:mb-10">
          <Skeleton className="h-8 w-48 md:h-9" />
          <Skeleton className="mt-2 h-5 w-64" />
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
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
}: ProductSectionProps) {
  if (isLoading) {
    return <ProductSectionSkeleton count={settings.products_count || 4} />;
  }

  if (!settings.enabled || products.length === 0) {
    return null;
  }

  const viewAllLink = settings.view_all_link || `/${locale}/shop`;

  return (
    <section className={`bg-[#eae5d9] py-12 md:py-16 ${className}`}>
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

        <WCProductGrid
          products={products.slice(0, settings.products_count)}
          locale={locale}
          columns={4}
        />

        {settings.show_view_all && (
          <div className="mt-8 text-center md:hidden">
            <Button variant="outline" className="border-amber-900 text-amber-900 hover:bg-amber-900 hover:text-white" asChild>
              <Link href={viewAllLink}>{viewAllText}</Link>
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
