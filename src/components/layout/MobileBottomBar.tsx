"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Grid3X3, Search, Heart, User } from "lucide-react";
import { useWishlist } from "@/contexts/WishlistContext";
import { useAuth } from "@/contexts/AuthContext";
import type { Locale } from "@/config/site";
import type { MobileBarSettings } from "@/lib/api/wordpress";
import type { Dictionary } from "@/i18n";
import { CategoriesDrawer } from "@/components/layout/CategoriesDrawer";
import { SearchDrawer } from "@/components/layout/SearchDrawer";

interface MobileBottomBarProps {
  locale: Locale;
  settings: MobileBarSettings;
  dictionary: Dictionary;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  home: Home,
  grid: Grid3X3,
  search: Search,
  heart: Heart,
  user: User,
};

export function MobileBottomBar({ locale, settings, dictionary }: MobileBottomBarProps) {
  const { wishlistItemsCount } = useWishlist();
  const { setIsAccountDrawerOpen } = useAuth();
  const [isCategoriesDrawerOpen, setIsCategoriesDrawerOpen] = useState(false);
  const [isSearchDrawerOpen, setIsSearchDrawerOpen] = useState(false);
  const [activeDrawer, setActiveDrawer] = useState<string | null>(null);
  const pathname = usePathname();

  if (!settings.enabled || settings.items.length === 0) {
    return null;
  }

  const isRTL = locale === "ar";

  const isItemActive = (item: MobileBarSettings["items"][0]) => {
    const itemPath = item.url.startsWith("/") ? `/${locale}${item.url}` : item.url;
    
    if (item.icon === "home" || item.url === "/" || item.url === "") {
      return pathname === `/${locale}` || pathname === `/${locale}/`;
    }
    if (item.icon === "grid" || item.url.includes("categories")) {
      return activeDrawer === "categories";
    }
    if (item.icon === "search") {
      return activeDrawer === "search";
    }
    if (item.icon === "user" || item.url.includes("account")) {
      return activeDrawer === "account" || pathname.includes("/account");
    }
    if (item.icon === "heart" || item.url.includes("wishlist")) {
      return pathname.includes("/wishlist");
    }
    return pathname.startsWith(itemPath);
  };

  const handleItemClick = (item: MobileBarSettings["items"][0], e: React.MouseEvent) => {
    if (item.icon === "grid" || item.url.includes("categories")) {
      e.preventDefault();
      setActiveDrawer("categories");
      setIsCategoriesDrawerOpen(true);
    } else if (item.icon === "search") {
      e.preventDefault();
      setActiveDrawer("search");
      setIsSearchDrawerOpen(true);
    } else if (item.icon === "user" || item.url.includes("account")) {
      e.preventDefault();
      setActiveDrawer("account");
      setIsAccountDrawerOpen(true);
    }
  };

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl border-t border-gray-100 bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.08)] lg:hidden">
        <div className="flex h-16 items-center justify-around px-2 pb-safe">
          {settings.items.map((item, index) => {
            const IconComponent = iconMap[item.icon] || Home;
            const label = isRTL && item.labelAr ? item.labelAr : item.label;
            const href = item.url.startsWith("/") ? `/${locale}${item.url}` : item.url || `/${locale}`;

            const isWishlist = item.icon === "heart" || item.url.includes("wishlist");
            const showBadge = isWishlist && wishlistItemsCount > 0;
            const isActive = isItemActive(item);

            const isDrawerItem = item.icon === "grid" || item.icon === "search" || item.icon === "user" || 
                                 item.url.includes("categories") || item.url.includes("account");

            const activeClasses = isActive 
              ? "text-[#C4885B] border-2 border-[#C4885B] rounded-xl bg-amber-50/50" 
              : "text-gray-600 border-2 border-transparent";

            if (isDrawerItem) {
              return (
                <button
                  key={index}
                  type="button"
                  onClick={(e) => handleItemClick(item, e)}
                  className={`relative flex flex-1 flex-col items-center justify-center gap-1 py-2 mx-1 transition-all hover:text-[#C4885B] active:scale-95 ${activeClasses}`}
                >
                  <div className="relative">
                    <IconComponent className="h-5 w-5" />
                  </div>
                  {label && (
                    <span className="text-[10px] font-medium leading-tight">{label}</span>
                  )}
                </button>
              );
            }

            return (
              <Link
                key={index}
                href={href}
                className={`relative flex flex-1 flex-col items-center justify-center gap-1 py-2 mx-1 transition-all hover:text-[#C4885B] active:scale-95 ${activeClasses}`}
              >
                <div className="relative">
                  <IconComponent className="h-5 w-5" />
                  {showBadge && (
                    <span className="absolute -right-2 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#C4885B] text-[10px] font-medium text-white">
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

      <CategoriesDrawer
        isOpen={isCategoriesDrawerOpen}
        onClose={() => {
          setIsCategoriesDrawerOpen(false);
          setActiveDrawer(null);
        }}
        locale={locale}
        dictionary={dictionary}
      />
      <SearchDrawer
        isOpen={isSearchDrawerOpen}
        onClose={() => {
          setIsSearchDrawerOpen(false);
          setActiveDrawer(null);
        }}
        locale={locale}
        dictionary={dictionary}
      />
    </>
  );
}
