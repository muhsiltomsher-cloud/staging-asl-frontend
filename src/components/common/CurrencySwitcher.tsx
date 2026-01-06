"use client";

import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Check, X, Coins } from "lucide-react";
import { useCurrency } from "@/contexts/CurrencyContext";
import { type Currency } from "@/config/site";
import { cn } from "@/lib/utils";

interface CurrencySwitcherProps {
  className?: string;
  locale?: "en" | "ar";
}

export function CurrencySwitcher({ className, locale = "en" }: CurrencySwitcherProps) {
  const { currency, setCurrency, currencies } = useCurrency();
  const [isOpen, setIsOpen] = useState(false);
  const isRTL = locale === "ar";

  const currentCurrency = currencies.find((c) => c.code === currency);

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

  const handleSelect = (code: Currency) => {
    setCurrency(code);
    setIsOpen(false);
  };

  const handleButtonClick = () => {
    setIsOpen(true);
  };

  const translations = {
    en: {
      selectCurrency: "Select Currency",
    },
    ar: {
      selectCurrency: "اختر العملة",
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
        aria-label={t.selectCurrency}
        aria-haspopup="dialog"
      >
        <Coins className="h-3.5 w-3.5 text-[#7a3205]" />
        <span className="font-semibold text-[#7a3205]">{currentCurrency?.symbol}</span>
        <span className="text-gray-600">{currentCurrency?.code}</span>
        <ChevronDown className="h-3 w-3 text-gray-400" />
      </button>

      {/* Small Centered Popup Modal - Rendered via portal to ensure proper centering */}
      {isOpen && typeof window !== "undefined" && createPortal(
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
            aria-labelledby="currency-modal-title"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
              <div className="flex items-center gap-2">
                <Coins className="h-4 w-4 text-[#7a3205]" />
                <h2 id="currency-modal-title" className="text-sm font-semibold text-gray-900">
                  {t.selectCurrency}
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
            
            {/* Currency Options */}
            <div className="p-3">
              <div className="grid grid-cols-2 gap-2">
                {currencies.map((curr) => (
                  <button
                    key={curr.code}
                    type="button"
                    onClick={() => handleSelect(curr.code as Currency)}
                    className={cn(
                      "flex flex-col items-center gap-1.5 rounded-xl border-2 p-3 transition-all",
                      currency === curr.code
                        ? "border-[#7a3205] bg-[#7a3205]/5"
                        : "border-gray-100 bg-gray-50 hover:border-gray-200 hover:bg-gray-100"
                    )}
                  >
                    <span className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold",
                      currency === curr.code
                        ? "bg-[#7a3205] text-white"
                        : "bg-white text-gray-700 shadow-sm"
                    )}>
                      {curr.symbol}
                    </span>
                    <div className="text-center">
                      <p className={cn(
                        "text-sm font-semibold",
                        currency === curr.code ? "text-[#7a3205]" : "text-gray-900"
                      )}>
                        {curr.code}
                      </p>
                      {curr.rateFromAED !== 1 && (
                        <p className="text-xs text-gray-500">
                          1 AED = {curr.rateFromAED} {curr.code}
                        </p>
                      )}
                    </div>
                    {currency === curr.code && (
                      <Check className="h-3.5 w-3.5 text-[#7a3205]" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>,
        document.body
      )}
    </>
  );
}
