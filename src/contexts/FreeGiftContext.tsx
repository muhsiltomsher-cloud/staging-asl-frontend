"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { useCart } from "./CartContext";
import { useCurrency } from "./CurrencyContext";

export interface FreeGiftRule {
  id: string;
  enabled: boolean;
  name: string;
  min_cart_value: number;
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
  activeGift: FreeGiftRule | null;
  freeGiftItemKey: string | null;
  isFreeGiftItem: (itemKey: string) => boolean;
  isFreeGiftProduct: (productId: number) => boolean;
  getFreeGiftProductIds: () => number[];
  refreshRules: () => Promise<void>;
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
  const [activeGift, setActiveGift] = useState<FreeGiftRule | null>(null);
  const [freeGiftItemKey, setFreeGiftItemKey] = useState<string | null>(null);
  const isProcessingRef = useRef(false);
  const lastProcessedStateRef = useRef<string | null>(null);
  const lastCorrectedGiftKeyRef = useRef<string | null>(null);

  const currencyMinorUnit = cart?.currency?.currency_minor_unit ?? 2;
  const divisor = Math.pow(10, currencyMinorUnit);

  // Store cart operations in refs to avoid triggering useEffect when they change
  const addToCartRef = useRef(addToCart);
  const removeCartItemRef = useRef(removeCartItem);
  const updateCartItemRef = useRef(updateCartItem);
  
  // Keep refs updated with latest functions
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

  // Single consolidated useEffect for all free gift logic
  // This prevents cascading triggers between multiple useEffects
  useEffect(() => {
    const processGiftLogic = async () => {
      // Skip if already processing or no rules/cart
      if (isProcessingRef.current) return;
      if (rules.length === 0) return;
      if (!cart) return;

      // Generate a hash of current cart state for comparison
      const currentStateHash = getCartStateHash(cartItems, cartSubtotal);
      
      // Skip if we've already processed this exact cart state
      if (lastProcessedStateRef.current === currentStateHash) {
        return;
      }

      // Find existing free gift item using inline logic (not a callback)
      let existingFreeGift = null;
      for (const item of cartItems) {
        if (item.cart_item_data?.[FREE_GIFT_ITEM_DATA_KEY] === true) {
          existingFreeGift = item;
          break;
        }
        const isGiftProduct = rules.some((rule) => rule.product_id === item.id);
        const isFreePrice = parseFloat(item.price) === 0;
        if (isGiftProduct && isFreePrice) {
          existingFreeGift = item;
          break;
        }
      }

      // Calculate subtotal without the gift
      const subtotalValue = parseFloat(cartSubtotal) / divisor;
      const subtotalWithoutGift = existingFreeGift
        ? subtotalValue - (parseFloat(existingFreeGift.price) / divisor * existingFreeGift.quantity.value)
        : subtotalValue;

      // Find matching rule using inline logic (not a callback)
      const matchingRules = rules.filter(
        (rule) => rule.enabled && subtotalWithoutGift >= rule.min_cart_value && rule.currency === currency
      );
      matchingRules.sort((a, b) => a.priority - b.priority);
      const matchingRule = matchingRules.length > 0 ? matchingRules[0] : null;

      // Update state hash before any async operations
      lastProcessedStateRef.current = currentStateHash;

      // Sync freeGiftItemKey and activeGift state (previously in separate useEffect)
      if (existingFreeGift) {
        setFreeGiftItemKey(existingFreeGift.item_key);
        const ruleForGift = rules.find((r) => r.product_id === existingFreeGift.id);
        if (ruleForGift) {
          setActiveGift(ruleForGift);
        }
      }

      // Enforce quantity = 1 for free gift items (previously in separate useEffect)
      if (existingFreeGift && existingFreeGift.quantity.value > 1) {
        if (lastCorrectedGiftKeyRef.current !== existingFreeGift.item_key) {
          isProcessingRef.current = true;
          lastCorrectedGiftKeyRef.current = existingFreeGift.item_key;
          try {
            await updateCartItemRef.current(existingFreeGift.item_key, 1);
          } catch (error) {
            console.error("Failed to correct gift quantity:", error);
          } finally {
            isProcessingRef.current = false;
          }
          return; // Exit early, let next cycle handle gift logic
        }
      }

      // Handle gift logic
      if (matchingRule) {
        if (existingFreeGift) {
          if (existingFreeGift.id === matchingRule.product_id) {
            // Correct gift already in cart - just update state
            setActiveGift(matchingRule);
            setFreeGiftItemKey(existingFreeGift.item_key);
            return;
          } else {
            // Wrong gift - swap it
            isProcessingRef.current = true;
            try {
              await removeCartItemRef.current(existingFreeGift.item_key);
              await addToCartRef.current(matchingRule.product_id, 1, undefined, undefined, {
                [FREE_GIFT_ITEM_DATA_KEY]: true,
              });
              setActiveGift(matchingRule);
            } catch (error) {
              console.error("Failed to swap free gift:", error);
            } finally {
              isProcessingRef.current = false;
            }
          }
        } else {
          // No gift - add one
          isProcessingRef.current = true;
          try {
            await addToCartRef.current(matchingRule.product_id, 1, undefined, undefined, {
              [FREE_GIFT_ITEM_DATA_KEY]: true,
            });
            setActiveGift(matchingRule);
          } catch (error) {
            console.error("Failed to add free gift:", error);
          } finally {
            isProcessingRef.current = false;
          }
        }
      } else {
        // No matching rule
        if (existingFreeGift) {
          // Remove existing gift
          isProcessingRef.current = true;
          try {
            await removeCartItemRef.current(existingFreeGift.item_key);
            setActiveGift(null);
            setFreeGiftItemKey(null);
          } catch (error) {
            console.error("Failed to remove free gift:", error);
          } finally {
            isProcessingRef.current = false;
          }
        } else {
          setActiveGift(null);
          setFreeGiftItemKey(null);
        }
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
        activeGift,
        freeGiftItemKey,
        isFreeGiftItem,
        isFreeGiftProduct,
        getFreeGiftProductIds,
        refreshRules: fetchRules,
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
