"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { Select } from "@/components/common/Select";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useCart } from "@/contexts/CartContext";
import type { Locale } from "@/config/site";

export default function CheckoutPage() {
  const { locale } = useParams<{ locale: string }>();
  const { formatPrice } = useCurrency();
  const { cart, cartItems, cartSubtotal, cartTotal } = useCart();
  const isRTL = locale === "ar";
  const [isSubmitting, setIsSubmitting] = useState(false);

  const breadcrumbItems = [
    { name: isRTL ? "السلة" : "Cart", href: `/${locale}/cart` },
    { name: isRTL ? "الدفع" : "Checkout", href: `/${locale}/checkout` },
  ];

  const countryOptions = [
    { value: "SA", label: isRTL ? "المملكة العربية السعودية" : "Saudi Arabia" },
    { value: "AE", label: isRTL ? "الإمارات العربية المتحدة" : "United Arab Emirates" },
    { value: "KW", label: isRTL ? "الكويت" : "Kuwait" },
    { value: "BH", label: isRTL ? "البحرين" : "Bahrain" },
    { value: "OM", label: isRTL ? "عمان" : "Oman" },
    { value: "QA", label: isRTL ? "قطر" : "Qatar" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // TODO: Implement checkout logic
    setTimeout(() => setIsSubmitting(false), 2000);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumbs items={breadcrumbItems} locale={locale as Locale} />

      <h1 className="mb-8 text-3xl font-bold text-gray-900">
        {isRTL ? "الدفع" : "Checkout"}
      </h1>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Billing & Shipping Details */}
          <div className="space-y-8 lg:col-span-2">
            {/* Contact Information */}
            <div className="rounded-lg border p-6">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">
                {isRTL ? "معلومات الاتصال" : "Contact Information"}
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label={isRTL ? "البريد الإلكتروني" : "Email"}
                  type="email"
                  required
                />
                <Input
                  label={isRTL ? "رقم الهاتف" : "Phone"}
                  type="tel"
                  required
                />
              </div>
            </div>

            {/* Shipping Address */}
            <div className="rounded-lg border p-6">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">
                {isRTL ? "عنوان الشحن" : "Shipping Address"}
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label={isRTL ? "الاسم الأول" : "First Name"}
                  required
                />
                <Input
                  label={isRTL ? "اسم العائلة" : "Last Name"}
                  required
                />
                <div className="sm:col-span-2">
                  <Input
                    label={isRTL ? "العنوان" : "Address"}
                    required
                  />
                </div>
                <Input
                  label={isRTL ? "المدينة" : "City"}
                  required
                />
                <Input
                  label={isRTL ? "المنطقة" : "State/Province"}
                />
                <Input
                  label={isRTL ? "الرمز البريدي" : "Postal Code"}
                />
                <Select
                  label={isRTL ? "الدولة" : "Country"}
                  options={countryOptions}
                  required
                />
              </div>
            </div>

            {/* Payment Method */}
            <div className="rounded-lg border p-6">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">
                {isRTL ? "طريقة الدفع" : "Payment Method"}
              </h2>
              <div className="space-y-3">
                <label className="flex cursor-pointer items-center gap-3 rounded-md border p-4 hover:bg-gray-50">
                  <input
                    type="radio"
                    name="payment"
                    value="card"
                    defaultChecked
                    className="h-4 w-4 text-gray-900"
                  />
                  <span>{isRTL ? "بطاقة ائتمان" : "Credit Card"}</span>
                </label>
                <label className="flex cursor-pointer items-center gap-3 rounded-md border p-4 hover:bg-gray-50">
                  <input
                    type="radio"
                    name="payment"
                    value="cod"
                    className="h-4 w-4 text-gray-900"
                  />
                  <span>{isRTL ? "الدفع عند الاستلام" : "Cash on Delivery"}</span>
                </label>
              </div>
            </div>

            {/* Order Notes */}
            <div className="rounded-lg border p-6">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">
                {isRTL ? "ملاحظات الطلب" : "Order Notes"}
              </h2>
              <textarea
                className="w-full rounded-md border border-gray-300 p-3 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
                rows={4}
                placeholder={
                  isRTL
                    ? "ملاحظات إضافية حول طلبك (اختياري)"
                    : "Additional notes about your order (optional)"
                }
              />
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 rounded-lg border bg-gray-50 p-6">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">
                {isRTL ? "ملخص الطلب" : "Order Summary"}
              </h2>

              {/* Cart Items */}
              <div className="max-h-64 space-y-3 overflow-y-auto border-b pb-4">
                {cartItems.map((item) => (
                  <div key={item.item_key} className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      {item.name} x {item.quantity.value}
                    </span>
                    <span className="font-medium">{formatPrice(item.totals.total)}</span>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="space-y-3 border-b py-4">
                <div className="flex justify-between text-gray-600">
                  <span>{isRTL ? "المجموع الفرعي" : "Subtotal"}</span>
                  <span>{formatPrice(cartSubtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>{isRTL ? "الشحن" : "Shipping"}</span>
                  <span>{formatPrice(cart?.totals?.shipping_total || "0")}</span>
                </div>
              </div>

              <div className="flex justify-between py-4 text-lg font-semibold text-gray-900">
                <span>{isRTL ? "الإجمالي" : "Total"}</span>
                <span>{formatPrice(cartTotal)}</span>
              </div>

              <Button
                type="submit"
                className="w-full"
                size="lg"
                isLoading={isSubmitting}
              >
                {isRTL ? "تأكيد الطلب" : "Place Order"}
              </Button>

              <p className="mt-4 text-center text-xs text-gray-500">
                {isRTL
                  ? "بالنقر على تأكيد الطلب، فإنك توافق على شروط الخدمة وسياسة الخصوصية."
                  : "By clicking Place Order, you agree to our Terms of Service and Privacy Policy."}
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
