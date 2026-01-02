"use client";

import { useCurrency } from "@/contexts/CurrencyContext";
import { API_BASE_CURRENCY, type Currency } from "@/config/site";
import { AEDIcon } from "./AEDIcon";
import { cn } from "@/lib/utils";

interface FormattedPriceProps {
  price?: string | number | null;
  showCode?: boolean;
  className?: string;
  iconSize?: "xs" | "sm" | "md" | "lg";
  strikethrough?: boolean;
  sourceCurrency?: Currency;
}

export function FormattedPrice({
  price,
  showCode = true,
  className,
  iconSize = "sm",
  strikethrough = false,
  sourceCurrency = API_BASE_CURRENCY,
}: FormattedPriceProps) {
  const { currency, getCurrencyInfo, convertPrice } = useCurrency();
  const currencyInfo = getCurrencyInfo();

  // Handle undefined, null, or empty price
  if (price === undefined || price === null || price === "") {
    return <span className={className}>—</span>;
  }

  const numericPrice = typeof price === "string" 
    ? parseFloat(price.replace(/[^0-9.-]+/g, "")) 
    : price;

  if (isNaN(numericPrice)) {
    return <span className={className}>{String(price)}</span>;
  }

  // Convert price from source currency to user's selected currency
  const convertedPrice = convertPrice(numericPrice, sourceCurrency);

  const formattedNumber = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: currencyInfo.decimals,
    maximumFractionDigits: currencyInfo.decimals,
  }).format(convertedPrice);

  const isAED = currency === "AED";

  if (showCode) {
    return (
      <span className={cn("inline-flex items-center gap-1", strikethrough && "line-through", className)}>
        {isAED ? (
          <AEDIcon size={iconSize} className="flex-shrink-0" />
        ) : (
          <span>{currencyInfo.code}</span>
        )}
        <span>{formattedNumber}</span>
      </span>
    );
  }

  return (
    <span className={cn("inline-flex items-center gap-0.5", strikethrough && "line-through", className)}>
      {isAED ? (
        <AEDIcon size={iconSize} className="flex-shrink-0" />
      ) : (
        <span>{currencyInfo.symbol}</span>
      )}
      <span>{formattedNumber}</span>
    </span>
  );
}
