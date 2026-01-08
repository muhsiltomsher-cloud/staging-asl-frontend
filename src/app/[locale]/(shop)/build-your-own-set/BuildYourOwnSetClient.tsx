"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { X, Plus, Minus, Search, Check } from "lucide-react";
import { FormattedPrice } from "@/components/common/FormattedPrice";
import { useCart } from "@/contexts/CartContext";
import { useNotification } from "@/contexts/NotificationContext";
import { useFreeGift } from "@/contexts/FreeGiftContext";
import type { WCProduct } from "@/types/woocommerce";
import type { Locale } from "@/config/site";
import type { BundleConfig } from "@/lib/api/woocommerce";

interface ProductOption {
  id: number;
  name: string;
  price: number;
  slug: string;
  image: string;
  category: string;
}

interface BuildYourOwnSetClientProps {
  products: WCProduct[];
  locale: Locale;
  bundleProduct?: WCProduct | null;
  bundleConfig?: BundleConfig | null;
}

type CategoryFilter = "all" | "perfumes" | "oils" | "lotions" | "home";

export function BuildYourOwnSetClient({
  products,
  locale,
  bundleProduct,
  bundleConfig,
}: BuildYourOwnSetClientProps) {
  const isRTL = locale === "ar";
  const { addToCart } = useCart();
  const { notify } = useNotification();
  const { getFreeGiftProductIds } = useFreeGift();
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [activeSlot, setActiveSlot] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");

  const [selections, setSelections] = useState<(ProductOption | null)[]>([
    null,
    null,
    null,
    null,
    null,
  ]);

  // Get eligible product IDs from bundle config (if configured)
  const eligibleProductIds = useMemo(() => {
    if (!bundleConfig?.eligible_products?.length) return null;
    return new Set(bundleConfig.eligible_products);
  }, [bundleConfig]);

  // Get eligible category IDs from bundle config (if configured)
  const eligibleCategoryIds = useMemo(() => {
    if (!bundleConfig?.eligible_categories?.length) return null;
    return new Set(bundleConfig.eligible_categories);
  }, [bundleConfig]);

  // Get exclude product IDs from bundle config
  const excludeProductIds = useMemo(() => {
    if (!bundleConfig?.exclude_products?.length) return new Set<number>();
    return new Set(bundleConfig.exclude_products);
  }, [bundleConfig]);

  // Get exclude category IDs from bundle config
  const excludeCategoryIds = useMemo(() => {
    if (!bundleConfig?.exclude_categories?.length) return new Set<number>();
    return new Set(bundleConfig.exclude_categories);
  }, [bundleConfig]);

  // Get unique product IDs from bundle config (products that can only be selected once)
  const uniqueProductIds = useMemo(() => {
    if (!bundleConfig?.unique_products?.length) return new Set<number>();
    return new Set(bundleConfig.unique_products);
  }, [bundleConfig]);

  const productOptions: ProductOption[] = useMemo(() => {
    // Get free gift product IDs to exclude from bundle selection
    const freeGiftProductIds = new Set(getFreeGiftProductIds());
    
    // Get the bundle product ID to exclude from bundle selection
    const bundleProductId = bundleProduct?.id;
    
    // Filter products based on eligibility rules
    const filteredProducts = products.filter((p) => {
      // Exclude the bundle product itself
      if (bundleProductId && p.id === bundleProductId) return false;
      
      // Exclude free gift products
      if (freeGiftProductIds.has(p.id)) return false;
      
      // Exclude products in exclude_products list
      if (excludeProductIds.has(p.id)) return false;
      
      // Exclude products in excluded categories
      if (excludeCategoryIds.size > 0) {
        const productCategoryIds = p.categories?.map(c => c.id) || [];
        if (productCategoryIds.some(catId => excludeCategoryIds.has(catId))) return false;
      }
      
      // Check eligibility - if both eligible_products and eligible_categories are empty, allow all
      const hasEligibleProducts = eligibleProductIds && eligibleProductIds.size > 0;
      const hasEligibleCategories = eligibleCategoryIds && eligibleCategoryIds.size > 0;
      
      if (!hasEligibleProducts && !hasEligibleCategories) {
        // No eligibility restrictions, allow all (except excluded)
        return true;
      }
      
      // Check if product is in eligible_products list
      if (hasEligibleProducts && eligibleProductIds.has(p.id)) {
        return true;
      }
      
      // Check if product is in an eligible category
      if (hasEligibleCategories) {
        const productCategoryIds = p.categories?.map(c => c.id) || [];
        if (productCategoryIds.some(catId => eligibleCategoryIds.has(catId))) {
          return true;
        }
      }
      
      // If eligibility rules exist but product doesn't match any, exclude it
      return false;
    });

    return filteredProducts.map((product) => {
      const categoryName = product.categories?.[0]?.name?.toLowerCase() || "";
      let category: CategoryFilter = "all";
      if (categoryName.includes("perfume") || categoryName.includes("عطر")) {
        category = "perfumes";
      } else if (categoryName.includes("oil") || categoryName.includes("زيت")) {
        category = "oils";
      } else if (categoryName.includes("lotion") || categoryName.includes("لوشن") || categoryName.includes("care") || categoryName.includes("عناية")) {
        category = "lotions";
      } else if (categoryName.includes("home") || categoryName.includes("منزل")) {
        category = "home";
      }

      return {
        id: product.id,
        name: product.name,
        price:
          parseInt(product.prices.price) /
          Math.pow(10, product.prices.currency_minor_unit),
        slug: product.slug,
        image: product.images?.[0]?.src || "/images/placeholder-product.jpg",
        category,
      };
    });
  }, [products, eligibleProductIds, eligibleCategoryIds, excludeProductIds, excludeCategoryIds, getFreeGiftProductIds, bundleProduct]);

  const selectedIds = useMemo(() => {
    return new Set(selections.filter((s) => s !== null).map((s) => s!.id));
  }, [selections]);

  // Compute which categories have available products
  const availableCategories = useMemo(() => {
    const categoriesWithProducts = new Set<CategoryFilter>(["all"]);
    productOptions.forEach((product) => {
      if (product.category !== "all") {
        categoriesWithProducts.add(product.category);
      }
    });
    return categoriesWithProducts;
  }, [productOptions]);

  const filteredProducts = useMemo(() => {
    return productOptions.filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === "all" || product.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [productOptions, searchQuery, categoryFilter]);

  const total = useMemo(() => {
    return selections.reduce((sum, selection) => {
      return sum + (selection?.price || 0);
    }, 0);
  }, [selections]);

  const requiredCount = selections.slice(0, 3).filter((s) => s !== null).length;
  const isValid = requiredCount === 3;

  const handleSlotClick = (index: number) => {
    setActiveSlot(index);
    setSearchQuery("");
    setCategoryFilter("all");
  };

  const handleProductSelect = (product: ProductOption) => {
    if (activeSlot === null) return;

    const newSelections = [...selections];
    newSelections[activeSlot] = product;
    setSelections(newSelections);
    setActiveSlot(null);
  };

  const handleRemoveSelection = (index: number) => {
    const newSelections = [...selections];
    newSelections[index] = null;
    setSelections(newSelections);
  };

  const handleAddToCart = async () => {
    if (!isValid) {
      notify("error", isRTL ? "يرجى اختيار 3 منتجات على الأقل" : "Please select at least 3 products");
      return;
    }

    if (!bundleProduct) {
      notify("error", isRTL ? "منتج الحزمة غير متوفر" : "Bundle product not available");
      return;
    }

    setIsAddingToCart(true);
    try {
      const selectedProducts = selections
        .filter((s): s is ProductOption => s !== null)
        .map((product) => ({
          product_id: product.id,
          name: product.name,
          price: product.price,
        }));

      await addToCart(bundleProduct.id, quantity, undefined, undefined, {
        bundle_items: selectedProducts,
      });
      
      notify("success", isRTL ? "تمت إضافة الحزمة إلى السلة" : "Bundle added to cart");
    } catch (error) {
      console.error("Failed to add to cart:", error);
      notify("error", isRTL ? "فشل في إضافة الحزمة" : "Failed to add bundle");
    } finally {
      setIsAddingToCart(false);
    }
  };

  const bundleImage = bundleProduct?.images?.[0]?.src || "/images/bundle-box.jpg";

  const translations = {
    en: {
      title: "Build Your Own Set",
      description:
        "Whether you're treating yourself or surprising someone special, our ASL Bundle Boxes bring together the finest in fragrance and body care.",
      instructions:
        "Create a set that's as unique as your fragrance personality. Pick 3 or more products of your choice.",
      yourBox: "Your Box",
      required: "Required",
      optional: "Optional",
      chooseItem: "Choose item",
      addExtra: "Add extra",
      addExtraWithPrice: "Add extra (with price)",
      change: "Change",
      total: "Total",
      addToCart: "Add to cart",
      adding: "Adding...",
      selectProduct: "Select a Product",
      searchProducts: "Search products...",
      all: "All",
      perfumes: "Perfumes",
      oils: "Oils",
      lotions: "Personal Care",
      home: "Home Fragrances",
      select: "Select",
      selected: "Selected",
      close: "Close",
      itemsSelected: "items selected",
      requiredItems: "required",
    },
    ar: {
      title: "اصنع مجموعتك الخاصة",
      description:
        "سواء كنت تدلل نفسك أو تفاجئ شخصًا مميزًا، فإن صناديق ASL تجمع أفضل العطور ومنتجات العناية بالجسم.",
      instructions:
        "أنشئ مجموعة فريدة مثل شخصيتك العطرية. اختر 3 منتجات أو أكثر من اختيارك.",
      yourBox: "صندوقك",
      required: "مطلوب",
      optional: "اختياري",
      chooseItem: "اختر منتج",
      addExtra: "أضف إضافي",
      addExtraWithPrice: "أضف إضافي (بسعر)",
      change: "تغيير",
      total: "المجموع",
      addToCart: "أضف إلى السلة",
      adding: "جاري الإضافة...",
      selectProduct: "اختر منتج",
      searchProducts: "ابحث عن المنتجات...",
      all: "الكل",
      perfumes: "العطور",
      oils: "الزيوت",
      lotions: "العناية الشخصية",
      home: "معطرات المنزل",
      select: "اختر",
      selected: "مختار",
      close: "إغلاق",
      itemsSelected: "منتجات مختارة",
      requiredItems: "مطلوب",
    },
  };

  const t = translations[isRTL ? "ar" : "en"];

  const allCategories: { key: CategoryFilter; label: string }[] = [
    { key: "all", label: t.all },
    { key: "perfumes", label: t.perfumes },
    { key: "oils", label: t.oils },
    { key: "lotions", label: t.lotions },
    { key: "home", label: t.home },
  ];

  // Only show categories that have available products
  const categories = allCategories.filter((cat) => availableCategories.has(cat.key));

  return (
    <>
      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        {/* Product Image */}
        <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
          <Image
            src={bundleImage}
            alt={t.title}
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
            priority
          />
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          {/* Title */}
          <h1 className="font-serif text-2xl sm:text-3xl font-medium uppercase tracking-normal sm:tracking-wide text-amber-800 md:text-4xl leading-tight">
            {t.title}
          </h1>

          {/* Price */}
          <div className="text-xl font-bold text-gray-900">
            <FormattedPrice price={total} iconSize="md" />
          </div>

          {/* Description */}
          <div className="space-y-2 text-sm text-gray-600">
            <p>{t.description}</p>
            <p>{t.instructions}</p>
          </div>

          {/* Your Box Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">{t.yourBox}</h2>
              <span className="text-sm text-gray-500">
                {requiredCount}/3 {t.requiredItems}
              </span>
            </div>

            {/* Required Slots (3) */}
            <div className="space-y-3">
              {[0, 1, 2].map((index) => (
                <div
                  key={`slot-${index}`}
                  className={`relative flex items-center gap-4 rounded-xl border-2 p-3 transition-all ${
                    selections[index]
                      ? "border-amber-500 bg-amber-50"
                      : "border-dashed border-gray-300 bg-gray-50 hover:border-amber-400 hover:bg-amber-50/50"
                  }`}
                >
                  {selections[index] ? (
                    <>
                      <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-white">
                        <Image
                          src={selections[index]!.image}
                          alt={selections[index]!.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                                            <div className="flex-1 min-w-0 overflow-hidden">
                                              <p className="line-clamp-2 break-words font-medium text-gray-900 text-xs sm:text-sm uppercase">
                                                {selections[index]!.name}
                                              </p>
                                              <p className="text-xs sm:text-sm text-amber-700">
                                                <FormattedPrice price={selections[index]!.price} iconSize="sm" />
                                              </p>
                                            </div>
                      <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                        <button
                          onClick={() => handleSlotClick(index)}
                          className="text-xs text-amber-600 hover:text-amber-800 hover:underline whitespace-nowrap"
                        >
                          {t.change}
                        </button>
                        <button
                          onClick={() => handleRemoveSelection(index)}
                          className="rounded-full p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-600"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </>
                  ) : (
                    <button
                      onClick={() => handleSlotClick(index)}
                      className="flex w-full items-center gap-4 text-left"
                    >
                      <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-white">
                        <Plus className="h-6 w-6 text-gray-400" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-600">
                          {t.chooseItem} {index + 1}
                        </p>
                        <p className="text-xs text-red-500">{t.required}</p>
                      </div>
                    </button>
                  )}
                  <div className="absolute -top-2 left-3 rounded bg-amber-600 px-2 py-0.5 text-xs font-medium text-white">
                    {index + 1}
                  </div>
                </div>
              ))}
            </div>

            {/* Optional Slots (2) */}
            <div className="space-y-3 pt-2">
              <p className="text-sm font-medium text-gray-500">{t.optional}</p>
              {[3, 4].map((index) => (
                <div
                  key={`slot-${index}`}
                  className={`relative flex items-center gap-4 rounded-xl border-2 p-3 transition-all ${
                    selections[index]
                      ? "border-amber-500 bg-amber-50"
                      : "border-dashed border-gray-200 bg-gray-50/50 hover:border-amber-300 hover:bg-amber-50/30"
                  }`}
                >
                  {selections[index] ? (
                    <>
                      <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-white">
                        <Image
                          src={selections[index]!.image}
                          alt={selections[index]!.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                                            <div className="flex-1 min-w-0 overflow-hidden">
                                              <p className="line-clamp-2 break-words font-medium text-gray-900 text-xs sm:text-sm uppercase">
                                                {selections[index]!.name}
                                              </p>
                                              <p className="text-xs sm:text-sm text-amber-700">
                                                <FormattedPrice price={selections[index]!.price} iconSize="sm" />
                                              </p>
                                            </div>
                      <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                        <button
                          onClick={() => handleSlotClick(index)}
                          className="text-xs text-amber-600 hover:text-amber-800 hover:underline whitespace-nowrap"
                        >
                          {t.change}
                        </button>
                        <button
                          onClick={() => handleRemoveSelection(index)}
                          className="rounded-full p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-600"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </>
                  ) : (
                    <button
                      onClick={() => handleSlotClick(index)}
                      className="flex w-full items-center gap-4 text-left"
                    >
                      <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-lg border-2 border-dashed border-gray-200 bg-white">
                        <Plus className="h-6 w-6 text-gray-300" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-400">{t.addExtraWithPrice}</p>
                        <p className="text-xs text-gray-400">{t.optional}</p>
                      </div>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Total */}
          <div className="flex items-center justify-between border-t border-gray-200 pt-4">
            <span className="text-lg font-bold text-gray-900">{t.total}</span>
            <span className="text-xl font-bold text-gray-900">
              <FormattedPrice price={total} iconSize="md" />
            </span>
          </div>

          {/* Quantity and Add to Cart */}
          <div className="flex items-center gap-4">
            {/* Quantity Selector */}
            <div className="flex items-center overflow-hidden rounded-full bg-[#E8E0D5]">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
                className="flex h-10 w-10 cursor-pointer items-center justify-center text-[#5C4A3D] transition-all duration-300 hover:bg-[#d9d0c3] disabled:cursor-not-allowed disabled:opacity-50"
                aria-label={isRTL ? "تقليل الكمية" : "Decrease quantity"}
              >
                <Minus className="h-4 w-4" />
              </button>
              <input
                type="number"
                value={quantity}
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 1;
                  setQuantity(Math.min(Math.max(1, val), 99));
                }}
                className="h-10 w-10 bg-transparent text-center text-sm font-bold text-[#5C4A3D] focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                min={1}
                max={99}
              />
              <button
                type="button"
                onClick={() => setQuantity(Math.min(quantity + 1, 99))}
                disabled={quantity >= 99}
                className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-[#C4885B] text-white transition-all duration-300 hover:bg-[#b07a4f] disabled:cursor-not-allowed disabled:opacity-50"
                aria-label={isRTL ? "زيادة الكمية" : "Increase quantity"}
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            {/* Add to Cart Button */}
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={!isValid || isAddingToCart}
              className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-full border-2 border-[#C4885B] bg-[#C4885B] px-8 py-3 text-sm font-medium uppercase tracking-wide text-white transition-all duration-300 hover:bg-transparent hover:text-[#C4885B] disabled:cursor-not-allowed disabled:border-gray-400 disabled:bg-gray-400"
            >
              {isAddingToCart ? t.adding : t.addToCart}
            </button>
          </div>
        </div>
      </div>

      {/* Product Picker Modal */}
      {activeSlot !== null && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center">
          <div className="relative max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-t-2xl bg-white sm:rounded-2xl">
            {/* Modal Header */}
            <div className="sticky top-0 z-10 border-b border-gray-200 bg-white p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  {t.selectProduct}
                </h3>
                <button
                  onClick={() => setActiveSlot(null)}
                  className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Search */}
              <div className="relative mt-3">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder={t.searchProducts}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              {/* Category Filters */}
              <div className="mt-3 flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat.key}
                    onClick={() => setCategoryFilter(cat.key)}
                    className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
                      categoryFilter === cat.key
                        ? "bg-amber-600 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Product Grid */}
            <div className="max-h-[60vh] overflow-y-auto p-4">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {filteredProducts.map((product) => {
                  // Check if product is already selected
                  const isSelected = selectedIds.has(product.id);
                  // Check if product is unique (can only be selected once) and already selected
                  const isUniqueAndSelected = uniqueProductIds.has(product.id) && isSelected;
                  // Product is disabled if it's a unique product that's already selected
                  // Non-unique products can be selected multiple times
                  const isDisabled = isUniqueAndSelected;
                  return (
                    <button
                      key={product.id}
                      onClick={() => handleProductSelect(product)}
                      disabled={isDisabled}
                      className={`group relative flex flex-col overflow-hidden rounded-xl border-2 bg-white text-left transition-all ${
                        isDisabled
                          ? "cursor-not-allowed border-gray-200 opacity-50"
                          : "border-transparent hover:border-amber-500 hover:shadow-lg"
                      }`}
                    >
                      <div className="relative aspect-square overflow-hidden bg-gray-100">
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          className="object-cover transition-transform group-hover:scale-105"
                        />
                        {isDisabled && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                            <div className="rounded-full bg-white p-2">
                              <Check className="h-5 w-5 text-amber-600" />
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="p-2 sm:p-3 min-w-0">
                        <p className="line-clamp-2 text-xs sm:text-sm font-medium text-gray-900 uppercase break-words">
                          {product.name}
                        </p>
                        <p className="mt-1 text-xs sm:text-sm font-semibold text-amber-700">
                          <FormattedPrice price={product.price} iconSize="sm" />
                        </p>
                      </div>
                      {!isDisabled && (
                        <div className="absolute bottom-3 right-3 rounded-full bg-amber-600 px-3 py-1 text-xs font-medium text-white opacity-0 transition-opacity group-hover:opacity-100">
                          {t.select}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {filteredProducts.length === 0 && (
                <div className="py-12 text-center text-gray-500">
                  {isRTL ? "لا توجد منتجات" : "No products found"}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
