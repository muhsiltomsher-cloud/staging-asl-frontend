import { NextRequest, NextResponse } from "next/server";
import { siteConfig } from "@/config/site";
import { cookies } from "next/headers";

const API_BASE = siteConfig.apiUrl;
// TI WooCommerce Wishlist REST API - uses WooCommerce REST API namespace
const WISHLIST_BASE = `${API_BASE}/wp-json/wc/v3/wishlist`;
const USER_COOKIE = "asl_auth_user";

// WooCommerce REST API authentication (required for /wc/v3/ endpoints)
function getWooCommerceCredentials() {
  const consumerKey = process.env.WC_CONSUMER_KEY || process.env.NEXT_PUBLIC_WC_CONSUMER_KEY || "";
  const consumerSecret = process.env.WC_CONSUMER_SECRET || process.env.NEXT_PUBLIC_WC_CONSUMER_SECRET || "";
  return { consumerKey, consumerSecret };
}

function getBasicAuthParams(): string {
  const { consumerKey, consumerSecret } = getWooCommerceCredentials();
  return `consumer_key=${consumerKey}&consumer_secret=${consumerSecret}`;
}

async function getUserId(): Promise<number | null> {
  const cookieStore = await cookies();
  const userCookie = cookieStore.get(USER_COOKIE)?.value;
  
  if (userCookie) {
    try {
      const userData = JSON.parse(decodeURIComponent(userCookie));
      return userData.user_id || null;
    } catch {
      // Ignore parse errors
    }
  }
  
  return null;
}

