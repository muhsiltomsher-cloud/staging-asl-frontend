"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Globe, ChevronDown, Check, X } from "lucide-react";
import { type Locale } from "@/config/site";
import { getPathWithoutLocale, cn } from "@/lib/utils";

interface LanguageSwitcherProps {
  locale: Locale;
  className?: string;
  alternateUrl?: string;
}

const locales: { code: Locale; name: string; nativeName: string }[] = [
  { code: "en", name: "English", nativeName: "English" },
  { code: "ar", name: "Arabic", nativeName: "العربية" },
];

export function LanguageSwitcher({ locale, className, alternateUrl }: LanguageSwitcherProps) {
  const pathname = usePathname();
  const router = useRouter();
  const pathWithoutLocale = getPathWithoutLocale(pathname);
  const [isOpen, setIsOpen] = useState(false);
  const [isMobileSheetOpen, setIsMobileSheetOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const isRTL = locale === "ar";

  const currentLocale = locales.find((l) => l.code === locale);

  const handleEscapeKey = useCallback((event: KeyboardEvent) => {
    if (event.key === "Escape") {
      setIsOpen(false);
      setIsMobileSheetOpen(false);
    }
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscapeKey);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [handleEscapeKey]);

  useEffect(() => {
    if (isMobileSheetOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileSheetOpen]);

  const handleSelect = (code: Locale) => {
    if (code !== locale) {
      const newHref = alternateUrl || `/${code}${pathWithoutLocale}`;
      router.push(newHref);
    }
    setIsOpen(false);
    setIsMobileSheetOpen(false);
  };

  const handleDesktopClick = () => {
    setIsOpen(!isOpen);
  };

  const handleMobileClick = () => {
    setIsMobileSheetOpen(true);
  };

  const translations = {
    en: {
      selectLanguage: "Select Language",
      currentlySelected: "Currently selected",
    },
    ar: {
      selectLanguage: "اختر اللغة",
      currentlySelected: "المحدد حالياً",
    },
  };

  const t = translations[locale];

  return (
    <>
      {/* Desktop: Button with dropdown */}
      <div ref={dropdownRef} className={cn("relative hidden md:block", className)}>
        <button
          type="button"
          onClick={handleDesktopClick}
          className={cn(
            "flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium text-gray-700 transition-all hover:bg-gray-100",
            isOpen && "bg-gray-100"
          )}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
        >
          <Globe className="h-3.5 w-3.5 text-[#7a3205]" />
          <span className="text-gray-600">{currentLocale?.nativeName}</span>
          <ChevronDown className={cn("h-3.5 w-3.5 text-gray-400 transition-transform duration-200", isOpen && "rotate-180")} />
        </button>

        {isOpen && (
          <div 
            className={cn(
              "absolute top-full z-50 mt-2 w-48 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-xl",
              isRTL ? "right-0" : "left-0"
            )}
          >
            <div className="border-b border-gray-100 bg-gray-50/50 px-4 py-2.5">
              <p className="text-xs font-medium uppercase tracking-wider text-gray-500">{t.selectLanguage}</p>
            </div>
            <ul role="listbox" aria-label={t.selectLanguage} className="py-1">
              {locales.map((loc) => (
                <li key={loc.code}>
                  <button
                    type="button"
                    onClick={() => handleSelect(loc.code)}
                    className={cn(
                      "flex w-full items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-gray-50",
                      locale === loc.code && "bg-[#7a3205]/5"
                    )}
                    role="option"
                    aria-selected={locale === loc.code}
                  >
                    <span className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold",
                      locale === loc.code 
                        ? "bg-[#7a3205] text-white" 
                        : "bg-gray-100 text-gray-600"
                    )}>
                      {loc.code.toUpperCase()}
                    </span>
                    <div className="flex flex-1 flex-col items-start">
                      <span className={cn(
                        "font-medium",
                        locale === loc.code ? "text-[#7a3205]" : "text-gray-900"
                      )}>
                        {loc.nativeName}
                      </span>
                      <span className="text-xs text-gray-500">{loc.name}</span>
                    </div>
                    {locale === loc.code && (
                      <Check className="h-4 w-4 text-[#7a3205]" />
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Mobile: Compact button that opens bottom sheet */}
      <button
        type="button"
        onClick={handleMobileClick}
        className={cn(
          "flex items-center gap-1.5 rounded-full px-2.5 py-1 text-sm font-medium transition-all hover:bg-gray-100 md:hidden",
          className
        )}
        aria-label={t.selectLanguage}
      >
        <Globe className="h-3.5 w-3.5 text-[#7a3205]" />
        <span className="text-gray-600">{currentLocale?.nativeName}</span>
        <ChevronDown className="h-3 w-3 text-gray-400" />
      </button>

      {/* Mobile Bottom Sheet */}
      {isMobileSheetOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity md:hidden"
            onClick={() => setIsMobileSheetOpen(false)}
            aria-hidden="true"
          />
          
          {/* Bottom Sheet */}
          <div
            className={cn(
              "fixed inset-x-0 bottom-0 z-50 rounded-t-2xl bg-white shadow-2xl transition-transform md:hidden",
              isMobileSheetOpen ? "translate-y-0" : "translate-y-full"
            )}
            dir={isRTL ? "rtl" : "ltr"}
            role="dialog"
            aria-modal="true"
            aria-labelledby="language-sheet-title"
          >
            {/* Handle bar */}
            <div className="flex justify-center pt-3">
              <div className="h-1 w-10 rounded-full bg-gray-300" />
            </div>
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
              <div className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-[#7a3205]" />
                <h2 id="language-sheet-title" className="text-lg font-semibold text-gray-900">
                  {t.selectLanguage}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsMobileSheetOpen(false)}
                className="rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-100"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            {/* Language Grid */}
            <div className="p-4">
              <div className="grid grid-cols-2 gap-3">
                {locales.map((loc) => (
                  <button
                    key={loc.code}
                    type="button"
                    onClick={() => handleSelect(loc.code)}
                    className={cn(
                      "flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all",
                      locale === loc.code
                        ? "border-[#7a3205] bg-[#7a3205]/5"
                        : "border-gray-100 bg-gray-50 hover:border-gray-200 hover:bg-gray-100"
                    )}
                  >
                    <span className={cn(
                      "flex h-12 w-12 items-center justify-center rounded-full text-lg font-bold",
                      locale === loc.code
                        ? "bg-[#7a3205] text-white"
                        : "bg-white text-gray-700 shadow-sm"
                    )}>
                      {loc.code.toUpperCase()}
                    </span>
                    <div className="text-center">
                      <p className={cn(
                        "font-semibold",
                        locale === loc.code ? "text-[#7a3205]" : "text-gray-900"
                      )}>
                        {loc.nativeName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {loc.name}
                      </p>
                    </div>
                    {locale === loc.code && (
                      <span className="text-xs font-medium text-[#7a3205]">
                        {t.currentlySelected}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Safe area padding for iOS */}
            <div className="h-safe-area-inset-bottom bg-white" />
          </div>
        </>
      )}
    </>
  );
}
