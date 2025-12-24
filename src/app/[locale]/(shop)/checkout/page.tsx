"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { Select } from "@/components/common/Select";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { FormattedPrice } from "@/components/common/FormattedPrice";
import { useCart } from "@/contexts/CartContext";
import type { Locale } from "@/config/site";

interface CheckoutFormData {
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  paymentMethod: string;
  orderNotes: string;
}

export default function CheckoutPage() {
  const { locale } = useParams<{ locale: string }>();
  const router = useRouter();
  const { cart, cartItems, cartSubtotal, cartTotal, clearCart } = useCart();
  const isRTL = locale === "ar";
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<CheckoutFormData>({
    email: "",
    phone: "",
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    state: "",
    postalCode: "",
    country: "AE",
    paymentMethod: "cod",
    orderNotes: "",
  });

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

  const handleInputChange = (field: keyof CheckoutFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const lineItems = cartItems.map((item) => ({
        product_id: item.id,
        quantity: item.quantity.value,
        variation_id: item.variation_id || undefined,
      }));

      const orderPayload = {
        payment_method: formData.paymentMethod,
        billing: {
          first_name: formData.firstName,
          last_name: formData.lastName,
          address_1: formData.address,
          city: formData.city,
          state: formData.state,
          postcode: formData.postalCode,
          country: formData.country,
          email: formData.email,
          phone: formData.phone,
        },
        line_items: lineItems,
        customer_note: formData.orderNotes,
      };

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderPayload),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error?.message || "Failed to create order");
      }

      if (clearCart) {
        await clearCart();
      }

      router.push(`/${locale}/order-confirmation?order_id=${data.order_id}&order_key=${data.order_key}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred while placing your order");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumbs items={breadcrumbItems} locale={locale as Locale} />

      <h1 className="mb-8 text-3xl font-bold text-gray-900">
        {isRTL ? "الدفع" : "Checkout"}
      </h1>

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="space-y-8 lg:col-span-2">
            <div className="rounded-lg border p-6">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">
                {isRTL ? "معلومات الاتصال" : "Contact Information"}
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label={isRTL ? "البريد الإلكتروني" : "Email"}
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                />
                <Input
                  label={isRTL ? "رقم الهاتف" : "Phone"}
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                />
              </div>
            </div>

            <div className="rounded-lg border p-6">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">
                {isRTL ? "عنوان الشحن" : "Shipping Address"}
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label={isRTL ? "الاسم الأول" : "First Name"}
                  required
                  value={formData.firstName}
                  onChange={(e) => handleInputChange("firstName", e.target.value)}
                />
                <Input
                  label={isRTL ? "اسم العائلة" : "Last Name"}
                  required
                  value={formData.lastName}
                  onChange={(e) => handleInputChange("lastName", e.target.value)}
                />
                <div className="sm:col-span-2">
                  <Input
                    label={isRTL ? "العنوان" : "Address"}
                    required
                    value={formData.address}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                  />
                </div>
                <Input
                  label={isRTL ? "المدينة" : "City"}
                  required
                  value={formData.city}
                  onChange={(e) => handleInputChange("city", e.target.value)}
                />
                <Input
                  label={isRTL ? "المنطقة" : "State/Province"}
                  value={formData.state}
                  onChange={(e) => handleInputChange("state", e.target.value)}
                />
                <Input
                  label={isRTL ? "الرمز البريدي" : "Postal Code"}
                  value={formData.postalCode}
                  onChange={(e) => handleInputChange("postalCode", e.target.value)}
                />
                <Select
                  label={isRTL ? "الدولة" : "Country"}
                  options={countryOptions}
                  required
                  value={formData.country}
                  onChange={(e) => handleInputChange("country", e.target.value)}
                />
              </div>
            </div>

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
                    checked={formData.paymentMethod === "card"}
                    onChange={(e) => handleInputChange("paymentMethod", e.target.value)}
                    className="h-4 w-4 text-gray-900"
                  />
                  <span>{isRTL ? "بطاقة ائتمان" : "Credit Card"}</span>
                </label>
                <label className="flex cursor-pointer items-center gap-3 rounded-md border p-4 hover:bg-gray-50">
                  <input
                    type="radio"
                    name="payment"
                    value="cod"
                    checked={formData.paymentMethod === "cod"}
                    onChange={(e) => handleInputChange("paymentMethod", e.target.value)}
                    className="h-4 w-4 text-gray-900"
                  />
                  <span>{isRTL ? "الدفع عند الاستلام" : "Cash on Delivery"}</span>
                </label>
              </div>
            </div>

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
                value={formData.orderNotes}
                onChange={(e) => handleInputChange("orderNotes", e.target.value)}
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
                    <FormattedPrice
                      price={parseInt(item.totals.total) / 100}
                      className="font-medium"
                      iconSize="xs"
                    />
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="space-y-3 border-b py-4">
                <div className="flex justify-between text-gray-600">
                  <span>{isRTL ? "المجموع الفرعي" : "Subtotal"}</span>
                  <FormattedPrice
                    price={parseInt(cartSubtotal) / 100}
                    iconSize="xs"
                  />
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>{isRTL ? "الشحن" : "Shipping"}</span>
                  <FormattedPrice
                    price={parseInt(cart?.totals?.shipping_total || "0") / 100}
                    iconSize="xs"
                  />
                </div>
              </div>

              <div className="flex justify-between py-4 text-lg font-semibold text-gray-900">
                <span>{isRTL ? "الإجمالي" : "Total"}</span>
                <FormattedPrice
                  price={parseInt(cartTotal) / 100}
                  iconSize="sm"
                />
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
