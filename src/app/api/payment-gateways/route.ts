import { NextResponse } from "next/server";
import { siteConfig } from "@/config/site";

const STORE_API_BASE = `${siteConfig.apiUrl}/wp-json/wc/store/v1`;

export interface StorePaymentGateway {
  id: string;
  title: string;
  description: string;
  order: number;
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
    const url = `${STORE_API_BASE}/payment-gateways`;
    
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

    const gateways = (Array.isArray(data) ? data : [])
      .sort((a: StorePaymentGateway, b: StorePaymentGateway) => (a.order || 0) - (b.order || 0))
      .map((gateway: StorePaymentGateway) => ({
        id: gateway.id,
        title: gateway.title,
        description: gateway.description,
        method_title: gateway.title,
      }));

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
