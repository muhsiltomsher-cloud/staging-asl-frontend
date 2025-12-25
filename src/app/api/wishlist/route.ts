import { NextRequest, NextResponse } from "next/server";
import { siteConfig } from "@/config/site";
import { cookies } from "next/headers";

const API_BASE = siteConfig.apiUrl;
const WISHLIST_BASE = `${API_BASE}/wp-json/yith/wishlist/v1`;
const AUTH_TOKEN_COOKIE = "asl_auth_token";

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

export async function GET(request: NextRequest) {
  try {
    const authToken = await getAuthToken();
    
    if (!authToken) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "unauthorized",
            message: "You must be logged in to view your wishlist.",
          },
        },
        { status: 401 }
      );
    }

    const response = await fetch(`${WISHLIST_BASE}/lists`, {
      method: "GET",
      headers: getAuthHeaders(request, authToken),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: data.code || "wishlist_error",
            message: data.message || "Failed to get wishlist.",
          },
        },
        { status: response.status }
      );
    }

    // Find default wishlist or use first one
    // API can return either an array directly or { lists: [...] }
    let wishlist = null;
    let items: unknown[] = [];
    let wishlistsArray: Array<{ is_default?: boolean; items?: unknown[] }> = [];
    
    if (Array.isArray(data)) {
      // Direct array response
      wishlistsArray = data;
    } else if (data.lists && Array.isArray(data.lists)) {
      // Response wrapped in { lists: [...] }
      wishlistsArray = data.lists;
    } else if (data.id) {
      // Single wishlist object
      wishlist = data;
      items = data.items || [];
      return NextResponse.json({ success: true, wishlist, items });
    }
    
    if (wishlistsArray.length > 0) {
      wishlist = wishlistsArray.find((w) => w.is_default) || wishlistsArray[0];
      items = wishlist?.items || [];
    }

    return NextResponse.json({ success: true, wishlist, items });
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
    const authToken = await getAuthToken();
    
    if (!authToken) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "unauthorized",
            message: "You must be logged in to manage your wishlist.",
          },
        },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => ({}));

    switch (action) {
      case "add": {
        const response = await fetch(`${WISHLIST_BASE}/items`, {
          method: "POST",
          headers: getAuthHeaders(request, authToken),
          body: JSON.stringify(body),
        });
        const data = await response.json();

        if (!response.ok) {
          return NextResponse.json(
            {
              success: false,
              error: {
                code: data.code || "add_to_wishlist_error",
                message: data.message || "Failed to add item to wishlist.",
              },
            },
            { status: response.status }
          );
        }

        return NextResponse.json({
          success: true,
          wishlist: data.wishlist || data,
          items: data.items || data.wishlist?.items || [],
        });
      }

      case "remove": {
        // Use query params for DELETE request as it's more reliable
        const productId = body.product_id;
        const wishlistId = body.wishlist_id;
        
        const params = new URLSearchParams();
        if (productId) params.append("product_id", String(productId));
        if (wishlistId) params.append("wishlist_id", String(wishlistId));
        
        const url = `${WISHLIST_BASE}/items?${params.toString()}`;
        
        const response = await fetch(url, {
          method: "DELETE",
          headers: getAuthHeaders(request, authToken),
        });
        const data = await response.json();

        if (!response.ok) {
          return NextResponse.json(
            {
              success: false,
              error: {
                code: data.code || "remove_from_wishlist_error",
                message: data.message || "Failed to remove item from wishlist.",
              },
            },
            { status: response.status }
          );
        }

        return NextResponse.json({
          success: true,
          wishlist: data.wishlist || data,
          items: data.items || data.wishlist?.items || [],
        });
      }

      case "sync": {
        // Sync is implemented client-side by adding items one by one
        // since the backend doesn't have a dedicated sync endpoint
        const guestItems = body.items || [];
        const results: Array<{ product_id: number; success: boolean }> = [];
        
        for (const item of guestItems) {
          try {
            const response = await fetch(`${WISHLIST_BASE}/items`, {
              method: "POST",
              headers: getAuthHeaders(request, authToken),
              body: JSON.stringify({
                product_id: item.product_id,
                variation_id: item.variation_id,
              }),
            });
            const data = await response.json();
            results.push({
              product_id: item.product_id,
              success: response.ok || data.code === "product_already_in_wishlist",
            });
          } catch {
            results.push({ product_id: item.product_id, success: false });
          }
        }

        // Fetch the updated wishlist after sync
        const listResponse = await fetch(`${WISHLIST_BASE}/lists`, {
          method: "GET",
          headers: getAuthHeaders(request, authToken),
        });
        const listData = await listResponse.json();

        let wishlist = null;
        let items: unknown[] = [];
        let wishlistsArray: Array<{ is_default?: boolean; items?: unknown[] }> = [];

        if (Array.isArray(listData)) {
          wishlistsArray = listData;
        } else if (listData.lists && Array.isArray(listData.lists)) {
          wishlistsArray = listData.lists;
        }

        if (wishlistsArray.length > 0) {
          wishlist = wishlistsArray.find((w) => w.is_default) || wishlistsArray[0];
          items = wishlist?.items || [];
        }

        return NextResponse.json({
          success: true,
          wishlist,
          items,
          syncResults: results,
        });
      }

      default:
        return NextResponse.json(
          { success: false, error: { code: "invalid_action", message: "Invalid action" } },
          { status: 400 }
        );
    }
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
