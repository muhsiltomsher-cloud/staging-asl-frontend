"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import {
  getCart as apiGetCart,
  addToCart as apiAddToCart,
  updateCartItem as apiUpdateCartItem,
  removeCartItem as apiRemoveCartItem,
  clearCart as apiClearCart,
  type CoCartResponse,
  type CoCartItem,
} from "@/lib/api/cocart";
import { useNotification } from "./NotificationContext";

export interface SelectedCoupon {
  code: string;
  discount_type: "percent" | "fixed_cart" | "fixed_product";
  amount: string;
  minimum_amount: string;
  free_shipping: boolean;
}

interface CartContextType {
  cart: CoCartResponse | null;
  cartItems: CoCartItem[];
  isLoading: boolean;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  addToCart: (productId: number, quantity?: number, variationId?: number, variation?: Record<string, string>) => Promise<void>;
  updateCartItem: (key: string, quantity: number) => Promise<void>;
  removeCartItem: (key: string) => Promise<void>;
  clearCart: () => Promise<void>;
  applyCoupon: (code: string, couponData?: SelectedCoupon) => Promise<{ success: boolean; error?: string }>;
  removeCoupon: (code: string) => Promise<boolean>;
  refreshCart: () => Promise<void>;
  cartItemsCount: number;
  cartSubtotal: string;
  cartTotal: string;
  selectedCoupons: SelectedCoupon[];
  couponDiscount: number;
  clearSelectedCoupons: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CoCartResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedCoupons, setSelectedCoupons] = useState<SelectedCoupon[]>([]);
  const { notify } = useNotification();

  const refreshCart = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await apiGetCart();
      if (response.success && response.cart) {
        setCart(response.cart);
      }
    } catch (error) {
      console.error("Error fetching cart:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

    const addToCart = useCallback(
      async (productId: number, quantity = 1, variationId?: number, variation?: Record<string, string>) => {
        setIsLoading(true);
        try {
          const response = await apiAddToCart(productId, quantity, variationId, variation);
          if (response.success && response.cart) {
            setCart(response.cart);
            setIsCartOpen(true);
            notify("cart", "Item added to cart");
          } else if (response.error) {
            console.error("Error adding to cart:", response.error.message);
            notify("error", response.error.message);
            throw new Error(response.error.message);
          }
        } catch (error) {
          console.error("Error adding to cart:", error);
          throw error;
        } finally {
          setIsLoading(false);
        }
      },
      [notify]
    );

    const updateCartItem = useCallback(
      async (key: string, quantity: number) => {
        setIsLoading(true);
        try {
          const response = await apiUpdateCartItem(key, quantity);
          if (response.success && response.cart) {
            setCart(response.cart);
            notify("cart", "Cart updated");
          } else if (response.error) {
            console.error("Error updating cart:", response.error.message);
            notify("error", response.error.message);
            throw new Error(response.error.message);
          }
        } catch (error) {
          console.error("Error updating cart:", error);
          throw error;
        } finally {
          setIsLoading(false);
        }
      },
      [notify]
    );

    const removeCartItem = useCallback(
      async (key: string) => {
        setIsLoading(true);
        try {
          const response = await apiRemoveCartItem(key);
          if (response.success && response.cart) {
            setCart(response.cart);
            notify("cart", "Item removed from cart");
          } else if (response.error) {
            console.error("Error removing from cart:", response.error.message);
            notify("error", response.error.message);
            throw new Error(response.error.message);
          }
        } catch (error) {
          console.error("Error removing from cart:", error);
          throw error;
        } finally {
          setIsLoading(false);
        }
      },
      [notify]
    );

  const clearCart = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await apiClearCart();
      if (response.success && response.cart) {
        setCart(response.cart);
      } else if (response.error) {
        console.error("Error clearing cart:", response.error.message);
        throw new Error(response.error.message);
      }
    } catch (error) {
      console.error("Error clearing cart:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const applyCoupon = useCallback(async (code: string, couponData?: SelectedCoupon): Promise<{ success: boolean; error?: string }> => {
    const normalizedCode = code.toLowerCase().trim();
    
    if (selectedCoupons.some(c => c.code.toLowerCase() === normalizedCode)) {
      notify("error", "Coupon already applied");
      return { success: false, error: "Coupon already applied" };
    }
    
    if (couponData) {
      const subtotal = parseFloat(cart?.totals?.subtotal || "0");
      const minAmount = parseFloat(couponData.minimum_amount || "0");
      
      if (minAmount > 0 && subtotal < minAmount) {
        const errorMsg = `Minimum spend of ${minAmount.toFixed(2)} required for this coupon`;
        notify("error", errorMsg);
        return { success: false, error: errorMsg };
      }
      
      setSelectedCoupons(prev => [...prev, { ...couponData, code: normalizedCode }]);
      notify("success", "Coupon applied successfully");
      return { success: true };
    }
    
    try {
      const response = await fetch("/api/coupons");
      const data = await response.json();
      
      if (data.success && data.coupons) {
        const foundCoupon = data.coupons.find(
          (c: SelectedCoupon) => c.code.toLowerCase() === normalizedCode
        );
        
        if (foundCoupon) {
          const subtotal = parseFloat(cart?.totals?.subtotal || "0");
          const minAmount = parseFloat(foundCoupon.minimum_amount || "0");
          
          if (minAmount > 0 && subtotal < minAmount) {
            const errorMsg = `Minimum spend of ${minAmount.toFixed(2)} required for this coupon`;
            notify("error", errorMsg);
            return { success: false, error: errorMsg };
          }
          
          setSelectedCoupons(prev => [...prev, { ...foundCoupon, code: normalizedCode }]);
          notify("success", "Coupon applied successfully");
          return { success: true };
        }
      }
      
      notify("error", "Invalid coupon code");
      return { success: false, error: "Invalid coupon code" };
    } catch (error) {
      console.error("Error validating coupon:", error);
      notify("error", "Failed to validate coupon");
      return { success: false, error: "Failed to validate coupon" };
    }
  }, [cart?.totals?.subtotal, selectedCoupons, notify]);

  const removeCoupon = useCallback(async (code: string): Promise<boolean> => {
    const normalizedCode = code.toLowerCase().trim();
    setSelectedCoupons(prev => prev.filter(c => c.code.toLowerCase() !== normalizedCode));
    notify("success", "Coupon removed");
    return true;
  }, [notify]);

  const clearSelectedCoupons = useCallback(() => {
    setSelectedCoupons([]);
  }, []);

  const cartItems = cart?.items || [];
  const cartItemsCount = cart?.item_count || 0;
  const cartSubtotal = cart?.totals?.subtotal || "0";
  const cartTotal = cart?.totals?.total || "0";

  const couponDiscount = selectedCoupons.reduce((total, coupon) => {
    const subtotal = parseFloat(cartSubtotal);
    const amount = parseFloat(coupon.amount);
    
    if (coupon.discount_type === "percent") {
      return total + (subtotal * amount / 100);
    } else if (coupon.discount_type === "fixed_cart") {
      return total + amount;
    }
    return total;
  }, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        cartItems,
        isLoading,
        isCartOpen,
        setIsCartOpen,
        addToCart,
        updateCartItem,
        removeCartItem,
        clearCart,
        applyCoupon,
        removeCoupon,
        refreshCart,
        cartItemsCount,
        cartSubtotal,
        cartTotal,
        selectedCoupons,
        couponDiscount,
        clearSelectedCoupons,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
