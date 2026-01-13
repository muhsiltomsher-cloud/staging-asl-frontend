"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Package, Printer, Gift } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/common/Button";
import { OrderPrice } from "@/components/common/OrderPrice";
import { getOrder, formatOrderStatus, formatDate, type Order } from "@/lib/api/customer";
import { isOrderBundleProduct, isOrderFreeGift } from "@/components/cart/OrderBundleItemsList";

interface InvoicePageProps {
  params: Promise<{ locale: string; id: string }>;
}

const translations = {
  en: {
    invoice: "Invoice",
    backToOrder: "Back to Order",
    orderNumber: "Order",
    invoiceNumber: "Invoice Number",
    invoiceDate: "Invoice Date",
    status: "Status",
    billTo: "Bill To",
    shipTo: "Ship To",
    item: "Item",
    quantity: "Qty",
    unitPrice: "Unit Price",
    total: "Total",
    subtotal: "Subtotal",
    shipping: "Shipping",
    discount: "Discount",
    tax: "VAT",
    grandTotal: "Grand Total",
    paymentMethod: "Payment Method",
    notLoggedIn: "Please log in to view invoice",
    login: "Login",
    loading: "Loading invoice...",
    invoiceNotFound: "Invoice not found",
    backToOrders: "Back to Orders",
    print: "Print Invoice",
    freeGift: "Free Gift",
    thankYou: "Thank you for your order!",
  },
  ar: {
    invoice: "الفاتورة",
    backToOrder: "العودة إلى الطلب",
    orderNumber: "طلب",
    invoiceNumber: "رقم الفاتورة",
    invoiceDate: "تاريخ الفاتورة",
    status: "الحالة",
    billTo: "فاتورة إلى",
    shipTo: "شحن إلى",
    item: "المنتج",
    quantity: "الكمية",
    unitPrice: "سعر الوحدة",
    total: "المجموع",
    subtotal: "المجموع الفرعي",
    shipping: "الشحن",
    discount: "الخصم",
    tax: "ضريبة القيمة المضافة",
    grandTotal: "المجموع الكلي",
    paymentMethod: "طريقة الدفع",
    notLoggedIn: "يرجى تسجيل الدخول لعرض الفاتورة",
    login: "تسجيل الدخول",
    loading: "جاري تحميل الفاتورة...",
    invoiceNotFound: "الفاتورة غير موجودة",
    backToOrders: "العودة إلى الطلبات",
    print: "طباعة الفاتورة",
    freeGift: "هدية مجانية",
    thankYou: "شكراً لطلبك!",
  },
};

