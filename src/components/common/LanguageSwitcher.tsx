"use client";

import { useState, useEffect, useCallback } from "react";
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
  const isRTL = locale === "ar";

  const currentLocale = locales.find((l) => l.code === locale);

  const handleEscapeKey = useCallback((event: KeyboardEvent) => {
    if (event.key === "Escape") {
      setIsOpen(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener("keydown", handleEscapeKey);
    return () => {
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [handleEscapeKey]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleSelect = (code: Locale) => {
    if (code !== locale) {
      const newHref = alternateUrl || `/${code}${pathWithoutLocale}`;
      router.push(newHref);
    }
    setIsOpen(false);
  };

  const handleButtonClick = () => {
    setIsOpen(true);
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
      {/* Trigger Button - Same design for all screens */}
      <button
        type="button"
        onClick={handleButtonClick}
        className={cn(
          "flex items-center gap-1.5 rounded-full px-2.5 py-1 text-sm font-medium transition-all hover:bg-gray-100",
          className
        )}
        aria-label={t.selectLanguage}
        aria-haspopup="dialog"
      >
        <Globe className="h-3.5 w-3.5 text-[#7a3205]" />
        <span className="text-gray-600">{currentLocale?.nativeName}</span>
        <ChevronDown className="h-3 w-3 text-gray-400" />
      </button>

      {/* Small Centered Popup Modal - Same design for all screens */}
      {isOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm transition-opacity"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          
          {/* Modal - Small centered popup on all screens */}
          <div
            className="fixed left-1/2 top-1/2 z-[100] w-[280px] max-w-[calc(100vw-32px)] -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white shadow-2xl transition-all"
            dir={isRTL ? "rtl" : "ltr"}
            role="dialog"
            aria-modal="true"
            aria-labelledby="language-modal-title"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-[#7a3205]" />
                <h2 id="language-modal-title" className="text-sm font-semibold text-gray-900">
                  {t.selectLanguage}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-full p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            
            {/* Language Options */}
            <div className="p-3">
              <div className="grid grid-cols-2 gap-2">
                {locales.map((loc) => (
                  <button
                    key={loc.code}
                    type="button"
                    onClick={() => handleSelect(loc.code)}
                    className={cn(
                      "flex flex-col items-center gap-1.5 rounded-xl border-2 p-3 transition-all",
                      locale === loc.code
                        ? "border-[#7a3205] bg-[#7a3205]/5"
                        : "border-gray-100 bg-gray-50 hover:border-gray-200 hover:bg-gray-100"
                    )}
                  >
                    <span className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold",
                      locale === loc.code
                        ? "bg-[#7a3205] text-white"
                        : "bg-white text-gray-700 shadow-sm"
                    )}>
                      {loc.code.toUpperCase()}
                    </span>
                    <div className="text-center">
                      <p className={cn(
                        "text-sm font-semibold",
                        locale === loc.code ? "text-[#7a3205]" : "text-gray-900"
                      )}>
                        {loc.nativeName}
                      </p>
                    </div>
                    {locale === loc.code && (
                      <Check className="h-3.5 w-3.5 text-[#7a3205]" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
