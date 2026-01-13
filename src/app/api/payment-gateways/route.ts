import { NextResponse } from "next/server";
import { siteConfig } from "@/config/site";
import { getEnvVar } from "@/lib/utils/loadEnv";

const API_BASE = `${siteConfig.apiUrl}/wp-json/wc/v3`;
const STORE_API_BASE = `${siteConfig.apiUrl}/wp-json/wc/store/v1`;

function getWooCommerceCredentials() {
  const consumerKey = getEnvVar("WC_CONSUMER_KEY") || getEnvVar("NEXT_PUBLIC_WC_CONSUMER_KEY") || "";
  const consumerSecret = getEnvVar("WC_CONSUMER_SECRET") || getEnvVar("NEXT_PUBLIC_WC_CONSUMER_SECRET") || "";
  return { consumerKey, consumerSecret };
}

function getBasicAuthParams(): string {
  const { consumerKey, consumerSecret } = getWooCommerceCredentials();
  return `consumer_key=${consumerKey}&consumer_secret=${consumerSecret}`;
}

const PAYMENT_METHOD_DETAILS: Record<string, { title: string; description: string }> = {
  myfatoorah_v2: {
    title: "Credit/Debit Card",
    description: "Pay securely with your credit or debit card via MyFatoorah",
  },
  myfatoorah: {
    title: "Credit/Debit Card",
    description: "Pay securely with your credit or debit card via MyFatoorah",
  },
  myfatoorah_cards: {
    title: "Credit/Debit Card",
    description: "Pay securely with your credit or debit card via MyFatoorah",
  },
  myfatoorah_embedded: {
    title: "Credit/Debit Card",
    description: "Pay securely with your credit or debit card via MyFatoorah",
  },
  tabby_installments: {
    title: "Tabby - Pay in Installments",
    description: "Split your purchase into 4 interest-free payments",
  },
  tabby_checkout: {
    title: "Tabby - Pay in Installments",
    description: "Split your purchase into 4 interest-free payments",
  },
  tabby: {
    title: "Tabby - Pay in Installments",
    description: "Split your purchase into 4 interest-free payments",
  },
  "tamara-gateway": {
    title: "Tamara - Buy Now Pay Later",
    description: "Pay in easy installments with Tamara",
  },
  tamara: {
    title: "Tamara - Buy Now Pay Later",
    description: "Pay in easy installments with Tamara",
  },
  cod: {
    title: "Cash on Delivery",
    description: "Pay with cash upon delivery",
  },
  bacs: {
    title: "Bank Transfer",
    description: "Make your payment directly into our bank account",
  },
};

interface WCPaymentGateway {
  id: string;
  title: string;
  description: string;
  order: number;
  enabled: boolean;
  method_title: string;
  method_description: string;
  settings?: Record<string, { value: string }>;
}

interface CartResponse {
  payment_methods?: string[];
}

export async function GET() {
  try {
    const { consumerKey, consumerSecret } = getWooCommerceCredentials();
    
    if (consumerKey && consumerSecret) {
      const url = `${API_BASE}/payment_gateways?${getBasicAuthParams()}`;
      
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        next: {
          revalidate: 60,
        },
      });

      if (response.ok) {
        const data: WCPaymentGateway[] = await response.json();
        
        const enabledGateways = data
          .filter((gateway) => gateway.enabled)
          .sort((a, b) => a.order - b.order)
          .map((gateway) => {
            const details = PAYMENT_METHOD_DETAILS[gateway.id];
            return {
              id: gateway.id,
              title: details?.title || gateway.title,
              description: details?.description || gateway.description || "",
              method_title: gateway.method_title,
              order: gateway.order,
            };
          });

        return NextResponse.json({ 
          success: true, 
          gateways: enabledGateways,
        });
      }
    }
    
    const storeUrl = `${STORE_API_BASE}/cart`;
    
    const storeResponse = await fetch(storeUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      next: {
        revalidate: 60,
      },
    });

    const storeData: CartResponse = await storeResponse.json();

    if (!storeResponse.ok) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "payment_gateways_error",
            message: "Failed to get payment gateways.",
          },
        },
        { status: storeResponse.status }
      );
    }

    const paymentMethodIds = storeData.payment_methods || [];
    
    const gateways = paymentMethodIds.map((id: string, index: number) => {
      const details = PAYMENT_METHOD_DETAILS[id] || {
        title: id.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
        description: "",
      };
      return {
        id,
        title: details.title,
        description: details.description,
        method_title: details.title,
        order: index,
      };
    });

    return NextResponse.json({ 
      success: true, 
      gateways,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "network_error",
          message: error instanceof Error ? error.message : "Network error occurred",
        },
      },
      { status: 500 }
    );
  }
}
