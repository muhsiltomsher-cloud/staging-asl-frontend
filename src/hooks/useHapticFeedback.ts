"use client";

import { useCallback } from "react";

type HapticPattern = "light" | "medium" | "heavy";

const patterns: Record<HapticPattern, number | number[]> = {
  light: 10,
  medium: 25,
  heavy: 50,
};

export function useHapticFeedback() {
  const vibrate = useCallback((pattern: HapticPattern = "light") => {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(patterns[pattern]);
    }
  }, []);

  return { vibrate };
}
