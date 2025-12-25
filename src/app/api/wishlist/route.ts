import { NextRequest, NextResponse } from "next/server";
import { siteConfig } from "@/config/site";
import { cookies } from "next/headers";

const API_BASE = siteConfig.apiUrl;
// TI WooCommerce Wishlist REST API v3
const WISHLIST_BASE = `${API_BASE}/wp-json/wishlist/v3`;
const WP_AUTH_TOKEN_COOKIE = "asl_wp_auth_token";
const AUTH_TOKEN_COOKIE = "asl_auth_token";

async function getAuthToken(): Promise<{ wpToken: string | null; cocartToken: string | null }> {
  const cookieStore = await cookies();
  return {
    wpToken: cookieStore.get(WP_AUTH_TOKEN_COOKIE)?.value || null,
    cocartToken: cookieStore.get(AUTH_TOKEN_COOKIE)?.value || null,
  };
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
    const { wpToken, cocartToken } = await getAuthToken();
    
    // Prefer WordPress JWT token for TI Wishlist endpoints, fall back to CoCart token
    const authToken = wpToken || cocartToken;
    
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

    // TI WooCommerce Wishlist: Get user's wishlists
    const response = await fetch(`${WISHLIST_BASE}/wishlists`, {
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

    // TI Wishlist returns array of wishlists
    let wishlist = null;
    let items: unknown[] = [];
    let wishlistsArray: Array<{ share_key?: string; is_default?: boolean; products?: unknown[] }> = [];
    
    if (Array.isArray(data)) {
      wishlistsArray = data;
    } else if (data.wishlists && Array.isArray(data.wishlists)) {
      wishlistsArray = data.wishlists;
    } else if (data.share_key) {
      // Single wishlist object
      wishlist = data;
      items = data.products || [];
      return NextResponse.json({ success: true, wishlist, items });
    }
    
    if (wishlistsArray.length > 0) {
      // Find default wishlist or use first one
      wishlist = wishlistsArray.find((w) => w.is_default) || wishlistsArray[0];
      
      // If we have a wishlist, fetch its products
      if (wishlist && wishlist.share_key) {
        const productsResponse = await fetch(`${WISHLIST_BASE}/wishlists/${wishlist.share_key}/products`, {
          method: "GET",
          headers: getAuthHeaders(request, authToken),
        });
        if (productsResponse.ok) {
          const productsData = await productsResponse.json();
          items = Array.isArray(productsData) ? productsData : productsData.products || [];
        }
      } else {
        items = wishlist?.products || [];
      }
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
    const { wpToken, cocartToken } = await getAuthToken();
    
    // Prefer WordPress JWT token for TI Wishlist endpoints, fall back to CoCart token
    const authToken = wpToken || cocartToken;
    
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

    // Helper function to get or create default wishlist
    async function getOrCreateDefaultWishlist(): Promise<{ share_key: string } | null> {
      // First, try to get existing wishlists
      const listResponse = await fetch(`${WISHLIST_BASE}/wishlists`, {
        method: "GET",
        headers: getAuthHeaders(request, authToken),
      });
      
      if (listResponse.ok) {
        const listData = await listResponse.json();
        const wishlists = Array.isArray(listData) ? listData : listData.wishlists || [];
        if (wishlists.length > 0) {
          return wishlists.find((w: { is_default?: boolean }) => w.is_default) || wishlists[0];
        }
      }
      
      // No wishlist exists, create one
      const createResponse = await fetch(`${WISHLIST_BASE}/wishlists`, {
        method: "POST",
        headers: getAuthHeaders(request, authToken),
        body: JSON.stringify({
          title: "Default wishlist",
          is_default: true,
        }),
      });
      
      if (createResponse.ok) {
        return await createResponse.json();
      }
      
      return null;
    }

    switch (action) {
      case "add": {
        // TI Wishlist: First get or create a wishlist, then add product to it
        const wishlist = await getOrCreateDefaultWishlist();
        
        if (!wishlist || !wishlist.share_key) {
          return NextResponse.json(
            {
              success: false,
              error: {
                code: "wishlist_error",
                message: "Could not get or create wishlist.",
              },
            },
            { status: 500 }
          );
        }
        
        // Add product to wishlist
        const response = await fetch(`${WISHLIST_BASE}/wishlists/${wishlist.share_key}/products`, {
          method: "POST",
          headers: getAuthHeaders(request, authToken),
          body: JSON.stringify({
            product_id: body.product_id,
            variation_id: body.variation_id || 0,
            quantity: body.quantity || 1,
          }),
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
          wishlist: wishlist,
          items: data.products || data.items || [],
          added_to: wishlist.share_key,
        });
      }

      case "remove": {
        const productId = body.product_id;
        const shareKey = body.share_key || body.wishlist_id;
        
        if (!shareKey) {
          // Try to get the default wishlist's share_key
          const wishlist = await getOrCreateDefaultWishlist();
          if (!wishlist || !wishlist.share_key) {
            return NextResponse.json(
              {
                success: false,
                error: {
                  code: "wishlist_error",
                  message: "Could not find wishlist.",
                },
              },
              { status: 404 }
            );
          }
          
          // TI Wishlist: DELETE /wishlists/{share_key}/products/{product_id}
          const response = await fetch(`${WISHLIST_BASE}/wishlists/${wishlist.share_key}/products/${productId}`, {
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
            wishlist: wishlist,
            items: data.products || data.items || [],
          });
        }
        
        // TI Wishlist: DELETE /wishlists/{share_key}/products/{product_id}
        const response = await fetch(`${WISHLIST_BASE}/wishlists/${shareKey}/products/${productId}`, {
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
          items: data.products || data.items || [],
        });
      }

      case "sync": {
        // Sync guest items to user's wishlist
        const guestItems = body.items || [];
        const results: Array<{ product_id: number; success: boolean }> = [];
        
        // Get or create default wishlist
        const wishlist = await getOrCreateDefaultWishlist();
        
        if (!wishlist || !wishlist.share_key) {
          return NextResponse.json(
            {
              success: false,
              error: {
                code: "wishlist_error",
                message: "Could not get or create wishlist for sync.",
              },
            },
            { status: 500 }
          );
        }
        
        // Add each item to the wishlist
        for (const item of guestItems) {
          try {
            const response = await fetch(`${WISHLIST_BASE}/wishlists/${wishlist.share_key}/products`, {
              method: "POST",
              headers: getAuthHeaders(request, authToken),
              body: JSON.stringify({
                product_id: item.product_id,
                variation_id: item.variation_id || 0,
                quantity: item.quantity || 1,
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

        // Fetch the updated wishlist products
        const productsResponse = await fetch(`${WISHLIST_BASE}/wishlists/${wishlist.share_key}/products`, {
          method: "GET",
          headers: getAuthHeaders(request, authToken),
        });
        let items: unknown[] = [];
        if (productsResponse.ok) {
          const productsData = await productsResponse.json();
          items = Array.isArray(productsData) ? productsData : productsData.products || [];
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
