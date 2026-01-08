"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { useCart } from "./CartContext";
import { useCurrency } from "./CurrencyContext";

export interface FreeGiftRule {
  id: string;
  enabled: boolean;
  name: string;
  min_cart_value: number;
  max_cart_value?: number;
  currency: string;
  product_id: number;
  priority: number;
  message_en: string;
  message_ar: string;
  product?: {
    id: number;
    name: string;
    slug: string;
    price: string;
    image: string;
  };
}

interface FreeGiftContextType {
  rules: FreeGiftRule[];
  isLoading: boolean;
  activeGifts: FreeGiftRule[];
  freeGiftItemKeys: string[];
  isFreeGiftItem: (itemKey: string) => boolean;
  isFreeGiftProduct: (productId: number) => boolean;
  getFreeGiftProductIds: () => number[];
  refreshRules: () => Promise<void>;
  getGiftMessages: (locale: string) => string[];
}

const FreeGiftContext = createContext<FreeGiftContextType | undefined>(undefined);

const FREE_GIFT_ITEM_DATA_KEY = "_asl_free_gift";

// Helper to generate a stable hash of cart state for comparison
function getCartStateHash(cartItems: Array<{ item_key: string; id: number; quantity: { value: number } }>, subtotal: string): string {
  const itemsHash = cartItems.map(i => `${i.item_key}:${i.id}:${i.quantity.value}`).join('|');
  return `${subtotal}::${itemsHash}`;
}

