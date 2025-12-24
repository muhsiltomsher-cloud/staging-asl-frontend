import { NextRequest, NextResponse } from "next/server";
import { siteConfig } from "@/config/site";
import { cookies } from "next/headers";

const API_BASE = siteConfig.apiUrl;
const CART_KEY_COOKIE = "cocart_cart_key";
const AUTH_TOKEN_COOKIE = "asl_auth_token";

async function getCartKey(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(CART_KEY_COOKIE)?.value || null;
}

async function getAuthToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(AUTH_TOKEN_COOKIE)?.value || null;
}

function getAuthHeaders(request: NextRequest, authToken: string | null): HeadersInit {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  const authHeader = request.headers.get("Authorization");
  if (authHeader) {
    headers["Authorization"] = authHeader;
  } else if (authToken) {
    headers["Authorization"] = `Bearer ${authToken}`;
  }

  return headers;
}

function createResponseWithCartKey(
  data: Record<string, unknown>,
  cartKey: string | null,
  status: number = 200
): NextResponse {
  const response = NextResponse.json(data, { status });
  
  if (cartKey) {
    response.cookies.set(CART_KEY_COOKIE, cartKey, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });
  }
  
  return response;
}

export async function GET(request: NextRequest) {
  try {
    const cartKey = await getCartKey();
    const authToken = await getAuthToken();
    
    // For authenticated users, don't use cart_key (use JWT identity)
    const url = authToken
      ? `${API_BASE}/wp-json/cocart/v2/cart`
      : cartKey
        ? `${API_BASE}/wp-json/cocart/v2/cart?cart_key=${cartKey}`
        : `${API_BASE}/wp-json/cocart/v2/cart`;

    const response = await fetch(url, {
      method: "GET",
      headers: getAuthHeaders(request, authToken),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: data.code || "cart_error",
            message: data.message || "Failed to get cart.",
          },
        },
        { status: response.status }
      );
    }

    // Store cart_key for future requests (only for guest users)
    const newCartKey = !authToken && data.cart_key ? data.cart_key : null;
    return createResponseWithCartKey({ success: true, cart: data }, newCartKey);
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
  const searchParams = request.nextUrl.searchParams;
  const action = searchParams.get("action");

  try {
    const cartKey = await getCartKey();
    const authToken = await getAuthToken();
    const body = await request.json().catch(() => ({}));
    let url: string;
    let method: string = "POST";

    switch (action) {
      case "add":
        url = `${API_BASE}/wp-json/cocart/v2/cart/add-item`;
        break;
      case "update": {
        const itemKey = searchParams.get("item_key");
        if (!itemKey) {
          return NextResponse.json(
            { success: false, error: { code: "missing_item_key", message: "Item key is required" } },
            { status: 400 }
          );
        }
        url = `${API_BASE}/wp-json/cocart/v2/cart/item/${itemKey}`;
        break;
      }
      case "remove": {
        const removeKey = searchParams.get("item_key");
        if (!removeKey) {
          return NextResponse.json(
            { success: false, error: { code: "missing_item_key", message: "Item key is required" } },
            { status: 400 }
          );
        }
        url = `${API_BASE}/wp-json/cocart/v2/cart/item/${removeKey}`;
        method = "DELETE";
        break;
      }
      case "clear":
        url = `${API_BASE}/wp-json/cocart/v2/cart/clear`;
        break;
      case "apply-coupon":
        url = `${API_BASE}/wp-json/cocart/v2/cart/coupon`;
        break;
      case "remove-coupon": {
        const couponCode = searchParams.get("coupon");
        if (!couponCode) {
          return NextResponse.json(
            { success: false, error: { code: "missing_coupon", message: "Coupon code is required" } },
            { status: 400 }
          );
        }
        url = `${API_BASE}/wp-json/cocart/v2/cart/coupon/${couponCode}`;
        method = "DELETE";
        break;
      }
      default:
        return NextResponse.json(
          { success: false, error: { code: "invalid_action", message: "Invalid action" } },
          { status: 400 }
        );
    }

    // Add cart_key to URL only for guest users (not authenticated)
    if (!authToken && cartKey) {
      url += url.includes("?") ? `&cart_key=${cartKey}` : `?cart_key=${cartKey}`;
    }

    const fetchOptions: RequestInit = {
      method,
      headers: getAuthHeaders(request, authToken),
    };

    if (method !== "DELETE" && Object.keys(body).length > 0) {
      fetchOptions.body = JSON.stringify(body);
    }

    const response = await fetch(url, fetchOptions);
    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: data.code || "cart_error",
            message: data.message || "Cart operation failed.",
          },
        },
        { status: response.status }
      );
    }

    // Store cart_key for future requests (only for guest users)
    const newCartKey = !authToken && data.cart_key ? data.cart_key : null;
    return createResponseWithCartKey({ success: true, cart: data }, newCartKey);
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
