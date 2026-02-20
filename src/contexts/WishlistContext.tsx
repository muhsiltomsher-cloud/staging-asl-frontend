"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import NProgress from "nprogress";
import {
  getWishlist as apiGetWishlist,
  addToWishlist as apiAddToWishlist,
  removeFromWishlist as apiRemoveFromWishlist,
  syncWishlist as apiSyncWishlist,
  isProductInWishlist as checkIsInWishlist,
  type WishlistResponse,
  type WishlistItem,
} from "@/lib/api/wishlist";
import { useAuth } from "@/contexts/AuthContext";
import { useNotification } from "@/contexts/NotificationContext";

const WISHLIST_COUNT_CACHE_KEY = "asl_wishlist_count";
const GUEST_WISHLIST_KEY = "asl_guest_wishlist";

interface GuestWishlistItem {
  product_id: number;
  variation_id?: number;
  added_at: string;
}

interface WishlistContextType {
  wishlist: WishlistResponse | null;
  wishlistItems: WishlistItem[];
  isLoading: boolean;
  isWishlistOpen: boolean;
  setIsWishlistOpen: (open: boolean) => void;
  addToWishlist: (productId: number, variationId?: number) => Promise<boolean>;
  removeFromWishlist: (productId: number, itemId?: number) => Promise<boolean>;
  syncWishlist: (guestItems: Array<{ product_id: number; variation_id?: number }>) => Promise<void>;
  refreshWishlist: () => Promise<void>;
  isInWishlist: (productId: number) => boolean;
  getWishlistItemId: (productId: number) => number | undefined;
  wishlistItemsCount: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

// Helper functions for localStorage caching (outside component to avoid SSR issues)
function getCachedWishlistCount(): number {
  if (typeof window === "undefined") return 0;
  try {
    const cached = localStorage.getItem(WISHLIST_COUNT_CACHE_KEY);
    return cached ? parseInt(cached, 10) : 0;
  } catch {
    return 0;
  }
}

function setCachedWishlistCount(count: number): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(WISHLIST_COUNT_CACHE_KEY, count.toString());
  } catch {
    // Ignore localStorage errors
  }
}

function clearCachedWishlistCount(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(WISHLIST_COUNT_CACHE_KEY);
  } catch {
    // Ignore localStorage errors
  }
}

function getGuestWishlist(): GuestWishlistItem[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(GUEST_WISHLIST_KEY);
    return stored ? JSON.parse(stored) as GuestWishlistItem[] : [];
  } catch {
    return [];
  }
}

function setGuestWishlist(items: GuestWishlistItem[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(GUEST_WISHLIST_KEY, JSON.stringify(items));
  } catch {
    // Ignore localStorage errors
  }
}

function clearGuestWishlist(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(GUEST_WISHLIST_KEY);
  } catch {
    // Ignore localStorage errors
  }
}

