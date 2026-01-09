"use client";

import { useEffect, useRef } from "react";

interface TabbyPromoWidgetProps {
  price: number;
  currency: string;
  locale: string;
}

declare global {
  interface Window {
    TabbyPromo?: new (config: {
      selector: string;
      currency: string;
      price: string;
      lang: string;
      source: string;
      publicKey: string;
      merchantCode: string;
    }) => void;
  }
}

export function TabbyPromoWidget({ price, currency, locale }: TabbyPromoWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    
    const publicKey = process.env.NEXT_PUBLIC_TABBY_PUBLIC_KEY;
    const merchantCode = process.env.NEXT_PUBLIC_TABBY_MERCHANT_CODE || "default";

    if (!publicKey || price <= 0) return;

    // Load Tabby promo script
    const script = document.createElement("script");
    script.src = "https://checkout.tabby.ai/tabby-promo.js";
    script.async = true;
    script.onload = () => {
      if (window.TabbyPromo && containerRef.current) {
        // Format price based on currency (KWD uses 3 decimal places)
        const formattedPrice = currency === "KWD" 
          ? price.toFixed(3) 
          : price.toFixed(2);

        new window.TabbyPromo({
          selector: "#tabby-promo-widget",
          currency: currency.toUpperCase(),
          price: formattedPrice,
          lang: locale === "ar" ? "ar" : "en",
          source: "product",
          publicKey: publicKey,
          merchantCode: merchantCode,
        });
        initialized.current = true;
      }
    };
    document.body.appendChild(script);

    return () => {
      // Cleanup script on unmount
      const existingScript = document.querySelector('script[src="https://checkout.tabby.ai/tabby-promo.js"]');
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, [price, currency, locale]);

  // Don't render if price is too low or no public key
  if (price <= 0) return null;

  return (
    <div 
      ref={containerRef} 
      id="tabby-promo-widget" 
      className="my-3"
    />
  );
}
