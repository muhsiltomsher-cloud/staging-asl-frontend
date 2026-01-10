"use client";

import { useState, useEffect } from "react";
import { X, Cookie } from "lucide-react";
import { getCookie, setCookie } from "cookies-next";
import { cn } from "@/lib/utils";

interface CookieConsentBannerProps {
  locale?: "en" | "ar";
}

const COOKIE_CONSENT_KEY = "asl_cookie_consent";

export function CookieConsentBanner({ locale = "en" }: CookieConsentBannerProps) {
  const [isVisible, setIsVisible] = useState(false);
  const isRTL = locale === "ar";

  useEffect(() => {
    const consent = getCookie(COOKIE_CONSENT_KEY);
    if (!consent) {
      // Small delay to avoid layout shift on initial load
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    setCookie(COOKIE_CONSENT_KEY, "accepted", {
      maxAge: 60 * 60 * 24 * 180, // 6 months
      path: "/",
    });
    setIsVisible(false);
  };

  const handleReject = () => {
    setCookie(COOKIE_CONSENT_KEY, "rejected", {
      maxAge: 60 * 60 * 24 * 180, // 6 months
      path: "/",
    });
    setIsVisible(false);
  };

  const handleDismiss = () => {
    setIsVisible(false);
  };

  if (!isVisible) return null;

  const translations = {
    en: {
      message: "We use cookies to enhance your browsing experience and analyze site traffic.",
      accept: "Accept All",
      reject: "Reject",
      learnMore: "Learn More",
    },
    ar: {
      message: "نستخدم ملفات تعريف الارتباط لتحسين تجربة التصفح وتحليل حركة المرور.",
      accept: "قبول الكل",
      reject: "رفض",
      learnMore: "اعرف المزيد",
    },
  };

  const t = translations[locale];

  return (
    <div
      className={cn(
        "fixed bottom-0 left-0 right-0 z-[60] transform transition-all duration-300 ease-out",
        "bg-white border-t border-gray-200 shadow-lg",
        "md:bottom-4 md:left-auto md:right-4 md:rounded-xl md:border md:max-w-md"
      )}
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div className="relative px-4 py-4 md:px-5 md:py-4">
        {/* Close button */}
        <button
          onClick={handleDismiss}
          className={cn(
            "absolute top-3 p-1 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors",
            isRTL ? "left-3" : "right-3"
          )}
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-start gap-3 pr-8">
          <div className="flex-shrink-0 rounded-full bg-[#C4885B]/10 p-2">
            <Cookie className="h-5 w-5 text-[#C4885B]" />
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-600 leading-relaxed">{t.message}</p>

            <div className="flex flex-wrap items-center gap-2 mt-3">
              <button
                onClick={handleAccept}
                className="px-4 py-2 text-xs font-medium text-white bg-[#C4885B] rounded-full hover:bg-[#B37A4F] transition-colors uppercase tracking-wide"
              >
                {t.accept}
              </button>
              <button
                onClick={handleReject}
                className="px-4 py-2 text-xs font-medium text-gray-600 border border-gray-300 rounded-full hover:bg-gray-50 transition-colors uppercase tracking-wide"
              >
                {t.reject}
              </button>
              <a
                href={`/${locale}/privacy`}
                className="text-xs text-[#C4885B] hover:underline"
              >
                {t.learnMore}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
