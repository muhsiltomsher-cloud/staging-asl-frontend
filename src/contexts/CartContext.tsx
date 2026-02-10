"use client";

import React, { createContext, useContext, useState, useCallback, useEffect, useRef, useMemo } from "react";
import useSWR, { mutate } from "swr";
import type { CoCartResponse, CoCartItem } from "@/lib/api/cocart";
import { getAuthToken } from "@/lib/api/auth";
import { useNotification } from "./NotificationContext";
import { useAuth } from "./AuthContext";
import { getBundleItems, getBundleItemsTotal } from "@/components/cart/BundleItemsList";
import { getBundleData } from "@/lib/utils/bundleStorage";

// Cache key now includes locale for proper multilingual support
const getCartCacheKey = (locale: string) => `/api/cart?locale=${locale}`;

// LocalStorage cache key for cart data (temporary caching strategy)
const CART_STORAGE_KEY = "asl_cart_cache";
const CART_CACHE_TTL = 5 * 60 * 1000; // 5 minutes TTL for localStorage cache

interface CachedCartData {
  cart: CoCartResponse;
  locale: string;
  timestamp: number;
}

// Get cached cart from localStorage
function getCachedCart(locale: string): CoCartResponse | null {
  if (typeof window === "undefined") return null;
  
  try {
    const cached = localStorage.getItem(CART_STORAGE_KEY);
    if (!cached) return null;
    
    const data: CachedCartData = JSON.parse(cached);
    
    // Check if cache is for the same locale and not expired
    if (data.locale !== locale) return null;
    if (Date.now() - data.timestamp > CART_CACHE_TTL) {
      localStorage.removeItem(CART_STORAGE_KEY);
      return null;
    }
    
    return data.cart;
  } catch {
    return null;
  }
}

// Save cart to localStorage cache
function setCachedCart(cart: CoCartResponse, locale: string): void {
  if (typeof window === "undefined") return;
  
  try {
    const data: CachedCartData = {
      cart,
      locale,
      timestamp: Date.now(),
    };
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Ignore storage errors (quota exceeded, etc.)
  }
}

// Clear cart cache from localStorage
function clearCachedCart(): void {
  if (typeof window === "undefined") return;
  
  try {
    localStorage.removeItem(CART_STORAGE_KEY);
  } catch {
    // Ignore storage errors
  }
}

function getHeaders(): HeadersInit {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  
  const token = getAuthToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  
  return headers;
}

// Fetcher that extracts locale from the cache key URL
async function cartFetcher(url: string): Promise<CoCartResponse | null> {
  const response = await fetch(url, {
    method: "GET",
    headers: getHeaders(),
  });

  const data = await response.json();
  
  if (!data.success) {
    console.error("Failed to fetch cart:", data.error?.message);
    return null;
  }
  
  return data.cart || null;
}

export interface SelectedCoupon {
  code: string;
  discount_type: "percent" | "fixed_cart" | "fixed_product";
  amount: string;
  minimum_amount: string;
  free_shipping: boolean;
}

interface CartItemData {
  wcpa_data?: Record<string, unknown>;
  bundle_items?: Array<{ product_id: number; quantity?: number }>;
  [key: string]: unknown;
}

interface CartContextType {
  cart: CoCartResponse | null;
  cartItems: CoCartItem[];
  isLoading: boolean;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  addToCart: (productId: number, quantity?: number, variationId?: number, variation?: Record<string, string>, itemData?: CartItemData) => Promise<void>;
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

interface CartProviderProps {
  children: React.ReactNode;
  locale: string;
}

export function CartProvider({ children, locale }: CartProviderProps) {
  // Use locale-aware cache key for proper multilingual support
  const cacheKey = getCartCacheKey(locale);
  
  // Get authentication state to refresh cart after login
  const { isAuthenticated, user } = useAuth();
  const wasAuthenticatedRef = useRef(isAuthenticated);
  
  // Use SWR for cart data - always start with null to match server-rendered HTML
  // and avoid React hydration error #418. LocalStorage cache is loaded post-mount.
  const { data: cart, isLoading: swrLoading, isValidating, mutate: mutateCart } = useSWR<CoCartResponse | null>(
    cacheKey,
    cartFetcher,
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      revalidateIfStale: true,
      dedupingInterval: 5000,
      errorRetryCount: 2,
      keepPreviousData: false,
    }
  );

