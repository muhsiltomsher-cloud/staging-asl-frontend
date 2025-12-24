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

function getGuestHeaders(): HeadersInit {
  return {
    "Content-Type": "application/json",
  };
}

function isAuthError(status: number, data: Record<string, unknown>): boolean {
  if (status !== 401 && status !== 403) return false;
  const code = data.code as string | undefined;
  const message = data.message as string | undefined;
  return (
    code?.includes("jwt_auth") ||
    code?.includes("rest_forbidden") ||
    message?.toLowerCase().includes("authentication") ||
    message?.toLowerCase().includes("token") ||
    message?.toLowerCase().includes("unauthorized")
  );
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
    const authUrl = `${API_BASE}/wp-json/cocart/v2/cart`;
    const guestUrl = cartKey
      ? `${API_BASE}/wp-json/cocart/v2/cart?cart_key=${cartKey}`
      : `${API_BASE}/wp-json/cocart/v2/cart`;

    // First attempt: try with auth if token exists
    const url = authToken ? authUrl : guestUrl;
    let response = await fetch(url, {
      method: "GET",
      headers: authToken ? getAuthHeaders(request, authToken) : getGuestHeaders(),
    });

    let data = await response.json();

    // If auth failed and we had a token, retry as guest (token might be stale/invalid)
    if (!response.ok && authToken && isAuthError(response.status, data)) {
      response = await fetch(guestUrl, {
        method: "GET",
        headers: getGuestHeaders(),
      });
      data = await response.json();
    }

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

    // Store cart_key for future requests (for guest users or when falling back to guest)
    const newCartKey = data.cart_key ? data.cart_key : null;
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
    let baseUrl: string;
    let method: string = "POST";

    switch (action) {
      case "add":
        baseUrl = `${API_BASE}/wp-json/cocart/v2/cart/add-item`;
        break;
      case "update": {
        const itemKey = searchParams.get("item_key");
        if (!itemKey) {
          return NextResponse.json(
            { success: false, error: { code: "missing_item_key", message: "Item key is required" } },
            { status: 400 }
          );
        }
        baseUrl = `${API_BASE}/wp-json/cocart/v2/cart/item/${itemKey}`;
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
        baseUrl = `${API_BASE}/wp-json/cocart/v2/cart/item/${removeKey}`;
        method = "DELETE";
        break;
      }
      case "clear":
        baseUrl = `${API_BASE}/wp-json/cocart/v2/cart/clear`;
        break;
      case "apply-coupon":
        baseUrl = `${API_BASE}/wp-json/cocart/v2/cart/coupon`;
        break;
      case "remove-coupon": {
        const couponCode = searchParams.get("coupon");
        if (!couponCode) {
          return NextResponse.json(
            { success: false, error: { code: "missing_coupon", message: "Coupon code is required" } },
            { status: 400 }
          );
        }
        baseUrl = `${API_BASE}/wp-json/cocart/v2/cart/coupon/${couponCode}`;
        method = "DELETE";
        break;
      }
      default:
        return NextResponse.json(
          { success: false, error: { code: "invalid_action", message: "Invalid action" } },
          { status: 400 }
        );
    }

    // Build URLs for authenticated and guest requests
    const guestUrl = cartKey
      ? baseUrl + (baseUrl.includes("?") ? `&cart_key=${cartKey}` : `?cart_key=${cartKey}`)
      : baseUrl;
    const url = authToken ? baseUrl : guestUrl;

    const fetchOptions: RequestInit = {
      method,
      headers: authToken ? getAuthHeaders(request, authToken) : getGuestHeaders(),
    };

    if (method !== "DELETE" && Object.keys(body).length > 0) {
      fetchOptions.body = JSON.stringify(body);
    }

    let response = await fetch(url, fetchOptions);
    let data = await response.json();

    // If auth failed and we had a token, retry as guest (token might be stale/invalid)
    if (!response.ok && authToken && isAuthError(response.status, data)) {
      const guestFetchOptions: RequestInit = {
        method,
        headers: getGuestHeaders(),
      };
      if (method !== "DELETE" && Object.keys(body).length > 0) {
        guestFetchOptions.body = JSON.stringify(body);
      }
      response = await fetch(guestUrl, guestFetchOptions);
      data = await response.json();
    }

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

    // Store cart_key for future requests (for guest users or when falling back to guest)
    const newCartKey = data.cart_key ? data.cart_key : null;
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
