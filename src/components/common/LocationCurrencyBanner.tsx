"use client";

import { useState, useEffect } from "react";
import { X, MapPin } from "lucide-react";
import { getCookie, setCookie } from "cookies-next";
import { useCurrency } from "@/contexts/CurrencyContext";
import { type Currency } from "@/config/site";
import { cn } from "@/lib/utils";

interface LocationCurrencyBannerProps {
  locale?: "en" | "ar";
}

const BANNER_DISMISSED_COOKIE = "asl_currency_banner_dismissed";
const CURRENCY_COOKIE = "wcml_currency";

// Map Gulf country codes to their local currencies
// All other countries will default to USD
const gulfCountryCurrencies: Record<string, Currency> = {
  AE: "AED", // UAE
  SA: "SAR", // Saudi Arabia
  KW: "KWD", // Kuwait
  BH: "BHD", // Bahrain
  OM: "OMR", // Oman
  QA: "QAR", // Qatar
};

// Get currency for a country code - Gulf countries get local currency, all others get USD
const getCurrencyForCountry = (countryCode: string): Currency => {
  return gulfCountryCurrencies[countryCode] || "USD";
};

export function LocationCurrencyBanner({ locale = "en" }: LocationCurrencyBannerProps) {
  const { currency, setCurrency, currencies } = useCurrency();
  const [isVisible, setIsVisible] = useState(false);
  const [suggestedCurrency, setSuggestedCurrency] = useState<Currency | null>(null);
  const [detectedCountry, setDetectedCountry] = useState<string>("");
  const [isGulfBanner, setIsGulfBanner] = useState(false);
  const isRTL = locale === "ar";

  useEffect(() => {
    // Check if banners were already dismissed
    const dismissed = getCookie(BANNER_DISMISSED_COOKIE);
    const existingCurrency = getCookie(CURRENCY_COOKIE);

    // Try to detect user's location using a free IP geolocation service
    const detectLocation = async () => {
      try {
        const response = await fetch("https://ipapi.co/json/", {
          cache: "no-store",
        });
        
        if (!response.ok) return;
        
        const data = await response.json();
        const countryCode = data.country_code;
        
        if (countryCode) {
          // Special case: Gulf country users who have switched to a different currency
          // Show banner suggesting they switch back to their local currency
          // This banner shows EVERY time they use a non-local currency (no persistent dismissal)
          const localGulfCurrency = gulfCountryCurrencies[countryCode];
          if (localGulfCurrency && currency !== localGulfCurrency) {
            setSuggestedCurrency(localGulfCurrency);
            setDetectedCountry(data.country_name || countryCode);
            setIsGulfBanner(true);
            setIsVisible(true);
            return;
          }
          
          // Standard case: First-time visitors (no currency set yet)
          if (!dismissed && !existingCurrency) {
            const detected = getCurrencyForCountry(countryCode);
            // Only show banner if detected currency is different from current
            if (detected !== currency) {
              setSuggestedCurrency(detected);
              setDetectedCountry(data.country_name || countryCode);
              setIsGulfBanner(false);
              setIsVisible(true);
            }
          }
        }
      } catch (error) {
        console.error("Failed to detect location:", error);
      }
    };

    // Small delay to avoid blocking initial render
    const timer = setTimeout(detectLocation, 1000);
    return () => clearTimeout(timer);
  }, [currency]);

  const handleAccept = () => {
    if (suggestedCurrency) {
      setCurrency(suggestedCurrency);
    }
    setIsVisible(false);
    // For Gulf banners, don't set cookie on accept - this allows the banner to show again
    // if the user switches away from their local currency again
    // For standard banners (first-time visitors), set cookie to prevent showing again
    if (!isGulfBanner) {
      setCookie(BANNER_DISMISSED_COOKIE, "true", {
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: "/",
      });
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    // For Gulf banners, don't set a persistent cookie - banner will show again on next page/refresh
    // For standard banners, set cookie to prevent showing again
    if (!isGulfBanner) {
      setCookie(BANNER_DISMISSED_COOKIE, "true", {
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: "/",
      });
    }
  };

  if (!isVisible || !suggestedCurrency) return null;

  const currencyInfo = currencies.find((c) => c.code === suggestedCurrency);

  const translations = {
    en: {
      detected: `We detected you're in ${detectedCountry}`,
      suggestion: `Would you like to shop in ${currencyInfo?.code || suggestedCurrency}?`,
      accept: `Yes, use ${currencyInfo?.code}`,
      dismiss: "No, thanks",
    },
    ar: {
      detected: `اكتشفنا أنك في ${detectedCountry}`,
      suggestion: `هل تريد التسوق بعملة ${currencyInfo?.code || suggestedCurrency}؟`,
      accept: `نعم، استخدم ${currencyInfo?.code}`,
      dismiss: "لا، شكراً",
    },
  };

  const t = translations[locale];

  return (
    <div
      className={cn(
        "fixed z-50 transform transition-transform duration-300 ease-out",
        "bg-gradient-to-r from-amber-50 to-amber-100 border-amber-200 shadow-lg",
        // Gulf banner: bottom center positioning
        isGulfBanner
          ? "bottom-4 left-1/2 -translate-x-1/2 max-w-sm rounded-xl border"
          : "bottom-0 left-0 right-0 border-t md:bottom-4 md:left-4 md:right-auto md:max-w-sm md:rounded-xl md:border"
      )}
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div className="relative px-4 py-3">
        {/* Close button */}
        <button
          onClick={handleDismiss}
          className={cn(
            "absolute top-2 p-1 rounded-full text-amber-600 hover:bg-amber-200 transition-colors",
            isRTL ? "left-2" : "right-2"
          )}
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-start gap-3 pr-6">
          <div className="flex-shrink-0 rounded-full bg-amber-200 p-2">
            <MapPin className="h-5 w-5 text-amber-700" />
          </div>
          
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-amber-900">{t.detected}</p>
            <p className="text-xs text-amber-700 mt-0.5">{t.suggestion}</p>
            
            <div className="flex items-center gap-2 mt-2">
              <button
                onClick={handleAccept}
                className="px-3 py-1.5 text-xs font-medium text-white bg-amber-700 rounded-full hover:bg-amber-800 transition-colors"
              >
                {t.accept}
              </button>
              <button
                onClick={handleDismiss}
                className="px-3 py-1.5 text-xs font-medium text-amber-700 hover:text-amber-900 transition-colors"
              >
                {t.dismiss}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
