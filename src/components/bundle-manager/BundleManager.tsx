"use client";

import { useState, useCallback } from "react";
import { Plus, Save, HelpCircle } from "lucide-react";
import { BundleItem } from "./BundleItem";
import type { 
  BundleConfiguration, 
  BundleItem as BundleItemType,
  BundleType,
  ShippingFeeOption,
  PricingMode,
  ExtraItemChargingMethod,
  BundlePricing,
} from "@/types/bundle";
import { 
  BUNDLE_TYPES, 
  SHIPPING_FEE_OPTIONS,
  PRICING_MODE_OPTIONS,
  EXTRA_ITEM_CHARGING_OPTIONS,
  createDefaultBundleItem,
  createDefaultBundleConfiguration,
} from "@/types/bundle";
import type { WCCategory, WCProduct } from "@/types/woocommerce";
import type { Locale } from "@/config/site";

interface BundleManagerProps {
  locale: Locale;
  categories: WCCategory[];
  products: WCProduct[];
  tags: { id: number; name: string }[];
  initialConfig?: BundleConfiguration;
  productId?: number;
  onSave?: (config: BundleConfiguration) => Promise<void>;
}

export function BundleManager({
  locale,
  categories,
  products,
  tags,
  initialConfig,
  productId,
  onSave,
}: BundleManagerProps) {
  const isRTL = locale === "ar";
  const [config, setConfig] = useState<BundleConfiguration>(() => {
    if (initialConfig) return initialConfig;
    const defaultConfig = createDefaultBundleConfiguration();
    if (productId) defaultConfig.productId = productId;
    return defaultConfig;
  });
  const [isSaving, setIsSaving] = useState(false);

  const translations = {
    en: {
      bundleTitle: "Bundle title:",
      bundleType: "Bundle type:",
      shippingFee: "Shipping fee:",
      enableBundle: "Enable Bundle",
      enableBundleDesc: "Enable this bundle on the product page",
      addBundleItem: "Add Bundle Item",
      save: "Save Bundle",
      saving: "Saving...",
      selectBundleType: "Select bundle type",
      bundlesCreator: "Bundles Creator",
      bundleConfiguration: "Bundle Configuration",
      pricingConfiguration: "Pricing Configuration",
      pricingMode: "Pricing Mode:",
      boxPrice: "Box/Bundle Price:",
      boxPriceHelp: "The price of the gift box or bundle itself",
      includedItemsCount: "Included Items Count:",
      includedItemsCountHelp: "Number of items included in the box price",
      extraItemCharging: "Extra Item Charging Method:",
      extraItemChargingHelp: "How to determine which items are charged as extras",
      showProductPrices: "Show Product Prices",
      showProductPricesDesc: "Display individual product prices on the frontend",
      pricingExample: "Example:",
      currency: "AED",
    },
    ar: {
      bundleTitle: "عنوان الحزمة:",
      bundleType: "نوع الحزمة:",
      shippingFee: "رسوم الشحن:",
      enableBundle: "تفعيل الحزمة",
      enableBundleDesc: "تفعيل هذه الحزمة في صفحة المنتج",
      addBundleItem: "إضافة عنصر حزمة",
      save: "حفظ الحزمة",
      saving: "جاري الحفظ...",
      selectBundleType: "اختر نوع الحزمة",
      bundlesCreator: "منشئ الحزم",
      bundleConfiguration: "تكوين الحزمة",
      pricingConfiguration: "تكوين التسعير",
      pricingMode: "وضع التسعير:",
      boxPrice: "سعر الصندوق/الحزمة:",
      boxPriceHelp: "سعر صندوق الهدايا أو الحزمة نفسها",
      includedItemsCount: "عدد العناصر المشمولة:",
      includedItemsCountHelp: "عدد العناصر المشمولة في سعر الصندوق",
      extraItemCharging: "طريقة احتساب العناصر الإضافية:",
      extraItemChargingHelp: "كيفية تحديد العناصر التي تُحتسب كإضافات",
      showProductPrices: "إظهار أسعار المنتجات",
      showProductPricesDesc: "عرض أسعار المنتجات الفردية على الواجهة",
      pricingExample: "مثال:",
      currency: "درهم",
    },
  };

  const t = translations[isRTL ? "ar" : "en"];

  const updateConfig = useCallback(<K extends keyof BundleConfiguration>(
    field: K,
    value: BundleConfiguration[K]
  ) => {
    setConfig((prev) => ({
      ...prev,
      [field]: value,
      updatedAt: new Date().toISOString(),
    }));
  }, []);

  const addBundleItem = useCallback(() => {
    const newItemId = String(config.items.length + 1);
    setConfig((prev) => ({
      ...prev,
      items: [...prev.items, createDefaultBundleItem(newItemId)],
      updatedAt: new Date().toISOString(),
    }));
  }, [config.items.length]);

  const updateBundleItem = useCallback((index: number, item: BundleItemType) => {
    setConfig((prev) => ({
      ...prev,
      items: prev.items.map((i, idx) => (idx === index ? item : i)),
      updatedAt: new Date().toISOString(),
    }));
  }, []);

  const duplicateBundleItem = useCallback((index: number) => {
    setConfig((prev) => {
      const itemToDuplicate = prev.items[index];
      const newItem: BundleItemType = {
        ...itemToDuplicate,
        id: String(prev.items.length + 1),
        title: `${itemToDuplicate.title} (copy)`,
      };
      return {
        ...prev,
        items: [...prev.items, newItem],
        updatedAt: new Date().toISOString(),
      };
    });
  }, []);

  const removeBundleItem = useCallback((index: number) => {
    setConfig((prev) => ({
      ...prev,
      items: prev.items.filter((_, idx) => idx !== index),
      updatedAt: new Date().toISOString(),
    }));
  }, []);

  const updatePricing = useCallback(<K extends keyof BundlePricing>(
    field: K,
    value: BundlePricing[K]
  ) => {
    setConfig((prev) => ({
      ...prev,
      pricing: {
        ...prev.pricing,
        [field]: value,
      },
      updatedAt: new Date().toISOString(),
    }));
  }, []);

  const handleSave = async () => {
    if (!onSave) return;
    setIsSaving(true);
    try {
      await onSave(config);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="mb-6 text-xl font-semibold text-gray-900">{t.bundleConfiguration}</h2>

        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <div className="flex items-center gap-1">
                <label className="text-sm font-medium text-gray-700">{t.bundleTitle}</label>
                <HelpCircle className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                value={config.title}
                onChange={(e) => updateConfig("title", e.target.value)}
                placeholder="A bundle by bopo"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-1">
                <label className="text-sm font-medium text-gray-700">{t.bundleType}</label>
                <HelpCircle className="h-4 w-4 text-gray-400" />
              </div>
              <select
                value={config.bundleType}
                onChange={(e) => updateConfig("bundleType", e.target.value as BundleType)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">{t.selectBundleType}</option>
                {BUNDLE_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {isRTL ? type.labelAr : type.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1">
              <label className="text-sm font-medium text-gray-700">{t.shippingFee}</label>
              <HelpCircle className="h-4 w-4 text-gray-400" />
            </div>
            <select
              value={config.shippingFee}
              onChange={(e) => updateConfig("shippingFee", e.target.value as ShippingFeeOption)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {SHIPPING_FEE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {isRTL ? opt.labelAr : opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4">
            <input
              type="checkbox"
              id="enableBundle"
              checked={config.isEnabled}
              onChange={(e) => updateConfig("isEnabled", e.target.checked)}
              className="h-5 w-5 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
            />
            <div>
              <label htmlFor="enableBundle" className="font-medium text-gray-900">
                {t.enableBundle}
              </label>
              <p className="text-sm text-gray-600">{t.enableBundleDesc}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="mb-6 text-xl font-semibold text-gray-900">{t.pricingConfiguration}</h2>

        <div className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-center gap-1">
              <label className="text-sm font-medium text-gray-700">{t.pricingMode}</label>
              <HelpCircle className="h-4 w-4 text-gray-400" />
            </div>
            <div className="space-y-3">
              {PRICING_MODE_OPTIONS.map((option) => (
                <label
                  key={option.value}
                  className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors ${
                    config.pricing.mode === option.value
                      ? "border-amber-500 bg-amber-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="pricingMode"
                    value={option.value}
                    checked={config.pricing.mode === option.value}
                    onChange={(e) => updatePricing("mode", e.target.value as PricingMode)}
                    className="mt-1 h-4 w-4 border-gray-300 text-amber-600 focus:ring-amber-500"
                  />
                  <div className="flex-1">
                    <span className="font-medium text-gray-900">
                      {isRTL ? option.labelAr : option.label}
                    </span>
                    <p className="mt-1 text-sm text-gray-500">
                      {isRTL ? option.descriptionAr : option.description}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {(config.pricing.mode === "box_fixed_price" || 
            config.pricing.mode === "box_plus_products" || 
            config.pricing.mode === "included_items_with_extras") && (
            <div className="space-y-1">
              <div className="flex items-center gap-1">
                <label className="text-sm font-medium text-gray-700">{t.boxPrice}</label>
                <div className="group relative">
                  <HelpCircle className="h-4 w-4 cursor-help text-gray-400" />
                  <div className="absolute left-0 top-6 z-10 hidden w-48 rounded bg-gray-800 p-2 text-xs text-white group-hover:block">
                    {t.boxPriceHelp}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={config.pricing.boxPrice}
                  onChange={(e) => updatePricing("boxPrice", Number(e.target.value))}
                  min={0}
                  step={0.01}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-500">{t.currency}</span>
              </div>
            </div>
          )}

          {config.pricing.mode === "included_items_with_extras" && (
            <>
              <div className="space-y-1">
                <div className="flex items-center gap-1">
                  <label className="text-sm font-medium text-gray-700">{t.includedItemsCount}</label>
                  <div className="group relative">
                    <HelpCircle className="h-4 w-4 cursor-help text-gray-400" />
                    <div className="absolute left-0 top-6 z-10 hidden w-48 rounded bg-gray-800 p-2 text-xs text-white group-hover:block">
                      {t.includedItemsCountHelp}
                    </div>
                  </div>
                </div>
                <input
                  type="number"
                  value={config.pricing.includedItemsCount}
                  onChange={(e) => updatePricing("includedItemsCount", Number(e.target.value))}
                  min={1}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-1">
                  <label className="text-sm font-medium text-gray-700">{t.extraItemCharging}</label>
                  <div className="group relative">
                    <HelpCircle className="h-4 w-4 cursor-help text-gray-400" />
                    <div className="absolute left-0 top-6 z-10 hidden w-48 rounded bg-gray-800 p-2 text-xs text-white group-hover:block">
                      {t.extraItemChargingHelp}
                    </div>
                  </div>
                </div>
                <select
                  value={config.pricing.extraItemChargingMethod}
                  onChange={(e) => updatePricing("extraItemChargingMethod", e.target.value as ExtraItemChargingMethod)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  {EXTRA_ITEM_CHARGING_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {isRTL ? opt.labelAr : opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                <p className="text-sm text-blue-800">
                  <span className="font-medium">{t.pricingExample}</span>{" "}
                  {isRTL 
                    ? `سعر الصندوق: ${config.pricing.boxPrice} ${t.currency} يشمل ${config.pricing.includedItemsCount} عناصر. إذا اختار العميل ${config.pricing.includedItemsCount + 2} منتجات، يدفع فقط مقابل ${2} منتجات إضافية.`
                    : `Box price: ${t.currency} ${config.pricing.boxPrice} includes ${config.pricing.includedItemsCount} items. If customer selects ${config.pricing.includedItemsCount + 2} products, they pay for only ${2} extra products.`
                  }
                </p>
              </div>
            </>
          )}

          <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
            <input
              type="checkbox"
              id="showProductPrices"
              checked={config.pricing.showProductPrices}
              onChange={(e) => updatePricing("showProductPrices", e.target.checked)}
              className="h-5 w-5 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
            />
            <div>
              <label htmlFor="showProductPrices" className="font-medium text-gray-900">
                {t.showProductPrices}
              </label>
              <p className="text-sm text-gray-600">{t.showProductPricesDesc}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {config.items.map((item, index) => (
          <BundleItem
            key={item.id}
            item={item}
            index={index}
            locale={locale}
            categories={categories}
            products={products}
            tags={tags}
            onUpdate={(updatedItem) => updateBundleItem(index, updatedItem)}
            onDuplicate={() => duplicateBundleItem(index)}
            onRemove={() => removeBundleItem(index)}
          />
        ))}
      </div>

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={addBundleItem}
          className="flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <Plus className="h-4 w-4" />
          {t.addBundleItem}
        </button>

        {onSave && (
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 rounded-md bg-amber-600 px-6 py-2 text-sm font-medium text-white hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {isSaving ? t.saving : t.save}
          </button>
        )}
      </div>
    </div>
  );
}
