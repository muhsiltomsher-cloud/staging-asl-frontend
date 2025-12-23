"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import {
  getWishlist as apiGetWishlist,
  addToWishlist as apiAddToWishlist,
  removeFromWishlist as apiRemoveFromWishlist,
  syncWishlist as apiSyncWishlist,
  isProductInWishlist as checkIsInWishlist,
  type WishlistResponse,
  type WishlistItem,
} from "@/lib/api/wishlist";

interface WishlistContextType {
  wishlist: WishlistResponse | null;
  wishlistItems: WishlistItem[];
  isLoading: boolean;
  isWishlistOpen: boolean;
  setIsWishlistOpen: (open: boolean) => void;
  addToWishlist: (productId: number, variationId?: number) => Promise<boolean>;
  removeFromWishlist: (productId: number) => Promise<boolean>;
  syncWishlist: (guestItems: Array<{ product_id: number; variation_id?: number }>) => Promise<void>;
  refreshWishlist: () => Promise<void>;
  isInWishlist: (productId: number) => boolean;
  wishlistItemsCount: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [wishlist, setWishlist] = useState<WishlistResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);

  const refreshWishlist = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await apiGetWishlist();
      if (response.success && response.wishlist) {
        setWishlist(response.wishlist);
      }
    } catch (error) {
      console.error("Error fetching wishlist:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshWishlist();
  }, [refreshWishlist]);

  const addToWishlist = useCallback(
    async (productId: number, variationId?: number): Promise<boolean> => {
      setIsLoading(true);
      try {
        const response = await apiAddToWishlist(productId, variationId);
        if (response.success) {
          await refreshWishlist();
          return true;
        } else if (response.error) {
          console.error("Error adding to wishlist:", response.error.message);
          return false;
        }
        return false;
      } catch (error) {
        console.error("Error adding to wishlist:", error);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [refreshWishlist]
  );

  const removeFromWishlist = useCallback(
    async (productId: number): Promise<boolean> => {
      setIsLoading(true);
      try {
        const response = await apiRemoveFromWishlist(productId);
        if (response.success) {
          await refreshWishlist();
          return true;
        } else if (response.error) {
          console.error("Error removing from wishlist:", response.error.message);
          return false;
        }
        return false;
      } catch (error) {
        console.error("Error removing from wishlist:", error);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [refreshWishlist]
  );

  const syncWishlist = useCallback(
    async (guestItems: Array<{ product_id: number; variation_id?: number }>) => {
      setIsLoading(true);
      try {
        const response = await apiSyncWishlist(guestItems);
        if (response.success && response.wishlist) {
          setWishlist(response.wishlist);
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
      return checkIsInWishlist(wishlist?.items || [], productId);
    },
    [wishlist]
  );

  const wishlistItems = wishlist?.items || [];
  const wishlistItemsCount = wishlist?.items_count || wishlistItems.length;

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
