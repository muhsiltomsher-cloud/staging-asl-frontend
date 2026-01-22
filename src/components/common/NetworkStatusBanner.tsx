"use client";

import { useEffect, useState, useCallback } from "react";
import { WifiOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface NetworkStatusBannerProps {
  locale: string;
}

// Get initial network status
function getInitialStatus(): "online" | "offline" | "reconnected" {
  if (typeof window === "undefined") return "online";
  return navigator.onLine ? "online" : "offline";
}

export function NetworkStatusBanner({ locale }: NetworkStatusBannerProps) {
  const [status, setStatus] = useState<"online" | "offline" | "reconnected">(getInitialStatus);
  const isRTL = locale === "ar";

  const handleOffline = useCallback(() => {
    setStatus("offline");
  }, []);

  const handleOnline = useCallback(() => {
    setStatus((prev) => {
      if (prev === "offline") {
        return "reconnected";
      }
      return prev;
    });
  }, []);

  // Subscribe to online/offline events
  useEffect(() => {
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [handleOnline, handleOffline]);

  // Auto-hide reconnected message after 3 seconds
  useEffect(() => {
    if (status === "reconnected") {
      const timer = setTimeout(() => {
        setStatus("online");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  // Don't show anything if online
  if (status === "online") return null;

  const isOffline = status === "offline";
  const message = isOffline
    ? isRTL
      ? "أنت غير متصل بالإنترنت. بعض الميزات قد لا تعمل."
      : "You are offline. Some features may not work."
    : isRTL
      ? "تم استعادة الاتصال بالإنترنت."
      : "You are back online.";

  return (
    <div
      className={cn(
        "fixed top-0 left-0 right-0 z-[100] flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium transition-all duration-300",
        isOffline
          ? "bg-amber-900 text-white"
          : "bg-green-600 text-white"
      )}
      role="alert"
      aria-live="polite"
    >
      {isOffline && <WifiOff className="h-4 w-4" />}
      <span>{message}</span>
    </div>
  );
}
