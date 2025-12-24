"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { ArrowLeft, Package, Eye } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/common/Button";
import { FormattedPrice } from "@/components/common/FormattedPrice";
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
    notLoggedIn: "يرجى تسجيل الدخول لعرض طلباتك",
    login: "تسجيل الدخول",
    loading: "جاري تحميل الطلبات...",
  },
};

export default function OrdersPage({ params }: OrdersPageProps) {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
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

  return (
    <div className="container mx-auto px-4 py-8" dir={isRTL ? "rtl" : "ltr"}>
      <div className="mb-8">
        <Link
          href={`/${locale}/account`}
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className={`h-4 w-4 ${isRTL ? "rotate-180" : ""}`} />
          {t.backToAccount}
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">
          {t.orders}
        </h1>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin h-8 w-8 border-4 border-gray-300 border-t-black rounded-full mx-auto mb-4" />
          <p className="text-gray-500">{t.loading}</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-12">
          <div className="mb-6 flex justify-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-gray-100 to-gray-200">
              <Package className="h-12 w-12 text-gray-400" />
            </div>
          </div>
          <h3 className="mb-2 text-lg font-semibold text-gray-900">
            {t.orderHistory}
          </h3>
          <p className="mb-8 text-gray-500">{t.noOrders}</p>
          <Button asChild variant="primary" size="lg">
            <Link href={`/${locale}/shop`}>{t.startShopping}</Link>
          </Button>
        </div>
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
                    <span>{formatDate(order.date_created, locale)}</span>
                    <span>
                      {order.line_items.length} {t.items}
                    </span>
                    <FormattedPrice
                      price={order.total}
                      className="font-medium text-gray-900"
                      iconSize="xs"
                    />
                  </div>
                </div>
                <Button asChild variant="outline" size="sm">
                  <Link href={`/${locale}/account/orders/${order.id}`}>
                    <Eye className="mr-2 h-4 w-4" />
                    {t.viewOrder}
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
