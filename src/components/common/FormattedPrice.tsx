"use client";

import { useCurrency } from "@/contexts/CurrencyContext";
import { AEDIcon } from "./AEDIcon";
import { cn } from "@/lib/utils";

interface FormattedPriceProps {
  price: string | number;
  showCode?: boolean;
  className?: string;
  iconSize?: "xs" | "sm" | "md" | "lg";
  strikethrough?: boolean;
}

export function FormattedPrice({
  price,
  showCode = true,
  className,
  iconSize = "sm",
  strikethrough = false,
}: FormattedPriceProps) {
  const { currency, getCurrencyInfo } = useCurrency();
  const currencyInfo = getCurrencyInfo();

  const numericPrice = typeof price === "string" 
    ? parseFloat(price.replace(/[^0-9.-]+/g, "")) 
    : price;

  if (isNaN(numericPrice)) {
    return <span className={className}>{price.toString()}</span>;
  }

  const formattedNumber = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: currencyInfo.decimals,
    maximumFractionDigits: currencyInfo.decimals,
  }).format(numericPrice);

  const isAED = currency === "AED";

  if (showCode) {
    return (
      <span className={cn("inline-flex items-center gap-1", strikethrough && "line-through", className)}>
        <span>{formattedNumber}</span>
        {isAED ? (
          <AEDIcon size={iconSize} className="flex-shrink-0" />
        ) : (
          <span>{currencyInfo.code}</span>
        )}
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
