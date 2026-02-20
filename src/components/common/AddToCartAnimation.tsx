"use client";

import { useState, useCallback, createContext, useContext, type ReactNode } from "react";
import Image from "next/image";

interface FlyingItem {
  id: string;
  src: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

interface AddToCartAnimationContextType {
  triggerAnimation: (imageSrc: string, startElement: HTMLElement) => void;
}

const AddToCartAnimationContext = createContext<AddToCartAnimationContextType>({
  triggerAnimation: () => {},
});

export function useAddToCartAnimation() {
  return useContext(AddToCartAnimationContext);
}

export function AddToCartAnimationProvider({ children }: { children: ReactNode }) {
  const [flyingItems, setFlyingItems] = useState<FlyingItem[]>([]);

  const triggerAnimation = useCallback((imageSrc: string, startElement: HTMLElement) => {
    const startRect = startElement.getBoundingClientRect();

    const cartIcon = document.querySelector('[aria-label="Cart"]') ||
      document.querySelector('[aria-label="cart"]') ||
      document.querySelector('button[aria-label="Cart"]');

    let endX = window.innerWidth - 40;
    let endY = window.innerHeight - 30;

    if (cartIcon) {
      const cartRect = cartIcon.getBoundingClientRect();
      endX = cartRect.left + cartRect.width / 2;
      endY = cartRect.top + cartRect.height / 2;
    }

    const id = `fly-${Date.now()}`;
    const newItem: FlyingItem = {
      id,
      src: imageSrc,
      startX: startRect.left + startRect.width / 2,
      startY: startRect.top + startRect.height / 2,
      endX,
      endY,
    };

    setFlyingItems((prev) => [...prev, newItem]);

    setTimeout(() => {
      setFlyingItems((prev) => prev.filter((item) => item.id !== id));
    }, 800);
  }, []);

  return (
    <AddToCartAnimationContext.Provider value={{ triggerAnimation }}>
      {children}
      {flyingItems.map((item) => (
        <FlyingThumbnail key={item.id} item={item} />
      ))}
    </AddToCartAnimationContext.Provider>
  );
}

function FlyingThumbnail({ item }: { item: FlyingItem }) {
  return (
    <div
      className="pointer-events-none fixed z-[9999]"
      style={{
        left: item.startX - 25,
        top: item.startY - 25,
        animation: "flyToCart 0.7s cubic-bezier(0.2, 0.8, 0.2, 1) forwards",
        // CSS custom properties for the animation endpoint
        ["--end-x" as string]: `${item.endX - item.startX}px`,
        ["--end-y" as string]: `${item.endY - item.startY}px`,
      }}
    >
      <div className="h-[50px] w-[50px] overflow-hidden rounded-full border-2 border-amber-500 bg-white shadow-xl">
        <Image
          src={item.src}
          alt=""
          width={50}
          height={50}
          className="h-full w-full object-cover"
          unoptimized
        />
      </div>
    </div>
  );
}
