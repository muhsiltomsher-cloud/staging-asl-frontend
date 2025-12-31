"use client";

import type { CoCartItem } from "@/lib/api/cocart";

interface BundleItem {
  product_id: number;
  name?: string;
  price?: number;
  quantity?: number;
}

interface BundleItemsListProps {
  item: CoCartItem;
  locale?: string;
  compact?: boolean;
}

/**
 * Safely extracts bundle items from cart item data
 */
export function getBundleItems(item: CoCartItem): BundleItem[] | null {
  try {
    const cartItemData = item.cart_item_data;
    if (!cartItemData) return null;

    let bundleItems = cartItemData.bundle_items;

    // Handle case where bundle_items might be a JSON string
    if (typeof bundleItems === "string") {
      try {
        bundleItems = JSON.parse(bundleItems);
      } catch {
        return null;
      }
    }

    // Validate it's an array
    if (!Array.isArray(bundleItems) || bundleItems.length === 0) {
      return null;
    }

    // Validate and map items
    return bundleItems
      .filter((item): item is BundleItem => 
        typeof item === "object" && 
        item !== null && 
        typeof item.product_id === "number"
      )
      .map((item) => ({
        product_id: item.product_id,
        name: typeof item.name === "string" ? item.name : undefined,
        price: typeof item.price === "number" ? item.price : undefined,
        quantity: typeof item.quantity === "number" ? item.quantity : undefined,
      }));
  } catch {
    return null;
  }
}

/**
 * Displays the list of products included in a bundle cart item
 */
export function BundleItemsList({ item, locale, compact = false }: BundleItemsListProps) {
  const bundleItems = getBundleItems(item);
  const isRTL = locale === "ar";

  if (!bundleItems || bundleItems.length === 0) {
    return null;
  }

  const label = isRTL ? "يشمل:" : "Includes:";

  if (compact) {
    // Compact view for mini-cart drawer
    return (
      <div className="mt-1 text-xs text-gray-500">
        <span className="font-medium">{label}</span>{" "}
        {bundleItems.map((bi, idx) => (
          <span key={bi.product_id}>
            {bi.name || `Product #${bi.product_id}`}
            {idx < bundleItems.length - 1 && ", "}
          </span>
        ))}
      </div>
    );
  }

  // Full view for cart page
  return (
    <div className="mt-2 rounded-md bg-gray-50 p-2">
      <p className="mb-1 text-xs font-medium text-gray-600">{label}</p>
      <ul className="space-y-0.5">
        {bundleItems.map((bi) => (
          <li key={bi.product_id} className="flex items-center gap-1 text-xs text-gray-500">
            <span className="h-1 w-1 rounded-full bg-amber-500"></span>
            <span>{bi.name || `Product #${bi.product_id}`}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
