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
  paidCurrency?: string;
  paidCurrencyValue?: string;
  className?: string;
  isRTL?: boolean;
}

export function OrderCurrencyBadge({
  orderCurrency,
  orderCurrencySymbol,
  paidCurrency,
  paidCurrencyValue,
  className,
  isRTL = false,
}: OrderCurrencyBadgeProps) {
  const { currencies } = useCurrency();
  const orderCurrencyInfo = currencies.find((c) => c.code === orderCurrency);
  const symbol = orderCurrencySymbol || orderCurrencyInfo?.symbol || orderCurrency;

  const hasDifferentCurrency = paidCurrency && paidCurrency !== orderCurrency;
  const paidCurrencyInfo = hasDifferentCurrency ? currencies.find((c) => c.code === paidCurrency) : null;
  const paidSymbol = paidCurrencyInfo?.symbol || paidCurrency;

  return (
    <span className={cn(
      "inline-flex flex-wrap items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700",
      className
    )}>
      <span>{isRTL ? "العملة المدفوعة:" : "Paid in:"}</span>
      {hasDifferentCurrency ? (
        <>
          <span className="font-semibold">{paidCurrency}</span>
          {paidCurrency === "AED" ? (
            <AEDIcon size="xs" className="flex-shrink-0" />
          ) : (
            <span>({paidSymbol})</span>
          )}
          {paidCurrencyValue && (
            <span className="font-semibold">
              {new Intl.NumberFormat("en-US", {
                minimumFractionDigits: paidCurrencyInfo?.decimals ?? 2,
                maximumFractionDigits: paidCurrencyInfo?.decimals ?? 3,
              }).format(parseFloat(paidCurrencyValue))}
            </span>
          )}
        </>
      ) : (
        <>
          <span className="font-semibold">{orderCurrency}</span>
          {orderCurrency === "AED" ? (
            <AEDIcon size="xs" className="flex-shrink-0" />
          ) : (
            <span>({symbol})</span>
          )}
        </>
      )}
    </span>
  );
}
