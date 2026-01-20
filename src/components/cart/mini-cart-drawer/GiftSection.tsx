"use client";

import { Gift } from "lucide-react";
import { getLocalizedProduct } from "@/contexts/FreeGiftContext";
import type { GiftSectionProps } from "./types";

export function GiftSection({ locale, currency, giftProgress, activeGifts }: GiftSectionProps) {
  const isRTL = locale === "ar";

  return (
    <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-200">
      {giftProgress.hasNextGift && (
        <div className="p-3 border-b border-amber-200 bg-white/50">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-amber-400 to-orange-400 flex-shrink-0">
              <Gift className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-semibold text-amber-900">
                {isRTL 
                  ? `أضف ${giftProgress.amountNeeded} ${currency} للحصول على هدية مجانية!`
                  : `Add ${giftProgress.amountNeeded} ${currency} more to get a free gift!`
                }
              </p>
            </div>
          </div>
          <div className="mt-2 h-1.5 bg-amber-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-500"
              style={{ 
                width: `${Math.min(100, (giftProgress.currentSubtotal / (giftProgress.nextGiftRule?.min_cart_value || 1)) * 100)}%` 
              }}
            />
          </div>
        </div>
      )}

      {activeGifts.length > 0 && (
        <div className="p-3">
          <p className="text-xs font-semibold text-amber-900 mb-2">
            {isRTL ? "هداياك المجانية:" : "Your free gifts:"}
          </p>
          <div className="space-y-1">
            {activeGifts.map((gift, index) => (
              <div key={index} className="flex items-center gap-2 bg-white/60 rounded px-2 py-1">
                <Gift className="h-3 w-3 text-amber-600" />
                <span className="text-xs text-amber-900 flex-1">
                  {getLocalizedProduct(gift, locale)?.name || (isRTL ? "هدية مجانية" : "Free Gift")}
                </span>
                <span className="text-[10px] font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded">
                  {isRTL ? "مجاني" : "FREE"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