function guestItemsToWishlistItems(items: GuestWishlistItem[]): WishlistItem[] {
  return items.map((item, index) => ({
    id: -(index + 1),
    product_id: item.product_id,
    variation_id: item.variation_id,
    product_name: "",
    dateadded: item.added_at,
  }));
}

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [wishlist, setWishlist] = useState<WishlistResponse | null>(null);
  const [guestItems, setGuestItems] = useState<GuestWishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [cachedCount, setCachedCount] = useState<number>(0);
  const { isAuthenticated, isLoading: isAuthLoading, user } = useAuth();
  const { notify } = useNotification();

  useEffect(() => {
    if (isAuthenticated && user) {
      setCachedCount(getCachedWishlistCount());
    } else {
      setCachedCount(0);
      clearCachedWishlistCount();
      const stored = getGuestWishlist();
      setGuestItems(stored);
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (isAuthenticated && user) {
      const stored = getGuestWishlist();
      if (stored.length > 0) {
        apiSyncWishlist(stored.map((i) => ({ product_id: i.product_id, variation_id: i.variation_id }))).then((response) => {
          if (response.success) {
            clearGuestWishlist();
            setGuestItems([]);
          }
        });
      }
    }
  }, [isAuthenticated, user]);

  const refreshWishlist = useCallback(async () => {
    if (!isAuthenticated) {
      setWishlist(null);
      clearCachedWishlistCount();
      setCachedCount(0);
      const stored = getGuestWishlist();
      setGuestItems(stored);
      return;
    }
    setIsLoading(true);
    try {
      const response = await apiGetWishlist();
      if (response.success) {
        if (response.wishlist) {
          setWishlist(response.wishlist);
          const newCount = response.wishlist.items_count || response.wishlist.items?.length || 0;
          setCachedWishlistCount(newCount);
          setCachedCount(newCount);
        } else {
          setWishlist(null);
          clearCachedWishlistCount();
          setCachedCount(0);
        }
      }
    } catch (error) {
      console.error("Error fetching wishlist:", error);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthLoading) {
      refreshWishlist();
    }
  }, [refreshWishlist, isAuthLoading]);

  const addToWishlist = useCallback(
    async (productId: number, variationId?: number): Promise<boolean> => {
      if (!isAuthenticated) {
        const current = getGuestWishlist();
        if (current.some((i) => i.product_id === productId)) {
          notify("info", "Already in your wishlist");
          return true;
        }
        const updated = [...current, { product_id: productId, variation_id: variationId, added_at: new Date().toISOString() }];
        setGuestWishlist(updated);
        setGuestItems(updated);
        notify("success", "Added to wishlist");
        return true;
      }
      setIsLoading(true);
      NProgress.start();
      try {
        const response = await apiAddToWishlist(productId, variationId);
        if (response.success) {
          if (response.wishlist) {
            setWishlist(response.wishlist);
            const newCount = response.wishlist.items_count || response.wishlist.items?.length || 0;
            setCachedWishlistCount(newCount);
            setCachedCount(newCount);
          }
          notify("success", "Added to wishlist");
          return true;
        } else if (response.error) {
          if (response.error.code === "product_already_in_wishlist") {
            notify("info", "Already in your wishlist");
            return true;
          }
          console.error("Error adding to wishlist:", response.error.message);
          notify("error", response.error.message || "Failed to add to wishlist");
          return false;
        }
        return false;
      } catch (error) {
        console.error("Error adding to wishlist:", error);
        notify("error", "Failed to add to wishlist");
        return false;
      } finally {
        setIsLoading(false);
        NProgress.done();
      }
    },
    [isAuthenticated, notify]
  );

  const removeFromWishlist = useCallback(
    async (productId: number, itemId?: number): Promise<boolean> => {
      if (!isAuthenticated) {
        const current = getGuestWishlist();
        const updated = current.filter((i) => i.product_id !== productId);
        setGuestWishlist(updated);
        setGuestItems(updated);
        notify("success", "Removed from wishlist");
        return true;
      }
      setIsLoading(true);
      NProgress.start();
      try {
        let resolvedItemId = itemId;
        if (!resolvedItemId && wishlist?.items) {
          const item = wishlist.items.find((i) => i.product_id === productId);
          resolvedItemId = item?.id;
        }
        const response = await apiRemoveFromWishlist(productId, resolvedItemId);
        if (response.success) {
          if (response.wishlist) {
            setWishlist(response.wishlist);
            const newCount = response.wishlist.items_count || response.wishlist.items?.length || 0;
            setCachedWishlistCount(newCount);
            setCachedCount(newCount);
          }
          notify("success", "Removed from wishlist");
          return true;
        } else if (response.error) {
          console.error("Error removing from wishlist:", response.error.message);
          notify("error", response.error.message || "Failed to remove from wishlist");
          return false;
        }
        return false;
      } catch (error) {
        console.error("Error removing from wishlist:", error);
        notify("error", "Failed to remove from wishlist");
        return false;
      } finally {
        setIsLoading(false);
        NProgress.done();
      }
    },
    [isAuthenticated, wishlist, notify]
  );

  const syncWishlist = useCallback(
    async (syncItems: Array<{ product_id: number; variation_id?: number }>) => {
      setIsLoading(true);
      try {
        const response = await apiSyncWishlist(syncItems);
        if (response.success && response.wishlist) {
          setWishlist(response.wishlist);
          clearGuestWishlist();
          setGuestItems([]);
        } else if (response.error) {
          console.error("Error syncing wishlist:", response.error.message);
        }
      } catch (error) {
        console.error("Error syncing wishlist:", error);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const isInWishlist = useCallback(
    (productId: number): boolean => {
      if (!isAuthenticated) {
        return guestItems.some((i) => i.product_id === productId);
      }
      return checkIsInWishlist(wishlist?.items || [], productId);
    },
    [isAuthenticated, guestItems, wishlist]
  );

  const getWishlistItemId = useCallback(
    (productId: number): number | undefined => {
      if (!isAuthenticated) {
        const idx = guestItems.findIndex((i) => i.product_id === productId);
        return idx >= 0 ? -(idx + 1) : undefined;
      }
      const item = wishlist?.items?.find((i) => i.product_id === productId);
      return item?.id;
    },
    [isAuthenticated, guestItems, wishlist]
  );

  const wishlistItems = isAuthenticated
    ? (wishlist?.items || [])
    : guestItemsToWishlistItems(guestItems);
  const wishlistItemsCount = isAuthenticated
    ? (wishlist?.items_count || wishlistItems.length || cachedCount)
    : guestItems.length;

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        wishlistItems,
        isLoading,
        isWishlistOpen,
        setIsWishlistOpen,
        addToWishlist,
        removeFromWishlist,
        syncWishlist,
        refreshWishlist,
        isInWishlist,
        getWishlistItemId,
        wishlistItemsCount,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
}
