"use client";

import { useCallback } from "react";
import { RefreshCw } from "lucide-react";
import { usePullToRefresh } from "@/hooks/usePullToRefresh";

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
  disabled?: boolean;
}

export function PullToRefresh({ onRefresh, children, disabled }: PullToRefreshProps) {
  const { pullDistance, isRefreshing, containerRef } = usePullToRefresh({
    onRefresh,
    disabled,
  });

  const showIndicator = pullDistance > 10 || isRefreshing;
  const progress = Math.min(pullDistance / 80, 1);

  return (
    <div ref={containerRef} className="relative">
      {showIndicator && (
        <div
          className="pointer-events-none absolute left-0 right-0 z-30 flex justify-center transition-opacity"
          style={{
            top: -8,
            transform: `translateY(${pullDistance}px)`,
            opacity: progress,
          }}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-lg">
            <RefreshCw
              className={`h-5 w-5 text-amber-700 ${isRefreshing ? "animate-spin" : ""}`}
              style={{
                transform: isRefreshing ? undefined : `rotate(${progress * 360}deg)`,
              }}
            />
          </div>
        </div>
      )}
      <div
        style={{
          transform: showIndicator ? `translateY(${pullDistance * 0.3}px)` : undefined,
          transition: pullDistance === 0 ? "transform 0.3s ease" : undefined,
        }}
      >
        {children}
      </div>
    </div>
  );
}

export function usePullToRefreshCallback() {
  const refresh = useCallback(async () => {
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  }, []);
  return refresh;
}
