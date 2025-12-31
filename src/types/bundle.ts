export type BundleType = 
  | "birthday"
  | "special_events"
  | "gift_sets"
  | "seasonal"
  | "corporate"
  | "wedding"
  | "custom";

export type ShippingFeeOption = 
  | "apply_to_each_bundled_product"
  | "apply_once_per_bundle"
  | "free_shipping"
  | "calculated_at_checkout";

export type SortOption = "price" | "name" | "date" | "popularity";
export type SortOrder = "asc" | "desc";
export type DiscountType = "percent" | "fixed";

export interface BundleItemRule {
  categories: number[];
  excludeCategories: number[];
  tags: number[];
  excludeTags: number[];
  products: number[];
  productVariations: number[];
  excludeProducts: number[];
  excludeProductVariations: number[];
}

export interface BundleItemDisplay {
  customTitle: string;
  sortBy: SortOption;
  sortOrder: SortOrder;
  isDefault: boolean;
  defaultProductId: number | null;
  quantity: number;
  quantityMin: number;
  quantityMax: number;
  discountType: DiscountType;
  discountValue: number;
  isOptional: boolean;
  showPrice: boolean;
}

export interface BundleItem {
  id: string;
  title: string;
  isExpanded: boolean;
  rule: BundleItemRule;
  display: BundleItemDisplay;
}

export interface BundleConfiguration {
  id: string;
  productId: number | null;
  title: string;
  bundleType: BundleType;
  shippingFee: ShippingFeeOption;
  isEnabled: boolean;
  items: BundleItem[];
  createdAt: string;
  updatedAt: string;
}

export interface BundleTypeOption {
  value: BundleType;
  label: string;
  labelAr: string;
}

export const BUNDLE_TYPES: BundleTypeOption[] = [
  { value: "birthday", label: "Birthday", labelAr: "عيد ميلاد" },
  { value: "special_events", label: "Special Events", labelAr: "مناسبات خاصة" },
  { value: "gift_sets", label: "Gift Sets", labelAr: "مجموعات هدايا" },
  { value: "seasonal", label: "Seasonal", labelAr: "موسمي" },
  { value: "corporate", label: "Corporate", labelAr: "شركات" },
  { value: "wedding", label: "Wedding", labelAr: "زفاف" },
  { value: "custom", label: "Custom", labelAr: "مخصص" },
];

export const SHIPPING_FEE_OPTIONS: { value: ShippingFeeOption; label: string; labelAr: string }[] = [
  { value: "apply_to_each_bundled_product", label: "Apply to each bundled product", labelAr: "تطبيق على كل منتج مجمع" },
  { value: "apply_once_per_bundle", label: "Apply once per bundle", labelAr: "تطبيق مرة واحدة لكل حزمة" },
  { value: "free_shipping", label: "Free shipping", labelAr: "شحن مجاني" },
  { value: "calculated_at_checkout", label: "Calculated at checkout", labelAr: "يحسب عند الدفع" },
];

export const SORT_OPTIONS: { value: SortOption; label: string; labelAr: string }[] = [
  { value: "price", label: "Price", labelAr: "السعر" },
  { value: "name", label: "Name", labelAr: "الاسم" },
  { value: "date", label: "Date", labelAr: "التاريخ" },
  { value: "popularity", label: "Popularity", labelAr: "الشعبية" },
];

export const SORT_ORDER_OPTIONS: { value: SortOrder; label: string; labelAr: string }[] = [
  { value: "asc", label: "ASC", labelAr: "تصاعدي" },
  { value: "desc", label: "DESC", labelAr: "تنازلي" },
];

export const DISCOUNT_TYPE_OPTIONS: { value: DiscountType; label: string; labelAr: string }[] = [
  { value: "percent", label: "Percent of total (%)", labelAr: "نسبة من الإجمالي (%)" },
  { value: "fixed", label: "Fixed amount", labelAr: "مبلغ ثابت" },
];

export function createDefaultBundleItem(id: string): BundleItem {
  return {
    id,
    title: `Bundle item ${id}`,
    isExpanded: true,
    rule: {
      categories: [],
      excludeCategories: [],
      tags: [],
      excludeTags: [],
      products: [],
      productVariations: [],
      excludeProducts: [],
      excludeProductVariations: [],
    },
    display: {
      customTitle: "",
      sortBy: "price",
      sortOrder: "asc",
      isDefault: false,
      defaultProductId: null,
      quantity: 1,
      quantityMin: 1,
      quantityMax: 10,
      discountType: "percent",
      discountValue: 0,
      isOptional: false,
      showPrice: true,
    },
  };
}

export function createDefaultBundleConfiguration(): BundleConfiguration {
  return {
    id: crypto.randomUUID(),
    productId: null,
    title: "",
    bundleType: "custom",
    shippingFee: "apply_to_each_bundled_product",
    isEnabled: false,
    items: [createDefaultBundleItem("1")],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}
