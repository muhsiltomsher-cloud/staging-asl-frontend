import { NextRequest, NextResponse } from "next/server";
import { siteConfig } from "@/config/site";
import { cookies } from "next/headers";

const API_BASE = siteConfig.apiUrl;
// TI WooCommerce Wishlist REST API - uses WooCommerce REST API namespace
const WISHLIST_BASE = `${API_BASE}/wp-json/wc/v3/wishlist`;
const PRODUCTS_BASE = `${API_BASE}/wp-json/wc/v3/products`;
const USER_COOKIE = "asl_auth_user";

// In-memory cache for product details with TTL (5 minutes)
const PRODUCT_CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds
interface CachedProduct {
  data: WCProduct;
  timestamp: number;
}
const productCache = new Map<number, CachedProduct>();

// In-memory cache for user's wishlist share_key (1 minute TTL)
const SHARE_KEY_CACHE_TTL = 60 * 1000; // 1 minute
interface CachedShareKey {
  shareKey: string;
  timestamp: number;
}
const shareKeyCache = new Map<number, CachedShareKey>();

function getCachedProduct(productId: number): WCProduct | null {
  const cached = productCache.get(productId);
  if (cached && Date.now() - cached.timestamp < PRODUCT_CACHE_TTL) {
    return cached.data;
  }
  // Remove expired cache entry
  if (cached) {
    productCache.delete(productId);
  }
  return null;
}

function setCachedProduct(productId: number, product: WCProduct): void {
  productCache.set(productId, { data: product, timestamp: Date.now() });
}

function getCachedShareKey(userId: number): string | null {
  const cached = shareKeyCache.get(userId);
  if (cached && Date.now() - cached.timestamp < SHARE_KEY_CACHE_TTL) {
    return cached.shareKey;
  }
  // Remove expired cache entry
  if (cached) {
    shareKeyCache.delete(userId);
  }
  return null;
}

function setCachedShareKey(userId: number, shareKey: string): void {
  shareKeyCache.set(userId, { shareKey, timestamp: Date.now() });
}

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

// Interface for WooCommerce product data
interface WCProduct {
  id: number;
  name: string;
  slug: string;
  price: string;
  regular_price: string;
  sale_price: string;
  stock_status: string;
  images: Array<{ src: string; alt: string }>;
}

