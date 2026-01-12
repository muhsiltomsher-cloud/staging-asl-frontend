"use client";

import type { OrderLineItem, OrderLineItemMetaData } from "@/lib/api/customer";
import { FormattedPrice } from "@/components/common/FormattedPrice";

interface BundleItem {
  product_id: number;
  name?: string;
  price?: number | string;
  quantity?: number;
  is_addon?: boolean;
}

interface OrderBundleItemsListProps {
  item: OrderLineItem;
  locale?: string;
  compact?: boolean;
  showPrices?: boolean;
}

/**
 * Safely extracts bundle items from order line item meta_data
 */
export function getOrderBundleItems(item: OrderLineItem): BundleItem[] | null {
  try {
    const metaData = item.meta_data;
    if (!metaData || !Array.isArray(metaData)) return null;

    // Look for bundle_items in meta_data
    const bundleItemsMeta = metaData.find(
      (meta: OrderLineItemMetaData) => meta.key === "_bundle_items" || meta.key === "bundle_items"
    );

    if (!bundleItemsMeta) return null;

    let bundleItems = bundleItemsMeta.value;

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
      .filter((bi): bi is BundleItem => 
        typeof bi === "object" && 
        bi !== null && 
        typeof bi.product_id === "number"
      )
      .map((bi) => ({
        product_id: bi.product_id,
        name: typeof bi.name === "string" ? bi.name : undefined,
        price: typeof bi.price === "number" || typeof bi.price === "string" ? bi.price : undefined,
        quantity: typeof bi.quantity === "number" ? bi.quantity : undefined,
        is_addon: typeof bi.is_addon === "boolean" ? bi.is_addon : undefined,
      }));
  } catch {
    return null;
  }
}

/**
 * Calculates the total price of all bundle items
 */
export function getOrderBundleItemsTotal(bundleItems: BundleItem[]): number {
  return bundleItems.reduce((total, item) => {
    const price = typeof item.price === "string" ? parseFloat(item.price) : (item.price || 0);
    const quantity = item.quantity || 1;
    return total + (price * quantity);
  }, 0);
}

/**
 * Extracts box price from order line item meta_data
 */
