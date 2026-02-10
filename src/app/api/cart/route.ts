import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { API_BASE, backendHeaders, backendAuthHeaders, noCacheUrl, safeJsonResponse } from "@/lib/utils/backendFetch";

const CART_KEY_COOKIE = "cocart_cart_key";
const AUTH_TOKEN_COOKIE = "asl_auth_token";
const AUTH_REFRESH_TOKEN_COOKIE = "asl_refresh_token";
const CURRENCY_COOKIE = "wcml_currency";
const LOCALE_COOKIE = "NEXT_LOCALE";

async function getCartKey(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(CART_KEY_COOKIE)?.value || null;
}

async function getAuthToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(AUTH_TOKEN_COOKIE)?.value || null;
}

async function getRefreshToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(AUTH_REFRESH_TOKEN_COOKIE)?.value || null;
}

// Attempt to refresh the JWT token using the refresh token
async function tryRefreshToken(): Promise<string | null> {
  const refreshTokenValue = await getRefreshToken();
  if (!refreshTokenValue) return null;

  try {
    const response = await fetch(noCacheUrl(`${API_BASE}/wp-json/cocart/jwt/refresh-token`), {
      method: "POST",
      headers: backendHeaders(),
      body: JSON.stringify({ refresh_token: refreshTokenValue }),
    });

    if (!response.ok) return null;

    const data = await safeJsonResponse(response);
    return (data.jwt_token as string) || (data.token as string) || null;
  } catch {
    return null;
  }
}

async function getCurrency(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(CURRENCY_COOKIE)?.value || null;
}

