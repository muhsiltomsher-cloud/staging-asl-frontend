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
  refreshRules: () => Promise<void>;
}

const FreeGiftContext = createContext<FreeGiftContextType | undefined>(undefined);

const FREE_GIFT_ITEM_DATA_KEY = "_asl_free_gift";

export function FreeGiftProvider({ children }: { children: React.ReactNode }) {
  const { cart, cartItems, cartSubtotal, addToCart, removeCartItem } = useCart();
  const { currency } = useCurrency();
  const [rules, setRules] = useState<FreeGiftRule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeGift, setActiveGift] = useState<FreeGiftRule | null>(null);
  const [freeGiftItemKey, setFreeGiftItemKey] = useState<string | null>(null);
  const isProcessingRef = useRef(false);
  const lastProcessedSubtotalRef = useRef<string | null>(null);

  const currencyMinorUnit = cart?.currency?.currency_minor_unit ?? 2;
  const divisor = Math.pow(10, currencyMinorUnit);

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
    return item.cart_item_data?.[FREE_GIFT_ITEM_DATA_KEY] === true;
  }, [cartItems]);

  const isFreeGiftProduct = useCallback((productId: number): boolean => {
    return rules.some((rule) => rule.product_id === productId);
  }, [rules]);

  const findExistingFreeGiftItem = useCallback(() => {
    for (const item of cartItems) {
      if (item.cart_item_data?.[FREE_GIFT_ITEM_DATA_KEY] === true) {
        return item;
      }
    }
    return null;
  }, [cartItems]);

  const findMatchingRule = useCallback((subtotalValue: number): FreeGiftRule | null => {
    const matchingRules = rules.filter(
      (rule) => rule.enabled && subtotalValue >= rule.min_cart_value && rule.currency === currency
    );

    if (matchingRules.length === 0) return null;

    matchingRules.sort((a, b) => a.priority - b.priority);
    return matchingRules[0];
  }, [rules, currency]);

  useEffect(() => {
    const processGiftLogic = async () => {
      if (isProcessingRef.current) return;
      if (rules.length === 0) return;
      if (!cart) return;

      const subtotalValue = parseFloat(cartSubtotal) / divisor;
      
            const existingFreeGift = findExistingFreeGiftItem();

            const subtotalWithoutGift = existingFreeGift
        ? subtotalValue - (parseFloat(existingFreeGift.price) / divisor * existingFreeGift.quantity.value)
        : subtotalValue;

      if (lastProcessedSubtotalRef.current === cartSubtotal && existingFreeGift?.item_key === freeGiftItemKey) {
        return;
      }

      const matchingRule = findMatchingRule(subtotalWithoutGift);

      if (matchingRule) {
        if (existingFreeGift) {
          if (existingFreeGift.id === matchingRule.product_id) {
            setActiveGift(matchingRule);
            setFreeGiftItemKey(existingFreeGift.item_key);
            lastProcessedSubtotalRef.current = cartSubtotal;
            return;
          } else {
            isProcessingRef.current = true;
            try {
              await removeCartItem(existingFreeGift.item_key);
              await addToCart(matchingRule.product_id, 1, undefined, undefined, {
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
          isProcessingRef.current = true;
          try {
            await addToCart(matchingRule.product_id, 1, undefined, undefined, {
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
        if (existingFreeGift) {
          isProcessingRef.current = true;
          try {
            await removeCartItem(existingFreeGift.item_key);
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

      lastProcessedSubtotalRef.current = cartSubtotal;
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
    findExistingFreeGiftItem,
    findMatchingRule,
    addToCart,
    removeCartItem,
    freeGiftItemKey,
  ]);

  useEffect(() => {
    const existingFreeGift = findExistingFreeGiftItem();
    if (existingFreeGift) {
      setFreeGiftItemKey(existingFreeGift.item_key);
      const matchingRule = rules.find((r) => r.product_id === existingFreeGift.id);
      if (matchingRule) {
        setActiveGift(matchingRule);
      }
    }
  }, [cartItems, rules, findExistingFreeGiftItem]);

  return (
    <FreeGiftContext.Provider
      value={{
        rules,
        isLoading,
        activeGift,
        freeGiftItemKey,
        isFreeGiftItem,
        isFreeGiftProduct,
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
