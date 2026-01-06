"use client";

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import { getCookie, setCookie } from "cookies-next";
import { currencies as defaultCurrencies, siteConfig, API_BASE_CURRENCY, type Currency } from "@/config/site";

// Dynamic currency data type (matches API response)
export interface CurrencyData {
  code: string;
  label: string;
  symbol: string;
  decimals: number;
  rateFromAED: number;
}

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  formatPrice: (price: string | number | null | undefined, showCode?: boolean) => string;
  formatCartPrice: (price: string | number | null | undefined, minorUnit?: number, showCode?: boolean) => string;
  convertPrice: (price: number, fromCurrency?: Currency) => number;
  getCurrencySymbol: () => string;
  getCurrencyInfo: () => CurrencyData;
  currencies: CurrencyData[];
  isLoading: boolean;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

const CURRENCY_COOKIE_NAME = "wcml_currency";

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  // Always start with default currency to avoid hydration mismatch
  // The actual currency from cookie will be loaded in useEffect after hydration
  const [currency, setCurrencyState] = useState<Currency>(siteConfig.defaultCurrency);
  const [currencies, setCurrencies] = useState<CurrencyData[]>([...defaultCurrencies]);
  const [isLoading, setIsLoading] = useState(true);
  const hasHydrated = useRef(false);
  const hasFetchedCurrencies = useRef(false);

  // Fetch currencies from API on mount
  useEffect(() => {
    if (hasFetchedCurrencies.current) return;
    hasFetchedCurrencies.current = true;

    const fetchCurrencies = async () => {
      try {
        const response = await fetch("/api/currencies");
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data) && data.length > 0) {
            setCurrencies(data);
          }
        }
      } catch (error) {
        console.error("Failed to fetch currencies:", error);
        // Keep using default currencies on error
      } finally {
        setIsLoading(false);
      }
    };

    fetchCurrencies();
  }, []);

  // Load currency from cookie after hydration to avoid SSR/client mismatch
  useEffect(() => {
    if (hasHydrated.current) return;
    hasHydrated.current = true;
    
    const savedCurrency = getCookie(CURRENCY_COOKIE_NAME) as Currency | undefined;
    if (savedCurrency && currencies.some((c) => c.code === savedCurrency)) {
      // Use requestAnimationFrame to avoid synchronous setState in effect
      requestAnimationFrame(() => {
        setCurrencyState(savedCurrency);
      });
    }
  }, [currencies]);

  const setCurrency = useCallback((newCurrency: Currency) => {
    setCurrencyState(newCurrency);
    setCookie(CURRENCY_COOKIE_NAME, newCurrency, {
      maxAge: 60 * 60 * 24 * 365,
      path: "/",
    });
  }, []);

  const getCurrencyInfo = useCallback(() => {
    return currencies.find((c) => c.code === currency) || currencies.find((c) => c.code === "QAR") || currencies[0];
  }, [currency, currencies]);

    const getCurrencySymbol = useCallback(() => {
      return getCurrencyInfo().symbol;
    }, [getCurrencyInfo]);

    const convertPrice = useCallback(
      (price: number, fromCurrency: Currency = API_BASE_CURRENCY): number => {
        if (price === 0) return 0;
      
        const fromCurrencyInfo = currencies.find((c) => c.code === fromCurrency);
        const toCurrencyInfo = getCurrencyInfo();
      
        if (!fromCurrencyInfo || !toCurrencyInfo) return price;
        if (fromCurrency === currency) return price;
      
        const priceInAED = price / fromCurrencyInfo.rateFromAED;
        const convertedPrice = priceInAED * toCurrencyInfo.rateFromAED;
      
        return convertedPrice;
      },
      [currency, currencies, getCurrencyInfo]
    );

    const formatPrice = useCallback(
    (price: string | number | null | undefined, showCode = true) => {
      const currencyInfo = getCurrencyInfo();
      
      // Handle undefined, null, or empty price
      if (price === undefined || price === null || price === "") {
        return "—";
      }
      
      const numericPrice = typeof price === "string" ? parseFloat(price.replace(/[^0-9.-]+/g, "")) : price;

      if (isNaN(numericPrice)) {
        return String(price);
      }

      const formattedNumber = new Intl.NumberFormat("en-US", {
        minimumFractionDigits: currencyInfo.decimals,
        maximumFractionDigits: currencyInfo.decimals,
      }).format(numericPrice);

      return showCode ? `${formattedNumber} ${currencyInfo.code}` : `${currencyInfo.symbol}${formattedNumber}`;
    },
    [getCurrencyInfo]
  );

  const formatCartPrice = useCallback(
    (price: string | number | null | undefined, minorUnit = 2, showCode = true) => {
      const currencyInfo = getCurrencyInfo();
      
      // Handle undefined, null, or empty price
      if (price === undefined || price === null || price === "") {
        return "—";
      }
      
      const numericPrice = typeof price === "string" ? parseFloat(price.replace(/[^0-9.-]+/g, "")) : price;

      if (isNaN(numericPrice)) {
        return String(price);
      }

      const divisor = Math.pow(10, minorUnit);
      const convertedPrice = numericPrice / divisor;

      const formattedNumber = new Intl.NumberFormat("en-US", {
        minimumFractionDigits: currencyInfo.decimals,
        maximumFractionDigits: currencyInfo.decimals,
      }).format(convertedPrice);

      return showCode ? `${formattedNumber} ${currencyInfo.code}` : `${currencyInfo.symbol}${formattedNumber}`;
    },
    [getCurrencyInfo]
  );

  return (
    <CurrencyContext.Provider
            value={{
              currency,
              setCurrency,
              formatPrice,
              formatCartPrice,
              convertPrice,
              getCurrencySymbol,
              getCurrencyInfo,
              currencies,
              isLoading,
            }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return context;
}
