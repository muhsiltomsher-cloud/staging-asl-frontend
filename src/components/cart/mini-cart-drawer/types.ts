import type { CoCartItem } from "@/lib/api/cocart";

export interface MiniCartDrawerProps {
  locale: string;
  dictionary: {
    cart: string;
    emptyCart: string;
    continueShopping: string;
    subtotal: string;
    viewCart: string;
    checkout: string;
    remove: string;
  };
}

export interface CartItemProps {
  item: CoCartItem;
  locale: string;
  dictionary: {
    remove: string;
  };
  isLoading: boolean;
  isUpdating: boolean;
  isGiftItem: boolean;
  isNewlyAddedGift: boolean;
  divisor: number;
  onQuantityChange: (itemKey: string, newQuantity: number) => void;
  onRemove: (itemKey: string) => void;
}

export interface EmptyCartProps {
  locale: string;
  dictionary: {
    cart: string;
    emptyCart: string;
    continueShopping: string;
  };
  onClose: () => void;
}

export interface GiftSectionProps {
  locale: string;
  giftProgress: {
    hasNextGift: boolean;
    amountNeeded: number;
    currentSubtotal: number;
    nextGiftRule?: { min_cart_value: number } | null;
  };
  activeGifts: Array<{
    product?: { name?: string } | null;
  }>;
}
