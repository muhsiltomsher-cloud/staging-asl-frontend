"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/common/Button";
import { OrderPrice, OrderCurrencyBadge } from "@/components/common/OrderPrice";
import { useCart } from "@/contexts/CartContext";
import { OrderBundleItemsList, isOrderBundleProduct, isOrderFreeGift } from "@/components/cart/OrderBundleItemsList";
import type { OrderLineItem } from "@/lib/api/customer";

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
  line_items: OrderLineItem[];
  payment_method_title: string;
}

interface PaymentVerificationResult {
  success: boolean;
  payment_status?: "success" | "failed" | "pending";
  status_message?: string;
  invoice_id?: string;
  transaction_id?: string;
  payment_method?: string;
  error_code?: string;
  error_message?: string;
  error?: {
    code: string;
    message: string;
  };
}

interface OrderConfirmationClientProps {
  locale: string;
}

export default function OrderConfirmationClient({ locale }: OrderConfirmationClientProps) {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id");
  const myFatoorahPaymentId = searchParams.get("paymentId");
  const tabbyPaymentId = searchParams.get("payment_id");
  const tamaraOrderId = searchParams.get("orderId");
  const isRTL = locale === "ar";
  const { clearCart } = useCart();
  const cartClearedRef = useRef(false);
  const paymentVerifiedRef = useRef(false);

  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<"success" | "failed" | "pending" | null>(null);
  const [paymentMessage, setPaymentMessage] = useState<string | null>(null);
  const [verifyingPayment, setVerifyingPayment] = useState(false);

  useEffect(() => {
    const verifyPaymentAndFetchOrder = async () => {
      if (!orderId) {
        setError("Order ID not found");
        setLoading(false);
        return;
      }

      try {
        const hasExternalPayment = myFatoorahPaymentId || tabbyPaymentId || tamaraOrderId;
        
        if (hasExternalPayment && !paymentVerifiedRef.current) {
          paymentVerifiedRef.current = true;
          setVerifyingPayment(true);
          
          try {
            let verifyUrl = "";
            
            if (myFatoorahPaymentId) {
              verifyUrl = `/api/myfatoorah/verify-payment?paymentId=${myFatoorahPaymentId}`;
            } else if (tabbyPaymentId) {
              verifyUrl = `/api/tabby/verify-payment?payment_id=${tabbyPaymentId}`;
            } else if (tamaraOrderId) {
              verifyUrl = `/api/tamara/verify-payment?order_id=${tamaraOrderId}`;
            }
            
            if (verifyUrl) {
              const verifyResponse = await fetch(verifyUrl);
              const verifyData: PaymentVerificationResult = await verifyResponse.json();
              
              if (verifyData.success && verifyData.payment_status) {
                setPaymentStatus(verifyData.payment_status);
                setPaymentMessage(verifyData.status_message || null);
                
                if (verifyData.payment_status === "failed") {
                  console.error("Payment verification failed:", {
                    error_code: verifyData.error_code,
                    error_message: verifyData.error_message,
                  });
                }
              } else {
                console.error("Payment verification error:", verifyData.error);
              }
            }
          } catch (verifyError) {
            console.error("Failed to verify payment:", verifyError);
          } finally {
            setVerifyingPayment(false);
          }
        }

        const response = await fetch(`/api/orders?orderId=${orderId}`);
        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error?.message || "Failed to fetch order");
        }

        setOrder(data.data);
        
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

    verifyPaymentAndFetchOrder();
  }, [orderId, myFatoorahPaymentId, tabbyPaymentId, tamaraOrderId, clearCart]);

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

  const isPaymentFailed = paymentStatus === "failed";
  const isPaymentPending = paymentStatus === "pending";

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-3xl">
        {verifyingPayment && (
          <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4 text-center">
            <div className="flex items-center justify-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600"></div>
              <span className="text-blue-700">
                {isRTL ? "جاري التحقق من حالة الدفع..." : "Verifying payment status..."}
              </span>
            </div>
          </div>
        )}

        {isPaymentFailed && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-red-100">
                <svg className="h-5 w-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-red-800">
                  {isRTL ? "فشل الدفع" : "Payment Failed"}
                </h3>
                <p className="mt-1 text-sm text-red-700">
                  {paymentMessage || (isRTL ? "لم يتم إتمام الدفع. يرجى المحاولة مرة أخرى." : "Payment was not completed. Please try again.")}
                </p>
                <Link href={`/${locale}/checkout`} className="mt-3 inline-block">
                  <Button size="sm" variant="outline" className="border-red-300 text-red-700 hover:bg-red-100">
                    {isRTL ? "إعادة المحاولة" : "Try Again"}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}

        {isPaymentPending && (
          <div className="mb-6 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-yellow-100">
                <svg className="h-5 w-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-yellow-800">
                  {isRTL ? "الدفع قيد المعالجة" : "Payment Processing"}
                </h3>
                <p className="mt-1 text-sm text-yellow-700">
                  {paymentMessage || (isRTL ? "جاري معالجة الدفع. سيتم تحديث حالة الطلب قريباً." : "Your payment is being processed. Order status will be updated shortly.")}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="mb-8 text-center">
          <div className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full ${
            isPaymentFailed ? "bg-red-100" : isPaymentPending ? "bg-yellow-100" : "bg-green-100"
          }`}>
            {isPaymentFailed ? (
              <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : isPaymentPending ? (
              <svg className="h-8 w-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
          <h1 className="mb-2 text-3xl font-bold text-gray-900">
            {isPaymentFailed 
              ? (isRTL ? "فشل الدفع" : "Payment Failed")
              : isPaymentPending
              ? (isRTL ? "الطلب قيد المعالجة" : "Order Processing")
              : (isRTL ? "شكراً لطلبك!" : "Thank you for your order!")}
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
            {order.line_items.map((item) => {
              const isFreeGift = isOrderFreeGift(item);
              const isBundle = isOrderBundleProduct(item);
              
              return (
                <div key={item.id}>
                  <div className="flex justify-between">
                    <span className="text-gray-600">
                      {item.name} x {item.quantity}
                      {isFreeGift && (
                        <span className="ml-2 inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                          {isRTL ? "هدية مجانية" : "Free Gift"}
                        </span>
                      )}
                    </span>
                    <OrderPrice 
                      price={isFreeGift ? 0 : item.total} 
                      orderCurrency={order.currency} 
                      className={`font-medium ${isFreeGift ? "text-amber-600" : ""}`} 
                      iconSize="xs" 
                    />
                  </div>
                  {/* Bundle Items Breakdown */}
                  {isBundle && (
                    <OrderBundleItemsList item={item} locale={locale} compact />
                  )}
                </div>
              );
            })}
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
