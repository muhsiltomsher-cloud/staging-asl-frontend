import { NextRequest, NextResponse } from "next/server";
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

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const customerId = searchParams.get("customerId");

  if (!customerId) {
    return NextResponse.json(
      { success: false, error: { code: "missing_customer_id", message: "Customer ID is required" } },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(
      `${API_BASE}/customers/${customerId}?${getBasicAuthParams()}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: data.code || "customer_error",
            message: data.message || "Failed to get customer.",
          },
        },
        { status: response.status }
      );
    }

    return NextResponse.json({ success: true, data });
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

export async function PUT(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const customerId = searchParams.get("customerId");

  if (!customerId) {
    return NextResponse.json(
      { success: false, error: { code: "missing_customer_id", message: "Customer ID is required" } },
      { status: 400 }
    );
  }

  try {
    const body = await request.json();

    const response = await fetch(
      `${API_BASE}/customers/${customerId}?${getBasicAuthParams()}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: data.code || "customer_update_error",
            message: data.message || "Failed to update customer.",
          },
        },
        { status: response.status }
      );
    }

    return NextResponse.json({ success: true, data });
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const response = await fetch(
      `${API_BASE}/customers?${getBasicAuthParams()}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: data.code || "customer_create_error",
            message: data.message || "Failed to create customer.",
          },
        },
        { status: response.status }
      );
    }

    return NextResponse.json({ success: true, data });
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