  // Update localStorage cache whenever cart data changes
  useEffect(() => {
    if (cart) {
      setCachedCart(cart, locale);
    }
  }, [cart, locale]);

  // Seed SWR cache with localStorage data after hydration to avoid
  // server/client mismatch (React error #418). This runs only on the client
  // after the initial render, so both server and client start with null.
  useEffect(() => {
    const cached = getCachedCart(locale);
    if (cached) {
      mutateCart(cached, false);
    }
  }, [locale, mutateCart]);

  // Refresh cart when user logs in - this ensures the authenticated user's
  // cart is loaded immediately after login
  useEffect(() => {
    // Check if user just logged in (transition from not authenticated to authenticated)
    if (isAuthenticated && !wasAuthenticatedRef.current) {
      // Clear cached cart on login to ensure fresh data for authenticated user
      clearCachedCart();
      // Small delay to ensure auth cookies are set before fetching cart
      const timer = setTimeout(() => {
        mutateCart();
      }, 200);
      return () => clearTimeout(timer);
    }
    // Update the ref to track current auth state
    wasAuthenticatedRef.current = isAuthenticated;
  }, [isAuthenticated, user, mutateCart]);

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedCoupons, setSelectedCoupons] = useState<SelectedCoupon[]>([]);
  const [isOperationLoading, setIsOperationLoading] = useState(false);
  const { notify } = useNotification();

  // Combined loading state
  const isLoading = swrLoading || isOperationLoading || isValidating;

  const refreshCart = useCallback(async () => {
    await mutate(cacheKey);
  }, [cacheKey]);

  const addToCart = useCallback(
    async (productId: number, quantity = 1, variationId?: number, variation?: Record<string, string>, itemData?: CartItemData) => {
      setIsOperationLoading(true);
      
      // Optimistic update - add a placeholder item immediately
      const optimisticItem: CoCartItem = {
        item_key: `temp-${productId}-${Date.now()}`,
        id: productId,
        name: "Adding...",
        title: "Adding...",
        price: "0",
        quantity: { value: quantity, min_purchase: 1, max_purchase: 99 },
        totals: { subtotal: "0", subtotal_tax: "0", total: "0", tax: "0" },
        slug: "",
        meta: { product_type: "simple", sku: "", dimensions: { length: "", width: "", height: "", unit: "" }, weight: 0, variation: {} },
        backorders: "no",
        cart_item_data: itemData || {},
        featured_image: "",
      };

      // Optimistically update the cache
      await mutate(
        cacheKey,
        (currentCart: CoCartResponse | null | undefined) => {
          if (!currentCart) return currentCart;
          return {
            ...currentCart,
            items: [...currentCart.items, optimisticItem],
            item_count: currentCart.item_count + quantity,
          };
        },
        false // Don't revalidate yet
      );

      try {
        const body: Record<string, unknown> = { id: String(productId), quantity: String(quantity) };
        if (variationId) body.variation_id = String(variationId);
        if (variation) body.variation = variation;
        if (itemData) body.cart_item_data = itemData;

        const response = await fetch("/api/cart?action=add", {
          method: "POST",
          headers: getHeaders(),
          body: JSON.stringify(body),
        });

        const data = await response.json();

        if (!data.success) {
          // Rollback on error
          await mutate(cacheKey);
          notify("error", data.error?.message || "Failed to add item to cart");
          throw new Error(data.error?.message || "Failed to add item to cart");
        }

        // Update cache with actual data
        await mutate(cacheKey, data.cart, false);
        notify("cart", "Item added to cart");
        // Open cart drawer after successfully adding item
        setIsCartOpen(true);
      } catch (error) {
        // Rollback on error
        await mutate(cacheKey);
        console.error("Error adding to cart:", error);
        throw error;
      } finally {
        setIsOperationLoading(false);
      }
    },
    [notify, cacheKey]
  );

  const updateCartItem = useCallback(
    async (key: string, quantity: number) => {
      setIsOperationLoading(true);

      // Optimistically update the quantity
      await mutate(
        cacheKey,
        (currentCart: CoCartResponse | null | undefined) => {
          if (!currentCart) return currentCart;
          return {
            ...currentCart,
            items: currentCart.items.map((item) =>
              item.item_key === key ? { ...item, quantity: { ...item.quantity, value: quantity } } : item
            ),
          };
        },
        false
      );

      try {
        const response = await fetch(`/api/cart?action=update&item_key=${encodeURIComponent(key)}`, {
          method: "POST",
          headers: getHeaders(),
          body: JSON.stringify({ quantity: String(quantity) }),
        });

        const data = await response.json();

        if (!data.success) {
          await mutate(cacheKey);
          notify("error", data.error?.message || "Failed to update cart");
          throw new Error(data.error?.message || "Failed to update cart");
        }

        await mutate(cacheKey, data.cart, false);
        notify("cart", "Cart updated");
      } catch (error) {
        await mutate(cacheKey);
        console.error("Error updating cart:", error);
        throw error;
      } finally {
        setIsOperationLoading(false);
      }
    },
    [notify, cacheKey]
  );

  const removeCartItem = useCallback(
    async (key: string) => {
      setIsOperationLoading(true);

      // Optimistically remove the item
      await mutate(
        cacheKey,
        (currentCart: CoCartResponse | null | undefined) => {
          if (!currentCart) return currentCart;
          const removedItem = currentCart.items.find((item) => item.item_key === key);
          return {
            ...currentCart,
            items: currentCart.items.filter((item) => item.item_key !== key),
            item_count: currentCart.item_count - (removedItem?.quantity.value || 0),
          };
        },
        false
      );

      try {
        const response = await fetch(`/api/cart?action=remove&item_key=${encodeURIComponent(key)}`, {
          method: "POST",
          headers: getHeaders(),
        });

        const data = await response.json();

        if (!data.success) {
          await mutate(cacheKey);
          notify("error", data.error?.message || "Failed to remove item");
          throw new Error(data.error?.message || "Failed to remove item");
        }

        await mutate(cacheKey, data.cart, false);
        notify("cart", "Item removed from cart");
      } catch (error) {
        await mutate(cacheKey);
        console.error("Error removing from cart:", error);
        throw error;
      } finally {
        setIsOperationLoading(false);
      }
    },
    [notify, cacheKey]
  );

  const clearCart = useCallback(async () => {
    setIsOperationLoading(true);

    // Clear localStorage cache immediately
    clearCachedCart();

    // Optimistically clear the cart
    await mutate(
      cacheKey,
      (currentCart: CoCartResponse | null | undefined) => {
        if (!currentCart) return currentCart;
        return { ...currentCart, items: [], item_count: 0 };
      },
      false
    );

    try {
      const response = await fetch("/api/cart?action=clear", {
        method: "POST",
        headers: getHeaders(),
      });

      const data = await response.json();

      if (!data.success) {
        await mutate(cacheKey);
        throw new Error(data.error?.message || "Failed to clear cart");
      }

      await mutate(cacheKey, data.cart, false);
    } catch (error) {
      await mutate(cacheKey);
      console.error("Error clearing cart:", error);
      throw error;
    } finally {
      setIsOperationLoading(false);
    }
  }, [cacheKey]);

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

  const cartItems = useMemo(() => cart?.items || [], [cart?.items]);
  const cartItemsCount = cart?.item_count || 0;
  const rawCartSubtotal = cart?.totals?.subtotal || "0";
  const rawCartTotal = cart?.totals?.total || "0";

  // Calculate the total bundle items price across all cart items
  // This is needed because CoCart only knows about the base product price, not the bundle items
  // However, if pricing_mode is set (from PHP backend), the cart item price is already correct
  // and we should NOT add any adjustment to avoid double-counting
  const bundleItemsAdjustment = useMemo(() => {
    if (!cartItems || cartItems.length === 0) return 0;
    
    const currencyMinorUnit = cart?.currency?.currency_minor_unit ?? 2;
    const divisor = Math.pow(10, currencyMinorUnit);
    
    return cartItems.reduce((total, item) => {
      const bundleItems = getBundleItems(item);
      if (bundleItems && bundleItems.length > 0) {
        // Check if pricing_mode was explicitly set (not just defaulting to "sum")
        // We check both cart_item_data (from PHP) and localStorage (from bundle builder)
        // The localStorage uses the bundleStorage utility which stores data under "asl_bundle_cart_data"
        // with product IDs as keys
        const storedBundleData = getBundleData(item.id);
        const hasExplicitPricingMode = 
          item.cart_item_data?.pricing_mode !== undefined ||
          storedBundleData?.pricing_mode !== undefined;
        
        // If pricing_mode is explicitly set, skip adjustment - the bundle builder
        // has already calculated the correct total (either fixed price or sum)
        // and the cart item price reflects this
        if (hasExplicitPricingMode) {
          return total;
        }
        
        // Legacy fallback: if no pricing_mode anywhere, add bundle items total (old behavior)
        const bundleItemsTotal = getBundleItemsTotal(bundleItems);
        const quantity = item.quantity?.value || 1;
        // Convert to minor units (same format as CoCart subtotal)
        return total + (bundleItemsTotal * quantity * divisor);
      }
      return total;
    }, 0);
  }, [cartItems, cart?.currency?.currency_minor_unit]);

  // Adjusted cart subtotal that includes bundle items price
  // Round to avoid floating-point precision errors
  const cartSubtotal = useMemo(() => {
    const rawSubtotal = parseFloat(rawCartSubtotal) || 0;
    const total = rawSubtotal + bundleItemsAdjustment;
    // Round to nearest integer (minor units are already integers)
    return Math.round(total).toString();
  }, [rawCartSubtotal, bundleItemsAdjustment]);

  // Adjusted cart total that includes bundle items price
  // The total from CoCart doesn't include bundle items, so we need to add the adjustment
  // Round to avoid floating-point precision errors
  const cartTotal = useMemo(() => {
    const rawTotal = parseFloat(rawCartTotal) || 0;
    const total = rawTotal + bundleItemsAdjustment;
    // Round to nearest integer (minor units are already integers)
    return Math.round(total).toString();
  }, [rawCartTotal, bundleItemsAdjustment]);

  // Calculate coupon discount with proper rounding to avoid floating-point errors
  const couponDiscount = useMemo(() => {
    return selectedCoupons.reduce((total, coupon) => {
      const subtotal = parseFloat(cartSubtotal);
      const amount = parseFloat(coupon.amount);
      
      if (coupon.discount_type === "percent") {
        // Round percent discount to avoid floating-point precision errors
        const discount = Math.round(subtotal * amount / 100);
        return total + discount;
      } else if (coupon.discount_type === "fixed_cart") {
        return total + amount;
      }
      return total;
    }, 0);
  }, [selectedCoupons, cartSubtotal]);

  // Normalize cart to null if undefined (SWR returns undefined before first fetch)
  const normalizedCart = cart ?? null;

  return (
    <CartContext.Provider
      value={{
        cart: normalizedCart,
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
