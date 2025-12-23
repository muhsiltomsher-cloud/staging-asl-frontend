"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, ShoppingBag, Search, User } from "lucide-react";
import { LanguageSwitcher } from "@/components/common/LanguageSwitcher";
import { CurrencySwitcher } from "@/components/common/CurrencySwitcher";
import { useCart } from "@/contexts/CartContext";
import { cn } from "@/lib/utils";
import type { Dictionary } from "@/i18n";
import type { Locale } from "@/config/site";

interface HeaderProps {
  locale: Locale;
  dictionary: Dictionary;
}

export function Header({ locale, dictionary }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { cartItemsCount, setIsCartOpen } = useCart();

  const navigation = [
    { name: dictionary.common.home, href: `/${locale}` },
    { name: dictionary.common.shop, href: `/${locale}/shop` },
    { name: dictionary.common.about, href: `/${locale}/about` },
    { name: dictionary.common.contact, href: `/${locale}/contact` },
    { name: dictionary.common.faq, href: `/${locale}/faq` },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      {/* Top bar with language and currency */}
      <div className="border-b bg-gray-50">
        <div className="container mx-auto flex h-10 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <LanguageSwitcher locale={locale} />
            <CurrencySwitcher />
          </div>
          <div className="hidden text-sm text-gray-600 md:block">
            Free shipping on orders over 200 SAR
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Mobile menu button */}
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
            <span className="text-xl font-bold tracking-tight text-gray-900">
              Aromatic Scents Lab
            </span>
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

          {/* Right side icons */}
          <div className="flex items-center gap-4">
            <button
              type="button"
              className="p-2 text-gray-700 hover:text-gray-900"
              aria-label={dictionary.common.search}
            >
              <Search className="h-5 w-5" />
            </button>
            <Link
              href={`/${locale}/account`}
              className="p-2 text-gray-700 hover:text-gray-900"
              aria-label={dictionary.account.myAccount}
            >
              <User className="h-5 w-5" />
            </Link>
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
  );
}