export async function GET() {
  try {
    const userId = await getUserId();
    
    if (!userId) {
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

    // TI WooCommerce Wishlist: Get user's wishlist by user ID
    // Uses WooCommerce REST API authentication (consumer key/secret)
    const response = await fetch(`${WISHLIST_BASE}/get_by_user/${userId}?${getBasicAuthParams()}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { message: errorText };
      }
      
      // If no wishlist found, return empty
      if (response.status === 404) {
        return NextResponse.json({ success: true, wishlist: null, items: [] });
      }
      
      return NextResponse.json(
        {
          success: false,
          error: {
            code: errorData.code || "wishlist_error",
            message: errorData.message || "Failed to get wishlist.",
          },
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // TI Wishlist returns wishlist data with share_key
    let wishlist = null;
    let items: unknown[] = [];
    
    if (data && data.share_key) {
      wishlist = data;
      
      // Fetch products for this wishlist
      const productsResponse = await fetch(`${WISHLIST_BASE}/${data.share_key}/get_products?${getBasicAuthParams()}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      if (productsResponse.ok) {
        const productsData = await productsResponse.json();
        items = Array.isArray(productsData) ? productsData : productsData.products || productsData.items || [];
      }
    } else if (Array.isArray(data) && data.length > 0) {
      // If array of wishlists, use first one
      wishlist = data[0];
      if (wishlist && wishlist.share_key) {
        const productsResponse = await fetch(`${WISHLIST_BASE}/${wishlist.share_key}/get_products?${getBasicAuthParams()}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        
        if (productsResponse.ok) {
          const productsData = await productsResponse.json();
          items = Array.isArray(productsData) ? productsData : productsData.products || productsData.items || [];
        }
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
    const userId = await getUserId();
    
    if (!userId) {
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

    // Helper function to get user's wishlist share_key
    async function getUserWishlistShareKey(): Promise<string | null> {
      const response = await fetch(`${WISHLIST_BASE}/get_by_user/${userId}?${getBasicAuthParams()}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data && data.share_key) {
          return data.share_key;
        }
        if (Array.isArray(data) && data.length > 0 && data[0].share_key) {
          return data[0].share_key;
        }
      }
      
      return null;
    }

    switch (action) {
      case "add": {
        // Get user's wishlist share_key
        const shareKey = await getUserWishlistShareKey();
        
        if (!shareKey) {
          return NextResponse.json(
            {
              success: false,
              error: {
                code: "no_wishlist",
                message: "No wishlist found. Please try again.",
              },
            },
            { status: 404 }
          );
        }
        
        // TI Wishlist: POST /{share_key}/add_product
        const response = await fetch(`${WISHLIST_BASE}/${shareKey}/add_product?${getBasicAuthParams()}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            product_id: body.product_id,
            variation_id: body.variation_id || 0,
            quantity: body.quantity || 1,
          }),
        });
        
        const responseText = await response.text();
        let data;
        try {
          data = JSON.parse(responseText);
        } catch {
          data = { message: responseText };
        }

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

        // Fetch updated products
        const productsResponse = await fetch(`${WISHLIST_BASE}/${shareKey}/get_products?${getBasicAuthParams()}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        let items: unknown[] = [];
        if (productsResponse.ok) {
          const productsData = await productsResponse.json();
          items = Array.isArray(productsData) ? productsData : productsData.products || productsData.items || [];
        }

        return NextResponse.json({
          success: true,
          wishlist: { share_key: shareKey },
          items,
          added_to: shareKey,
        });
      }

      case "remove": {
        const productId = body.product_id;
        const itemId = body.item_id || productId; // TI uses item_id for removal
        let shareKey = body.share_key || body.wishlist_id;
        
        if (!shareKey) {
          shareKey = await getUserWishlistShareKey();
        }
        
        if (!shareKey) {
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
        
        // TI Wishlist: DELETE /{share_key}/remove_product/{item_id}
        const response = await fetch(`${WISHLIST_BASE}/${shareKey}/remove_product/${itemId}?${getBasicAuthParams()}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        });
        
        const responseText = await response.text();
        let data;
        try {
          data = JSON.parse(responseText);
        } catch {
          data = { message: responseText };
        }

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

        // Fetch updated products
        const productsResponse = await fetch(`${WISHLIST_BASE}/${shareKey}/get_products?${getBasicAuthParams()}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        let items: unknown[] = [];
        if (productsResponse.ok) {
          const productsData = await productsResponse.json();
          items = Array.isArray(productsData) ? productsData : productsData.products || productsData.items || [];
        }

        return NextResponse.json({
          success: true,
          wishlist: { share_key: shareKey },
          items,
        });
      }

      case "sync": {
        // Sync guest items to user's wishlist
        const guestItems = body.items || [];
        const results: Array<{ product_id: number; success: boolean }> = [];
        
        // Get user's wishlist share_key
        const shareKey = await getUserWishlistShareKey();
        
        if (!shareKey) {
          return NextResponse.json(
            {
              success: false,
              error: {
                code: "wishlist_error",
                message: "Could not get wishlist for sync.",
              },
            },
            { status: 500 }
          );
        }
        
        // Add each item to the wishlist
        for (const item of guestItems) {
          try {
            const response = await fetch(`${WISHLIST_BASE}/${shareKey}/add_product?${getBasicAuthParams()}`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                product_id: item.product_id,
                variation_id: item.variation_id || 0,
                quantity: item.quantity || 1,
              }),
            });
            const responseOk = response.ok;
            let data;
            try {
              data = await response.json();
            } catch {
              data = {};
            }
            results.push({
              product_id: item.product_id,
              success: responseOk || data.code === "product_already_in_wishlist",
            });
          } catch {
            results.push({ product_id: item.product_id, success: false });
          }
        }

        // Fetch the updated wishlist products
        const productsResponse = await fetch(`${WISHLIST_BASE}/${shareKey}/get_products?${getBasicAuthParams()}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        let items: unknown[] = [];
        if (productsResponse.ok) {
          const productsData = await productsResponse.json();
          items = Array.isArray(productsData) ? productsData : productsData.products || productsData.items || [];
        }

        return NextResponse.json({
          success: true,
          wishlist: { share_key: shareKey },
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
