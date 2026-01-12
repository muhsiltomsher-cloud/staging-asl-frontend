"use client";

import { useCurrency } from "@/contexts/CurrencyContext";
import { AEDIcon } from "./AEDIcon";
import { cn } from "@/lib/utils";

interface OrderPriceProps {
  price?: string | number | null;
  orderCurrency: string;
  orderCurrencySymbol?: string;
  className?: string;
  iconSize?: "xs" | "sm" | "md" | "lg";
  showConversion?: boolean;
  isRTL?: boolean;
}

export function OrderPrice({
  price,
  orderCurrency,
  orderCurrencySymbol,
  className,
  iconSize = "sm",
  showConversion = false,
  isRTL = false,
}: OrderPriceProps) {
  const { currency, getCurrencyInfo, currencies } = useCurrency();
  const userCurrencyInfo = getCurrencyInfo();
  const orderCurrencyInfo = currencies.find((c) => c.code === orderCurrency);

  if (price === undefined || price === null || price === "") {
    return <span className={className}>—</span>;
  }

  const numericPrice = typeof price === "string" 
    ? parseFloat(price.replace(/[^0-9.-]+/g, "")) 
    : price;

  if (isNaN(numericPrice)) {
    return <span className={className}>{String(price)}</span>;
  }

  const decimals = orderCurrencyInfo?.decimals ?? 2;
  const formattedNumber = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(numericPrice);

  const isAED = orderCurrency === "AED";
  const symbol = orderCurrencySymbol || orderCurrencyInfo?.symbol || orderCurrency;

  const shouldShowConversion = showConversion && currency !== orderCurrency && orderCurrencyInfo && userCurrencyInfo;

  let convertedPrice = 0;
  if (shouldShowConversion && orderCurrencyInfo) {
    const priceInAED = numericPrice / orderCurrencyInfo.rateFromAED;
    convertedPrice = priceInAED * userCurrencyInfo.rateFromAED;
  }

  const formattedConvertedPrice = shouldShowConversion
    ? new Intl.NumberFormat("en-US", {
        minimumFractionDigits: userCurrencyInfo.decimals,
        maximumFractionDigits: userCurrencyInfo.decimals,
      }).format(convertedPrice)
    : "";

  return (
    <span className={cn("inline-flex flex-col", className)}>
      <span className="inline-flex items-center gap-1">
        {isAED ? (
          <AEDIcon size={iconSize} className="flex-shrink-0" />
        ) : (
          <span>{symbol}</span>
        )}
        <span>{formattedNumber}</span>
      </span>
      {shouldShowConversion && (
        <span className="text-xs text-gray-500 inline-flex items-center gap-1">
          {isRTL ? "≈" : "≈"}
          {currency === "AED" ? (
            <AEDIcon size="xs" className="flex-shrink-0" />
          ) : (
            <span>{userCurrencyInfo.symbol}</span>
          )}
          <span>{formattedConvertedPrice}</span>
        </span>
      )}
    </span>
  );
}

interface OrderCurrencyBadgeProps {
  orderCurrency: string;
  orderCurrencySymbol?: string;
  className?: string;
  isRTL?: boolean;
}

export function OrderCurrencyBadge({
  orderCurrency,
  orderCurrencySymbol,
  className,
  isRTL = false,
}: OrderCurrencyBadgeProps) {
  const { currencies } = useCurrency();
  const orderCurrencyInfo = currencies.find((c) => c.code === orderCurrency);
  const symbol = orderCurrencySymbol || orderCurrencyInfo?.symbol || orderCurrency;

  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700",
      className
    )}>
      <span>{isRTL ? "العملة المدفوعة:" : "Paid in:"}</span>
      <span className="font-semibold">{orderCurrency}</span>
      {orderCurrency === "AED" ? (
        <AEDIcon size="xs" className="flex-shrink-0" />
      ) : (
        <span>({symbol})</span>
      )}
    </span>
  );
}
