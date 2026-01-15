"use client";

import { useState, useCallback, useSyncExternalStore } from "react";

const STORAGE_KEY = "asl_recently_viewed";
const MAX_ITEMS = 10;

interface RecentlyViewedItem {
  productId: number;
  timestamp: number;
}

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

function getSnapshot(): string {
  if (typeof window === "undefined") return "[]";
  return localStorage.getItem(STORAGE_KEY) || "[]";
}

function getServerSnapshot(): string {
  return "[]";
}

export function useRecentlyViewed() {
  const storageValue = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  
  const recentlyViewedIds = (() => {
    try {
      const items: RecentlyViewedItem[] = JSON.parse(storageValue);
      return items
        .sort((a, b) => b.timestamp - a.timestamp)
        .map((item) => item.productId);
    } catch {
      return [];
    }
  })();

  const [isLoaded] = useState(true);

  const addToRecentlyViewed = useCallback((productId: number) => {
    if (typeof window === "undefined") return;

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      let items: RecentlyViewedItem[] = stored ? JSON.parse(stored) : [];

      items = items.filter((item) => item.productId !== productId);

      items.unshift({
        productId,
        timestamp: Date.now(),
      });

      items = items.slice(0, MAX_ITEMS);

      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
      
      window.dispatchEvent(new StorageEvent("storage", { key: STORAGE_KEY }));
    } catch (error) {
      console.error("Failed to save recently viewed product:", error);
    }
  }, []);

  const getRecentlyViewedIds = useCallback(
    (excludeProductId?: number): number[] => {
      if (excludeProductId) {
        return recentlyViewedIds.filter((id) => id !== excludeProductId);
      }
      return recentlyViewedIds;
    },
    [recentlyViewedIds]
  );

  const clearRecentlyViewed = useCallback(() => {
    if (typeof window === "undefined") return;

    try {
      localStorage.removeItem(STORAGE_KEY);
      window.dispatchEvent(new StorageEvent("storage", { key: STORAGE_KEY }));
    } catch (error) {
      console.error("Failed to clear recently viewed products:", error);
    }
  }, []);

  return {
    recentlyViewedIds,
    isLoaded,
    addToRecentlyViewed,
    getRecentlyViewedIds,
    clearRecentlyViewed,
  };
}
