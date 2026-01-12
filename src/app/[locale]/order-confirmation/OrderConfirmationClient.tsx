"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/common/Button";
import { OrderPrice, OrderCurrencyBadge } from "@/components/common/OrderPrice";
import { useCart } from "@/contexts/CartContext";

interface OrderData {
  id: number;
  order_key: string;
  status: string;
  total: string;
  currency: string;
  date_created: string;
  billing: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    address_1: string;
    city: string;
    country: string;
  };
  line_items: Array<{
    id: number;
    name: string;
    quantity: number;
    total: string;
  }>;
  payment_method_title: string;
}

interface OrderConfirmationClientProps {
  locale: string;
}

export default function OrderConfirmationClient({ locale }: OrderConfirmationClientProps) {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id");
  const isRTL = locale === "ar";
  const { clearCart } = useCart();
  const cartClearedRef = useRef(false);

  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) {
        setError("Order ID not found");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/orders?orderId=${orderId}`);
        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error?.message || "Failed to fetch order");
        }

        setOrder(data.data);
        
        // Clear cart after successfully fetching order (for external payment methods)
        // Use ref to prevent clearing cart multiple times
        if (!cartClearedRef.current) {
          cartClearedRef.current = true;
          try {
            await clearCart();
          } catch (cartError) {
            console.error("Failed to clear cart:", cartError);
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load order details");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, clearCart]);

  if (loading) {
    return (
      <div className="container mx-auto flex min-h-[60vh] items-center justify-center px-4 py-8">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-gray-900"></div>
          <p className="text-gray-600">{isRTL ? "جاري التحميل..." : "Loading..."}</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-6 text-6xl">!</div>
          <h1 className="mb-4 text-2xl font-bold text-gray-900">
            {isRTL ? "حدث خطأ" : "Something went wrong"}
          </h1>
          <p className="mb-8 text-gray-600">
            {error || (isRTL ? "لم نتمكن من تحميل تفاصيل الطلب" : "We couldn't load your order details")}
          </p>
          <Link href={`/${locale}/shop`}>
            <Button>{isRTL ? "العودة للتسوق" : "Continue Shopping"}</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <svg
              className="h-8 w-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="mb-2 text-3xl font-bold text-gray-900">
            {isRTL ? "شكراً لطلبك!" : "Thank you for your order!"}
          </h1>
          <p className="text-gray-600">
            {isRTL
              ? `رقم الطلب: #${order.id}`
              : `Order number: #${order.id}`}
          </p>
          {order.currency && (
            <div className="mt-3">
              <OrderCurrencyBadge 
                orderCurrency={order.currency} 
                isRTL={isRTL}
              />
            </div>
          )}
        </div>

        <div className="mb-8 rounded-lg border bg-gray-50 p-6">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            {isRTL ? "تفاصيل الطلب" : "Order Details"}
          </h2>

          <div className="mb-6 space-y-4 border-b pb-4">
            {order.line_items.map((item) => (
              <div key={item.id} className="flex justify-between">
                <span className="text-gray-600">
                  {item.name} x {item.quantity}
                </span>
                <OrderPrice price={item.total} orderCurrency={order.currency} className="font-medium" iconSize="xs" />
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-lg font-semibold">
              <span>{isRTL ? "الإجمالي" : "Total"}</span>
              <OrderPrice price={order.total} orderCurrency={order.currency} iconSize="sm" showConversion={true} isRTL={isRTL} />
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>{isRTL ? "طريقة الدفع" : "Payment Method"}</span>
              <span>{order.payment_method_title}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>{isRTL ? "الحالة" : "Status"}</span>
              <span className="capitalize">{order.status.replace(/-/g, " ")}</span>
            </div>
          </div>
        </div>

        <div className="mb-8 rounded-lg border p-6">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            {isRTL ? "عنوان الشحن" : "Shipping Address"}
          </h2>
          <div className="text-gray-600">
            <p>{order.billing.first_name} {order.billing.last_name}</p>
            <p>{order.billing.address_1}</p>
            <p>{order.billing.city}, {order.billing.country}</p>
            <p>{order.billing.email}</p>
            <p>{order.billing.phone}</p>
          </div>
        </div>

        <div className="text-center">
          <p className="mb-6 text-gray-600">
            {isRTL
              ? "سيتم إرسال تأكيد الطلب إلى بريدك الإلكتروني"
              : "A confirmation email has been sent to your email address"}
          </p>
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Link href={`/${locale}/shop`}>
              <Button variant="outline">
                {isRTL ? "متابعة التسوق" : "Continue Shopping"}
              </Button>
            </Link>
            <Link href={`/${locale}/account/orders`}>
              <Button>{isRTL ? "عرض طلباتي" : "View My Orders"}</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
