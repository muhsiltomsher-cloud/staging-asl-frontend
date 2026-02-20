"use client";

import { useState, useEffect } from "react";

export function useKeyboardVisible(): boolean {
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !window.visualViewport) {
      return;
    }

    const viewport = window.visualViewport;
    const handleResize = () => {
      const isVisible = window.innerHeight - viewport.height > 150;
      setIsKeyboardVisible(isVisible);
    };

    viewport.addEventListener("resize", handleResize);
    return () => viewport.removeEventListener("resize", handleResize);
  }, []);

  return isKeyboardVisible;
}
