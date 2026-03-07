"use client";

import { useState, useRef, useEffect } from "react";
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

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSwitch = (targetLocale: Locale) => {
    if (targetLocale === locale) {
      setIsOpen(false);
      return;
    }
    const newHref = alternateUrl || `/${targetLocale}${pathWithoutLocale}`;
    router.push(newHref);
    setIsOpen(false);
  };

  const currentLocaleData = locales.find((l) => l.code === locale);
  const isRTL = locale === "ar";

  const translations = {
    en: {
      selectLanguage: "Select language",
    },
    ar: {
      selectLanguage: "اختر اللغة",
    },
  };

  const t = translations[locale];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-1.5 rounded-full px-2.5 py-1 text-sm font-medium transition-all hover:bg-gray-100 !cursor-default",
          className
        )}
        aria-label={t.selectLanguage}
      >
        <Globe className="h-3.5 w-3.5 text-[#7a3205]" />
        <span className="text-gray-600">{currentLocaleData?.nativeName}</span>
        <ChevronDown className={cn("h-3 w-3 text-gray-400 transition-transform", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <div className={cn("absolute top-full z-50 mt-1 min-w-[140px] rounded-lg border border-gray-200 bg-white py-1 shadow-lg", isRTL ? "right-0" : "left-0")}>
          {locales.map((loc) => (
            <button
              key={loc.code}
              type="button"
              onClick={() => handleSwitch(loc.code)}
              className={cn(
                "flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors",
                locale === loc.code
                  ? "bg-amber-50 text-amber-800"
                  : "text-gray-700 hover:bg-gray-50"
              )}
            >
              <span className="flex-1 text-left">{loc.nativeName}</span>
              {locale === loc.code && (
                <Check className="h-3.5 w-3.5 text-amber-700 flex-shrink-0" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
