"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Script from "next/script";

interface MyFatoorahEmbeddedPaymentProps {
  sessionId: string;
  scriptUrl: string;
  encryptionKey: string;
  orderId: number;
  orderKey: string;
  locale: string;
  onPaymentComplete: (response: MyFatoorahPaymentResponse) => void;
  onPaymentError: (error: string) => void;
  onPaymentStarted?: () => void;
}

interface MyFatoorahPaymentResponse {
  isSuccess: boolean;
  sessionId: string;
  paymentCompleted: boolean;
  paymentData?: string;
  paymentType?: string;
  redirectionUrl?: string;
  error?: string;
}

interface MyFatoorahEvent {
  name: string;
  id: number;
  paymentMethodName: string;
  data: Record<string, unknown>;
}

declare global {
  interface Window {
    myfatoorah: {
      init: (config: MyFatoorahConfig) => void;
      submitCardPayment: (options?: { currency?: string; skipTokenSave?: boolean }) => void;
      validateCardInputs: () => Promise<{ isValid: boolean; errors?: string[] }>;
      updateAmount: (amount: number) => void;
    };
  }
}

interface MyFatoorahConfig {
  sessionId: string;
  callback: (response: MyFatoorahPaymentResponse) => void;
  containerId: string;
  shouldHandlePaymentUrl: boolean;
  subscribedEvents?: string[];
  eventListener?: (event: MyFatoorahEvent) => void;
  settings?: {
    loader?: {
      display?: string;
    };
    card?: {
      language?: string;
      style?: Record<string, unknown>;
    };
    applePay?: {
      language?: string;
      style?: Record<string, unknown>;
    };
    googlePay?: {
      language?: string;
      style?: Record<string, unknown>;
    };
  };
}

