"use client";

import type { CoCartItem } from "@/lib/api/cocart";
import { FormattedPrice } from "@/components/common/FormattedPrice";

interface BundleItem {
  product_id: number;
  name?: string;
  price?: number | string;
  quantity?: number;
  is_addon?: boolean;
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
        is_addon: typeof item.is_addon === "boolean" ? item.is_addon : undefined,
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
 * Extracts box price from cart item data, or calculates it from item price minus bundle items total
 */
export function getBoxPrice(item: CoCartItem, bundleItemsTotal?: number): number | null {
  try {
    const cartItemData = item.cart_item_data;
    
    // First try to get box_price from cart_item_data
    if (cartItemData) {
      const boxPrice = cartItemData.box_price;
      if (typeof boxPrice === "number" && boxPrice > 0) return boxPrice;
      if (typeof boxPrice === "string" && parseFloat(boxPrice) > 0) return parseFloat(boxPrice);
    }
    
    // Fallback: calculate box price from item price minus bundle items total
    // This handles cases where cart_item_data.box_price is not stored correctly by CoCart
    if (bundleItemsTotal !== undefined && bundleItemsTotal > 0) {
      // Get the item's total price (the bundle price)
      const itemPrice = item.totals?.total 
        ? parseFloat(item.totals.total) / 100 // CoCart returns prices in cents
        : item.price 
          ? parseFloat(item.price)
          : null;
      
      if (itemPrice !== null && itemPrice > bundleItemsTotal) {
        const calculatedBoxPrice = itemPrice - bundleItemsTotal;
        // Only return if the calculated box price is reasonable (positive and not too small)
        if (calculatedBoxPrice > 0) {
          return calculatedBoxPrice;
        }
      }
    }
    
    return null;
  } catch {
    return null;
  }
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

  const bundleTotal = getBundleItemsTotal(bundleItems);
  
  // Get box price - pass bundleTotal for fallback calculation
  const boxPrice = getBoxPrice(item, bundleTotal);
  
  // Separate regular items from add-ons
  const regularItems = bundleItems.filter(bi => !bi.is_addon);
  const addonItems = bundleItems.filter(bi => bi.is_addon);
  
  // Calculate totals for each category
  const regularItemsTotal = getBundleItemsTotal(regularItems);
  const addonItemsTotal = getBundleItemsTotal(addonItems);

  // Calculate total (items + box)
  const totalPrice = bundleTotal + (boxPrice || 0);

  if (compact) {
    // Compact view for mini-cart drawer - show names with prices
    return (
      <div className="mt-1 text-xs text-gray-500">
        {/* Regular Items */}
        {regularItems.length > 0 && (
          <>
            <span className="font-medium">{isRTL ? "المنتجات:" : "Products:"}</span>
            <ul className="mt-0.5 space-y-0.5">
              {regularItems.map((bi, idx) => {
                const price = typeof bi.price === "string" ? parseFloat(bi.price) : bi.price;
                const qty = bi.quantity || 1;
                return (
                  <li key={`${bi.product_id}-${idx}`} className="flex items-center justify-between gap-1">
                    <span className="flex items-center gap-1">
                      <span className="h-1 w-1 rounded-full bg-amber-500 flex-shrink-0"></span>
                      <span className="truncate">{bi.name || `Product #${bi.product_id}`}</span>
                      <span className="text-gray-400 flex-shrink-0">x{qty}</span>
                    </span>
                    {showPrices && price !== undefined && price > 0 && (
                      <FormattedPrice price={price} className="text-xs text-gray-400 flex-shrink-0" iconSize="xs" />
                    )}
                  </li>
                );
              })}
            </ul>
            {showPrices && regularItemsTotal > 0 && (
              <div className="mt-0.5 flex items-center justify-between text-gray-500">
                <span className="text-[10px]">{isRTL ? "مجموع المنتجات:" : "Products Total:"}</span>
                <FormattedPrice price={regularItemsTotal} className="text-xs text-gray-500 flex-shrink-0" iconSize="xs" />
              </div>
            )}
          </>
        )}
        
        {/* Add-on Items */}
        {addonItems.length > 0 && (
          <>
            <div className="mt-1 pt-1 border-t border-gray-100">
              <span className="font-medium text-amber-600">{isRTL ? "الإضافات:" : "Add-ons:"}</span>
            </div>
            <ul className="mt-0.5 space-y-0.5">
              {addonItems.map((bi, idx) => {
                const price = typeof bi.price === "string" ? parseFloat(bi.price) : bi.price;
                const qty = bi.quantity || 1;
                return (
                  <li key={`addon-${bi.product_id}-${idx}`} className="flex items-center justify-between gap-1">
                    <span className="flex items-center gap-1">
                      <span className="h-1 w-1 rounded-full bg-amber-600 flex-shrink-0"></span>
                      <span className="truncate">{bi.name || `Product #${bi.product_id}`}</span>
                      <span className="text-amber-400 flex-shrink-0">x{qty}</span>
                    </span>
                    {showPrices && price !== undefined && price > 0 && (
                      <FormattedPrice price={price} className="text-xs text-amber-500 flex-shrink-0" iconSize="xs" />
                    )}
                  </li>
                );
              })}
            </ul>
            {showPrices && addonItemsTotal > 0 && (
              <div className="mt-0.5 flex items-center justify-between text-amber-600">
                <span className="text-[10px]">{isRTL ? "مجموع الإضافات:" : "Add-ons Total:"}</span>
                <FormattedPrice price={addonItemsTotal} className="text-xs text-amber-600 flex-shrink-0" iconSize="xs" />
              </div>
            )}
          </>
        )}
        
        {/* Items Total */}
        {showPrices && bundleTotal > 0 && (
          <div className="mt-1 flex items-center justify-between border-t border-gray-200 pt-1">
            <span className="font-medium">{isRTL ? "مجموع المنتجات:" : "Items Total:"}</span>
            <FormattedPrice price={bundleTotal} className="text-xs font-medium text-amber-600" iconSize="xs" />
          </div>
        )}
        
        {/* Box Price */}
        {showPrices && boxPrice !== null && boxPrice > 0 && (
          <div className="flex items-center justify-between py-0.5">
            <span className="font-medium">{isRTL ? "سعر الصندوق:" : "Box Price:"}</span>
            <FormattedPrice price={boxPrice} className="text-xs text-gray-500 flex-shrink-0" iconSize="xs" />
          </div>
        )}
        
        {/* Total */}
        {showPrices && boxPrice !== null && boxPrice > 0 && (
          <div className="mt-1 flex items-center justify-between border-t border-gray-200 pt-1">
            <span className="font-medium">{isRTL ? "الإجمالي:" : "Total:"}</span>
            <FormattedPrice price={totalPrice} className="text-xs font-medium text-amber-600" iconSize="xs" />
          </div>
        )}
      </div>
    );
  }

  // Full view for cart page - show detailed breakdown with prices
  return (
    <div className="mt-2 rounded-md bg-gray-50 p-3">
      {/* Regular Items */}
      {regularItems.length > 0 && (
        <>
          <p className="mb-2 text-xs font-medium text-gray-600">{isRTL ? "المنتجات:" : "Products:"}</p>
          <ul className="space-y-1.5">
            {regularItems.map((bi, idx) => {
              const price = typeof bi.price === "string" ? parseFloat(bi.price) : bi.price;
              const qty = bi.quantity || 1;
              return (
                <li key={`${bi.product_id}-${idx}`} className="flex items-center justify-between gap-2 text-xs">
                  <span className="flex items-center gap-1.5 text-gray-600">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500 flex-shrink-0"></span>
                    <span>{bi.name || `Product #${bi.product_id}`}</span>
                    <span className="text-gray-400">x{qty}</span>
                  </span>
                  {showPrices && price !== undefined && price > 0 && (
                    <FormattedPrice price={price} className="text-xs text-gray-500 flex-shrink-0" iconSize="xs" />
                  )}
                </li>
              );
            })}
          </ul>
          {showPrices && regularItemsTotal > 0 && (
            <div className="mt-1.5 flex items-center justify-between text-gray-500">
              <span className="text-xs">{isRTL ? "مجموع المنتجات:" : "Products Total:"}</span>
              <FormattedPrice price={regularItemsTotal} className="text-xs text-gray-500 flex-shrink-0" iconSize="xs" />
            </div>
          )}
        </>
      )}
      
      {/* Add-on Items */}
      {addonItems.length > 0 && (
        <>
          <div className="mt-3 pt-2 border-t border-gray-200">
            <p className="mb-2 text-xs font-medium text-amber-600">{isRTL ? "الإضافات:" : "Add-ons:"}</p>
          </div>
          <ul className="space-y-1.5">
            {addonItems.map((bi, idx) => {
              const price = typeof bi.price === "string" ? parseFloat(bi.price) : bi.price;
              const qty = bi.quantity || 1;
              return (
                <li key={`addon-${bi.product_id}-${idx}`} className="flex items-center justify-between gap-2 text-xs">
                  <span className="flex items-center gap-1.5 text-amber-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-600 flex-shrink-0"></span>
                    <span>{bi.name || `Product #${bi.product_id}`}</span>
                    <span className="text-amber-400">x{qty}</span>
                  </span>
                  {showPrices && price !== undefined && price > 0 && (
                    <FormattedPrice price={price} className="text-xs text-amber-500 flex-shrink-0" iconSize="xs" />
                  )}
                </li>
              );
            })}
          </ul>
          {showPrices && addonItemsTotal > 0 && (
            <div className="mt-1.5 flex items-center justify-between text-amber-600">
              <span className="text-xs">{isRTL ? "مجموع الإضافات:" : "Add-ons Total:"}</span>
              <FormattedPrice price={addonItemsTotal} className="text-xs text-amber-600 flex-shrink-0" iconSize="xs" />
            </div>
          )}
        </>
      )}
      
      {/* Items Total */}
      {showPrices && bundleTotal > 0 && (
        <div className="mt-2 flex items-center justify-between border-t border-gray-200 pt-2">
          <span className="text-xs font-medium text-gray-600">{isRTL ? "مجموع المنتجات:" : "Items Total:"}</span>
          <FormattedPrice price={bundleTotal} className="text-sm font-semibold text-amber-600" iconSize="xs" />
        </div>
      )}
      
      {/* Box Price */}
      {showPrices && boxPrice !== null && boxPrice > 0 && (
        <div className="flex items-center justify-between py-1">
          <span className="text-xs font-medium text-gray-600">{isRTL ? "سعر الصندوق:" : "Box Price:"}</span>
          <FormattedPrice price={boxPrice} className="text-xs font-medium text-gray-600 flex-shrink-0" iconSize="xs" />
        </div>
      )}
      
      {/* Total */}
      {showPrices && boxPrice !== null && boxPrice > 0 && (
        <div className="mt-1 flex items-center justify-between border-t border-gray-200 pt-2">
          <span className="text-xs font-medium text-gray-600">{isRTL ? "الإجمالي:" : "Total:"}</span>
          <FormattedPrice price={totalPrice} className="text-sm font-semibold text-amber-600" iconSize="xs" />
        </div>
      )}
    </div>
  );
}
