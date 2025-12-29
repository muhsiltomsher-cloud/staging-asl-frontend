"use client";

import useSWR, { mutate } from "swr";
import type { WishlistResponse, WishlistItem, WishlistOperationResponse } from "@/lib/api/wishlist";
import { getAuthToken } from "@/lib/api/auth";

const WISHLIST_CACHE_KEY = "/api/wishlist";

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

interface WishlistData {
  wishlist: WishlistResponse | null;
  items: WishlistItem[];
}

async function wishlistFetcher(): Promise<WishlistData> {
  const response = await fetch(WISHLIST_CACHE_KEY, {
    method: "GET",
    headers: getHeaders(),
  });

  const data = await response.json();

  if (!data.success) {
    // Return empty data for unauthorized users instead of throwing
    if (data.error?.code === "unauthorized") {
      return { wishlist: null, items: [] };
    }
    throw new Error(data.error?.message || "Failed to fetch wishlist");
  }

  return {
    wishlist: data.wishlist || null,
    items: data.items || [],
  };
}

export function useWishlistSWR(isAuthenticated: boolean = false) {
  const { data, error, isLoading, isValidating } = useSWR<WishlistData>(
    isAuthenticated ? WISHLIST_CACHE_KEY : null, // Only fetch if authenticated
    wishlistFetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 10000,
      errorRetryCount: 2,
      keepPreviousData: true,
    }
  );

  const wishlist = data?.wishlist || null;
  const wishlistItems = data?.items || [];
  const wishlistItemsCount = wishlist?.items_count || wishlistItems.length || 0;

  const isInWishlist = (productId: number): boolean => {
    return wishlistItems.some((item) => item.product_id === productId);
  };

  const getWishlistItemId = (productId: number): number | undefined => {
    const item = wishlistItems.find((i) => i.product_id === productId);
    return item?.id;
  };

  const addToWishlist = async (
    productId: number,
    variationId?: number
  ): Promise<WishlistOperationResponse> => {
    const body: Record<string, unknown> = {
      product_id: productId,
    };

    if (variationId) {
      body.variation_id = variationId;
    }

    // Optimistic update - add a placeholder item
    const optimisticItem: WishlistItem = {
      id: Date.now(),
      product_id: productId,
      variation_id: variationId,
      product_name: "Loading...",
      is_in_stock: true,
    };

    await mutate(
      WISHLIST_CACHE_KEY,
      (currentData: WishlistData | undefined) => {
        if (!currentData) return currentData;
        return {
          ...currentData,
          items: [...currentData.items, optimisticItem],
          wishlist: currentData.wishlist
            ? {
                ...currentData.wishlist,
                items: [...(currentData.wishlist.items || []), optimisticItem],
                items_count: (currentData.wishlist.items_count || 0) + 1,
              }
            : null,
        };
      },
      false
    );

    try {
      const response = await fetch("/api/wishlist?action=add", {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(body),
      });

      const responseData = await response.json();

      if (!responseData.success) {
        // Rollback on error
        await mutate(WISHLIST_CACHE_KEY);
        return {
          success: false,
          error: {
            code: responseData.error?.code || "add_to_wishlist_error",
            message: responseData.error?.message || "Failed to add item to wishlist.",
            data: { status: response.status },
          },
        };
      }

      // Update cache with actual data
      await mutate(
        WISHLIST_CACHE_KEY,
        {
          wishlist: responseData.wishlist,
          items: responseData.items || [],
        },
        false
      );

      return {
        success: true,
        wishlist: responseData.wishlist,
        items: responseData.items,
      };
    } catch (error) {
      await mutate(WISHLIST_CACHE_KEY);
      return {
        success: false,
        error: {
          code: "network_error",
          message: error instanceof Error ? error.message : "Network error occurred",
        },
      };
    }
  };

  const removeFromWishlist = async (
    productId: number,
    itemId?: number
  ): Promise<WishlistOperationResponse> => {
    // Optimistically remove the item
    await mutate(
      WISHLIST_CACHE_KEY,
      (currentData: WishlistData | undefined) => {
        if (!currentData) return currentData;
        const filteredItems = currentData.items.filter(
          (item) => item.product_id !== productId
        );
        return {
          ...currentData,
          items: filteredItems,
          wishlist: currentData.wishlist
            ? {
                ...currentData.wishlist,
                items: filteredItems,
                items_count: filteredItems.length,
              }
            : null,
        };
      },
      false
    );

    try {
      const body: Record<string, unknown> = { product_id: productId };
      if (itemId) {
        body.item_id = itemId;
      }

      const response = await fetch("/api/wishlist?action=remove", {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(body),
      });

      const responseData = await response.json();

      if (!responseData.success) {
        await mutate(WISHLIST_CACHE_KEY);
        return {
          success: false,
          error: {
            code: responseData.error?.code || "remove_from_wishlist_error",
            message: responseData.error?.message || "Failed to remove item from wishlist.",
            data: { status: response.status },
          },
        };
      }

      await mutate(
        WISHLIST_CACHE_KEY,
        {
          wishlist: responseData.wishlist,
          items: responseData.items || [],
        },
        false
      );

      return {
        success: true,
        wishlist: responseData.wishlist,
        items: responseData.items,
      };
    } catch (error) {
      await mutate(WISHLIST_CACHE_KEY);
      return {
        success: false,
        error: {
          code: "network_error",
          message: error instanceof Error ? error.message : "Network error occurred",
        },
      };
    }
  };

  const syncWishlist = async (
    guestItems: Array<{ product_id: number; variation_id?: number }>
  ): Promise<WishlistOperationResponse> => {
    try {
      const response = await fetch("/api/wishlist?action=sync", {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ items: guestItems }),
      });

      const responseData = await response.json();

      if (!responseData.success) {
        return {
          success: false,
          error: {
            code: responseData.error?.code || "sync_wishlist_error",
            message: responseData.error?.message || "Failed to sync wishlist.",
            data: { status: response.status },
          },
        };
      }

      await mutate(
        WISHLIST_CACHE_KEY,
        {
          wishlist: responseData.wishlist,
          items: responseData.items || [],
        },
        false
      );

      return {
        success: true,
        wishlist: responseData.wishlist,
        items: responseData.items,
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
  };

  const refreshWishlist = async () => {
    await mutate(WISHLIST_CACHE_KEY);
  };

  return {
    wishlist,
    wishlistItems,
    wishlistItemsCount,
    isLoading,
    isValidating,
    error,
    isInWishlist,
    getWishlistItemId,
    addToWishlist,
    removeFromWishlist,
    syncWishlist,
    refreshWishlist,
  };
}

// Export mutate function for external cache invalidation
export const invalidateWishlistCache = () => mutate(WISHLIST_CACHE_KEY);
