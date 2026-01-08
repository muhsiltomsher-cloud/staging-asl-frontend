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
  hide_from_shop?: boolean;
  product?: {
    id: number;
    name: string;
    slug: string;
    price: string;
    image: string;
  };
}

interface GiftProgress {
  hasNextGift: boolean;
  amountNeeded: number;
  nextGiftRule: FreeGiftRule | null;
  currentSubtotal: number;
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
  getGiftProgress: () => GiftProgress;
}

const FreeGiftContext = createContext<FreeGiftContextType | undefined>(undefined);

const FREE_GIFT_ITEM_DATA_KEY = "_asl_free_gift";

// Helper to generate a stable hash of cart state for comparison
// Only include non-gift items in the hash to prevent re-processing when gifts are added
function getCartStateHash(
  cartItems: Array<{ item_key: string; id: number; quantity: { value: number } }>,
  subtotal: string,
  giftProductIds: Set<number>
): string {
  const nonGiftItems = cartItems.filter(i => !giftProductIds.has(i.id));
  const itemsHash = nonGiftItems.map(i => `${i.id}:${i.quantity.value}`).join('|');
  return `${subtotal}::${itemsHash}`;
}

interface FreeGiftProviderProps {
  children: React.ReactNode;
  locale: string;
}

export function FreeGiftProvider({ children, locale }: FreeGiftProviderProps) {
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
      const response = await fetch(`/api/free-gifts?currency=${currency}&locale=${locale}`);
      const data = await response.json();

      if (data.success && data.rules) {
        setRules(data.rules);
      }
    } catch (error) {
      console.error("Failed to fetch free gift rules:", error);
    } finally {
      setIsLoading(false);
    }
  }, [currency, locale]);

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

    // Fallback check: product ID matches a gift rule
    // This handles cases where CoCart doesn't preserve the flag
    // and where the gift product has a non-zero price
    return rules.some((rule) => rule.product_id === item.id);
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

  const getGiftProgress = useCallback((): GiftProgress => {
    // Calculate subtotal without gift items
    const giftProductIds = new Set(rules.map(r => r.product_id));
    const subtotalValue = parseFloat(cartSubtotal) / divisor;
    
    // Calculate gift items total to subtract from subtotal
    let giftsTotalValue = 0;
    for (const item of cartItems) {
      if (giftProductIds.has(item.id)) {
        giftsTotalValue += (parseFloat(item.price) / divisor * item.quantity.value);
      }
    }
    const subtotalWithoutGifts = subtotalValue - giftsTotalValue;

    // Find enabled rules for current currency, sorted by min_cart_value
    const eligibleRules = rules
      .filter((rule) => rule.enabled && rule.currency === currency)
      .sort((a, b) => a.min_cart_value - b.min_cart_value);

    // Find the next gift rule that hasn't been unlocked yet
    const nextGiftRule = eligibleRules.find((rule) => {
      return subtotalWithoutGifts < rule.min_cart_value;
    });

    if (nextGiftRule) {
      const amountNeeded = nextGiftRule.min_cart_value - subtotalWithoutGifts;
      return {
        hasNextGift: true,
        amountNeeded: Math.ceil(amountNeeded),
        nextGiftRule,
        currentSubtotal: subtotalWithoutGifts,
      };
    }

    return {
      hasNextGift: false,
      amountNeeded: 0,
      nextGiftRule: null,
      currentSubtotal: subtotalWithoutGifts,
    };
  }, [rules, cartItems, cartSubtotal, currency, divisor]);

  useEffect(() => {
    const processGiftLogic = async () => {
      if (isProcessingRef.current) return;
      if (rules.length === 0) return;
      if (!cart) return;

      // Get all gift product IDs for hash calculation
      const giftProductIds = new Set(rules.map(r => r.product_id));
      const currentStateHash = getCartStateHash(cartItems, cartSubtotal, giftProductIds);

      if (lastProcessedStateRef.current === currentStateHash) {
        return;
      }

      // Find existing gift items in cart
      // A gift item is identified by:
      // 1. Having the _asl_free_gift flag in cart_item_data (if CoCart preserves it)
      // 2. OR having a product_id that matches a gift rule (regardless of price)
      const existingFreeGifts: Array<{ item: typeof cartItems[0]; rule: FreeGiftRule | undefined }> = [];
      for (const item of cartItems) {
        const isFreeGiftFlag = item.cart_item_data?.[FREE_GIFT_ITEM_DATA_KEY] === true;
        const matchingRule = rules.find((rule) => rule.product_id === item.id);
        
        // If the product matches a gift rule, treat it as a gift
        // This handles cases where CoCart doesn't preserve the flag
        if (isFreeGiftFlag || matchingRule) {
          existingFreeGifts.push({ item, rule: matchingRule });
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
        getGiftProgress,
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
