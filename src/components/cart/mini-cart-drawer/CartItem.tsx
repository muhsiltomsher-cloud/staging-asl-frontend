"use client";

import Image from "next/image";
import { Minus, Plus, Trash2, ShoppingBag, Gift } from "lucide-react";
import { FormattedPrice } from "@/components/common/FormattedPrice";
import { BundleItemsList } from "@/components/cart/BundleItemsList";
import type { CartItemProps } from "./types";

export function CartItem({
  item,
  locale,
  dictionary,
  isLoading,
  isUpdating,
  isGiftItem,
  isNewlyAddedGift,
  divisor,
  onQuantityChange,
  onRemove,
}: CartItemProps) {
  return (
    <li 
      className={`p-4 transition-all duration-500 ${isGiftItem ? "bg-gradient-to-r from-amber-50 to-orange-50" : ""} ${isNewlyAddedGift ? "animate-pulse ring-2 ring-amber-400 ring-inset" : ""}`}
    >
      <div className="flex gap-4">
        <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
          {item.featured_image ? (
            <Image
              src={item.featured_image}
              alt={item.name}
              fill
              sizes="80px"
              className="object-cover"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <ShoppingBag className="h-8 w-8 text-gray-400" />
            </div>
          )}
          {isGiftItem && (
            <div className="absolute top-0 left-0 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-br-lg flex items-center gap-0.5">
              <Gift className="h-3 w-3" />
              FREE
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col">
          <div className="flex justify-between">
            <h3 className="text-sm font-medium text-gray-900 line-clamp-2">
              {item.name}
            </h3>
            {!isGiftItem && (
              <button
                onClick={() => onRemove(item.item_key)}
                className="text-gray-400 hover:text-red-500 transition-colors"
                aria-label={dictionary.remove}
                disabled={isLoading}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>

          {isGiftItem ? (
            <p className="mt-1 text-sm font-medium text-amber-600 inline-flex items-center gap-1">
              <Gift className="h-3 w-3" />
              {locale === "ar" ? "هدية مجانية" : "Free Gift"}
            </p>
          ) : (
            <p className="mt-1 text-sm font-medium text-gray-900 inline-flex items-center gap-1">
              <FormattedPrice
                price={parseFloat(item.price) / divisor}
                iconSize="xs"
              /> x {item.quantity.value}
            </p>
          )}

          <BundleItemsList item={item} locale={locale} compact />

          {!isGiftItem && (
            <div className="mt-2 flex items-center gap-2">
              <button
                onClick={() =>
                  onQuantityChange(
                    item.item_key,
                    item.quantity.value - 1
                  )
                }
                className="flex h-8 w-8 items-center justify-center rounded-full border hover:bg-[#633d1f] hover:text-white hover:border-[#633d1f] disabled:opacity-50 transition-colors"
                disabled={isLoading || isUpdating || item.quantity.value <= 1}
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-8 text-center text-sm font-medium relative">
                {isUpdating ? (
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-[#633d1f]"></span>
                ) : (
                  item.quantity.value
                )}
              </span>
              <button
                onClick={() =>
                  onQuantityChange(
                    item.item_key,
                    item.quantity.value + 1
                  )
                }
                className="flex h-8 w-8 items-center justify-center rounded-full border hover:bg-[#633d1f] hover:text-white hover:border-[#633d1f] disabled:opacity-50 transition-colors"
                disabled={isLoading || isUpdating}
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </li>
  );
}
