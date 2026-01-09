"use client";

import { useEffect, useRef } from "react";

// Declare the custom element for TypeScript
declare global {
  interface Window {
    TamaraProductWidget?: {
      init: (config: {
        lang: string;
        currency: string;
        publicKey: string;
      }) => void;
      render: () => void;
    };
    tamaraWidgetConfig?: {
      lang: string;
      currency: string;
      publicKey: string;
    };
  }
}

// Extend JSX IntrinsicElements for tamara-widget custom element
declare module "react" {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      "tamara-widget": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          type?: string;
          amount?: string;
          currency?: string;
          "inline-type"?: string;
        },
        HTMLElement
      >;
    }
  }
}

interface TamaraPromoWidgetProps {
  price: number;
  currency: string;
  locale: string;
}

export function TamaraPromoWidget({ price, currency, locale }: TamaraPromoWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;

    const publicKey = process.env.NEXT_PUBLIC_TAMARA_PUBLIC_KEY;

    if (!publicKey || price <= 0) return;

    // Set up Tamara widget config
    window.tamaraWidgetConfig = {
      lang: locale === "ar" ? "ar" : "en",
      currency: currency.toUpperCase(),
      publicKey: publicKey,
    };

    // Load Tamara product widget script
    const script = document.createElement("script");
    script.src = "https://cdn.tamara.co/widget-v2/tamara-widget.js";
    script.async = true;
    script.onload = () => {
      if (window.TamaraProductWidget) {
        window.TamaraProductWidget.init({
          lang: locale === "ar" ? "ar" : "en",
          currency: currency.toUpperCase(),
          publicKey: publicKey,
        });
        window.TamaraProductWidget.render();
        initialized.current = true;
      }
    };
    document.body.appendChild(script);

    return () => {
      // Cleanup script on unmount
      const existingScript = document.querySelector('script[src="https://cdn.tamara.co/widget-v2/tamara-widget.js"]');
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, [price, currency, locale]);

  // Don't render if price is too low or no public key
  if (price <= 0) return null;

  // Format price based on currency
  const formattedPrice = currency === "KWD" ? price.toFixed(3) : price.toFixed(2);

  return (
    <div ref={containerRef} className="my-3">
      <tamara-widget
        type="tamara-summary"
        amount={formattedPrice}
        currency={currency.toUpperCase()}
        inline-type="2"
      />
    </div>
  );
}
