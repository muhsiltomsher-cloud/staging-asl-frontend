"use client";

import type { CoCartItem } from "@/lib/api/cocart";
import { FormattedPrice } from "@/components/common/FormattedPrice";

interface BundleItem {
  product_id: number;
  name?: string;
  price?: number | string;
  quantity?: number;
}

interface BundleItemsListProps {
  item: CoCartItem;
  locale?: string;
  compact?: boolean;
  showPrices?: boolean;
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
        price: typeof item.price === "number" || typeof item.price === "string" ? item.price : undefined,
        quantity: typeof item.quantity === "number" ? item.quantity : undefined,
      }));
  } catch {
    return null;
  }
}

/**
 * Calculates the total price of all bundle items
 */
export function getBundleItemsTotal(bundleItems: BundleItem[]): number {
  return bundleItems.reduce((total, item) => {
    const price = typeof item.price === "string" ? parseFloat(item.price) : (item.price || 0);
    const quantity = item.quantity || 1;
    return total + (price * quantity);
  }, 0);
}

/**
 * Displays the list of products included in a bundle cart item
 */
export function BundleItemsList({ item, locale, compact = false, showPrices = true }: BundleItemsListProps) {
  const bundleItems = getBundleItems(item);
  const isRTL = locale === "ar";

  if (!bundleItems || bundleItems.length === 0) {
    return null;
  }

  const label = isRTL ? "يشمل:" : "Includes:";
  const bundleTotal = getBundleItemsTotal(bundleItems);

  if (compact) {
    // Compact view for mini-cart drawer - show names with prices
    return (
      <div className="mt-1 text-xs text-gray-500">
        <span className="font-medium">{label}</span>
        <ul className="mt-0.5 space-y-0.5">
          {bundleItems.map((bi, idx) => {
            const price = typeof bi.price === "string" ? parseFloat(bi.price) : bi.price;
            return (
              <li key={`${bi.product_id}-${idx}`} className="flex items-center justify-between gap-1">
                <span className="flex items-center gap-1">
                  <span className="h-1 w-1 rounded-full bg-amber-500 flex-shrink-0"></span>
                  <span className="truncate">{bi.name || `Product #${bi.product_id}`}</span>
                </span>
                {showPrices && price !== undefined && price > 0 && (
                  <FormattedPrice price={price} className="text-xs text-gray-400 flex-shrink-0" iconSize="xs" />
                )}
              </li>
            );
          })}
        </ul>
        {showPrices && bundleTotal > 0 && (
          <div className="mt-1 flex items-center justify-between border-t border-gray-200 pt-1">
            <span className="font-medium">{isRTL ? "المجموع:" : "Bundle Total:"}</span>
            <FormattedPrice price={bundleTotal} className="text-xs font-medium text-amber-600" iconSize="xs" />
          </div>
        )}
      </div>
    );
  }

  // Full view for cart page - show detailed breakdown with prices
  return (
    <div className="mt-2 rounded-md bg-gray-50 p-3">
      <p className="mb-2 text-xs font-medium text-gray-600">{label}</p>
      <ul className="space-y-1.5">
        {bundleItems.map((bi, idx) => {
          const price = typeof bi.price === "string" ? parseFloat(bi.price) : bi.price;
          return (
            <li key={`${bi.product_id}-${idx}`} className="flex items-center justify-between gap-2 text-xs">
              <span className="flex items-center gap-1.5 text-gray-600">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500 flex-shrink-0"></span>
                <span>{bi.name || `Product #${bi.product_id}`}</span>
                {bi.quantity && bi.quantity > 1 && (
                  <span className="text-gray-400">x{bi.quantity}</span>
                )}
              </span>
              {showPrices && price !== undefined && price > 0 && (
                <FormattedPrice price={price} className="text-xs text-gray-500 flex-shrink-0" iconSize="xs" />
              )}
            </li>
          );
        })}
      </ul>
      {showPrices && bundleTotal > 0 && (
        <div className="mt-2 flex items-center justify-between border-t border-gray-200 pt-2">
          <span className="text-xs font-medium text-gray-600">{isRTL ? "مجموع الحزمة:" : "Bundle Total:"}</span>
          <FormattedPrice price={bundleTotal} className="text-sm font-semibold text-amber-600" iconSize="xs" />
        </div>
      )}
    </div>
  );
}
