"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import type { Cart } from "@/types";

interface CartContextType {
  cart: Cart | null;
  isLoading: boolean;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  addToCart: (productId: number, quantity?: number, variationId?: number) => Promise<void>;
  updateCartItem: (key: string, quantity: number) => Promise<void>;
  removeCartItem: (key: string) => Promise<void>;
  refreshCart: () => Promise<void>;
  cartItemsCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const refreshCart = useCallback(async () => {
    setIsLoading(true);
    try {
      // TODO: Implement GraphQL cart fetch
      // const data = await fetchGraphQL(GET_CART);
      // setCart(data.cart);
    } catch (error) {
      console.error("Error fetching cart:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addToCart = useCallback(
    async (productId: number, quantity = 1, variationId?: number) => {
      setIsLoading(true);
      try {
        // TODO: Implement GraphQL add to cart mutation
        // const data = await fetchGraphQL(ADD_TO_CART, { productId, quantity, variationId });
        await refreshCart();
        setIsCartOpen(true);
      } catch (error) {
        console.error("Error adding to cart:", error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [refreshCart]
  );

  const updateCartItem = useCallback(
    async (key: string, quantity: number) => {
      setIsLoading(true);
      try {
        // TODO: Implement GraphQL update cart mutation
        // const data = await fetchGraphQL(UPDATE_CART_ITEM, { key, quantity });
        await refreshCart();
      } catch (error) {
        console.error("Error updating cart:", error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [refreshCart]
  );

  const removeCartItem = useCallback(
    async (key: string) => {
      setIsLoading(true);
      try {
        // TODO: Implement GraphQL remove from cart mutation
        // const data = await fetchGraphQL(REMOVE_CART_ITEM, { keys: [key] });
        await refreshCart();
      } catch (error) {
        console.error("Error removing from cart:", error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [refreshCart]
  );

  const cartItemsCount = cart?.contents?.itemCount || 0;

  return (
    <CartContext.Provider
      value={{
        cart,
        isLoading,
        isCartOpen,
        setIsCartOpen,
        addToCart,
        updateCartItem,
        removeCartItem,
        refreshCart,
        cartItemsCount,
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
