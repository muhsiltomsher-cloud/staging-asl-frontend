"use client";

import { FormattedPrice } from "@/components/common/FormattedPrice";
import type { BundleItemsListProps } from "./types";
import { getBundleItems, getBundleItemsTotal, getBoxPrice, getPricingMode, getFixedPrice, getBundleTotal } from "./utils";

export function BundleItemsList({ item, locale, compact = false, showPrices = true }: BundleItemsListProps) {
  const bundleItems = getBundleItems(item);
  const isRTL = locale === "ar";

  if (!bundleItems || bundleItems.length === 0) {
    return null;
  }

  const cartQuantity = item.quantity?.value || 1;
  const baseBundleTotal = getBundleItemsTotal(bundleItems);
  const baseBoxPrice = getBoxPrice(item);
  const bundleTotal = baseBundleTotal * cartQuantity;
  const boxPrice = baseBoxPrice !== null ? baseBoxPrice * cartQuantity : null;
  
  const regularItems = bundleItems.filter(bi => !bi.is_addon && !bi.is_free);
  const addonItems = bundleItems.filter(bi => bi.is_addon && !bi.is_free);
  const freeItems = bundleItems.filter(bi => bi.is_free);
  
  const regularItemsTotal = getBundleItemsTotal(regularItems) * cartQuantity;
  const addonItemsTotal = getBundleItemsTotal(addonItems) * cartQuantity;
  
  const pricingMode = getPricingMode(item);
  const baseFixedPrice = getFixedPrice(item);
  const storedBundleTotal = getBundleTotal(item);
  
  const totalPrice = pricingMode === "fixed" 
    ? (baseFixedPrice !== null ? baseFixedPrice * cartQuantity : (storedBundleTotal !== null ? storedBundleTotal * cartQuantity : bundleTotal + (boxPrice || 0)))
    : bundleTotal + (boxPrice || 0);
  
  const isFixedPricing = pricingMode === "fixed";

  if (compact) {
    return (
      <div className="mt-1 text-xs text-gray-500">
        {regularItems.length > 0 && (
          <>
            <span className="font-medium">{isRTL ? "المنتجات:" : "Products:"}</span>
            <ul className="mt-0.5 space-y-0.5">
              {regularItems.map((bi, idx) => {
                const basePrice = typeof bi.price === "string" ? parseFloat(bi.price) : bi.price;
                const baseQty = bi.quantity || 1;
                const displayQty = baseQty * cartQuantity;
                const displayPrice = basePrice !== undefined ? basePrice * cartQuantity : undefined;
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
            {showPrices && !isFixedPricing && regularItemsTotal > 0 && (
              <div className="mt-0.5 flex items-center justify-between text-gray-500">
                <span className="text-[10px]">{isRTL ? "مجموع المنتجات:" : "Products Total:"}</span>
                <FormattedPrice price={regularItemsTotal} className="text-xs text-gray-500 flex-shrink-0" iconSize="xs" />
              </div>
            )}
          </>
        )}
        
        {addonItems.length > 0 && (
          <>
            <div className="mt-1 pt-1 border-t border-gray-100">
              <span className="font-medium text-amber-600">{isRTL ? "الإضافات:" : "Add-ons:"}</span>
            </div>
            <ul className="mt-0.5 space-y-0.5">
              {addonItems.map((bi, idx) => {
                const basePrice = typeof bi.price === "string" ? parseFloat(bi.price) : bi.price;
                const baseQty = bi.quantity || 1;
                const displayQty = baseQty * cartQuantity;
                const displayPrice = basePrice !== undefined ? basePrice * cartQuantity : undefined;
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

        {freeItems.length > 0 && (
          <>
            <div className="mt-1 pt-1 border-t border-gray-100">
              <span className="font-medium text-green-600">{isRTL ? "مجاني:" : "Free:"}</span>
            </div>
            <ul className="mt-0.5 space-y-0.5">
              {freeItems.map((bi, idx) => {
                const baseQty = bi.quantity || 1;
                const displayQty = baseQty * cartQuantity;
                return (
                  <li key={`free-${bi.product_id}-${idx}`} className="flex items-center justify-between gap-1">
                    <span className="flex items-center gap-1">
                      <span className="h-1 w-1 rounded-full bg-green-500 flex-shrink-0"></span>
                      <span className="truncate">{bi.name || `Product #${bi.product_id}`}</span>
                      <span className="text-gray-400 flex-shrink-0">x{displayQty}</span>
                    </span>
                    <span className="text-xs font-semibold text-green-600 flex-shrink-0">{isRTL ? "مجاني" : "FREE"}</span>
                  </li>
                );
              })}
            </ul>
          </>
        )}
        
        {showPrices && !isFixedPricing && bundleTotal > 0 && (
          <div className="mt-1 flex items-center justify-between border-t border-gray-200 pt-1">
            <span className="font-medium">{isRTL ? "مجموع المنتجات:" : "Items Total:"}</span>
            <FormattedPrice price={bundleTotal} className="text-xs font-medium text-amber-600" iconSize="xs" />
          </div>
        )}
        
        {showPrices && !isFixedPricing && boxPrice !== null && boxPrice > 0 && (
          <div className="flex items-center justify-between py-0.5">
            <span className="font-medium">{isRTL ? "سعر الصندوق:" : "Box Price:"}</span>
            <FormattedPrice price={boxPrice} className="text-xs text-gray-500 flex-shrink-0" iconSize="xs" />
          </div>
        )}
        
        {showPrices && (isFixedPricing || (boxPrice !== null && boxPrice > 0)) && (
          <div className="mt-1 flex items-center justify-between border-t border-gray-200 pt-1">
            <span className="font-medium">{isRTL ? (isFixedPricing ? "سعر الباقة:" : "الإجمالي:") : (isFixedPricing ? "Bundle Price:" : "Total:")}</span>
            <FormattedPrice price={totalPrice} className="text-xs font-medium text-amber-600" iconSize="xs" />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="mt-2 rounded-md bg-gray-50 p-3">
      {regularItems.length > 0 && (
        <>
          <p className="mb-2 text-xs font-medium text-gray-600">{isRTL ? "المنتجات:" : "Products:"}</p>
          <ul className="space-y-1.5">
            {regularItems.map((bi, idx) => {
              const basePrice = typeof bi.price === "string" ? parseFloat(bi.price) : bi.price;
              const baseQty = bi.quantity || 1;
              const displayQty = baseQty * cartQuantity;
              const displayPrice = basePrice !== undefined ? basePrice * cartQuantity : undefined;
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
          {showPrices && !isFixedPricing && regularItemsTotal > 0 && (
            <div className="mt-1.5 flex items-center justify-between text-gray-500">
              <span className="text-xs">{isRTL ? "مجموع المنتجات:" : "Products Total:"}</span>
              <FormattedPrice price={regularItemsTotal} className="text-xs text-gray-500 flex-shrink-0" iconSize="xs" />
            </div>
          )}
        </>
      )}
      
      {addonItems.length > 0 && (
        <>
          <div className="mt-3 pt-2 border-t border-gray-200">
            <p className="mb-2 text-xs font-medium text-amber-600">{isRTL ? "الإضافات:" : "Add-ons:"}</p>
          </div>
          <ul className="space-y-1.5">
            {addonItems.map((bi, idx) => {
              const basePrice = typeof bi.price === "string" ? parseFloat(bi.price) : bi.price;
              const baseQty = bi.quantity || 1;
              const displayQty = baseQty * cartQuantity;
              const displayPrice = basePrice !== undefined ? basePrice * cartQuantity : undefined;
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

      {freeItems.length > 0 && (
        <>
          <div className="mt-3 pt-2 border-t border-gray-200">
            <p className="mb-2 text-xs font-medium text-green-600">{isRTL ? "مجاني:" : "Free:"}</p>
          </div>
          <ul className="space-y-1.5">
            {freeItems.map((bi, idx) => {
              const baseQty = bi.quantity || 1;
              const displayQty = baseQty * cartQuantity;
              return (
                <li key={`free-${bi.product_id}-${idx}`} className="flex items-center justify-between gap-2 text-xs">
                  <span className="flex items-center gap-1.5 text-green-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-500 flex-shrink-0"></span>
                    <span>{bi.name || `Product #${bi.product_id}`}</span>
                    <span className="text-gray-400">x{displayQty}</span>
                  </span>
                  <span className="text-xs font-semibold text-green-600 flex-shrink-0">{isRTL ? "مجاني" : "FREE"}</span>
                </li>
              );
            })}
          </ul>
        </>
      )}
      
      {showPrices && !isFixedPricing && bundleTotal > 0 && (
        <div className="mt-2 flex items-center justify-between border-t border-gray-200 pt-2">
          <span className="text-xs font-medium text-gray-600">{isRTL ? "مجموع المنتجات:" : "Items Total:"}</span>
          <FormattedPrice price={bundleTotal} className="text-sm font-semibold text-amber-600" iconSize="xs" />
        </div>
      )}
      
      {showPrices && !isFixedPricing && boxPrice !== null && boxPrice > 0 && (
        <div className="flex items-center justify-between py-1">
          <span className="text-xs font-medium text-gray-600">{isRTL ? "سعر الصندوق:" : "Box Price:"}</span>
          <FormattedPrice price={boxPrice} className="text-xs font-medium text-gray-600 flex-shrink-0" iconSize="xs" />
        </div>
      )}
      
      {showPrices && (isFixedPricing || (boxPrice !== null && boxPrice > 0)) && (
        <div className="mt-1 flex items-center justify-between border-t border-gray-200 pt-2">
          <span className="text-xs font-medium text-gray-600">{isRTL ? (isFixedPricing ? "سعر الباقة:" : "الإجمالي:") : (isFixedPricing ? "Bundle Price:" : "Total:")}</span>
          <FormattedPrice price={totalPrice} className="text-sm font-semibold text-amber-600" iconSize="xs" />
        </div>
      )}
    </div>
  );
}
