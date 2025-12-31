"use client";

import { useState, useCallback } from "react";
import { Plus, Save, HelpCircle } from "lucide-react";
import { BundleItem } from "./BundleItem";
import type { 
  BundleConfiguration, 
  BundleItem as BundleItemType,
  BundleType,
  ShippingFeeOption,
} from "@/types/bundle";
import { 
  BUNDLE_TYPES, 
  SHIPPING_FEE_OPTIONS,
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
      bundleManager: "Bundle Manager",
      bundleConfiguration: "Bundle Configuration",
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
      bundleManager: "مدير الحزم",
      bundleConfiguration: "تكوين الحزمة",
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
