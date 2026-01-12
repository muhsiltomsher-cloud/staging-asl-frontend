import { NextRequest, NextResponse } from "next/server";
import { siteConfig } from "@/config/site";
import { cookies } from "next/headers";

const API_BASE = siteConfig.apiUrl;
const AUTH_TOKEN_COOKIE = "asl_auth_token";

async function getAuthToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(AUTH_TOKEN_COOKIE)?.value || null;
}

async function getStoreApiAuth(): Promise<{ cartToken: string | null; nonce: string | null }> {
  try {
    const response = await fetch(`${API_BASE}/wp-json/wc/store/v1/cart`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    
    const cartToken = response.headers.get("cart-token");
    const nonce = response.headers.get("nonce");
    
    return { cartToken, nonce };
  } catch {
    return { cartToken: null, nonce: null };
  }
}

export interface ShippingRate {
  rate_id: string;
  name: string;
  description: string;
  delivery_time: string;
  price: string;
  taxes: string;
  instance_id: number;
  method_id: string;
  meta_data: Array<{ key: string; value: string }>;
  selected: boolean;
  currency_code: string;
  currency_symbol: string;
  currency_minor_unit: number;
  currency_decimal_separator: string;
  currency_thousand_separator: string;
  currency_prefix: string;
  currency_suffix: string;
}

export interface ShippingPackage {
  package_id: number;
  name: string;
  destination: {
    address_1: string;
    address_2: string;
    city: string;
    state: string;
    postcode: string;
    country: string;
  };
  items: Array<{
    key: string;
    name: string;
    quantity: number;
  }>;
  shipping_rates: ShippingRate[];
}

export async function GET(request: NextRequest) {
  try {
    const { cartToken, nonce } = await getStoreApiAuth();
    const authToken = await getAuthToken();
    
    if (!cartToken || !nonce) {
      return NextResponse.json(
        { success: false, error: { code: "store_api_auth_error", message: "Failed to get Store API authentication" } },
        { status: 500 }
      );
    }

    const country = request.nextUrl.searchParams.get("country") || "AE";
    const city = request.nextUrl.searchParams.get("city") || "";
    const postcode = request.nextUrl.searchParams.get("postcode") || "";

    const headers: HeadersInit = {
      "Content-Type": "application/json",
      "Cart-Token": cartToken,
      "X-WP-Nonce": nonce,
    };

    if (authToken) {
      headers["Authorization"] = `Bearer ${authToken}`;
    }

    const updateAddressResponse = await fetch(`${API_BASE}/wp-json/wc/store/v1/cart/update-customer`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        shipping_address: {
          country,
          city,
          postcode,
        },
      }),
    });

    if (!updateAddressResponse.ok) {
      const errorData = await updateAddressResponse.json();
      console.error("Failed to update shipping address:", errorData);
    }

    const cartResponse = await fetch(`${API_BASE}/wp-json/wc/store/v1/cart`, {
      method: "GET",
      headers,
    });

    const cartData = await cartResponse.json();

    if (!cartResponse.ok) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: cartData.code || "shipping_error",
            message: cartData.message || "Failed to get shipping methods.",
          },
        },
        { status: cartResponse.status }
      );
    }

    const shippingRates: ShippingPackage[] = cartData.shipping_rates || [];
    const needsShipping = cartData.needs_shipping || false;

    return NextResponse.json({
      success: true,
      needs_shipping: needsShipping,
      shipping_rates: shippingRates,
      totals: {
        shipping_total: cartData.totals?.total_shipping || "0",
        shipping_tax: cartData.totals?.total_shipping_tax || "0",
      },
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

export async function POST(request: NextRequest) {
  try {
    const { cartToken, nonce } = await getStoreApiAuth();
    const authToken = await getAuthToken();
    
    if (!cartToken || !nonce) {
      return NextResponse.json(
        { success: false, error: { code: "store_api_auth_error", message: "Failed to get Store API authentication" } },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { rate_id, package_id } = body;

    if (!rate_id) {
      return NextResponse.json(
        { success: false, error: { code: "missing_rate_id", message: "Rate ID is required" } },
        { status: 400 }
      );
    }

    const headers: HeadersInit = {
      "Content-Type": "application/json",
      "Cart-Token": cartToken,
      "X-WP-Nonce": nonce,
    };

    if (authToken) {
      headers["Authorization"] = `Bearer ${authToken}`;
    }

    const selectRateResponse = await fetch(`${API_BASE}/wp-json/wc/store/v1/cart/select-shipping-rate`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        rate_id,
        package_id: package_id ?? 0,
      }),
    });

    const selectRateData = await selectRateResponse.json();

    if (!selectRateResponse.ok) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: selectRateData.code || "select_rate_error",
            message: selectRateData.message || "Failed to select shipping rate.",
          },
        },
        { status: selectRateResponse.status }
      );
    }

    const shippingRates: ShippingPackage[] = selectRateData.shipping_rates || [];

    return NextResponse.json({
      success: true,
      shipping_rates: shippingRates,
      totals: {
        shipping_total: selectRateData.totals?.total_shipping || "0",
        shipping_tax: selectRateData.totals?.total_shipping_tax || "0",
        total: selectRateData.totals?.total_price || "0",
      },
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
