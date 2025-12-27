"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useRef, useCallback } from "react";
import { Menu, X, ShoppingBag, User, Heart } from "lucide-react";
import { LanguageSwitcher } from "@/components/common/LanguageSwitcher";
import { CurrencySwitcher } from "@/components/common/CurrencySwitcher";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { cn } from "@/lib/utils";
import type { Dictionary } from "@/i18n";
import type { Locale } from "@/config/site";
import type { SiteSettings, WPMenuItem } from "@/types/wordpress";
import type { HeaderSettings, TopbarSettings } from "@/lib/api/wordpress";
import { CategoriesDrawer } from "@/components/layout/CategoriesDrawer";
import { DesktopSearchDropdown } from "@/components/layout/DesktopSearchDropdown";
import { MegaMenu } from "@/components/layout/MegaMenu";

interface HeaderProps {
  locale: Locale;
  dictionary: Dictionary;
  siteSettings?: SiteSettings | null;
  headerSettings?: HeaderSettings | null;
  menuItems?: WPMenuItem[] | null;
  topbarSettings?: TopbarSettings | null;
}

export function Header({ locale, dictionary, siteSettings, headerSettings, menuItems, topbarSettings }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const megaMenuTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isRTL = locale === "ar";

  // Get topbar text based on locale
  const topbarText = topbarSettings?.enabled !== false
    ? (isRTL && topbarSettings?.textAr ? topbarSettings.textAr : topbarSettings?.text) || ""
    : "";
  const [isCategoriesDrawerOpen, setIsCategoriesDrawerOpen] = useState(false);
  const { cartItemsCount, setIsCartOpen } = useCart();
  const { setIsAccountDrawerOpen } = useAuth();
  const { wishlistItemsCount } = useWishlist();

  const handleShopMouseEnter = useCallback(() => {
    if (megaMenuTimeoutRef.current) {
      clearTimeout(megaMenuTimeoutRef.current);
    }
    setIsMegaMenuOpen(true);
  }, []);

  const handleShopMouseLeave = useCallback(() => {
    megaMenuTimeoutRef.current = setTimeout(() => {
      setIsMegaMenuOpen(false);
    }, 150);
  }, []);

  const handleMegaMenuMouseEnter = useCallback(() => {
    if (megaMenuTimeoutRef.current) {
      clearTimeout(megaMenuTimeoutRef.current);
    }
  }, []);

  const handleMegaMenuClose = useCallback(() => {
    setIsMegaMenuOpen(false);
  }, []);

    const defaultNavigation = [
    { name: dictionary.common.home, href: `/${locale}` },
    { name: dictionary.common.shop, href: `/${locale}/shop` },
    { name: dictionary.common.about, href: `/${locale}/about` },
    { name: dictionary.common.contact, href: `/${locale}/contact` },
    { name: dictionary.common.faq, href: `/${locale}/faq` },
  ];

  const navigation = menuItems && menuItems.length > 0
    ? menuItems.map((item) => ({
        name: item.title,
        href: item.url.startsWith("http") ? item.url : `/${locale}${item.url}`,
      }))
    : defaultNavigation;

  return (
    <>
            <header className="sticky top-0 z-50 w-full border-b border-gray-100 bg-[#dad6cd] backdrop-blur supports-[backdrop-filter]:bg-[#dad6cd]/95">
              {/* Top bar - Mobile: Arabic left, Currency right | Desktop: both left */}
              <div className="border-b border-gray-100 bg-[#f7f6f2] h-8">
          <div className="container mx-auto flex h-8 items-center justify-between px-4">
            {/* Mobile: Arabic on left */}
            <div className="flex items-center gap-4">
              <LanguageSwitcher locale={locale} />
              {/* Desktop only: Currency next to language */}
              <div className="hidden md:block">
                <CurrencySwitcher locale={locale} />
              </div>
            </div>
            {/* Mobile: Currency on right | Desktop: Promotional text */}
            <div className="md:hidden">
              <CurrencySwitcher locale={locale} />
            </div>
            {topbarText && (
              <div className="hidden text-sm text-gray-600 md:block">
                {topbarText}
              </div>
            )}
          </div>
        </div>

        {/* Main header */}
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20 md:h-24">
            {/* Mobile: Left side - Menu button only */}
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-md p-2 text-gray-700 hover:bg-gray-100 hover:text-gray-900 md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <span className="sr-only">{dictionary.navigation.menu}</span>
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="h-6 w-6" aria-hidden="true" />
              )}
            </button>

            {/* Logo */}
            <Link href={`/${locale}`} className="flex items-center">
              {headerSettings?.logo || siteSettings?.logo?.url ? (
                <Image
                  src={headerSettings?.logo || siteSettings?.logo?.url || ""}
                  alt={siteSettings?.logo?.alt || siteSettings?.site_name || "Logo"}
                  width={140}
                  height={90}
                  className="w-auto h-16 md:h-20"
                  priority
                />
              ) : (
                <span className="font-bold tracking-tight text-gray-900 dark:text-white text-xl md:text-2xl">
                  {siteSettings?.site_name || "Aromatic Scents Lab"}
                </span>
              )}
            </Link>

            {/* Desktop navigation */}
            <nav className="hidden md:flex md:gap-x-8">
              {navigation.map((item) => {
                const isShopItem = item.href === `/${locale}/shop`;
                
                if (isShopItem) {
                  return (
                    <div
                      key={item.name}
                      className="relative"
                      onMouseEnter={handleShopMouseEnter}
                      onMouseLeave={handleShopMouseLeave}
                    >
                      <Link
                        href={item.href}
                        className={cn(
                          "text-sm font-bold text-[#7a3205] transition-colors hover:text-[#5a2504]",
                          "flex items-center gap-1",
                          isMegaMenuOpen && "text-[#5a2504]"
                        )}
                      >
                        {item.name}
                        <svg
                          className={cn(
                            "h-3 w-3 transition-transform duration-200",
                            isMegaMenuOpen && "rotate-180"
                          )}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </Link>
                    </div>
                  );
                }
                
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="text-sm font-bold text-[#7a3205] transition-colors hover:text-[#5a2504]"
                  >
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            {/* Mega Menu */}
            <div
              onMouseEnter={handleMegaMenuMouseEnter}
              onMouseLeave={handleShopMouseLeave}
            >
              <MegaMenu
                isOpen={isMegaMenuOpen}
                onClose={handleMegaMenuClose}
                locale={locale}
                dictionary={dictionary}
              />
            </div>

                        {/* Right side icons - Desktop: all icons | Mobile: cart only */}
                        <div className="flex items-center gap-2 md:gap-4">
                          {/* Desktop Search with Dropdown */}
                          <DesktopSearchDropdown locale={locale} dictionary={dictionary} />
                            <button
                              type="button"
                              onClick={() => setIsAccountDrawerOpen(true)}
                              className="hidden p-2 text-[#7a3205] hover:text-[#5a2504] md:block"
                              aria-label={dictionary.account.myAccount}
                            >
                              <User className="h-5 w-5" />
                            </button>
                            <Link
                              href={`/${locale}/wishlist`}
                              className="relative hidden p-2 text-[#7a3205] hover:text-[#5a2504] md:block"
                              aria-label={dictionary.account.wishlist}
                            >
                              <Heart className="h-5 w-5" />
                {wishlistItemsCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black text-xs font-medium text-white">
                    {wishlistItemsCount}
                  </span>
                )}
              </Link>
              {/* Cart - visible on both mobile and desktop */}
                            <button
                              type="button"
                              className="relative p-2 text-[#7a3205] hover:text-[#5a2504]"
                              onClick={() => setIsCartOpen(true)}
                              aria-label={dictionary.common.cart}
                            >
                              <ShoppingBag className="h-5 w-5" />
                {cartItemsCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black text-xs font-medium text-white">
                    {cartItemsCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <div
          className={cn(
            "md:hidden",
            isMobileMenuOpen ? "block" : "hidden"
          )}
        >
          <div className="space-y-1 px-4 pb-3 pt-2">
            {navigation.map((item) => (
                            <Link
                              key={item.name}
                              href={item.href}
                              className="block rounded-md px-3 py-2 text-base font-bold text-[#7a3205] hover:bg-gray-100 hover:text-[#5a2504]"
                              onClick={() => setIsMobileMenuOpen(false)}
                            >
                              {item.name}
                            </Link>
            ))}
          </div>
        </div>
      </header>

      {/* Drawers */}
      <CategoriesDrawer
        isOpen={isCategoriesDrawerOpen}
        onClose={() => setIsCategoriesDrawerOpen(false)}
        locale={locale}
        dictionary={dictionary}
      />
    </>
  );
}
