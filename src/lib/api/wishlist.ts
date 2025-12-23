import { siteConfig } from "@/config/site";
import { getAuthToken } from "./auth";

const API_BASE = siteConfig.apiUrl;
const WISHLIST_BASE = `${API_BASE}/wp-json/yith/wishlist/v1`;

export interface WishlistItem {
  id: number;
  product_id: number;
  variation_id?: number;
  quantity: number;
  user_id: number;
  dateadded: string;
  dateadded_formatted: string;
  product_name: string;
  product_price: string;
  product_price_html: string;
  product_image: string;
  product_url: string;
  stock_status: string;
  is_in_stock: boolean;
}

export interface WishlistResponse {
  id: number;
  user_id: number;
  name: string;
  token: string;
  privacy: string;
  is_default: boolean;
  items: WishlistItem[];
  items_count: number;
  date_added: string;
}

export interface WishlistError {
  code: string;
  message: string;
  data?: {
    status: number;
  };
}

export interface WishlistOperationResponse {
  success: boolean;
  wishlist?: WishlistResponse;
  items?: WishlistItem[];
  error?: WishlistError;
}

function getHeaders(): HeadersInit {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  const token = getAuthToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return headers;
}

export async function getWishlist(): Promise<WishlistOperationResponse> {
  try {
    // Use /lists endpoint to get all wishlists for the user
    const response = await fetch(`${WISHLIST_BASE}/lists`, {
      method: "GET",
      headers: getHeaders(),
      credentials: "include",
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: {
          code: data.code || "wishlist_error",
          message: data.message || "Failed to get wishlist.",
          data: { status: response.status },
        },
      };
    }

    if (Array.isArray(data)) {
      const defaultWishlist = data.find((w: WishlistResponse) => w.is_default) || data[0];
      return {
        success: true,
        wishlist: defaultWishlist,
        items: defaultWishlist?.items || [],
      };
    }

    return {
      success: true,
      wishlist: data,
      items: data?.items || [],
    };
  } catch (error) {
    return {
      success: false,
      error: {
        code: "network_error",
        message: error instanceof Error ? error.message : "Network error occurred",
      },
    };
  }
}

export async function addToWishlist(
  productId: number,
  variationId?: number
): Promise<WishlistOperationResponse> {
  try {
    const body: Record<string, unknown> = {
      product_id: productId,
    };

    if (variationId) {
      body.variation_id = variationId;
    }

    // Use /items endpoint with POST to add item to wishlist
    const response = await fetch(`${WISHLIST_BASE}/items`, {
      method: "POST",
      headers: getHeaders(),
      credentials: "include",
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: {
          code: data.code || "add_to_wishlist_error",
          message: data.message || "Failed to add item to wishlist.",
          data: { status: response.status },
        },
      };
    }

    return {
      success: true,
      wishlist: data.wishlist || data,
      items: data.items || data.wishlist?.items || [],
    };
  } catch (error) {
    return {
      success: false,
      error: {
        code: "network_error",
        message: error instanceof Error ? error.message : "Network error occurred",
      },
    };
  }
}

export async function removeFromWishlist(
  productId: number
): Promise<WishlistOperationResponse> {
  try {
    // Use /items endpoint with DELETE to remove item from wishlist
    const response = await fetch(`${WISHLIST_BASE}/items`, {
      method: "DELETE",
      headers: getHeaders(),
      credentials: "include",
      body: JSON.stringify({ product_id: productId }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: {
          code: data.code || "remove_from_wishlist_error",
          message: data.message || "Failed to remove item from wishlist.",
          data: { status: response.status },
        },
      };
    }

    return {
      success: true,
      wishlist: data.wishlist || data,
      items: data.items || data.wishlist?.items || [],
    };
  } catch (error) {
    return {
      success: false,
      error: {
        code: "network_error",
        message: error instanceof Error ? error.message : "Network error occurred",
      },
    };
  }
}

export async function syncWishlist(
  guestItems: Array<{ product_id: number; variation_id?: number }>
): Promise<WishlistOperationResponse> {
  try {
    const response = await fetch(`${WISHLIST_BASE}/wishlist/sync`, {
      method: "POST",
      headers: getHeaders(),
      credentials: "include",
      body: JSON.stringify({ items: guestItems }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: {
          code: data.code || "sync_wishlist_error",
          message: data.message || "Failed to sync wishlist.",
          data: { status: response.status },
        },
      };
    }

    return {
      success: true,
      wishlist: data.wishlist || data,
      items: data.items || data.wishlist?.items || [],
    };
  } catch (error) {
    return {
      success: false,
      error: {
        code: "network_error",
        message: error instanceof Error ? error.message : "Network error occurred",
      },
    };
  }
}

export function isProductInWishlist(
  items: WishlistItem[],
  productId: number
): boolean {
  return items.some((item) => item.product_id === productId);
}