// Fetch product details from WooCommerce for multiple product IDs (with caching)
async function fetchProductDetails(productIds: number[]): Promise<Map<number, WCProduct>> {
  const productMap = new Map<number, WCProduct>();
  
  if (productIds.length === 0) return productMap;
  
  // Check cache first and collect uncached IDs
  const uncachedIds: number[] = [];
  for (const id of productIds) {
    const cached = getCachedProduct(id);
    if (cached) {
      productMap.set(id, cached);
    } else {
      uncachedIds.push(id);
    }
  }
  
  // If all products are cached, return early
  if (uncachedIds.length === 0) {
    return productMap;
  }
  
  try {
    // Batch fetch only uncached products
    const idsParam = uncachedIds.join(",");
    const response = await fetch(
      `${PRODUCTS_BASE}?include=${idsParam}&per_page=${uncachedIds.length}&${getBasicAuthParams()}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }
    );
    
    if (response.ok) {
      const products: WCProduct[] = await response.json();
      for (const product of products) {
        productMap.set(product.id, product);
        // Cache the product for future requests
        setCachedProduct(product.id, product);
      }
    }
  } catch (error) {
    console.error("[Wishlist API] Error fetching product details:", error);
  }
  
  return productMap;
}

// Enrich wishlist items with product details
interface RawWishlistItem {
  id?: number;
  item_id?: number;
  product_id: number;
  variation_id?: number;
  quantity?: number;
  date_added?: string;
  // TI Wishlist may include some product fields
  product_name?: string;
  name?: string;
  product_price?: string;
  price?: string;
  product_image?: string;
  image?: string;
  thumbnail?: string;
}

function enrichWishlistItems(
  rawItems: RawWishlistItem[],
  productMap: Map<number, WCProduct>
): Array<{
  id: number;
  product_id: number;
  variation_id?: number;
  quantity?: number;
  dateadded?: string;
  product_name: string;
  product_price?: string;
  product_image?: string;
  product_url?: string;
  stock_status?: string;
  is_in_stock?: boolean;
}> {
  return rawItems.map((item) => {
    const product = productMap.get(item.product_id);
    const itemId = item.id || item.item_id || item.product_id;
    
    // Use product data from WooCommerce, fallback to TI Wishlist data if available
    const productName = product?.name || item.product_name || item.name || `Product #${item.product_id}`;
    const productPrice = product?.price || item.product_price || item.price;
    const productImage = product?.images?.[0]?.src || item.product_image || item.image || item.thumbnail;
    const productSlug = product?.slug;
    const stockStatus = product?.stock_status || "instock";
    
    return {
      id: itemId,
      product_id: item.product_id,
      variation_id: item.variation_id,
      quantity: item.quantity,
      dateadded: item.date_added,
      product_name: productName,
      product_price: productPrice,
      product_image: productImage,
      product_url: productSlug ? `/en/product/${productSlug}` : undefined,
      stock_status: stockStatus,
      is_in_stock: stockStatus === "instock",
    };
  });
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
    let wishlistMeta = null;
    let rawItems: RawWishlistItem[] = [];
    
    if (data && data.share_key) {
      wishlistMeta = data;
      
      // Fetch products for this wishlist
      const productsResponse = await fetch(`${WISHLIST_BASE}/${data.share_key}/get_products?${getBasicAuthParams()}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      if (productsResponse.ok) {
        const productsData = await productsResponse.json();
        rawItems = Array.isArray(productsData) ? productsData : productsData.products || productsData.items || [];
      }
    } else if (Array.isArray(data) && data.length > 0) {
      // If array of wishlists, use first one
      wishlistMeta = data[0];
      if (wishlistMeta && wishlistMeta.share_key) {
        const productsResponse = await fetch(`${WISHLIST_BASE}/${wishlistMeta.share_key}/get_products?${getBasicAuthParams()}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        
        if (productsResponse.ok) {
          const productsData = await productsResponse.json();
          rawItems = Array.isArray(productsData) ? productsData : productsData.products || productsData.items || [];
        }
      }
    }

    // Enrich items with product details from WooCommerce
    let enrichedItems: ReturnType<typeof enrichWishlistItems> = [];
    if (rawItems.length > 0) {
      const productIds = rawItems.map((item) => item.product_id).filter(Boolean);
      const productMap = await fetchProductDetails(productIds);
      enrichedItems = enrichWishlistItems(rawItems, productMap);
    }

    // Return wishlist object with enriched items
    const wishlist = wishlistMeta ? {
      ...wishlistMeta,
      items: enrichedItems,
      items_count: enrichedItems.length,
    } : null;

    return NextResponse.json({ success: true, wishlist, items: enrichedItems });
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

    // Helper function to get user's wishlist share_key (with caching)
    // Takes userId as parameter to ensure proper TypeScript type narrowing
    async function getUserWishlistShareKey(uid: number): Promise<string | null> {
      // Check cache first
      const cachedKey = getCachedShareKey(uid);
      if (cachedKey) {
        return cachedKey;
      }
      
      const response = await fetch(`${WISHLIST_BASE}/get_by_user/${uid}?${getBasicAuthParams()}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        let shareKey: string | null = null;
        if (data && data.share_key) {
          shareKey = data.share_key;
        } else if (Array.isArray(data) && data.length > 0 && data[0].share_key) {
          shareKey = data[0].share_key;
        }
        
        // Cache the share_key for future requests
        if (shareKey) {
          setCachedShareKey(uid, shareKey);
        }
        return shareKey;
      }
      
      return null;
    }

    switch (action) {
      case "add": {
        // Get user's wishlist share_key
        const shareKey = await getUserWishlistShareKey(userId);
        
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

        // Fetch updated products and enrich with product details
        const productsResponse = await fetch(`${WISHLIST_BASE}/${shareKey}/get_products?${getBasicAuthParams()}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        let rawItems: RawWishlistItem[] = [];
        if (productsResponse.ok) {
          const productsData = await productsResponse.json();
          rawItems = Array.isArray(productsData) ? productsData : productsData.products || productsData.items || [];
        }
        
        // Enrich items with product details
        let enrichedItems: ReturnType<typeof enrichWishlistItems> = [];
        if (rawItems.length > 0) {
          const productIds = rawItems.map((item) => item.product_id).filter(Boolean);
          const productMap = await fetchProductDetails(productIds);
          enrichedItems = enrichWishlistItems(rawItems, productMap);
        }

        // Return wishlist object with enriched items
        return NextResponse.json({
          success: true,
          wishlist: { share_key: shareKey, items: enrichedItems, items_count: enrichedItems.length },
          items: enrichedItems,
          added_to: shareKey,
        });
      }

      case "remove": {
        const productId = body.product_id;
        const itemId = body.item_id || productId; // TI uses item_id for removal
        let shareKey = body.share_key || body.wishlist_id;
        
        if (!shareKey) {
          shareKey = await getUserWishlistShareKey(userId);
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

        // Fetch updated products and enrich with product details
        const productsResponse = await fetch(`${WISHLIST_BASE}/${shareKey}/get_products?${getBasicAuthParams()}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        let rawItems: RawWishlistItem[] = [];
        if (productsResponse.ok) {
          const productsData = await productsResponse.json();
          rawItems = Array.isArray(productsData) ? productsData : productsData.products || productsData.items || [];
        }
        
        // Enrich items with product details
        let enrichedItems: ReturnType<typeof enrichWishlistItems> = [];
        if (rawItems.length > 0) {
          const productIds = rawItems.map((item) => item.product_id).filter(Boolean);
          const productMap = await fetchProductDetails(productIds);
          enrichedItems = enrichWishlistItems(rawItems, productMap);
        }

        // Return wishlist object with enriched items
        return NextResponse.json({
          success: true,
          wishlist: { share_key: shareKey, items: enrichedItems, items_count: enrichedItems.length },
          items: enrichedItems,
        });
      }

      case "sync": {
        // Sync guest items to user's wishlist
        const guestItems = body.items || [];
        const results: Array<{ product_id: number; success: boolean }> = [];
        
        // Get user's wishlist share_key
        const shareKey = await getUserWishlistShareKey(userId);
        
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

        // Fetch the updated wishlist products and enrich with product details
        const productsResponse = await fetch(`${WISHLIST_BASE}/${shareKey}/get_products?${getBasicAuthParams()}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        let rawItems: RawWishlistItem[] = [];
        if (productsResponse.ok) {
          const productsData = await productsResponse.json();
          rawItems = Array.isArray(productsData) ? productsData : productsData.products || productsData.items || [];
        }
        
        // Enrich items with product details
        let enrichedItems: ReturnType<typeof enrichWishlistItems> = [];
        if (rawItems.length > 0) {
          const productIds = rawItems.map((item) => item.product_id).filter(Boolean);
          const productMap = await fetchProductDetails(productIds);
          enrichedItems = enrichWishlistItems(rawItems, productMap);
        }

        // Return wishlist object with enriched items
        return NextResponse.json({
          success: true,
          wishlist: { share_key: shareKey, items: enrichedItems, items_count: enrichedItems.length },
          items: enrichedItems,
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
