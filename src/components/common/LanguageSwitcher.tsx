"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Globe, ChevronDown, Check } from "lucide-react";
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
  const dropdownRef = useRef<HTMLDivElement>(null);
  const isRTL = locale === "ar";

  const currentLocale = locales.find((l) => l.code === locale);

  const handleEscapeKey = useCallback((event: KeyboardEvent) => {
    if (event.key === "Escape") {
      setIsOpen(false);
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

  const handleSelect = (code: Locale) => {
    if (code !== locale) {
      const newHref = alternateUrl || `/${code}${pathWithoutLocale}`;
      router.push(newHref);
    }
    setIsOpen(false);
  };

  const handleButtonClick = () => {
    setIsOpen(!isOpen);
  };

  const translations = {
    en: {
      selectLanguage: "Select Language",
    },
    ar: {
      selectLanguage: "اختر اللغة",
    },
  };

  const t = translations[locale];

  return (
    <div ref={dropdownRef} className={cn("relative", className)}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={handleButtonClick}
        className={cn(
          "flex items-center gap-1.5 rounded-full px-2.5 py-1 text-sm font-medium transition-all hover:bg-gray-100",
          isOpen && "bg-gray-100"
        )}
        aria-label={t.selectLanguage}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <Globe className="h-3.5 w-3.5 text-[#7a3205]" />
        <span className="text-gray-600">{currentLocale?.nativeName}</span>
        <ChevronDown className={cn("h-3 w-3 text-gray-400 transition-transform duration-200", isOpen && "rotate-180")} />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div 
          className={cn(
            "absolute top-full z-50 mt-2 w-40 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-xl",
            isRTL ? "right-0" : "left-0"
          )}
        >
          <div className="border-b border-gray-100 bg-gray-50/50 px-3 py-2">
            <p className="text-xs font-medium uppercase tracking-wider text-gray-500">{t.selectLanguage}</p>
          </div>
          <ul role="listbox" aria-label={t.selectLanguage} className="py-1">
            {locales.map((loc) => (
              <li key={loc.code}>
                <button
                  type="button"
                  onClick={() => handleSelect(loc.code)}
                  className={cn(
                    "flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors hover:bg-gray-50",
                    locale === loc.code && "bg-[#7a3205]/5"
                  )}
                  role="option"
                  aria-selected={locale === loc.code}
                >
                  <span className={cn(
                    "flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold",
                    locale === loc.code 
                      ? "bg-[#7a3205] text-white" 
                      : "bg-gray-100 text-gray-600"
                  )}>
                    {loc.code.toUpperCase()}
                  </span>
                  <span className={cn(
                    "flex-1 text-left font-medium",
                    locale === loc.code ? "text-[#7a3205]" : "text-gray-900"
                  )}>
                    {loc.nativeName}
                  </span>
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
  );
}
