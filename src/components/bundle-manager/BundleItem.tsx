"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Copy, Trash2, HelpCircle } from "lucide-react";
import type { 
  BundleItem as BundleItemType, 
  SortOption, 
  SortOrder, 
  DiscountType 
} from "@/types/bundle";
import { 
  SORT_OPTIONS, 
  SORT_ORDER_OPTIONS, 
  DISCOUNT_TYPE_OPTIONS 
} from "@/types/bundle";
import type { WCCategory, WCProduct } from "@/types/woocommerce";
import type { Locale } from "@/config/site";

interface BundleItemProps {
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

interface TagInputProps {
  label: string;
  placeholder: string;
  selectedIds: number[];
  options: { id: number; name: string }[];
  onChange: (ids: number[]) => void;
  helpText?: string;
}

function TagInput({ label, placeholder, selectedIds, options, onChange, helpText }: TagInputProps) {
  const [inputValue, setInputValue] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  const filteredOptions = options.filter(
    (opt) => 
      !selectedIds.includes(opt.id) && 
      opt.name.toLowerCase().includes(inputValue.toLowerCase())
  );

  const selectedItems = options.filter((opt) => selectedIds.includes(opt.id));

  const handleSelect = (id: number) => {
    onChange([...selectedIds, id]);
    setInputValue("");
    setShowDropdown(false);
  };

  const handleRemove = (id: number) => {
    onChange(selectedIds.filter((i) => i !== id));
  };

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        {helpText && (
          <div className="group relative">
            <HelpCircle className="h-4 w-4 text-gray-400 cursor-help" />
            <div className="absolute left-0 top-6 z-10 hidden w-48 rounded bg-gray-800 p-2 text-xs text-white group-hover:block">
              {helpText}
            </div>
          </div>
        )}
      </div>
      <div className="relative">
        <div className="min-h-[42px] rounded-md border border-gray-300 bg-white p-2">
          <div className="flex flex-wrap gap-1">
            {selectedItems.map((item) => (
              <span
                key={item.id}
                className="inline-flex items-center gap-1 rounded bg-blue-600 px-2 py-1 text-xs text-white"
              >
                {item.name}
                <button
                  type="button"
                  onClick={() => handleRemove(item.id)}
                  className="hover:text-blue-200"
                >
                  ×
                </button>
              </span>
            ))}
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onFocus={() => setShowDropdown(true)}
              onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
              placeholder={selectedItems.length === 0 ? placeholder : ""}
              className="flex-1 min-w-[120px] border-none p-0 text-sm focus:outline-none focus:ring-0"
            />
          </div>
        </div>
        {showDropdown && filteredOptions.length > 0 && (
          <div className="absolute z-10 mt-1 max-h-48 w-full overflow-auto rounded-md border border-gray-200 bg-white shadow-lg">
            {filteredOptions.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => handleSelect(opt.id)}
                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100"
              >
                {opt.name}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function BundleItem({
  item,
  index,
  locale,
  categories,
  products,
  tags,
  onUpdate,
  onDuplicate,
  onRemove,
}: BundleItemProps) {
  const isRTL = locale === "ar";

  const translations = {
    en: {
      bundleItem: "Bundle item",
      duplicate: "Duplicate",
      remove: "Remove",
      rule: "Rule",
      categories: "Categories",
      excludeCategories: "Exclude categories",
      tags: "Tags",
      excludeTags: "Exclude tags",
      product: "Product",
      productVariation: "Product variation",
      excludeProduct: "Exclude product",
      excludeProductVariation: "Exclude product variation",
      display: "Display",
      customItemTitle: "Custom item title",
      sort: "Sort",
      default: "Default",
      quantity: "Quantity",
      details: "Details",
      discount: "Discount",
      optionalItem: "Optional item",
      showPrice: "Show price",
      pleaseSelectCategory: "Please Fill In Your Category",
      pleaseSelectTag: "Please Fill In Your Tag",
      pleaseSelectProduct: "Please Fill In Your Product Title",
    },
    ar: {
      bundleItem: "عنصر الحزمة",
      duplicate: "تكرار",
      remove: "إزالة",
      rule: "القاعدة",
      categories: "الفئات",
      excludeCategories: "استبعاد الفئات",
      tags: "العلامات",
      excludeTags: "استبعاد العلامات",
      product: "المنتج",
      productVariation: "تنوع المنتج",
      excludeProduct: "استبعاد المنتج",
      excludeProductVariation: "استبعاد تنوع المنتج",
      display: "العرض",
      customItemTitle: "عنوان العنصر المخصص",
      sort: "الترتيب",
      default: "افتراضي",
      quantity: "الكمية",
      details: "التفاصيل",
      discount: "الخصم",
      optionalItem: "عنصر اختياري",
      showPrice: "إظهار السعر",
      pleaseSelectCategory: "يرجى ملء الفئة الخاصة بك",
      pleaseSelectTag: "يرجى ملء العلامة الخاصة بك",
      pleaseSelectProduct: "يرجى ملء عنوان المنتج الخاص بك",
    },
  };

  const t = translations[isRTL ? "ar" : "en"];

  const categoryOptions = categories.map((c) => ({ id: c.id, name: c.name }));
  const productOptions = products.map((p) => ({ id: p.id, name: p.name }));

  const updateRule = (field: keyof BundleItemType["rule"], value: number[]) => {
    onUpdate({
      ...item,
      rule: { ...item.rule, [field]: value },
    });
  };

  const updateDisplay = <K extends keyof BundleItemType["display"]>(
    field: K,
    value: BundleItemType["display"][K]
  ) => {
    onUpdate({
      ...item,
      display: { ...item.display, [field]: value },
    });
  };

  const toggleExpanded = () => {
    onUpdate({ ...item, isExpanded: !item.isExpanded });
  };

  return (
    <div className="border border-gray-200 bg-white">
      <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-4 py-3">
        <button
          type="button"
          onClick={toggleExpanded}
          className="flex items-center gap-2 font-medium text-gray-900"
        >
          {item.isExpanded ? (
            <ChevronUp className="h-5 w-5" />
          ) : (
            <ChevronDown className="h-5 w-5" />
          )}
          {t.bundleItem} {index + 1}
        </button>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onDuplicate}
            className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
          >
            <Copy className="h-4 w-4" />
            {t.duplicate}
          </button>
          <button
            type="button"
            onClick={onRemove}
            className="flex items-center gap-1 text-sm text-red-600 hover:text-red-800"
          >
            <Trash2 className="h-4 w-4" />
            {t.remove}
          </button>
        </div>
      </div>

      {item.isExpanded && (
        <div className="space-y-6 p-4">
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-gray-500 uppercase">{t.rule}</h4>
            
            <div className="grid gap-4 md:grid-cols-2">
              <TagInput
                label={t.categories}
                placeholder={t.pleaseSelectCategory}
                selectedIds={item.rule.categories}
                options={categoryOptions}
                onChange={(ids) => updateRule("categories", ids)}
              />
              <TagInput
                label={t.excludeCategories}
                placeholder={t.pleaseSelectCategory}
                selectedIds={item.rule.excludeCategories}
                options={categoryOptions}
                onChange={(ids) => updateRule("excludeCategories", ids)}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <TagInput
                label={t.tags}
                placeholder={t.pleaseSelectTag}
                selectedIds={item.rule.tags}
                options={tags}
                onChange={(ids) => updateRule("tags", ids)}
              />
              <TagInput
                label={t.excludeTags}
                placeholder={t.pleaseSelectTag}
                selectedIds={item.rule.excludeTags}
                options={tags}
                onChange={(ids) => updateRule("excludeTags", ids)}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <TagInput
                label={t.product}
                placeholder={t.pleaseSelectProduct}
                selectedIds={item.rule.products}
                options={productOptions}
                onChange={(ids) => updateRule("products", ids)}
              />
              <TagInput
                label={t.productVariation}
                placeholder={t.pleaseSelectProduct}
                selectedIds={item.rule.productVariations}
                options={productOptions}
                onChange={(ids) => updateRule("productVariations", ids)}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <TagInput
                label={t.excludeProduct}
                placeholder={t.pleaseSelectProduct}
                selectedIds={item.rule.excludeProducts}
                options={productOptions}
                onChange={(ids) => updateRule("excludeProducts", ids)}
              />
              <TagInput
                label={t.excludeProductVariation}
                placeholder={t.pleaseSelectProduct}
                selectedIds={item.rule.excludeProductVariations}
                options={productOptions}
                onChange={(ids) => updateRule("excludeProductVariations", ids)}
              />
            </div>
          </div>

          <div className="space-y-4 border-t border-gray-200 pt-4">
            <h4 className="text-sm font-semibold text-gray-500 uppercase">{t.display}</h4>

            <div className="space-y-1">
              <div className="flex items-center gap-1">
                <label className="text-sm font-medium text-gray-700">{t.customItemTitle}</label>
                <HelpCircle className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                value={item.display.customTitle}
                onChange={(e) => updateDisplay("customTitle", e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1">
                <div className="flex items-center gap-1">
                  <label className="text-sm font-medium text-gray-700">{t.sort}</label>
                  <HelpCircle className="h-4 w-4 text-gray-400" />
                </div>
                <select
                  value={item.display.sortBy}
                  onChange={(e) => updateDisplay("sortBy", e.target.value as SortOption)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {isRTL ? opt.labelAr : opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700 invisible">Order</label>
                <select
                  value={item.display.sortOrder}
                  onChange={(e) => updateDisplay("sortOrder", e.target.value as SortOrder)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  {SORT_ORDER_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {isRTL ? opt.labelAr : opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id={`default-${item.id}`}
                  checked={item.display.isDefault}
                  onChange={(e) => updateDisplay("isDefault", e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor={`default-${item.id}`} className="text-sm font-medium text-gray-700">
                  {t.default}
                </label>
                <HelpCircle className="h-4 w-4 text-gray-400" />
              </div>
              <select
                value={item.display.defaultProductId || ""}
                onChange={(e) => updateDisplay("defaultProductId", e.target.value ? Number(e.target.value) : null)}
                className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                disabled={!item.display.isDefault}
              >
                <option value="">{t.pleaseSelectProduct}</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1">
                <div className="flex items-center gap-1">
                  <label className="text-sm font-medium text-gray-700">{t.quantity}</label>
                  <span className="text-xs text-blue-600 cursor-pointer">{t.default}</span>
                  <HelpCircle className="h-4 w-4 text-gray-400" />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={item.display.quantity}
                    onChange={(e) => updateDisplay("quantity", Number(e.target.value))}
                    min={1}
                    className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    {t.details}
                  </button>
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1">
                <div className="flex items-center gap-1">
                  <label className="text-sm font-medium text-gray-700">{t.discount}</label>
                  <HelpCircle className="h-4 w-4 text-gray-400" />
                </div>
                <select
                  value={item.display.discountType}
                  onChange={(e) => updateDisplay("discountType", e.target.value as DiscountType)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  {DISCOUNT_TYPE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {isRTL ? opt.labelAr : opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700 invisible">Value</label>
                <input
                  type="number"
                  value={item.display.discountValue}
                  onChange={(e) => updateDisplay("discountValue", Number(e.target.value))}
                  min={0}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id={`optional-${item.id}`}
                  checked={item.display.isOptional}
                  onChange={(e) => updateDisplay("isOptional", e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor={`optional-${item.id}`} className="text-sm font-medium text-gray-700">
                  {t.optionalItem}
                </label>
                <HelpCircle className="h-4 w-4 text-gray-400" />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id={`showPrice-${item.id}`}
                  checked={item.display.showPrice}
                  onChange={(e) => updateDisplay("showPrice", e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor={`showPrice-${item.id}`} className="text-sm font-medium text-gray-700">
                  {t.showPrice}
                </label>
                <HelpCircle className="h-4 w-4 text-gray-400" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
