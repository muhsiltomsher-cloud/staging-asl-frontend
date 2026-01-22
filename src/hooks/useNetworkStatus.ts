"use client";

import { useSyncExternalStore, useCallback } from "react";

function subscribe(callback: () => void) {
  window.addEventListener("online", callback);
  window.addEventListener("offline", callback);
  return () => {
    window.removeEventListener("online", callback);
    window.removeEventListener("offline", callback);
  };
}

function getSnapshot(): boolean {
  if (typeof window === "undefined") return true;
  return navigator.onLine;
}

function getServerSnapshot(): boolean {
  return true; // Assume online during SSR
}

export function useNetworkStatus() {
  const isOnline = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const checkConnection = useCallback(async (): Promise<boolean> => {
    if (typeof window === "undefined") return true;
    
    // Double-check by trying to fetch a small resource
    try {
      const response = await fetch("/api/health", {
        method: "HEAD",
        cache: "no-store",
      });
      return response.ok;
    } catch {
      return false;
    }
  }, []);

  return {
    isOnline,
    isOffline: !isOnline,
    checkConnection,
  };
}
