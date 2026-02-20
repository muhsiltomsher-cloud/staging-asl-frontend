"use client";

import { useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";

interface SwipeBackOptions {
  threshold?: number;
  edgeWidth?: number;
  disabled?: boolean;
}

export function useSwipeBack({
  threshold = 100,
  edgeWidth = 30,
  disabled = false,
}: SwipeBackOptions = {}) {
  const router = useRouter();
  const startXRef = useRef(0);
  const startYRef = useRef(0);
  const isSwipingRef = useRef(false);

  const handleTouchStart = useCallback(
    (e: TouchEvent) => {
      if (disabled) return;
      const touch = e.touches[0];
      if (touch.clientX <= edgeWidth) {
        startXRef.current = touch.clientX;
        startYRef.current = touch.clientY;
        isSwipingRef.current = true;
      }
    },
    [disabled, edgeWidth]
  );

  const handleTouchEnd = useCallback(
    (e: TouchEvent) => {
      if (!isSwipingRef.current || disabled) return;
      isSwipingRef.current = false;
      const touch = e.changedTouches[0];
      const diffX = touch.clientX - startXRef.current;
      const diffY = Math.abs(touch.clientY - startYRef.current);
      if (diffX > threshold && diffY < diffX * 0.5) {
        router.back();
      }
    },
    [disabled, threshold, router]
  );

  useEffect(() => {
    document.addEventListener("touchstart", handleTouchStart, { passive: true });
    document.addEventListener("touchend", handleTouchEnd, { passive: true });
    return () => {
      document.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchEnd]);
}
