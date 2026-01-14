import type { CoCartItem } from "@/lib/api/cocart";
import { getBundleData } from "@/lib/utils/bundleStorage";
import type { BundleItem } from "./types";

export function getBundleItems(item: CoCartItem): BundleItem[] | null {
  try {
    const cartItemData = item.cart_item_data;
    let bundleItems = cartItemData?.bundle_items;

    if (typeof bundleItems === "string") {
      try {
        bundleItems = JSON.parse(bundleItems);
      } catch {
        bundleItems = null;
      }
    }

    if (!Array.isArray(bundleItems) || bundleItems.length === 0) {
      const storedData = getBundleData(item.id);
      if (storedData?.bundle_items) {
        bundleItems = storedData.bundle_items;
      }
    }

    if (!Array.isArray(bundleItems) || bundleItems.length === 0) {
      return null;
    }

    return bundleItems
      .filter((bundleItem): bundleItem is BundleItem => 
        typeof bundleItem === "object" && 
        bundleItem !== null && 
        typeof bundleItem.product_id === "number"
      )
      .map((bundleItem) => ({
        product_id: bundleItem.product_id,
        name: typeof bundleItem.name === "string" ? bundleItem.name : undefined,
        price: typeof bundleItem.price === "number" || typeof bundleItem.price === "string" ? bundleItem.price : undefined,
        quantity: typeof bundleItem.quantity === "number" ? bundleItem.quantity : undefined,
        is_addon: typeof bundleItem.is_addon === "boolean" ? bundleItem.is_addon : undefined,
      }));
  } catch {
    return null;
  }
}

export function getBundleItemsTotal(bundleItems: BundleItem[]): number {
  return bundleItems.reduce((total, item) => {
    const price = typeof item.price === "string" ? parseFloat(item.price) : (item.price || 0);
    const quantity = item.quantity || 1;
    return total + (price * quantity);
  }, 0);
}

export function getBoxPrice(item: CoCartItem): number | null {
  try {
    const cartItemData = item.cart_item_data;
    
    if (cartItemData) {
      const boxPrice = cartItemData.box_price;
      if (typeof boxPrice === "number" && boxPrice > 0) return boxPrice;
      if (typeof boxPrice === "string" && parseFloat(boxPrice) > 0) return parseFloat(boxPrice);
    }
    
    const storedData = getBundleData(item.id);
    if (storedData?.box_price !== undefined) {
      const storedBoxPrice = storedData.box_price;
      if (typeof storedBoxPrice === "number" && storedBoxPrice > 0) return storedBoxPrice;
    }
    
    return null;
  } catch {
    return null;
  }
}

export function getPricingMode(item: CoCartItem): "sum" | "fixed" {
  try {
    const cartItemData = item.cart_item_data;
    
    if (cartItemData) {
      const pricingMode = cartItemData.pricing_mode;
      if (pricingMode === "fixed" || pricingMode === "sum") return pricingMode;
    }
    
    const storedData = getBundleData(item.id);
    if (storedData?.pricing_mode === "fixed" || storedData?.pricing_mode === "sum") {
      return storedData.pricing_mode;
    }
    
    return "sum";
  } catch {
    return "sum";
  }
}

export function getFixedPrice(item: CoCartItem): number | null {
  try {
    const cartItemData = item.cart_item_data;
    
    if (cartItemData) {
      const fixedPrice = cartItemData.fixed_price;
      if (typeof fixedPrice === "number" && fixedPrice > 0) return fixedPrice;
      if (typeof fixedPrice === "string" && parseFloat(fixedPrice) > 0) return parseFloat(fixedPrice);
    }
    
    const storedData = getBundleData(item.id);
    if (storedData?.fixed_price !== undefined) {
      const storedFixedPrice = storedData.fixed_price;
      if (typeof storedFixedPrice === "number" && storedFixedPrice > 0) return storedFixedPrice;
    }
    
    return null;
  } catch {
    return null;
  }
}

export function getBundleTotal(item: CoCartItem): number | null {
  try {
    const cartItemData = item.cart_item_data;
    
    if (cartItemData) {
      const bundleTotal = cartItemData.bundle_total;
      if (typeof bundleTotal === "number" && bundleTotal > 0) return bundleTotal;
      if (typeof bundleTotal === "string" && parseFloat(bundleTotal) > 0) return parseFloat(bundleTotal);
    }
    
    const storedData = getBundleData(item.id);
    if (storedData?.bundle_total !== undefined) {
      const storedBundleTotal = storedData.bundle_total;
      if (typeof storedBundleTotal === "number" && storedBundleTotal > 0) return storedBundleTotal;
    }
    
    return null;
  } catch {
    return null;
  }
}