// Get locale from query parameter, cookie, or referer URL
async function getLocale(request: NextRequest): Promise<string | null> {
  // First, check for locale in query parameter (highest priority for explicit requests)
  const localeParam = request.nextUrl.searchParams.get("locale");
  if (localeParam && (localeParam === "en" || localeParam === "ar")) {
    return localeParam;
  }
  
  const cookieStore = await cookies();
  const localeCookie = cookieStore.get(LOCALE_COOKIE)?.value;
  if (localeCookie) return localeCookie;
  
  // Try to extract locale from referer URL (e.g., /ar/product/... or /en/product/...)
  const referer = request.headers.get("referer");
  if (referer) {
    const match = referer.match(/\/(ar|en)\//);
    if (match) return match[1];
  }
  
  return null;
}

// Helper to append currency and lang parameters to URL
function appendParamsToUrl(url: string, currency: string | null, lang: string | null): string {
  let result = url;
  if (currency) {
    const separator = result.includes("?") ? "&" : "?";
    result = `${result}${separator}currency=${currency}`;
  }
  if (lang) {
    const separator = result.includes("?") ? "&" : "?";
    result = `${result}${separator}lang=${lang}`;
  }
  return result;
}

function getAuthHeaders(request: NextRequest, authToken: string | null): HeadersInit {
  const authHeader = request.headers.get("Authorization");
  if (authHeader) {
    return backendHeaders({ "Authorization": authHeader });
  } else if (authToken) {
    return backendAuthHeaders(authToken);
  }
  return backendHeaders();
}

function getGuestHeaders(): HeadersInit {
  return backendHeaders();
}

function isAuthError(status: number, data: Record<string, unknown>): boolean {
  if (status !== 401 && status !== 403) return false;
  
  // For 403 errors, always treat as potential auth error and retry as guest
  // This handles cases where:
  // 1. Auth token is stale/invalid
  // 2. Cart key is stale/invalid
  // 3. WAF or security plugin blocks authenticated requests
  // 4. CoCart returns non-standard error codes
  if (status === 403) return true;
  
  // For 401 errors, check for specific auth-related error codes/messages
  const code = data.code as string | undefined;
  const message = data.message as string | undefined;
  return Boolean(
    code?.includes("jwt_auth") ||
    code?.includes("rest_forbidden") ||
    code?.includes("cocart_rest") ||
    code?.includes("cocart_customer") ||
    message?.toLowerCase().includes("authentication") ||
    message?.toLowerCase().includes("token") ||
    message?.toLowerCase().includes("unauthorized") ||
    message?.toLowerCase().includes("permission")
  );
}

// Get Store API authentication tokens (cart-token and nonce) for coupon operations
async function getStoreApiAuth(): Promise<{ cartToken: string | null; nonce: string | null }> {
  try {
    const response = await fetch(noCacheUrl(`${API_BASE}/wp-json/wc/store/v1/cart`), {
      method: "GET",
      headers: backendHeaders(),
    });
    
    const cartToken = response.headers.get("cart-token");
    const nonce = response.headers.get("nonce");
    
    return { cartToken, nonce };
  } catch {
    return { cartToken: null, nonce: null };
  }
}

function createResponseWithCartKey(
  data: Record<string, unknown>,
  cartKey: string | null,
  newAuthToken: string | null = null,
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
  
  // Update auth token cookie if we refreshed it
  if (newAuthToken) {
    response.cookies.set(AUTH_TOKEN_COOKIE, newAuthToken, {
      httpOnly: false, // Needs to be accessible by client-side JS
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
    const currency = await getCurrency();
    const locale = await getLocale(request);
    
    // For authenticated users, don't use cart_key (use JWT identity)
    // Append currency and lang parameters for WPML multicurrency and multilingual support
    const authUrl = appendParamsToUrl(`${API_BASE}/wp-json/cocart/v2/cart`, currency, locale);
    const guestUrl = cartKey
      ? appendParamsToUrl(`${API_BASE}/wp-json/cocart/v2/cart?cart_key=${cartKey}`, currency, locale)
      : appendParamsToUrl(`${API_BASE}/wp-json/cocart/v2/cart`, currency, locale);

    // First attempt: try with auth if token exists
    const url = authToken ? authUrl : guestUrl;
    let response = await fetch(noCacheUrl(url), {
      method: "GET",
      headers: authToken ? getAuthHeaders(request, authToken) : getGuestHeaders(),
    });

    let data = await safeJsonResponse(response);
    let refreshedToken: string | null = null;

    if (!response.ok && authToken && isAuthError(response.status, data)) {
      refreshedToken = await tryRefreshToken();
      
      if (refreshedToken) {
        response = await fetch(noCacheUrl(authUrl), {
          method: "GET",
          headers: backendAuthHeaders(refreshedToken),
        });
        data = await safeJsonResponse(response);
      }
      
      if (!refreshedToken || !response.ok) {
        refreshedToken = null;
        response = await fetch(noCacheUrl(guestUrl), {
          method: "GET",
          headers: getGuestHeaders(),
        });
        data = await safeJsonResponse(response);
      }
    }

    if (!response.ok && !authToken && response.status === 403 && cartKey) {
      const freshGuestUrl = appendParamsToUrl(`${API_BASE}/wp-json/cocart/v2/cart`, currency, locale);
      response = await fetch(noCacheUrl(freshGuestUrl), {
        method: "GET",
        headers: getGuestHeaders(),
      });
      data = await safeJsonResponse(response);
    }

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: (data.code as string) || "cart_error",
            message: (data.message as string) || "Failed to get cart.",
          },
        },
        { status: response.status }
      );
    }

    const newCartKey = data.cart_key ? (data.cart_key as string) : null;
    return createResponseWithCartKey({ success: true, cart: data }, newCartKey, refreshedToken);
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
    const currency = await getCurrency();
    const locale = await getLocale(request);
    const body = await request.json().catch(() => ({}));
    let baseUrl: string;
    let method: string = "POST";

    switch (action) {
      case "add":
        baseUrl = appendParamsToUrl(`${API_BASE}/wp-json/cocart/v2/cart/add-item`, currency, locale);
        break;
      case "update": {
        const itemKey = searchParams.get("item_key");
        if (!itemKey) {
          return NextResponse.json(
            { success: false, error: { code: "missing_item_key", message: "Item key is required" } },
            { status: 400 }
          );
        }
        baseUrl = appendParamsToUrl(`${API_BASE}/wp-json/cocart/v2/cart/item/${itemKey}`, currency, locale);
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
        baseUrl = appendParamsToUrl(`${API_BASE}/wp-json/cocart/v2/cart/item/${removeKey}`, currency, locale);
        method = "DELETE";
        break;
      }
      case "clear":
        baseUrl = appendParamsToUrl(`${API_BASE}/wp-json/cocart/v2/cart/clear`, currency, locale);
        break;
      case "apply-coupon":
      case "remove-coupon": {
        // Use WooCommerce Store API for coupons (CoCart v2 doesn't have coupon endpoints on this backend)
        // Store API requires Cart-Token and X-WP-Nonce headers for authentication
        const { cartToken, nonce } = await getStoreApiAuth();
        
        if (!cartToken || !nonce) {
          return NextResponse.json(
            { success: false, error: { code: "store_api_auth_error", message: "Failed to get Store API authentication" } },
            { status: 500 }
          );
        }
        
        const storeApiUrl = action === "apply-coupon" 
          ? `${API_BASE}/wp-json/wc/store/v1/cart/apply-coupon`
          : `${API_BASE}/wp-json/wc/store/v1/cart/remove-coupon`;
        
        const storeApiResponse = await fetch(noCacheUrl(storeApiUrl), {
          method: "POST",
          headers: backendHeaders({
            "Cart-Token": cartToken,
            "X-WP-Nonce": nonce,
          }),
          body: JSON.stringify(body),
        });
        
        const storeApiData = await safeJsonResponse(storeApiResponse);
        
        if (!storeApiResponse.ok) {
          return NextResponse.json(
            {
              success: false,
              error: {
                code: String(storeApiData.code || "coupon_error"),
                message: String(storeApiData.message || "Coupon operation failed."),
              },
            },
            { status: storeApiResponse.status }
          );
        }
        
        const coCartUrl = cartKey
          ? appendParamsToUrl(`${API_BASE}/wp-json/cocart/v2/cart?cart_key=${cartKey}`, currency, locale)
          : appendParamsToUrl(`${API_BASE}/wp-json/cocart/v2/cart`, currency, locale);
        
        const coCartResponse = await fetch(noCacheUrl(coCartUrl), {
          method: "GET",
          headers: authToken ? getAuthHeaders(request, authToken) : getGuestHeaders(),
        });
        
        const coCartData = await safeJsonResponse(coCartResponse);
        
        if (!coCartResponse.ok) {
          return NextResponse.json({ 
            success: true, 
            cart: storeApiData,
            warning: "Cart data may not be in expected format"
          });
        }
        
        const newCartKey = coCartData.cart_key ? (coCartData.cart_key as string) : null;
        return createResponseWithCartKey({ success: true, cart: coCartData }, newCartKey);
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

    let response = await fetch(noCacheUrl(url), fetchOptions);
    let data = await safeJsonResponse(response);
    let refreshedToken: string | null = null;

    if (!response.ok && authToken && isAuthError(response.status, data)) {
      refreshedToken = await tryRefreshToken();
      
      if (refreshedToken) {
        const refreshedFetchOptions: RequestInit = {
          method,
          headers: backendAuthHeaders(refreshedToken),
        };
        if (method !== "DELETE" && Object.keys(body).length > 0) {
          refreshedFetchOptions.body = JSON.stringify(body);
        }
        response = await fetch(noCacheUrl(baseUrl), refreshedFetchOptions);
        data = await safeJsonResponse(response);
      }
      
      if (!refreshedToken || !response.ok) {
        refreshedToken = null;
        const guestFetchOptions: RequestInit = {
          method,
          headers: getGuestHeaders(),
        };
        if (method !== "DELETE" && Object.keys(body).length > 0) {
          guestFetchOptions.body = JSON.stringify(body);
        }
        response = await fetch(noCacheUrl(guestUrl), guestFetchOptions);
        data = await safeJsonResponse(response);
      }
    }

    if (!response.ok && !authToken && response.status === 403 && cartKey) {
      const freshGuestUrl = baseUrl;
      const freshGuestFetchOptions: RequestInit = {
        method,
        headers: getGuestHeaders(),
      };
      if (method !== "DELETE" && Object.keys(body).length > 0) {
        freshGuestFetchOptions.body = JSON.stringify(body);
      }
      response = await fetch(noCacheUrl(freshGuestUrl), freshGuestFetchOptions);
      data = await safeJsonResponse(response);
    }

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: String(data.code || "cart_error"),
            message: String(data.message || "Cart operation failed."),
          },
        },
        { status: response.status }
      );
    }

    const newCartKey = data.cart_key ? (data.cart_key as string) : null;
    return createResponseWithCartKey({ success: true, cart: data }, newCartKey, refreshedToken);
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
