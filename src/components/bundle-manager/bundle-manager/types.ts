import type { 
  BundleConfiguration, 
  BundleItem as BundleItemType,
  BundleType,
  ShippingFeeOption,
  PricingMode,
  ExtraItemChargingMethod,
  BundlePricing,
} from "@/types/bundle";
import type { WCCategory, WCProduct } from "@/types/woocommerce";
import type { Locale } from "@/config/site";

export interface BundleManagerProps {
  locale: Locale;
  categories: WCCategory[];
  products: WCProduct[];
  tags: { id: number; name: string }[];
  initialConfig?: BundleConfiguration;
  productId?: number;
  onSave?: (config: BundleConfiguration) => Promise<void>;
}

export interface BundleManagerTranslations {
  bundleTitle: string;
  bundleType: string;
  shippingFee: string;
  enableBundle: string;
  enableBundleDesc: string;
  addBundleItem: string;
  save: string;
  saving: string;
  selectBundleType: string;
  bundlesCreator: string;
  bundleConfiguration: string;
  pricingConfiguration: string;
  pricingMode: string;
  boxPrice: string;
  boxPriceHelp: string;
  includedItemsCount: string;
  includedItemsCountHelp: string;
  extraItemCharging: string;
  extraItemChargingHelp: string;
  showProductPrices: string;
  showProductPricesDesc: string;
  pricingExample: string;
  currency: string;
}

export type { 
  BundleConfiguration, 
  BundleItemType,
  BundleType,
  ShippingFeeOption,
  PricingMode,
  ExtraItemChargingMethod,
  BundlePricing,
};
