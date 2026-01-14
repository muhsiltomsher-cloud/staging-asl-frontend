import type { 
  BundleItem as BundleItemType, 
  SortOption, 
  SortOrder, 
  DiscountType 
} from "@/types/bundle";
import type { WCCategory, WCProduct } from "@/types/woocommerce";
import type { Locale } from "@/config/site";

export interface BundleItemProps {
  item: BundleItemType;
  index: number;
  locale: Locale;
  categories: WCCategory[];
  products: WCProduct[];
  tags: { id: number; name: string }[];
  onUpdate: (item: BundleItemType) => void;
  onDuplicate: () => void;
  onRemove: () => void;
}

export interface TagInputProps {
  label: string;
  placeholder: string;
  selectedIds: number[];
  options: { id: number; name: string }[];
  onChange: (ids: number[]) => void;
  helpText?: string;
}

export interface BundleItemTranslations {
  bundleItem: string;
  duplicate: string;
  remove: string;
  rule: string;
  categories: string;
  excludeCategories: string;
  tags: string;
  excludeTags: string;
  product: string;
  productVariation: string;
  excludeProduct: string;
  excludeProductVariation: string;
  display: string;
  customItemTitle: string;
  sort: string;
  default: string;
  quantity: string;
  details: string;
  discount: string;
  optionalItem: string;
  showPrice: string;
  pleaseSelectCategory: string;
  pleaseSelectTag: string;
  pleaseSelectProduct: string;
}

export type { BundleItemType, SortOption, SortOrder, DiscountType };