export function FreeGiftProvider({ children }: { children: React.ReactNode }) {
  const { cart, cartItems, cartSubtotal, addToCart, removeCartItem, updateCartItem } = useCart();
  const { currency } = useCurrency();
  const [rules, setRules] = useState<FreeGiftRule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeGifts, setActiveGifts] = useState<FreeGiftRule[]>([]);
  const [freeGiftItemKeys, setFreeGiftItemKeys] = useState<string[]>([]);
  const isProcessingRef = useRef(false);
  const lastProcessedStateRef = useRef<string | null>(null);
  const correctedGiftKeysRef = useRef<Set<string>>(new Set());

  const currencyMinorUnit = cart?.currency?.currency_minor_unit ?? 2;
  const divisor = Math.pow(10, currencyMinorUnit);

  const addToCartRef = useRef(addToCart);
  const removeCartItemRef = useRef(removeCartItem);
  const updateCartItemRef = useRef(updateCartItem);

  useEffect(() => {
    addToCartRef.current = addToCart;
    removeCartItemRef.current = removeCartItem;
    updateCartItemRef.current = updateCartItem;
  }, [addToCart, removeCartItem, updateCartItem]);

  const fetchRules = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/free-gifts?currency=${currency}`);
      const data = await response.json();

      if (data.success && data.rules) {
        setRules(data.rules);
      }
    } catch (error) {
      console.error("Failed to fetch free gift rules:", error);
    } finally {
      setIsLoading(false);
    }
  }, [currency]);

  useEffect(() => {
    fetchRules();
  }, [fetchRules]);

  const isFreeGiftItem = useCallback((itemKey: string): boolean => {
    const item = cartItems.find((i) => i.item_key === itemKey);
    if (!item) return false;

    // Primary check: cart_item_data flag (if CoCart preserves it)
    if (item.cart_item_data?.[FREE_GIFT_ITEM_DATA_KEY] === true) {
      return true;
    }

    // Fallback check: product ID is in gift rules AND price is 0 (free)
    const isGiftProduct = rules.some((rule) => rule.product_id === item.id);
    const isFreePrice = parseFloat(item.price) === 0;

    return isGiftProduct && isFreePrice;
  }, [cartItems, rules]);

  const isFreeGiftProduct = useCallback((productId: number): boolean => {
    return rules.some((rule) => rule.product_id === productId);
  }, [rules]);

  const getFreeGiftProductIds = useCallback((): number[] => {
    return rules.map((rule) => rule.product_id);
  }, [rules]);

  const getGiftMessages = useCallback((locale: string): string[] => {
    return activeGifts
      .map((gift) => locale === "ar" ? gift.message_ar : gift.message_en)
      .filter((msg) => msg && msg.trim() !== "");
  }, [activeGifts]);

  useEffect(() => {
    const processGiftLogic = async () => {
      if (isProcessingRef.current) return;
      if (rules.length === 0) return;
      if (!cart) return;

      const currentStateHash = getCartStateHash(cartItems, cartSubtotal);

      if (lastProcessedStateRef.current === currentStateHash) {
        return;
      }

      const existingFreeGifts: Array<{ item: typeof cartItems[0]; rule: FreeGiftRule | undefined }> = [];
      for (const item of cartItems) {
        const isFreeGift = item.cart_item_data?.[FREE_GIFT_ITEM_DATA_KEY] === true;
        const isGiftProduct = rules.some((rule) => rule.product_id === item.id);
        const isFreePrice = parseFloat(item.price) === 0;

        if (isFreeGift || (isGiftProduct && isFreePrice)) {
          const rule = rules.find((r) => r.product_id === item.id);
          existingFreeGifts.push({ item, rule });
        }
      }

      const subtotalValue = parseFloat(cartSubtotal) / divisor;
      const giftsTotalValue = existingFreeGifts.reduce((sum, { item }) => {
        return sum + (parseFloat(item.price) / divisor * item.quantity.value);
      }, 0);
      const subtotalWithoutGifts = subtotalValue - giftsTotalValue;

      const matchingRules = rules.filter((rule) => {
        if (!rule.enabled) return false;
        if (rule.currency !== currency) return false;
        if (subtotalWithoutGifts < rule.min_cart_value) return false;
        if (rule.max_cart_value && subtotalWithoutGifts > rule.max_cart_value) return false;
        return true;
      });
      matchingRules.sort((a, b) => a.priority - b.priority);

      lastProcessedStateRef.current = currentStateHash;

      const currentGiftKeys: string[] = [];
      const currentActiveGifts: FreeGiftRule[] = [];

      for (const { item, rule } of existingFreeGifts) {
        if (rule) {
          currentGiftKeys.push(item.item_key);
          currentActiveGifts.push(rule);
        }
      }

      setFreeGiftItemKeys(currentGiftKeys);
      setActiveGifts(currentActiveGifts);

      for (const { item } of existingFreeGifts) {
        if (item.quantity.value > 1 && !correctedGiftKeysRef.current.has(item.item_key)) {
          isProcessingRef.current = true;
          correctedGiftKeysRef.current.add(item.item_key);
          try {
            await updateCartItemRef.current(item.item_key, 1);
          } catch (error) {
            console.error("Failed to correct gift quantity:", error);
          } finally {
            isProcessingRef.current = false;
          }
          return;
        }
      }

      const existingGiftProductIds = new Set(existingFreeGifts.map(({ item }) => item.id));
      const matchingProductIds = new Set(matchingRules.map((r) => r.product_id));

      const giftsToRemove = existingFreeGifts.filter(({ item }) => !matchingProductIds.has(item.id));
      const rulesToAdd = matchingRules.filter((rule) => !existingGiftProductIds.has(rule.product_id));

      if (giftsToRemove.length === 0 && rulesToAdd.length === 0) {
        setActiveGifts(matchingRules);
        return;
      }

      isProcessingRef.current = true;
      try {
        for (const { item } of giftsToRemove) {
          try {
            await removeCartItemRef.current(item.item_key);
          } catch (error) {
            console.error("Failed to remove gift:", error);
          }
        }

        for (const rule of rulesToAdd) {
          try {
            await addToCartRef.current(rule.product_id, 1, undefined, undefined, {
              [FREE_GIFT_ITEM_DATA_KEY]: true,
            });
          } catch (error) {
            console.error("Failed to add gift:", error);
          }
        }

        setActiveGifts(matchingRules);
      } finally {
        isProcessingRef.current = false;
      }
    };

    const timeoutId = setTimeout(processGiftLogic, 500);
    return () => clearTimeout(timeoutId);
  }, [
    cart,
    cartItems,
    cartSubtotal,
    rules,
    currency,
    divisor,
  ]);

  return (
    <FreeGiftContext.Provider
      value={{
        rules,
        isLoading,
        activeGifts,
        freeGiftItemKeys,
        isFreeGiftItem,
        isFreeGiftProduct,
        getFreeGiftProductIds,
        refreshRules: fetchRules,
        getGiftMessages,
      }}
    >
      {children}
    </FreeGiftContext.Provider>
  );
}

export function useFreeGift() {
  const context = useContext(FreeGiftContext);
  if (context === undefined) {
    throw new Error("useFreeGift must be used within a FreeGiftProvider");
  }
  return context;
}