export default function InvoicePage({ params }: InvoicePageProps) {
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

  const handlePrint = () => {
    window.print();
  };

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
          <h3 className="mb-2 text-lg font-semibold text-gray-900">{t.invoiceNotFound}</h3>
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
    <div className="min-h-screen bg-gray-50" dir={isRTL ? "rtl" : "ltr"}>
      <div className="container mx-auto px-4 py-8 print:py-0 print:px-0">
        <div className="mb-6 flex items-center justify-between print:hidden">
          <Link
            href={`/${locale}/account/orders/${orderId}`}
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className={`h-4 w-4 ${isRTL ? "rotate-180" : ""}`} />
            {t.backToOrder}
          </Link>
          <Button onClick={handlePrint} variant="outline" size="sm">
            <Printer className={`h-4 w-4 ${isRTL ? "ml-2" : "mr-2"}`} />
            {t.print}
          </Button>
        </div>

        <div className="mx-auto max-w-4xl bg-white rounded-lg shadow-sm print:shadow-none print:rounded-none">
          <div className="p-8 print:p-6">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6 mb-8 pb-8 border-b">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{t.invoice}</h1>
                <div className="space-y-1 text-sm text-gray-600">
                  <p><span className="font-medium">{t.invoiceNumber}:</span> INV-{order.number}</p>
                  <p><span className="font-medium">{t.invoiceDate}:</span> {formatDate(order.date_created, locale)}</p>
                  <p><span className="font-medium">{t.status}:</span> {formatOrderStatus(order.status)}</p>
                </div>
              </div>
              <div className="text-right">
                <h2 className="text-xl font-bold text-gray-900 mb-1">Aromatic Scents Lab</h2>
                <p className="text-sm text-gray-600">www.aromaticscentslab.com</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-8 pb-8 border-b">
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">{t.billTo}</h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <p className="font-medium text-gray-900">
                    {order.billing.first_name} {order.billing.last_name}
                  </p>
                  {order.billing.company && <p>{order.billing.company}</p>}
                  <p>{order.billing.address_1}</p>
                  {order.billing.address_2 && <p>{order.billing.address_2}</p>}
                  <p>
                    {order.billing.city}
                    {order.billing.state && `, ${order.billing.state}`} {order.billing.postcode}
                  </p>
                  <p>{order.billing.country}</p>
                  {order.billing.email && <p>{order.billing.email}</p>}
                  {order.billing.phone && <p>{order.billing.phone}</p>}
                </div>
              </div>
              {order.shipping && (order.shipping.address_1 || order.shipping.city) && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">{t.shipTo}</h3>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p className="font-medium text-gray-900">
                      {order.shipping.first_name} {order.shipping.last_name}
                    </p>
                    {order.shipping.company && <p>{order.shipping.company}</p>}
                    <p>{order.shipping.address_1}</p>
                    {order.shipping.address_2 && <p>{order.shipping.address_2}</p>}
                    <p>
                      {order.shipping.city}
                      {order.shipping.state && `, ${order.shipping.state}`} {order.shipping.postcode}
                    </p>
                    <p>{order.shipping.country}</p>
                    {order.shipping.phone && <p>{order.shipping.phone}</p>}
                  </div>
                </div>
              )}
            </div>

            <div className="mb-8">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className={`py-3 text-sm font-semibold text-gray-900 uppercase tracking-wide ${isRTL ? "text-right" : "text-left"}`}>
                      {t.item}
                    </th>
                    <th className="py-3 text-sm font-semibold text-gray-900 uppercase tracking-wide text-center w-20">
                      {t.quantity}
                    </th>
                    <th className={`py-3 text-sm font-semibold text-gray-900 uppercase tracking-wide ${isRTL ? "text-left" : "text-right"} w-28`}>
                      {t.unitPrice}
                    </th>
                    <th className={`py-3 text-sm font-semibold text-gray-900 uppercase tracking-wide ${isRTL ? "text-left" : "text-right"} w-28`}>
                      {t.total}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {order.line_items.map((item) => {
                    const isFreeGift = isOrderFreeGift(item);
                    const isBundle = isOrderBundleProduct(item);
                    
                    return (
                      <tr key={item.id}>
                        <td className={`py-4 ${isRTL ? "text-right" : "text-left"}`}>
                          <div className="flex items-center gap-3">
                            {item.image?.src && (
                              <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded bg-gray-100 print:hidden">
                                <Image
                                  src={item.image.src}
                                  alt={item.name}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                            )}
                            <div>
                              <p className="font-medium text-gray-900">{item.name}</p>
                              {isFreeGift && (
                                <span className="inline-flex items-center gap-1 text-xs text-amber-600">
                                  <Gift className="h-3 w-3" />
                                  {t.freeGift}
                                </span>
                              )}
                              {isBundle && item.meta_data && (
                                <div className="mt-1 text-xs text-gray-500">
                                  {item.meta_data
                                    .filter((meta) => meta.key.startsWith("_bundle_item_"))
                                    .map((meta, idx) => (
                                      <p key={idx}>{meta.display_value || meta.value}</p>
                                    ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 text-center text-gray-600">
                          {item.quantity}
                        </td>
                        <td className={`py-4 ${isRTL ? "text-left" : "text-right"} text-gray-600`}>
                          {isFreeGift ? (
                            <span className="text-amber-600">-</span>
                          ) : (
                            <OrderPrice 
                              price={item.price} 
                              orderCurrency={order.currency} 
                              orderCurrencySymbol={order.currency_symbol}
                              iconSize="xs"
                            />
                          )}
                        </td>
                        <td className={`py-4 ${isRTL ? "text-left" : "text-right"} font-medium text-gray-900`}>
                          {isFreeGift ? (
                            <span className="text-amber-600">{order.currency_symbol}0.00</span>
                          ) : (
                            <OrderPrice 
                              price={item.total} 
                              orderCurrency={order.currency} 
                              orderCurrencySymbol={order.currency_symbol}
                              iconSize="xs"
                            />
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end">
              <div className="w-full sm:w-72">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t.subtotal}</span>
                    <OrderPrice 
                      price={subtotal} 
                      orderCurrency={order.currency} 
                      orderCurrencySymbol={order.currency_symbol}
                      className="text-gray-900"
                      iconSize="xs"
                    />
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t.shipping}</span>
                    <OrderPrice 
                      price={order.shipping_total} 
                      orderCurrency={order.currency} 
                      orderCurrencySymbol={order.currency_symbol}
                      className="text-gray-900"
                      iconSize="xs"
                    />
                  </div>
                  {parseFloat(order.discount_total) > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">{t.discount}</span>
                      <span className="text-green-600">
                        -<OrderPrice 
                          price={order.discount_total} 
                          orderCurrency={order.currency} 
                          orderCurrencySymbol={order.currency_symbol}
                          iconSize="xs"
                        />
                      </span>
                    </div>
                  )}
                  {parseFloat(order.total_tax) > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">{t.tax}</span>
                      <OrderPrice 
                        price={order.total_tax} 
                        orderCurrency={order.currency} 
                        orderCurrencySymbol={order.currency_symbol}
                        className="text-gray-900"
                        iconSize="xs"
                      />
                    </div>
                  )}
                  <div className="flex justify-between border-t-2 border-gray-200 pt-2 text-base font-semibold">
                    <span className="text-gray-900">{t.grandTotal}</span>
                    <OrderPrice 
                      price={order.total} 
                      orderCurrency={order.currency} 
                      orderCurrencySymbol={order.currency_symbol}
                      className="text-gray-900"
                      iconSize="sm"
                    />
                  </div>
                </div>

                {order.payment_method_title && (
                  <div className="mt-4 pt-4 border-t text-sm">
                    <span className="text-gray-600">{t.paymentMethod}: </span>
                    <span className="font-medium text-gray-900">{order.payment_method_title}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-12 pt-8 border-t text-center">
              <p className="text-gray-500 text-sm">{t.thankYou}</p>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:py-0 {
            padding-top: 0 !important;
            padding-bottom: 0 !important;
          }
          .print\\:px-0 {
            padding-left: 0 !important;
            padding-right: 0 !important;
          }
          .print\\:shadow-none {
            box-shadow: none !important;
          }
          .print\\:rounded-none {
            border-radius: 0 !important;
          }
          .print\\:p-6 {
            padding: 1.5rem !important;
          }
        }
      `}</style>
    </div>
  );
}
