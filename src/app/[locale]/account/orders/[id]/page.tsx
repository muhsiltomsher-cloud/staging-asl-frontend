"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Package, Truck, CheckCircle, Clock, MapPin, Gift } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/common/Button";
import { FormattedPrice } from "@/components/common/FormattedPrice";
import { getOrder, formatOrderStatus, getOrderStatusColor, formatDate, type Order } from "@/lib/api/customer";
import { OrderBundleItemsList, isOrderBundleProduct, isOrderFreeGift } from "@/components/cart/OrderBundleItemsList";

interface OrderDetailPageProps {
  params: Promise<{ locale: string; id: string }>;
}

const translations = {
  en: {
    orderDetails: "Order Details",
    backToOrders: "Back to Orders",
    orderNumber: "Order",
    orderDate: "Order Date",
    status: "Status",
    items: "Items",
    item: "item",
    subtotal: "Subtotal",
    shipping: "Shipping",
    discount: "Discount",
    tax: "Tax",
    vat: "VAT",
    total: "Total",
    shippingAddress: "Shipping Address",
    billingAddress: "Billing Address",
    paymentMethod: "Payment Method",
    notLoggedIn: "Please log in to view order details",
    login: "Login",
    loading: "Loading order details...",
    orderNotFound: "Order not found",
    backToAccount: "Back to Account",
    orderTimeline: "Order Timeline",
    orderPlaced: "Order Placed",
    processing: "Processing",
    shipped: "Shipped",
    delivered: "Delivered",
    qty: "Qty",
    freeGift: "Free Gift",
  },
  ar: {
    orderDetails: "تفاصيل الطلب",
    backToOrders: "العودة إلى الطلبات",
    orderNumber: "طلب",
    orderDate: "تاريخ الطلب",
    status: "الحالة",
    items: "العناصر",
    item: "عنصر",
    subtotal: "المجموع الفرعي",
    shipping: "الشحن",
    discount: "الخصم",
    tax: "الضريبة",
    vat: "ضريبة القيمة المضافة",
    total: "المجموع",
    shippingAddress: "عنوان الشحن",
    billingAddress: "عنوان الفواتير",
    paymentMethod: "طريقة الدفع",
    notLoggedIn: "يرجى تسجيل الدخول لعرض تفاصيل الطلب",
    login: "تسجيل الدخول",
    loading: "جاري تحميل تفاصيل الطلب...",
    orderNotFound: "الطلب غير موجود",
    backToAccount: "العودة إلى الحساب",
    orderTimeline: "الجدول الزمني للطلب",
    orderPlaced: "تم تقديم الطلب",
    processing: "قيد المعالجة",
    shipped: "تم الشحن",
    delivered: "تم التسليم",
    qty: "الكمية",
    freeGift: "هدية مجانية",
  },
};

function getStatusStep(status: string): number {
  const statusMap: Record<string, number> = {
    pending: 0,
    processing: 1,
    "on-hold": 1,
    shipped: 2,
    completed: 3,
    delivered: 3,
  };
  return statusMap[status] ?? 0;
}

