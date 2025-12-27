"use client";

import { useState, useRef, useEffect } from "react";
import { User, Package, MapPin, Heart, Settings, LogOut, X, ChevronRight, Globe, ChevronDown, Check, Coins } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import MuiDrawer from "@mui/material/Drawer";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import { Button } from "@/components/common/Button";
import { localeConfig, currencies, type Locale, type Currency } from "@/config/site";
import { getPathWithoutLocale, cn } from "@/lib/utils";

interface AccountDrawerProps {
  locale: string;
  dictionary: {
    myAccount: string;
    orders: string;
    addresses: string;
    wishlist: string;
    settings: string;
    logout: string;
    welcome: string;
    login: string;
    register: string;
    notLoggedIn: string;
    profile?: string;
    more?: string;
  };
}

interface MenuItem {
  icon: typeof User;
  label: string;
  href: string;
}

export function AccountDrawer({
  locale,
  dictionary,
}: AccountDrawerProps) {
  const { user, isAuthenticated, logout, isAccountDrawerOpen, setIsAccountDrawerOpen } = useAuth();
  const { currency, setCurrency } = useCurrency();
  const pathname = usePathname();
  const isRTL = locale === "ar";
  const [isCurrencyDropdownOpen, setIsCurrencyDropdownOpen] = useState(false);
  const currencyDropdownRef = useRef<HTMLDivElement>(null);

  const currentCurrency = currencies.find((c) => c.code === currency);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (currencyDropdownRef.current && !currencyDropdownRef.current.contains(event.target as Node)) {
        setIsCurrencyDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const onClose = () => setIsAccountDrawerOpen(false);

  const handleLogout = () => {
    logout();
    onClose();
  };

  const handleCurrencyChange = (code: Currency) => {
    setCurrency(code);
    setIsCurrencyDropdownOpen(false);
  };

  const alternateLocale: Locale = locale === "en" ? "ar" : "en";
  const pathWithoutLocale = getPathWithoutLocale(pathname);
  const alternateHref = `/${alternateLocale}${pathWithoutLocale}`;

  const menuItems: MenuItem[] = [
    {
      icon: User,
      label: dictionary.profile || "Profile",
      href: `/${locale}/account/profile`,
    },
    {
      icon: Package,
      label: dictionary.orders,
      href: `/${locale}/account/orders`,
    },
    {
      icon: MapPin,
      label: dictionary.addresses,
      href: `/${locale}/account/addresses`,
    },
    {
      icon: Heart,
      label: dictionary.wishlist,
      href: `/${locale}/account/wishlist`,
    },
    {
      icon: Settings,
      label: dictionary.settings,
      href: `/${locale}/account`,
    },
  ];

  const renderAuthenticatedContent = () => (
    <>
      <div className="border-b p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-gray-100 to-gray-200">
            <User className="h-8 w-8 text-gray-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-500">{dictionary.welcome}</p>
            <p className="text-lg font-semibold text-gray-900 truncate">
              {user?.user_display_name}
            </p>
            <p className="text-sm text-gray-500 truncate">{user?.user_email}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {menuItems.slice(0, 3).map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={onClose}
                className="flex items-center gap-3 rounded-lg px-4 py-3 text-gray-700 transition-all hover:bg-gray-100 hover:text-gray-900 active:scale-[0.98]"
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                <span className="font-medium">{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="border-t p-4 space-y-2">
        <Link
          href={`/${locale}/account`}
          onClick={onClose}
          className="flex w-full items-center justify-between rounded-lg px-4 py-3 text-gray-700 transition-all hover:bg-gray-100 hover:text-gray-900 active:scale-[0.98]"
        >
          <span className="font-medium">{dictionary.more || "More"}</span>
          <ChevronRight className={`h-5 w-5 flex-shrink-0 ${isRTL ? "rotate-180" : ""}`} />
        </Link>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-red-600 transition-all hover:bg-red-50 active:scale-[0.98]"
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          <span className="font-medium">{dictionary.logout}</span>
        </button>
      </div>
    </>
  );

  const renderGuestContent = () => (
    <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
      <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-gray-100 to-gray-200">
        <User className="h-12 w-12 text-gray-400" />
      </div>
      <h3 className="mb-2 text-lg font-semibold text-gray-900">
        {dictionary.myAccount}
      </h3>
      <p className="mb-8 text-gray-500">{dictionary.notLoggedIn}</p>
      <div className="flex w-full flex-col gap-3">
        <Button asChild variant="primary" size="lg" className="w-full">
          <Link href={`/${locale}/login`} onClick={onClose}>
            {dictionary.login}
          </Link>
        </Button>
        <Button asChild variant="outline" size="lg" className="w-full">
          <Link href={`/${locale}/register`} onClick={onClose}>
            {dictionary.register}
          </Link>
        </Button>
      </div>
    </div>
  );

  const renderSettingsSection = () => (
    <div className="border-t bg-gray-50 p-4">
      <div className="space-y-3">
        {/* Language Switcher */}
        <div className="flex items-center justify-between rounded-lg bg-white px-4 py-3 shadow-sm">
          <div className="flex items-center gap-3">
            <Globe className="h-5 w-5 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">
              {locale === "en" ? "Language" : "اللغة"}
            </span>
          </div>
          <Link
            href={alternateHref}
            onClick={onClose}
            className="flex items-center gap-2 rounded-md bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200"
            hrefLang={localeConfig[alternateLocale].hrefLang}
          >
            {localeConfig[alternateLocale].name}
          </Link>
        </div>

        {/* Currency Switcher */}
        <div ref={currencyDropdownRef} className="relative">
          <button
            type="button"
            onClick={() => setIsCurrencyDropdownOpen(!isCurrencyDropdownOpen)}
            className="flex w-full items-center justify-between rounded-lg bg-white px-4 py-3 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <Coins className="h-5 w-5 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">
                {locale === "en" ? "Currency" : "العملة"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700">
                {currentCurrency?.symbol} {currentCurrency?.code}
              </span>
              <ChevronDown className={cn("h-4 w-4 text-gray-400 transition-transform", isCurrencyDropdownOpen && "rotate-180")} />
            </div>
          </button>

          {isCurrencyDropdownOpen && (
            <div className={cn(
              "absolute z-50 mt-2 w-full overflow-hidden rounded-xl border border-gray-100 bg-white shadow-xl",
              isRTL ? "right-0" : "left-0"
            )}>
              <div className="border-b border-gray-100 bg-gray-50/50 px-4 py-2.5">
                <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
                  {locale === "en" ? "Select Currency" : "اختر العملة"}
                </p>
              </div>
              <ul role="listbox" className="max-h-[200px] overflow-y-auto py-1">
                {currencies.map((curr) => (
                  <li key={curr.code}>
                    <button
                      type="button"
                      onClick={() => handleCurrencyChange(curr.code as Currency)}
                      className={cn(
                        "flex w-full items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-gray-50",
                        currency === curr.code && "bg-[#7a3205]/5"
                      )}
                      role="option"
                      aria-selected={currency === curr.code}
                    >
                      <span className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold",
                        currency === curr.code 
                          ? "bg-[#7a3205] text-white" 
                          : "bg-gray-100 text-gray-600"
                      )}>
                        {curr.symbol}
                      </span>
                      <div className="flex flex-1 flex-col items-start">
                        <span className={cn(
                          "font-medium",
                          currency === curr.code ? "text-[#7a3205]" : "text-gray-900"
                        )}>
                          {curr.code}
                        </span>
                        <span className="text-xs text-gray-500">{curr.label.replace(` (${curr.code})`, "")}</span>
                      </div>
                      {currency === curr.code && (
                        <Check className="h-4 w-4 text-[#7a3205]" />
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );

    return (
      <MuiDrawer
        anchor={isRTL ? "left" : "right"}
        open={isAccountDrawerOpen}
        onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: "100%", sm: 320 },
          maxWidth: "100%",
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
        }}
        dir={isRTL ? "rtl" : "ltr"}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid",
            borderColor: "divider",
            px: 2,
            py: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <User className="h-5 w-5" />
            <Typography variant="h6" component="h2" sx={{ fontWeight: 600 }}>
              {dictionary.myAccount}
            </Typography>
          </Box>
          <IconButton
            onClick={onClose}
            aria-label="Close drawer"
            sx={{ color: "text.secondary" }}
          >
            <X className="h-5 w-5" />
          </IconButton>
        </Box>

        <Box sx={{ flex: 1, overflow: "auto", display: "flex", flexDirection: "column" }}>
          <div className="flex flex-1 flex-col">
            {isAuthenticated && user
              ? renderAuthenticatedContent()
              : renderGuestContent()}
          </div>
          {renderSettingsSection()}
        </Box>
      </Box>
    </MuiDrawer>
  );
}
