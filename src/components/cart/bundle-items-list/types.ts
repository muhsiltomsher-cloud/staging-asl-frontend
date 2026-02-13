import type { CoCartItem } from "@/lib/api/cocart";

export interface BundleItem {
  product_id: number;
  name?: string;
  price?: number | string;
  quantity?: number;
  is_addon?: boolean;
  is_free?: boolean;
}

export interface BundleItemsListProps {
  item: CoCartItem;
  locale?: string;
  compact?: boolean;
  showPrices?: boolean;
}

export type { CoCartItem };
