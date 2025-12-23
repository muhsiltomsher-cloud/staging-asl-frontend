"use client";

import Link from "next/link";
import Image from "next/image";
import { Trash2, ShoppingBag } from "lucide-react";
import { Button } from "@/components/common/Button";
import { QuantitySelector } from "@/components/shop/QuantitySelector";
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
  const { cart, updateCartItem, removeCartItem, isLoading } = useCart();
  const isRTL = locale === "ar";

  const breadcrumbItems = [
    { name: isRTL ? "السلة" : "Cart", href: `/${locale}/cart` },
  ];

  const cartItems = cart?.contents?.nodes || [];
  const isEmpty = cartItems.length === 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumbs items={breadcrumbItems} locale={locale as Locale} />

      <h1 className="mb-8 text-3xl font-bold text-gray-900">
        {isRTL ? "سلة التسوق" : "Shopping Cart"}
      </h1>

      {isEmpty ? (
        <div className="py-16 text-center">
          <ShoppingBag className="mx-auto mb-4 h-16 w-16 text-gray-300" />
          <h2 className="mb-2 text-xl font-semibold text-gray-900">
            {isRTL ? "سلة التسوق فارغة" : "Your cart is empty"}
          </h2>
          <p className="mb-8 text-gray-600">
            {isRTL
              ? "لم تقم بإضافة أي منتجات إلى سلة التسوق بعد."
              : "You haven't added any products to your cart yet."}
          </p>
          <Button asChild>
            <Link href={`/${locale}/shop`}>
              {isRTL ? "متابعة التسوق" : "Continue Shopping"}
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="divide-y rounded-lg border">
              {cartItems.map((item) => (
                <div key={item.key} className="flex gap-4 p-4">
                  {/* Product Image */}
                  <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-md bg-gray-100">
                    {item.product?.node?.image ? (
                      <Image
                        src={item.product.node.image.sourceUrl}
                        alt={item.product.node.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <ShoppingBag className="h-8 w-8 text-gray-300" />
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="flex flex-1 flex-col">
                    <div className="flex justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">
                          <Link href={`/${locale}/product/${item.product?.node?.slug}`}>
                            {item.product?.node?.name}
                          </Link>
                        </h3>
                        {item.variation && (
                          <p className="mt-1 text-sm text-gray-500">
                            {item.variation.node.attributes?.nodes
                              ?.map((attr) => `${attr.name}: ${attr.value}`)
                              .join(", ")}
                          </p>
                        )}
                      </div>
                      <p className="font-medium text-gray-900">
                        {formatPrice(item.total)}
                      </p>
                    </div>

                    <div className="mt-auto flex items-center justify-between pt-2">
                      <QuantitySelector
                        quantity={item.quantity}
                        onChange={(qty) => updateCartItem(item.key, qty)}
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => removeCartItem(item.key)}
                        disabled={isLoading}
                        className="text-gray-400 hover:text-red-500"
                        aria-label={isRTL ? "إزالة" : "Remove"}
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="rounded-lg border bg-gray-50 p-6">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">
                {isRTL ? "ملخص الطلب" : "Order Summary"}
              </h2>

              <div className="space-y-3 border-b pb-4">
                <div className="flex justify-between text-gray-600">
                  <span>{isRTL ? "المجموع الفرعي" : "Subtotal"}</span>
                  <span>{formatPrice(cart?.subtotal || "0")}</span>
                </div>
                {cart?.discountTotal && parseFloat(cart.discountTotal) > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>{isRTL ? "الخصم" : "Discount"}</span>
                    <span>-{formatPrice(cart.discountTotal)}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-600">
                  <span>{isRTL ? "الشحن" : "Shipping"}</span>
                  <span>
                    {cart?.shippingTotal
                      ? formatPrice(cart.shippingTotal)
                      : isRTL
                      ? "يحسب عند الدفع"
                      : "Calculated at checkout"}
                  </span>
                </div>
              </div>

              <div className="flex justify-between py-4 text-lg font-semibold text-gray-900">
                <span>{isRTL ? "الإجمالي" : "Total"}</span>
                <span>{formatPrice(cart?.total || "0")}</span>
              </div>

              <Button className="w-full" size="lg" asChild>
                <Link href={`/${locale}/checkout`}>
                  {isRTL ? "المتابعة للدفع" : "Proceed to Checkout"}
                </Link>
              </Button>

              <Link
                href={`/${locale}/shop`}
                className="mt-4 block text-center text-sm text-gray-600 hover:text-gray-900"
              >
                {isRTL ? "متابعة التسوق" : "Continue Shopping"}
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
