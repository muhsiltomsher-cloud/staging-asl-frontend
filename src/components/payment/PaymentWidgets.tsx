"use client";

import { useState, useEffect } from "react";
import { TabbyPromoWidget } from "./TabbyPromoWidget";
import { TamaraPromoWidget } from "./TamaraPromoWidget";

interface PaymentWidgetsProps {
  price: number;
  currency: string;
  locale: string;
}

interface PaymentGateway {
  id: string;
  title: string;
  description: string;
  method_title: string;
}

export function PaymentWidgets({ price, currency, locale }: PaymentWidgetsProps) {
  const [enabledGateways, setEnabledGateways] = useState<PaymentGateway[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPaymentGateways = async () => {
      try {
        const response = await fetch("/api/payment-gateways");
        const data = await response.json();
        if (data.success && data.gateways) {
          setEnabledGateways(data.gateways);
        }
      } catch (err) {
        console.error("Failed to fetch payment gateways:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPaymentGateways();
  }, []);

  // Don't render widgets for very low prices
  if (price <= 0) return null;

  // Don't render anything while loading to avoid flash
  if (isLoading) return null;

  // Check if Tabby is enabled (any tabby variant)
  const isTabbyEnabled = enabledGateways.some(
    (gateway) => gateway.id === "tabby" || gateway.id === "tabby_installments" || gateway.id === "tabby_checkout"
  );

  // Check if Tamara is enabled (any tamara variant)
  const isTamaraEnabled = enabledGateways.some(
    (gateway) => gateway.id === "tamara" || gateway.id === "tamara-gateway"
  );

  // Don't render the container if neither widget is enabled
  if (!isTabbyEnabled && !isTamaraEnabled) return null;

  return (
    <div className="space-y-2 border-t border-gray-200 pt-3 mt-3">
      {isTabbyEnabled && <TabbyPromoWidget price={price} currency={currency} locale={locale} />}
      {isTamaraEnabled && <TamaraPromoWidget price={price} currency={currency} locale={locale} />}
    </div>
  );
}
