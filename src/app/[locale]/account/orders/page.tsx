"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { Package, Eye, FileText } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/common/Button";
import { OrderPrice } from "@/components/common/OrderPrice";
import { AccountAuthGuard } from "@/components/account/AccountAuthGuard";
import { AccountPageHeader } from "@/components/account/AccountPageHeader";
import { AccountEmptyState } from "@/components/account/AccountEmptyState";
import { AccountLoadingSpinner } from "@/components/account/AccountLoadingSpinner";
import { getCustomerOrders, formatOrderStatus, getOrderStatusColor, formatDate, type Order } from "@/lib/api/customer";

interface OrdersPageProps {
  params: Promise<{ locale: string }>;
}

const translations = {
  en: {
    orders: "Orders",
    backToAccount: "Back to Account",
    orderHistory: "Order History",
    noOrders: "You haven't placed any orders yet",
    startShopping: "Start Shopping",
    orderNumber: "Order",
    date: "Date",
    status: "Status",
    total: "Total",
    items: "items",
    viewOrder: "View Order",
    showInvoice: "Show Invoice",
    notLoggedIn: "Please log in to view your orders",
    login: "Login",
    loading: "Loading orders...",
  },
  ar: {
    orders: "الطلبات",
    backToAccount: "العودة إلى الحساب",
    orderHistory: "سجل الطلبات",
    noOrders: "لم تقم بأي طلبات بعد",
    startShopping: "ابدأ التسوق",
    orderNumber: "طلب",
    date: "التاريخ",
    status: "الحالة",
    total: "المجموع",
    items: "عناصر",
    viewOrder: "عرض الطلب",
    showInvoice: "عرض الفاتورة",
    notLoggedIn: "يرجى تسجيل الدخول لعرض طلباتك",
    login: "تسجيل الدخول",
    loading: "جاري تحميل الطلبات...",
  },
};


export default function OrdersPage({ params }: OrdersPageProps) {
  const { user, isAuthenticated } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const resolvedParams = use(params);
  const locale = resolvedParams.locale as "en" | "ar";
  const t = translations[locale] || translations.en;
  const isRTL = locale === "ar";

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user?.user_id) return;
      
      try {
        setIsLoading(true);
        const response = await getCustomerOrders(user.user_id);
        if (response.success && response.data) {
          setOrders(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch orders:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated && user) {
      fetchOrders();
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated, user]);

  return (
    <AccountAuthGuard
      locale={locale}
      icon={Package}
      notLoggedInText={t.notLoggedIn}
      loginText={t.login}
    >
      <div className="container mx-auto px-4 py-8" dir={isRTL ? "rtl" : "ltr"}>
        <AccountPageHeader
          locale={locale}
          title={t.orders}
          backHref={`/${locale}/account`}
          backLabel={t.backToAccount}
        />

        {isLoading ? (
          <AccountLoadingSpinner message={t.loading} />
        ) : orders.length === 0 ? (
          <AccountEmptyState
            icon={Package}
            title={t.orderHistory}
            message={t.noOrders}
            actionLabel={t.startShopping}
            actionHref={`/${locale}/shop`}
          />
        ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="rounded-xl border border-gray-200 bg-white p-6 transition-all hover:shadow-md"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-gray-900">
                      {t.orderNumber} #{order.number}
                    </h3>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getOrderStatusColor(order.status)}`}
                    >
                      {formatOrderStatus(order.status)}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                    <span>{formatDate(order.date_created, locale, order.billing?.country)}</span>
                    <span>
                      {order.line_items.length} {t.items}
                    </span>
                    <OrderPrice
                      price={order.total}
                      orderCurrency={order.currency}
                      orderCurrencySymbol={order.currency_symbol}
                      className="font-medium text-gray-900"
                      iconSize="xs"
                    />
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                  <Button asChild variant="outline" size="sm" className="whitespace-nowrap">
                    <Link href={`/${locale}/account/orders/${order.id}`}>
                      <Eye className={`h-4 w-4 ${isRTL ? "ml-2" : "mr-2"}`} />
                      {t.viewOrder}
                    </Link>
                  </Button>
                  {order.status === "completed" && (
                    <Button asChild variant="outline" size="sm" className="whitespace-nowrap">
                      <Link href={`/${locale}/account/orders/${order.id}/invoice`}>
                        <FileText className={`h-4 w-4 ${isRTL ? "ml-2" : "mr-2"}`} />
                        {t.showInvoice}
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      </div>
    </AccountAuthGuard>
  );
}