function OrderTimeline({ status, t }: { status: string; t: typeof translations.en }) {
  const currentStep = getStatusStep(status);
  const steps = [
    { label: t.orderPlaced, icon: Package },
    { label: t.processing, icon: Clock },
    { label: t.shipped, icon: Truck },
    { label: t.delivered, icon: CheckCircle },
  ];

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6">
      <h3 className="font-semibold text-gray-900 mb-6">{t.orderTimeline}</h3>
      <div className="relative">
        <div className="absolute top-5 left-5 right-5 h-0.5 bg-gray-200" />
        <div
          className="absolute top-5 left-5 h-0.5 bg-green-500 transition-all duration-500"
          style={{ width: `${(currentStep / (steps.length - 1)) * 100}%`, maxWidth: "calc(100% - 40px)" }}
        />
        <div className="relative flex justify-between">
          {steps.map((step, index) => {
            const isCompleted = index <= currentStep;
            const isCurrent = index === currentStep;
            return (
              <div key={step.label} className="flex flex-col items-center">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors ${
                    isCompleted
                      ? "border-green-500 bg-green-500 text-white"
                      : "border-gray-300 bg-white text-gray-400"
                  } ${isCurrent ? "ring-4 ring-green-100" : ""}`}
                >
                  <step.icon className="h-5 w-5" />
                </div>
                <span
                  className={`mt-2 text-xs font-medium text-center ${
                    isCompleted ? "text-green-600" : "text-gray-500"
                  }`}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function AddressCard({ title, address, icon: Icon }: { title: string; address: Order["shipping"]; icon: typeof MapPin }) {
  if (!address || (!address.address_1 && !address.city)) {
    return null;
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6">
      <div className="flex items-center gap-2 mb-4">
        <Icon className="h-5 w-5 text-gray-600" />
        <h3 className="font-semibold text-gray-900">{title}</h3>
      </div>
      <div className="text-gray-600 space-y-1">
        <p className="font-medium text-gray-900">
          {address.first_name} {address.last_name}
        </p>
        {address.company && <p>{address.company}</p>}
        <p>{address.address_1}</p>
        {address.address_2 && <p>{address.address_2}</p>}
        <p>
          {address.city}
          {address.state && `, ${address.state}`} {address.postcode}
        </p>
        <p>{address.country}</p>
        {address.phone && <p>{address.phone}</p>}
      </div>
    </div>
  );
}

export default function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const resolvedParams = use(params);
  const locale = resolvedParams.locale as "en" | "ar";
  const orderId = resolvedParams.id;
  const t = translations[locale] || translations.en;
  const isRTL = locale === "ar";

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await getOrder(parseInt(orderId, 10));
        if (response.success && response.data) {
          setOrder(response.data);
        } else {
          setError(response.error?.message || "Failed to load order");
        }
      } catch (err) {
        console.error("Failed to fetch order:", err);
        setError("Failed to load order");
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated && orderId) {
      fetchOrder();
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated, orderId]);

  if (authLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 w-48 bg-gray-200 rounded mb-8" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-md text-center">
          <div className="mb-6 flex justify-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-gray-100 to-gray-200">
              <Package className="h-12 w-12 text-gray-400" />
            </div>
          </div>
          <p className="mb-8 text-gray-500">{t.notLoggedIn}</p>
          <Button asChild variant="primary" size="lg">
            <Link href={`/${locale}/login`}>{t.login}</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="animate-spin h-8 w-8 border-4 border-gray-300 border-t-black rounded-full mx-auto mb-4" />
          <p className="text-gray-500">{t.loading}</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-md text-center">
          <div className="mb-6 flex justify-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-gray-100 to-gray-200">
              <Package className="h-12 w-12 text-gray-400" />
            </div>
          </div>
          <h3 className="mb-2 text-lg font-semibold text-gray-900">{t.orderNotFound}</h3>
          <p className="mb-8 text-gray-500">{error}</p>
          <Button asChild variant="primary" size="lg">
            <Link href={`/${locale}/account/orders`}>{t.backToOrders}</Link>
          </Button>
        </div>
      </div>
    );
  }

  const subtotal = parseFloat(order.total) - parseFloat(order.shipping_total) - parseFloat(order.total_tax) + parseFloat(order.discount_total);

  return (
    <div className="container mx-auto px-4 py-8" dir={isRTL ? "rtl" : "ltr"}>
      <div className="mb-8">
        <Link
          href={`/${locale}/account/orders`}
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className={`h-4 w-4 ${isRTL ? "rotate-180" : ""}`} />
          {t.backToOrders}
        </Link>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">
            {t.orderNumber} #{order.number}
          </h1>
          <span
            className={`inline-flex items-center self-start rounded-full px-3 py-1 text-sm font-medium ${getOrderStatusColor(order.status)}`}
          >
            {formatOrderStatus(order.status)}
          </span>
        </div>
        <p className="mt-2 text-gray-500">
          {t.orderDate}: {formatDate(order.date_created, locale)}
        </p>
      </div>

      <div className="space-y-6">
        <OrderTimeline status={order.status} t={t} />

        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
          <div className="border-b p-4">
            <h3 className="font-semibold text-gray-900">
              {t.items} ({order.line_items.length} {order.line_items.length === 1 ? t.item : t.items})
            </h3>
          </div>
          <ul className="divide-y">
            {order.line_items.map((item) => {
              const isFreeGift = isOrderFreeGift(item);
              const isBundle = isOrderBundleProduct(item);
              
              return (
                <li key={item.id} className="p-4">
                  <div className="flex gap-4">
                    <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                      {item.image?.src ? (
                        <Image
                          src={item.image.src}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          {isFreeGift ? (
                            <Gift className="h-8 w-8 text-amber-500" />
                          ) : (
                            <Package className="h-8 w-8 text-gray-400" />
                          )}
                        </div>
                      )}
                      {/* Quantity Badge */}
                      <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-gray-900 text-xs font-medium text-white">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex flex-1 flex-col justify-center min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-gray-900 truncate">{item.name}</h4>
                        {isFreeGift && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                            <Gift className="h-3 w-3" />
                            {t.freeGift}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 inline-flex items-center gap-1">
                        {t.qty}: {item.quantity}
                        {!isFreeGift && !isBundle && (
                          <> × <FormattedPrice price={item.price} iconSize="xs" /></>
                        )}
                      </p>
                      {/* Bundle Items Breakdown */}
                      {isBundle && (
                        <OrderBundleItemsList item={item} locale={locale} />
                      )}
                    </div>
                    <div className="flex items-start pt-1">
                      <FormattedPrice
                        price={isFreeGift ? 0 : item.total}
                        className={`font-medium ${isFreeGift ? "text-amber-600" : "text-gray-900"}`}
                        iconSize="xs"
                      />
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
          <div className="border-t bg-gray-50 p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">{t.subtotal}</span>
              <FormattedPrice price={subtotal} className="text-gray-900" iconSize="xs" />
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">{t.shipping}</span>
              <FormattedPrice price={order.shipping_total} className="text-gray-900" iconSize="xs" />
            </div>
            {parseFloat(order.discount_total) > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">{t.discount}</span>
                <span className="text-green-600 inline-flex items-center gap-1">
                  -<FormattedPrice price={order.discount_total} iconSize="xs" />
                </span>
              </div>
            )}
            {parseFloat(order.total_tax) > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">{t.vat}</span>
                <FormattedPrice price={order.total_tax} className="text-gray-900" iconSize="xs" />
              </div>
            )}
            <div className="flex justify-between border-t pt-2 text-base font-semibold">
              <span className="text-gray-900">{t.total}</span>
              <FormattedPrice price={order.total} className="text-gray-900" iconSize="sm" />
            </div>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <AddressCard title={t.shippingAddress} address={order.shipping} icon={Truck} />
          <AddressCard title={t.billingAddress} address={order.billing} icon={MapPin} />
        </div>

        {order.payment_method_title && (
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h3 className="font-semibold text-gray-900 mb-2">{t.paymentMethod}</h3>
            <p className="text-gray-600">{order.payment_method_title}</p>
          </div>
        )}
      </div>
    </div>
  );
}
