"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
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
  const isRTL = locale === "ar";

  // Get topbar text based on locale
  const topbarText = topbarSettings?.enabled !== false
    ? (isRTL && topbarSettings?.textAr ? topbarSettings.textAr : topbarSettings?.text) || ""
    : "";
  const [isCategoriesDrawerOpen, setIsCategoriesDrawerOpen] = useState(false);
  const { cartItemsCount, setIsCartOpen } = useCart();
  const { setIsAccountDrawerOpen } = useAuth();
  const { wishlistItemsCount } = useWishlist();

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
      <header className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        {/* Top bar - Mobile: Arabic left, Currency right | Desktop: both left */}
        <div className="border-b border-gray-100 bg-[#e4dcd1]">
          <div className="container mx-auto flex h-8 items-center justify-between px-4">
            {/* Mobile: Arabic on left */}
            <div className="flex items-center gap-4">
              <LanguageSwitcher locale={locale} />
              {/* Desktop only: Currency next to language */}
              <div className="hidden md:block">
                <CurrencySwitcher />
              </div>
            </div>
            {/* Mobile: Currency on right | Desktop: Promotional text */}
            <div className="md:hidden">
              <CurrencySwitcher />
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
          <div className="flex h-16 items-center justify-between md:h-20">
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

            {/* Logo - Desktop: 72px height, Mobile: 56px height */}
            <Link href={`/${locale}`} className="flex items-center">
              {headerSettings?.logo || siteSettings?.logo?.url ? (
                <Image
                  src={headerSettings?.logo || siteSettings?.logo?.url || ""}
                  alt={siteSettings?.logo?.alt || siteSettings?.site_name || "Logo"}
                  width={100}
                  height={72}
                  className="h-14 w-auto md:h-[72px]"
                  priority
                />
              ) : (
                <span className="text-xl font-bold tracking-tight text-gray-900 dark:text-white md:text-2xl">
                  {siteSettings?.site_name || "Aromatic Scents Lab"}
                </span>
              )}
            </Link>

            {/* Desktop navigation */}
            <nav className="hidden md:flex md:gap-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-sm font-medium text-gray-700 transition-colors hover:text-gray-900"
                >
                  {item.name}
                </Link>
              ))}
            </nav>

                        {/* Right side icons - Desktop: all icons | Mobile: cart only */}
                        <div className="flex items-center gap-2 md:gap-4">
                          {/* Desktop Search with Dropdown */}
                          <DesktopSearchDropdown locale={locale} dictionary={dictionary} />
              <button
                type="button"
                onClick={() => setIsAccountDrawerOpen(true)}
                className="hidden p-2 text-gray-700 hover:text-gray-900 md:block"
                aria-label={dictionary.account.myAccount}
              >
                <User className="h-5 w-5" />
              </button>
              <Link
                href={`/${locale}/wishlist`}
                className="relative hidden p-2 text-gray-700 hover:text-gray-900 md:block"
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
                className="relative p-2 text-gray-700 hover:text-gray-900"
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
                className="block rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900"
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