export function getOrderBoxPrice(item: OrderLineItem, bundleItemsTotal?: number): number | null {
  try {
    const metaData = item.meta_data;
    if (!metaData || !Array.isArray(metaData)) return null;

    // Look for box_price in meta_data
    const boxPriceMeta = metaData.find(
      (meta: OrderLineItemMetaData) => meta.key === "_box_price" || meta.key === "box_price"
    );

    if (boxPriceMeta) {
      const boxPrice = boxPriceMeta.value;
      if (typeof boxPrice === "number" && boxPrice > 0) return boxPrice;
      if (typeof boxPrice === "string" && parseFloat(boxPrice) > 0) return parseFloat(boxPrice);
    }

    // Fallback: calculate box price from item total minus bundle items total
    if (bundleItemsTotal !== undefined && bundleItemsTotal > 0) {
      const itemTotal = parseFloat(item.total);
      if (itemTotal > bundleItemsTotal) {
        const calculatedBoxPrice = itemTotal - bundleItemsTotal;
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
 * Checks if an order line item is a free gift
 */
export function isOrderFreeGift(item: OrderLineItem): boolean {
  try {
    const metaData = item.meta_data;
    if (!metaData || !Array.isArray(metaData)) return false;

    // Check for free gift flag in meta_data
    const freeGiftMeta = metaData.find(
      (meta: OrderLineItemMetaData) => 
        meta.key === "_asl_free_gift" || 
        meta.key === "asl_free_gift" ||
        meta.key === "_is_free_gift" ||
        meta.key === "is_free_gift"
    );

    if (freeGiftMeta) {
      const value = freeGiftMeta.value;
      return value === true || value === "1" || value === "yes" || value === 1;
    }

    // Also check if the item total is 0 and has "free" or "gift" in the name
    const itemTotal = parseFloat(item.total);
    if (itemTotal === 0) {
      const nameLower = item.name.toLowerCase();
      if (nameLower.includes("free") || nameLower.includes("gift")) {
        return true;
      }
    }

    return false;
  } catch {
    return false;
  }
}

/**
 * Checks if an order line item is a bundle product
 */
export function isOrderBundleProduct(item: OrderLineItem): boolean {
  const bundleItems = getOrderBundleItems(item);
  return bundleItems !== null && bundleItems.length > 0;
}

/**
 * Displays the list of products included in a bundle order line item
 */
export function OrderBundleItemsList({ item, locale, compact = false, showPrices = true }: OrderBundleItemsListProps) {
  const bundleItems = getOrderBundleItems(item);
  const isRTL = locale === "ar";

  if (!bundleItems || bundleItems.length === 0) {
    return null;
  }

  // Get the order item quantity (how many bundles were ordered)
  const orderQuantity = item.quantity || 1;

  // Calculate base totals (for 1 bundle)
  const baseBundleTotal = getOrderBundleItemsTotal(bundleItems);
  
  // Get box price per bundle - pass baseBundleTotal for fallback calculation
  const baseBoxPrice = getOrderBoxPrice(item, baseBundleTotal);
  
  // Multiply by order quantity for display
  const bundleTotal = baseBundleTotal * orderQuantity;
  const boxPrice = baseBoxPrice !== null ? baseBoxPrice * orderQuantity : null;
  
  // Separate regular items from add-ons
  const regularItems = bundleItems.filter(bi => !bi.is_addon);
  const addonItems = bundleItems.filter(bi => bi.is_addon);
  
  // Calculate totals for each category (multiplied by order quantity)
  const regularItemsTotal = getOrderBundleItemsTotal(regularItems) * orderQuantity;
  const addonItemsTotal = getOrderBundleItemsTotal(addonItems) * orderQuantity;

  // Calculate total (items + box)
  const totalPrice = bundleTotal + (boxPrice || 0);

  if (compact) {
    // Compact view for order list - show names with prices
    return (
      <div className="mt-1 text-xs text-gray-500">
        {/* Regular Items */}
        {regularItems.length > 0 && (
          <>
            <span className="font-medium">{isRTL ? "المنتجات:" : "Products:"}</span>
            <ul className="mt-0.5 space-y-0.5">
              {regularItems.map((bi, idx) => {
                const basePrice = typeof bi.price === "string" ? parseFloat(bi.price) : bi.price;
                const baseQty = bi.quantity || 1;
                const displayQty = baseQty * orderQuantity;
                const displayPrice = basePrice !== undefined ? basePrice * orderQuantity : undefined;
                return (
                  <li key={`${bi.product_id}-${idx}`} className="flex items-center justify-between gap-1">
                    <span className="flex items-center gap-1">
                      <span className="h-1 w-1 rounded-full bg-amber-500 flex-shrink-0"></span>
                      <span className="truncate">{bi.name || `Product #${bi.product_id}`}</span>
                      <span className="text-gray-400 flex-shrink-0">x{displayQty}</span>
                    </span>
                    {showPrices && displayPrice !== undefined && displayPrice > 0 && (
                      <FormattedPrice price={displayPrice} className="text-xs text-gray-400 flex-shrink-0" iconSize="xs" />
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
                const basePrice = typeof bi.price === "string" ? parseFloat(bi.price) : bi.price;
                const baseQty = bi.quantity || 1;
                const displayQty = baseQty * orderQuantity;
                const displayPrice = basePrice !== undefined ? basePrice * orderQuantity : undefined;
                return (
                  <li key={`addon-${bi.product_id}-${idx}`} className="flex items-center justify-between gap-1">
                    <span className="flex items-center gap-1">
                      <span className="h-1 w-1 rounded-full bg-amber-600 flex-shrink-0"></span>
                      <span className="truncate">{bi.name || `Product #${bi.product_id}`}</span>
                      <span className="text-amber-400 flex-shrink-0">x{displayQty}</span>
                    </span>
                    {showPrices && displayPrice !== undefined && displayPrice > 0 && (
                      <FormattedPrice price={displayPrice} className="text-xs text-amber-500 flex-shrink-0" iconSize="xs" />
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

  // Full view for order detail page - show detailed breakdown with prices
  return (
    <div className="mt-2 rounded-md bg-gray-50 p-3">
      {/* Regular Items */}
      {regularItems.length > 0 && (
        <>
          <p className="mb-2 text-xs font-medium text-gray-600">{isRTL ? "المنتجات:" : "Products:"}</p>
          <ul className="space-y-1.5">
            {regularItems.map((bi, idx) => {
              const basePrice = typeof bi.price === "string" ? parseFloat(bi.price) : bi.price;
              const baseQty = bi.quantity || 1;
              const displayQty = baseQty * orderQuantity;
              const displayPrice = basePrice !== undefined ? basePrice * orderQuantity : undefined;
              return (
                <li key={`${bi.product_id}-${idx}`} className="flex items-center justify-between gap-2 text-xs">
                  <span className="flex items-center gap-1.5 text-gray-600">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500 flex-shrink-0"></span>
                    <span>{bi.name || `Product #${bi.product_id}`}</span>
                    <span className="text-gray-400">x{displayQty}</span>
                  </span>
                  {showPrices && displayPrice !== undefined && displayPrice > 0 && (
                    <FormattedPrice price={displayPrice} className="text-xs text-gray-500 flex-shrink-0" iconSize="xs" />
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
              const basePrice = typeof bi.price === "string" ? parseFloat(bi.price) : bi.price;
              const baseQty = bi.quantity || 1;
              const displayQty = baseQty * orderQuantity;
              const displayPrice = basePrice !== undefined ? basePrice * orderQuantity : undefined;
              return (
                <li key={`addon-${bi.product_id}-${idx}`} className="flex items-center justify-between gap-2 text-xs">
                  <span className="flex items-center gap-1.5 text-amber-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-600 flex-shrink-0"></span>
                    <span>{bi.name || `Product #${bi.product_id}`}</span>
                    <span className="text-amber-400">x{displayQty}</span>
                  </span>
                  {showPrices && displayPrice !== undefined && displayPrice > 0 && (
                    <FormattedPrice price={displayPrice} className="text-xs text-amber-500 flex-shrink-0" iconSize="xs" />
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
