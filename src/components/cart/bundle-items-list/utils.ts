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
