import Link from "next/link";
import Image from "next/image";
import { Skeleton } from "@/components/common/Skeleton";
import type { CollectionsSettings } from "@/types/wordpress";

interface CollectionsSectionProps {
  settings: CollectionsSettings;
  className?: string;
  isLoading?: boolean;
}

function CollectionCardSkeleton() {
  return (
    <div className="flex flex-col">
      <Skeleton className="aspect-[4/3] w-full rounded-xl" />
      <div className="mt-4 space-y-2">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full" />
      </div>
    </div>
  );
}

export function CollectionsSectionSkeleton({ count = 3 }: { count?: number }) {
  return (
    <section className="bg-white py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="mb-8 text-center md:mb-10">
          <Skeleton className="mx-auto h-8 w-48 md:h-9" />
          <Skeleton className="mx-auto mt-2 h-5 w-64" />
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-3">
          {Array.from({ length: count }).map((_, i) => (
            <CollectionCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

export function CollectionsSection({
  settings,
  className = "",
  isLoading = false,
}: CollectionsSectionProps) {
  if (isLoading) {
    return <CollectionsSectionSkeleton count={3} />;
  }

  if (!settings.enabled || settings.collections.length === 0) {
    return null;
  }

  return (
    <section className={`bg-white py-12 md:py-16 ${className}`}>
      <div className="container mx-auto px-4">
        <div className="mb-8 text-center md:mb-10">
          <h2 className="mb-2 text-2xl font-bold text-amber-900 md:text-3xl">
            {settings.section_title}
          </h2>
          {settings.section_subtitle && (
            <p className="text-amber-700/70">
              {settings.section_subtitle}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-3">
          {settings.collections.map((collection, index) => (
            <Link
              key={index}
              href={collection.link?.url || "#"}
              target={collection.link?.target || "_self"}
              className="group relative aspect-[4/3] overflow-hidden rounded-xl"
            >
              {collection.image?.url ? (
                <Image
                  src={collection.image.url}
                  alt={collection.image.alt || collection.title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
              ) : (
                <div className="absolute inset-0 bg-stone-200" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
                <h3 className="text-xl font-semibold text-white md:text-2xl">
                  {collection.title}
                </h3>
                {collection.description && (
                  <p className="mt-1 text-sm text-white/80 line-clamp-2">
                    {collection.description}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
