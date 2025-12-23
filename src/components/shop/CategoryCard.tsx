import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { ProductCategory } from "@/types";
import type { Locale } from "@/config/site";

interface CategoryCardProps {
  category: ProductCategory;
  locale: Locale;
  className?: string;
  variant?: "default" | "featured";
}

export function CategoryCard({
  category,
  locale,
  className,
  variant = "default",
}: CategoryCardProps) {
  return (
    <Link
      href={`/${locale}/category/${category.slug}`}
      className={cn(
        "group relative block overflow-hidden rounded-lg",
        variant === "featured" ? "aspect-[4/3]" : "aspect-square",
        className
      )}
    >
      {/* Background image */}
      {category.image ? (
        <Image
          src={category.image.sourceUrl}
          alt={category.image.altText || category.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
      ) : (
        <div className="h-full w-full bg-gray-200" />
      )}

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <h3
          className={cn(
            "font-semibold text-white",
            variant === "featured" ? "text-xl md:text-2xl" : "text-lg"
          )}
        >
          {category.name}
        </h3>
        {variant === "featured" && category.description && (
          <p className="mt-1 text-sm text-white/80 line-clamp-2">
            {category.description}
          </p>
        )}
      </div>
    </Link>
  );
}