export function MyFatoorahEmbeddedPayment({
  sessionId,
  scriptUrl,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  encryptionKey: _encryptionKey,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  orderId: _orderId,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  orderKey: _orderKey,
  locale,
  onPaymentComplete,
  onPaymentError,
  onPaymentStarted,
}: MyFatoorahEmbeddedPaymentProps) {
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const isRTL = locale === "ar";

  const handlePaymentCallback = useCallback((response: MyFatoorahPaymentResponse) => {
    console.log("MyFatoorah payment callback:", response);
    setIsProcessing(false);

    if (response.isSuccess && response.paymentCompleted) {
      onPaymentComplete(response);
    } else if (!response.isSuccess) {
      const errorMessage = response.error || 
        (isRTL ? "فشل الدفع. يرجى المحاولة مرة أخرى." : "Payment failed. Please try again.");
      onPaymentError(errorMessage);
    }
  }, [onPaymentComplete, onPaymentError, isRTL]);

  const handleEvent = useCallback((event: MyFatoorahEvent) => {
    console.log("MyFatoorah event:", event);
    
    switch (event.name) {
      case "VIEW_READY":
        setIsInitialized(true);
        break;
      case "PAYMENT_STARTED":
        setIsProcessing(true);
        onPaymentStarted?.();
        break;
      case "PAYMENT_COMPLETED":
        setIsProcessing(false);
        break;
      case "3DS_CHALLENGE_INITIATED":
        break;
      default:
        break;
    }
  }, [onPaymentStarted]);

  useEffect(() => {
    if (!isScriptLoaded || !sessionId || isInitialized) return;

    const initializePayment = () => {
      if (typeof window.myfatoorah === "undefined") {
        console.error("MyFatoorah SDK not loaded");
        return;
      }

      const config: MyFatoorahConfig = {
        sessionId: sessionId,
        callback: handlePaymentCallback,
        containerId: "myfatoorah-embedded-container",
        shouldHandlePaymentUrl: true,
        subscribedEvents: [
          "VIEW_READY",
          "CARD_IDENTIFIED",
          "PAYMENT_STARTED",
          "PAYMENT_COMPLETED",
          "SESSION_STARTED",
          "SESSION_CANCELED",
          "3DS_CHALLENGE_INITIATED",
        ],
        eventListener: handleEvent,
        settings: {
          loader: {
            display: "none",
          },
          card: {
            language: locale === "ar" ? "ar" : "en",
            style: {
              showCardholderName: true,
              hideCardIcons: false,
              cardHeight: "220px",
              input: {
                color: "#1f2937",
                fontSize: "14px",
                fontFamily: "inherit",
                inputHeight: "44px",
                inputMargin: "8px",
                borderColor: "#d1d5db",
                borderWidth: "1px",
                borderRadius: "8px",
                backgroundColor: "#ffffff",
                placeHolder: {
                  color: "#9ca3af",
                  holderName: isRTL ? "الاسم على البطاقة" : "Name on Card",
                  cardNumber: isRTL ? "رقم البطاقة" : "Card Number",
                  expiryDate: "MM/YY",
                  securityCode: "CVV",
                },
              },
              label: {
                display: true,
                color: "#374151",
                fontSize: "14px",
                fontWeight: "500",
                fontFamily: "inherit",
                text: {
                  holderName: isRTL ? "اسم حامل البطاقة" : "Cardholder Name",
                  cardNumber: isRTL ? "رقم البطاقة" : "Card Number",
                  expiryDate: isRTL ? "تاريخ الانتهاء" : "Expiry Date",
                  securityCode: isRTL ? "رمز الأمان" : "Security Code",
                },
              },
              error: {
                borderColor: "#ef4444",
                borderRadius: "8px",
              },
              button: {
                useCustomButton: true,
              },
              separator: {
                useCustomSeparator: true,
              },
            },
          },
          applePay: {
            language: locale === "ar" ? "ar" : "en",
            style: {
              frameHeight: "48px",
              frameWidth: "100%",
              button: {
                height: "48px",
                type: "pay",
                borderRadius: "8px",
              },
            },
          },
          googlePay: {
            language: locale === "ar" ? "ar" : "en",
            style: {
              frameHeight: "48px",
              frameWidth: "100%",
              button: {
                height: "48px",
                type: "pay",
                borderRadius: "8px",
                color: "black",
              },
            },
          },
        },
      };

      try {
        window.myfatoorah.init(config);
        console.log("MyFatoorah initialized successfully");
      } catch (error) {
        console.error("Failed to initialize MyFatoorah:", error);
        onPaymentError(isRTL ? "فشل تحميل نموذج الدفع" : "Failed to load payment form");
      }
    };

    const timer = setTimeout(initializePayment, 100);
    return () => clearTimeout(timer);
  }, [isScriptLoaded, sessionId, isInitialized, locale, isRTL, handlePaymentCallback, handleEvent, onPaymentError]);

  const handleScriptLoad = () => {
    console.log("MyFatoorah script loaded");
    setIsScriptLoaded(true);
  };

  const handleScriptError = () => {
    console.error("Failed to load MyFatoorah script");
    onPaymentError(isRTL ? "فشل تحميل بوابة الدفع" : "Failed to load payment gateway");
  };

  return (
    <div className="myfatoorah-embedded-payment">
      <Script
        src={scriptUrl}
        onLoad={handleScriptLoad}
        onError={handleScriptError}
        strategy="afterInteractive"
      />

      {!isInitialized && (
        <div className="flex items-center justify-center py-8">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900"></div>
            <span className="text-sm text-gray-600">
              {isRTL ? "جاري تحميل نموذج الدفع..." : "Loading payment form..."}
            </span>
          </div>
        </div>
      )}

      <div
        id="myfatoorah-embedded-container"
        ref={containerRef}
        className={`transition-opacity duration-300 ${isInitialized ? "opacity-100" : "opacity-0"}`}
        style={{ minHeight: isInitialized ? "auto" : "0" }}
      />

      {isProcessing && (
        <div className="mt-4 flex items-center justify-center gap-2 rounded-lg bg-blue-50 p-3">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600"></div>
          <span className="text-sm text-blue-700">
            {isRTL ? "جاري معالجة الدفع..." : "Processing payment..."}
          </span>
        </div>
      )}
    </div>
  );
}

export default MyFatoorahEmbeddedPayment;
