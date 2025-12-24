"use client";

import Link from "next/link";
import { Home, Grid3X3, Search, Heart, User } from "lucide-react";
import { useWishlist } from "@/contexts/WishlistContext";
import type { Locale } from "@/config/site";
import type { MobileBarSettings } from "@/lib/api/wordpress";

interface MobileBottomBarProps {
  locale: Locale;
  settings: MobileBarSettings;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  home: Home,
  grid: Grid3X3,
  search: Search,
  heart: Heart,
  user: User,
};

export function MobileBottomBar({ locale, settings }: MobileBottomBarProps) {
  const { wishlistItemsCount } = useWishlist();

  if (!settings.enabled || settings.items.length === 0) {
    return null;
  }

  const isRTL = locale === "ar";

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-white md:hidden">
      <div className="flex h-16 items-center justify-around px-2 pb-safe">
        {settings.items.map((item, index) => {
          const IconComponent = iconMap[item.icon] || Home;
          const label = isRTL && item.labelAr ? item.labelAr : item.label;
          const href = item.url.startsWith("/") ? `/${locale}${item.url}` : item.url || `/${locale}`;

          const isWishlist = item.icon === "heart" || item.url.includes("wishlist");
          const showBadge = isWishlist && wishlistItemsCount > 0;

          return (
            <Link
              key={index}
              href={href}
              className="relative flex flex-1 flex-col items-center justify-center gap-1 py-2 text-gray-600 transition-colors hover:text-gray-900"
            >
              <div className="relative">
                <IconComponent className="h-5 w-5" />
                {showBadge && (
                  <span className="absolute -right-2 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-black text-[10px] font-medium text-white">
                    {wishlistItemsCount > 9 ? "9+" : wishlistItemsCount}
                  </span>
                )}
              </div>
              {label && (
                <span className="text-[10px] font-medium leading-tight">{label}</span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
