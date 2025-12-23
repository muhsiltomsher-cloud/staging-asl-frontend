"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft } from "lucide-react";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useCart } from "@/contexts/CartContext";
import type { Locale } from "@/config/site";

interface CartPageProps {
  params: { locale: string };
}

export default function CartPage({ params }: CartPageProps) {
  const { locale } = params;
  const { formatPrice } = useCurrency();
  const {
    cart,
    cartItems,
    cartItemsCount,
    cartSubtotal,
    cartTotal,
    isLoading,
    updateCartItem,
    removeCartItem,
    applyCoupon,
    removeCoupon,
  } = useCart();

  const [couponCode, setCouponCode] = useState("");
  const [couponError, setCouponError] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);

  const isRTL = locale === "ar";
  const isEmpty = cartItems.length === 0;

  const breadcrumbItems = [
    { name: isRTL ? "السلة" : "Cart", href: `/${locale}/cart` },
  ];

  const t = {
    en: {
      cart: "Shopping Cart",
      emptyCart: "Your cart is empty",
      emptyCartDesc: "You haven't added any products to your cart yet.",
      continueShopping: "Continue Shopping",
      product: "Product",
      price: "Price",
      quantity: "Quantity",
      total: "Total",
      remove: "Remove",
      orderSummary: "Order Summary",
      subtotal: "Subtotal",
      shipping: "Shipping",
      discount: "Discount",
      orderTotal: "Total",
      checkout: "Proceed to Checkout",
      couponCode: "Coupon Code",
      applyCoupon: "Apply",
      couponError: "Invalid coupon code",
      removeCoupon: "Remove",
      calculatedAtCheckout: "Calculated at checkout",
      backToShop: "Continue Shopping",
    },
    ar: {
      cart: "سلة التسوق",
      emptyCart: "سلة التسوق فارغة",
      emptyCartDesc: "لم تقم بإضافة أي منتجات إلى سلة التسوق بعد.",
      continueShopping: "متابعة التسوق",
      product: "المنتج",
      price: "السعر",
      quantity: "الكمية",
      total: "المجموع",
      remove: "إزالة",
      orderSummary: "ملخص الطلب",
      subtotal: "المجموع الفرعي",
      shipping: "الشحن",
      discount: "الخصم",
      orderTotal: "الإجمالي",
      checkout: "المتابعة للدفع",
      couponCode: "كود الخصم",
      applyCoupon: "تطبيق",
      couponError: "كود الخصم غير صالح",
      removeCoupon: "إزالة",
      calculatedAtCheckout: "يحسب عند الدفع",
      backToShop: "متابعة التسوق",
    },
  };

  const texts = t[locale as keyof typeof t] || t.en;

  const handleQuantityChange = async (itemKey: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    try {
      await updateCartItem(itemKey, newQuantity);
    } catch (error) {
      console.error("Failed to update quantity:", error);
    }
  };

  const handleRemoveItem = async (itemKey: string) => {
    try {
      await removeCartItem(itemKey);
    } catch (error) {
      console.error("Failed to remove item:", error);
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    setCouponError("");
    try {
      const success = await applyCoupon(couponCode);
      if (!success) {
        setCouponError(texts.couponError);
      } else {
        setCouponCode("");
      }
    } catch {
      setCouponError(texts.couponError);
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = async (code: string) => {
    try {
      await removeCoupon(code);
    } catch (error) {
      console.error("Failed to remove coupon:", error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumbs items={breadcrumbItems} locale={locale as Locale} />

      <h1 className="mb-8 text-3xl font-bold text-gray-900">
        {texts.cart} {cartItemsCount > 0 && `(${cartItemsCount})`}
      </h1>

      {isEmpty ? (
        <div className="py-16 text-center">
          <ShoppingBag className="mx-auto mb-4 h-16 w-16 text-gray-300" />
          <h2 className="mb-2 text-xl font-semibold text-gray-900">
            {texts.emptyCart}
          </h2>
          <p className="mb-8 text-gray-600">{texts.emptyCartDesc}</p>
          <Button asChild>
            <Link href={`/${locale}/shop`}>{texts.continueShopping}</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="rounded-lg bg-white shadow-sm">
              <div className="hidden border-b p-4 md:grid md:grid-cols-12 md:gap-4">
                <div className="col-span-6 text-sm font-medium text-gray-500">
                  {texts.product}
                </div>
                <div className="col-span-2 text-center text-sm font-medium text-gray-500">
                  {texts.price}
                </div>
                <div className="col-span-2 text-center text-sm font-medium text-gray-500">
                  {texts.quantity}
                </div>
                <div className="col-span-2 text-center text-sm font-medium text-gray-500">
                  {texts.total}
                </div>
              </div>

              <ul className="divide-y">
                {cartItems.map((item) => (
                  <li key={item.item_key} className="p-4">
                    <div className="grid items-center gap-4 md:grid-cols-12">
                      <div className="flex gap-4 md:col-span-6">
                        <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                          {item.featured_image ? (
                            <Image
                              src={item.featured_image}
                              alt={item.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center">
                              <ShoppingBag className="h-8 w-8 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col justify-center">
                          <Link
                            href={`/${locale}/product/${item.slug}`}
                            className="font-medium text-gray-900 hover:text-gray-700 line-clamp-2"
                          >
                            {item.name}
                          </Link>
                          {item.meta.sku && (
                            <p className="mt-1 text-sm text-gray-500">
                              SKU: {item.meta.sku}
                            </p>
                          )}
                          <button
                            onClick={() => handleRemoveItem(item.item_key)}
                            className="mt-2 flex items-center gap-1 text-sm text-red-600 hover:text-red-700 md:hidden"
                            disabled={isLoading}
                          >
                            <Trash2 className="h-4 w-4" />
                            {texts.remove}
                          </button>
                        </div>
                      </div>

                      <div className="hidden text-center md:col-span-2 md:block">
                        <span className="font-medium">
                          {formatPrice(item.price)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between md:col-span-2 md:justify-center">
                        <span className="text-sm text-gray-500 md:hidden">
                          {texts.quantity}:
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              handleQuantityChange(
                                item.item_key,
                                item.quantity.value - 1
                              )
                            }
                            className="flex h-8 w-8 items-center justify-center rounded-full border hover:bg-gray-100 disabled:opacity-50"
                            disabled={isLoading || item.quantity.value <= 1}
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="w-8 text-center">
                            {item.quantity.value}
                          </span>
                          <button
                            onClick={() =>
                              handleQuantityChange(
                                item.item_key,
                                item.quantity.value + 1
                              )
                            }
                            className="flex h-8 w-8 items-center justify-center rounded-full border hover:bg-gray-100 disabled:opacity-50"
                            disabled={isLoading}
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between md:col-span-2 md:justify-center">
                        <span className="text-sm text-gray-500 md:hidden">
                          {texts.total}:
                        </span>
                        <span className="font-semibold">
                          {formatPrice(item.totals.total)}
                        </span>
                      </div>

                      <div className="hidden md:col-span-12 md:flex md:justify-end">
                        <button
                          onClick={() => handleRemoveItem(item.item_key)}
                          className="text-gray-400 hover:text-red-500"
                          aria-label={texts.remove}
                          disabled={isLoading}
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="rounded-lg border bg-gray-50 p-6">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">
                {texts.orderSummary}
              </h2>

              <div className="mb-6">
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  {texts.couponCode}
                </label>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder={texts.couponCode}
                    className="flex-1"
                    error={couponError}
                  />
                  <Button
                    onClick={handleApplyCoupon}
                    isLoading={couponLoading}
                    disabled={couponLoading || !couponCode.trim()}
                    size="sm"
                  >
                    {texts.applyCoupon}
                  </Button>
                </div>
              </div>

              {cart?.coupons && cart.coupons.length > 0 && (
                <div className="mb-6 space-y-2">
                  {cart.coupons.map((coupon) => (
                    <div
                      key={coupon.coupon}
                      className="flex items-center justify-between rounded-lg bg-green-50 px-3 py-2"
                    >
                      <span className="text-sm font-medium text-green-700">
                        {coupon.coupon}
                      </span>
                      <button
                        onClick={() => handleRemoveCoupon(coupon.coupon)}
                        className="text-sm text-red-600 hover:text-red-700"
                      >
                        {texts.removeCoupon}
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="space-y-3 border-b pb-4">
                <div className="flex justify-between text-gray-600">
                  <span>{texts.subtotal}</span>
                  <span>{formatPrice(cartSubtotal)}</span>
                </div>
                {cart?.totals?.discount_total &&
                  parseFloat(cart.totals.discount_total) > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>{texts.discount}</span>
                      <span>-{formatPrice(cart.totals.discount_total)}</span>
                    </div>
                  )}
                <div className="flex justify-between text-gray-600">
                  <span>{texts.shipping}</span>
                  <span>
                    {cart?.totals?.shipping_total &&
                    parseFloat(cart.totals.shipping_total) > 0
                      ? formatPrice(cart.totals.shipping_total)
                      : texts.calculatedAtCheckout}
                  </span>
                </div>
              </div>

              <div className="flex justify-between py-4 text-lg font-semibold text-gray-900">
                <span>{texts.orderTotal}</span>
                <span>{formatPrice(cartTotal)}</span>
              </div>

              <Button className="w-full" size="lg" asChild>
                <Link href={`/${locale}/checkout`}>{texts.checkout}</Link>
              </Button>

              <Link
                href={`/${locale}/shop`}
                className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className={`h-4 w-4 ${isRTL ? "rotate-180" : ""}`} />
                {texts.backToShop}
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
