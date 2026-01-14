import type { OrderLineItem } from "@/lib/api/customer";

export interface BundleItem {
  product_id: number;
  name?: string;
  price?: number | string;
  quantity?: number;
  is_addon?: boolean;
}

export interface OrderBundleItemsListProps {
  item: OrderLineItem;
  locale?: string;
  compact?: boolean;
  showPrices?: boolean;
}

export type { OrderLineItem };
