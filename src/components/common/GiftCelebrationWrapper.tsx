"use client";

import { useFreeGift } from "@/contexts/FreeGiftContext";
import { GiftCelebration } from "./GiftCelebration";

interface GiftCelebrationWrapperProps {
  locale: string;
}

export function GiftCelebrationWrapper({ locale }: GiftCelebrationWrapperProps) {
  const { newGiftCelebration, dismissGiftCelebration } = useFreeGift();

  return (
    <GiftCelebration
      isVisible={newGiftCelebration.isVisible}
      onComplete={dismissGiftCelebration}
      giftName={newGiftCelebration.giftName || undefined}
      locale={locale}
    />
  );
}
