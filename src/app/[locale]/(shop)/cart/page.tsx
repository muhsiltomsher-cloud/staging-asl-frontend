"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft, User, UserCheck, Tag, X } from "lucide-react";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { FormattedPrice } from "@/components/common/FormattedPrice";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import type { Locale } from "@/config/site";

interface PublicCoupon {
  code: string;
  description: string;
  discount_type: "percent" | "fixed_cart" | "fixed_product";
  amount: string;
  minimum_amount: string;
  free_shipping: boolean;
}

export default function CartPage() {
  const { locale } = useParams<{ locale: string }>();
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
    selectedCoupons,
    couponDiscount,
  } = useCart();
  const { isAuthenticated, user } = useAuth();

  const isRTL = locale === "ar";
  const isEmpty = cartItems.length === 0;
  
  const currencyMinorUnit = cart?.currency?.currency_minor_unit ?? 2;
  const divisor = Math.pow(10, currencyMinorUnit);

  const [couponCode, setCouponCode] = useState("");
  const [couponError, setCouponError] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [availableCoupons, setAvailableCoupons] = useState<PublicCoupon[]>([]);
  const [isLoadingCoupons, setIsLoadingCoupons] = useState(false);

  useEffect(() => {
    const fetchAvailableCoupons = async () => {
      setIsLoadingCoupons(true);
      try {
        const response = await fetch("/api/coupons");
        const data = await response.json();
        if (data.success && data.coupons) {
          setAvailableCoupons(data.coupons);
        }
      } catch (err) {
        console.error("Failed to fetch available coupons:", err);
      } finally {
        setIsLoadingCoupons(false);
      }
    };
    fetchAvailableCoupons();
  }, []);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    setCouponError("");
    try {
      const couponData = availableCoupons.find(c => c.code.toLowerCase() === couponCode.toLowerCase().trim());
      const result = await applyCoupon(couponCode, couponData);
      if (!result.success) {
        setCouponError(result.error || (isRTL ? "كود الخصم غير صالح" : "Invalid coupon code"));
      } else {
        setCouponCode("");
      }
    } catch {
      setCouponError(isRTL ? "كود الخصم غير صالح" : "Invalid coupon code");
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

  const handleSelectCoupon = (code: string) => {
    setCouponCode(code);
  };

  const formatCouponDiscount = (coupon: PublicCoupon) => {
    if (coupon.discount_type === "percent") {
      return `${coupon.amount}%`;
    }
    return `${coupon.amount} AED`;
  };

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
      calculatedAtCheckout: "Calculated at checkout",
      backToShop: "Continue Shopping",
      loggedInAs: "Logged in as",
      guestCheckout: "You are checking out as a guest",
      loginForBenefits: "Login for faster checkout",
      couponCode: "Coupon Code",
      enterCouponCode: "Enter coupon code",
      apply: "Apply",
      availableCoupons: "Available coupons:",
      loadingCoupons: "Loading coupons...",
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
      calculatedAtCheckout: "يحسب عند الدفع",
      backToShop: "متابعة التسوق",
      loggedInAs: "تم تسجيل الدخول كـ",
      guestCheckout: "أنت تتسوق كضيف",
      loginForBenefits: "سجل دخولك لتجربة أسرع",
      couponCode: "كود الخصم",
      enterCouponCode: "أدخل كود الخصم",
      apply: "تطبيق",
      availableCoupons: "أكواد الخصم المتاحة:",
      loadingCoupons: "جاري تحميل الأكواد...",
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

  return (
    <div className="min-h-screen pb-32 md:pb-8" style={{ backgroundColor: '#F5F0E8' }}>
      <div className="container mx-auto px-4 py-8">
        <Breadcrumbs items={breadcrumbItems} locale={locale as Locale} />

        {/* Login Status Indicator */}
        {!isEmpty && (
          <div className="mb-6 flex items-center gap-3 rounded-lg border border-black/10 bg-white p-4">
            {isAuthenticated ? (
              <>
                <UserCheck className="h-5 w-5 text-green-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">
                    {texts.loggedInAs} <span className="font-semibold">{user?.user_email}</span>
                  </p>
                </div>
              </>
            ) : (
              <>
                <User className="h-5 w-5 text-amber-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">{texts.guestCheckout}</p>
                  <Link href={`/${locale}/login`} className="text-sm text-gray-600 underline hover:text-gray-900">
                    {texts.loginForBenefits}
                  </Link>
                </div>
              </>
            )}
          </div>
        )}

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
                              sizes="96px"
                              className="object-cover"
                              loading="lazy"
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
                        <FormattedPrice
                          price={parseFloat(item.price) / divisor}
                          className="font-medium"
                          iconSize="xs"
                        />
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
                        <FormattedPrice
                          price={parseFloat(item.totals.total)}
                          className="font-semibold"
                          iconSize="xs"
                        />
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
            <div className="rounded-lg border border-black/10 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">
                {texts.orderSummary}
              </h2>

              {/* Coupon Code Section */}
              <div className="border-b border-black/10 pb-4 mb-4">
                <div className="mb-3">
                  <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
                    <Tag className="h-4 w-4" />
                    {texts.couponCode}
                  </label>
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder={texts.enterCouponCode}
                      className="flex-1"
                      error={couponError}
                    />
                    <Button
                      type="button"
                      onClick={handleApplyCoupon}
                      isLoading={couponLoading}
                      disabled={couponLoading || !couponCode.trim()}
                      size="sm"
                    >
                      {texts.apply}
                    </Button>
                  </div>
                </div>

                {/* Applied Coupons */}
                {selectedCoupons.length > 0 && (
                  <div className="mb-3 space-y-2">
                    {selectedCoupons.map((coupon) => (
                      <div
                        key={coupon.code}
                        className="flex items-center justify-between rounded-lg border border-green-200 bg-green-50 px-3 py-2"
                      >
                        <div className="flex items-center gap-2">
                          <Tag className="h-4 w-4 text-green-600" />
                          <span className="text-sm font-medium text-green-700">
                            {coupon.code}
                          </span>
                          <span className="text-xs text-green-600">
                            ({coupon.discount_type === "percent" ? `${coupon.amount}%` : `${coupon.amount} AED`})
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveCoupon(coupon.code)}
                          className="flex items-center gap-1 text-sm text-red-600 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Available Coupons */}
                {availableCoupons.length > 0 && (
                  <div>
                    <p className="mb-2 text-xs font-medium text-gray-500">
                      {texts.availableCoupons}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {availableCoupons.slice(0, 3).map((coupon) => (
                        <button
                          key={coupon.code}
                          type="button"
                          onClick={() => handleSelectCoupon(coupon.code)}
                          className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-800 transition-colors hover:bg-amber-100"
                          title={coupon.description || `${formatCouponDiscount(coupon)} off`}
                        >
                          <Tag className="h-3 w-3" />
                          {coupon.code}
                          <span className="text-amber-600">({formatCouponDiscount(coupon)})</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {isLoadingCoupons && (
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <div className="h-3 w-3 animate-spin rounded-full border border-gray-300 border-t-gray-600"></div>
                    {texts.loadingCoupons}
                  </div>
                )}
              </div>

              <div className="space-y-3 border-b border-black/10 pb-4">
                <div className="flex justify-between text-gray-600">
                  <span>{texts.subtotal}</span>
                  <FormattedPrice
                    price={parseFloat(cartSubtotal) / divisor}
                    iconSize="xs"
                  />
                </div>
                {couponDiscount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>{texts.discount}</span>
                      <span className="inline-flex items-center gap-1">
                        -<FormattedPrice
                          price={couponDiscount / divisor}
                          iconSize="xs"
                        />
                      </span>
                    </div>
                  )}
                <div className="flex justify-between text-gray-600">
                  <span>{texts.shipping}</span>
                  <span>
                    {cart?.totals?.shipping_total &&
                    parseFloat(cart.totals.shipping_total) > 0
                      ? <FormattedPrice
                          price={parseFloat(cart.totals.shipping_total) / divisor}
                          iconSize="xs"
                        />
                      : texts.calculatedAtCheckout}
                  </span>
                </div>
              </div>

              <div className="flex justify-between py-4 text-lg font-semibold text-gray-900">
                <span>{texts.orderTotal}</span>
                <FormattedPrice
                  price={parseFloat(cartTotal) / divisor}
                  iconSize="sm"
                />
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

      {/* Mobile Sticky Order Summary - positioned above bottom nav bar */}
      {!isEmpty && (
        <div className="fixed bottom-16 left-0 right-0 z-40 border-t border-black/10 bg-white px-4 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.1)] md:hidden" style={{ paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom, 0px))' }}>
          <div className="flex items-center justify-between gap-4">
            <div className="flex flex-col">
              <span className="text-xs text-gray-500">{texts.orderTotal}</span>
              <FormattedPrice
                price={parseFloat(cartTotal) / divisor}
                className="text-lg font-bold text-gray-900"
                iconSize="sm"
              />
            </div>
            <Button size="lg" className="flex-1 max-w-[200px]" asChild>
              <Link href={`/${locale}/checkout`}>{texts.checkout}</Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
