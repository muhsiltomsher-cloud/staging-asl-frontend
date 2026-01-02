"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { getCookie, setCookie } from "cookies-next";
import { currencies, siteConfig, API_BASE_CURRENCY, type Currency } from "@/config/site";

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  formatPrice: (price: string | number | null | undefined, showCode?: boolean) => string;
  formatCartPrice: (price: string | number | null | undefined, minorUnit?: number, showCode?: boolean) => string;
  convertPrice: (price: number, fromCurrency?: Currency) => number;
  getCurrencySymbol: () => string;
  getCurrencyInfo: () => (typeof currencies)[number];
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

const CURRENCY_COOKIE_NAME = "wcml_currency";

// Initialize currency from cookie (runs once on first render)
function getInitialCurrency(): Currency {
  if (typeof window === "undefined") {
    return siteConfig.defaultCurrency;
  }
  const savedCurrency = getCookie(CURRENCY_COOKIE_NAME) as Currency | undefined;
  if (savedCurrency && currencies.some((c) => c.code === savedCurrency)) {
    return savedCurrency;
  }
  return siteConfig.defaultCurrency;
}

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>(getInitialCurrency);

  const setCurrency = useCallback((newCurrency: Currency) => {
    setCurrencyState(newCurrency);
    setCookie(CURRENCY_COOKIE_NAME, newCurrency, {
      maxAge: 60 * 60 * 24 * 365,
      path: "/",
    });
  }, []);

  const getCurrencyInfo = useCallback(() => {
    return currencies.find((c) => c.code === currency) || currencies[4];
  }, [currency]);

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
      [currency, getCurrencyInfo]
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
