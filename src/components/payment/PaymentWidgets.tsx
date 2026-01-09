"use client";

import { TabbyPromoWidget } from "./TabbyPromoWidget";
import { TamaraPromoWidget } from "./TamaraPromoWidget";

interface PaymentWidgetsProps {
  price: number;
  currency: string;
  locale: string;
}

export function PaymentWidgets({ price, currency, locale }: PaymentWidgetsProps) {
  // Don't render widgets for very low prices
  if (price <= 0) return null;

  return (
    <div className="space-y-2 border-t border-gray-200 pt-3 mt-3">
      <TabbyPromoWidget price={price} currency={currency} locale={locale} />
      <TamaraPromoWidget price={price} currency={currency} locale={locale} />
    </div>
  );
}
