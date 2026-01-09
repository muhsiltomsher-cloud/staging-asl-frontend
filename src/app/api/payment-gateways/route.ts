import { NextResponse } from "next/server";
import { siteConfig } from "@/config/site";

const API_BASE = `${siteConfig.apiUrl}/wp-json/wc/v3`;

function getWooCommerceCredentials() {
  const consumerKey = process.env.WC_CONSUMER_KEY || process.env.NEXT_PUBLIC_WC_CONSUMER_KEY || "";
  const consumerSecret = process.env.WC_CONSUMER_SECRET || process.env.NEXT_PUBLIC_WC_CONSUMER_SECRET || "";
  return { consumerKey, consumerSecret };
}

function getBasicAuthParams(): string {
  const { consumerKey, consumerSecret } = getWooCommerceCredentials();
  return `consumer_key=${consumerKey}&consumer_secret=${consumerSecret}`;
}

export interface PaymentGateway {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
  order: number;
  method_title: string;
  method_description: string;
  settings?: Record<string, unknown>;
}

export async function GET() {
  try {
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

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: data.code || "payment_gateways_error",
            message: data.message || "Failed to get payment gateways.",
          },
        },
        { status: response.status }
      );
    }

    const enabledGateways = data
      .filter((gateway: PaymentGateway) => gateway.enabled)
      .sort((a: PaymentGateway, b: PaymentGateway) => (a.order || 0) - (b.order || 0))
      .map((gateway: PaymentGateway) => ({
        id: gateway.id,
        title: gateway.title,
        description: gateway.description,
        method_title: gateway.method_title,
      }));

    return NextResponse.json({ 
      success: true, 
      gateways: enabledGateways,
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
