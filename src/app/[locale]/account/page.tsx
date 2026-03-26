"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, Package, MapPin, Heart, Settings, LogOut, ChevronRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/common/Button";

interface AccountPageProps {
  params: Promise<{ locale: string }>;
}

export default function AccountPage({ params }: AccountPageProps) {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const [locale, setLocale] = useState<string>("en");

  useEffect(() => {
    params.then((p) => setLocale(p.locale));
  }, [params]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(`/${locale}/login`);
    }
  }, [isLoading, isAuthenticated, locale, router]);

  const isRTL = locale === "ar";

  const t = {
    en: {
      myAccount: "My Account",
      welcome: "Welcome back",
      orders: "My Orders",
      ordersDesc: "View and track your orders",
      addresses: "Addresses",
      addressesDesc: "Manage your delivery addresses",
      wishlist: "Wishlist",
      wishlistDesc: "View your saved items",
      settings: "Account Settings",
      settingsDesc: "Update your profile and preferences",
      logout: "Logout",
      logoutDesc: "Sign out of your account",
      memberSince: "Member since",
      loading: "Loading...",
    },
    ar: {
      myAccount: "حسابي",
      welcome: "مرحباً بعودتك",
      orders: "طلباتي",
      ordersDesc: "عرض وتتبع طلباتك",
      addresses: "العناوين",
      addressesDesc: "إدارة عناوين التوصيل",
      wishlist: "قائمة الرغبات",
      wishlistDesc: "عرض المنتجات المحفوظة",
      settings: "إعدادات الحساب",
      settingsDesc: "تحديث ملفك الشخصي والتفضيلات",
      logout: "تسجيل الخروج",
      logoutDesc: "الخروج من حسابك",
      memberSince: "عضو منذ",
      loading: "جاري التحميل...",
    },
  };

  const texts = t[locale as keyof typeof t] || t.en;

  const menuItems = [
    {
      icon: Package,
      label: texts.orders,
      description: texts.ordersDesc,
      href: `/${locale}/account/orders`,
    },
    {
      icon: MapPin,
      label: texts.addresses,
      description: texts.addressesDesc,
      href: `/${locale}/account/addresses`,
    },
    {
      icon: Heart,
      label: texts.wishlist,
      description: texts.wishlistDesc,
      href: `/${locale}/account/wishlist`,
    },
    {
      icon: Settings,
      label: texts.settings,
      description: texts.settingsDesc,
      href: `/${locale}/account/settings`,
    },
  ];

  const handleLogout = async () => {
    await logout();
    router.push(`/${locale}`);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[calc(100vh-200px)] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-black"></div>
          <p className="text-gray-600">{texts.loading}</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8" dir={isRTL ? "rtl" : "ltr"}>
      <div className="container mx-auto px-4">
        <h1 className="mb-8 text-2xl font-bold text-gray-900 md:text-3xl">
          {texts.myAccount}
        </h1>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-gray-100">
                  <User className="h-12 w-12 text-gray-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {user.user_display_name}
                </h2>
                <p className="mt-1 text-gray-500">{user.user_email}</p>
                <p className="mt-2 text-sm text-gray-400">
                  {texts.welcome}
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="rounded-lg bg-white shadow-sm">
              <nav>
                <ul className="divide-y">
                  {menuItems.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className="flex items-center justify-between p-4 transition-colors hover:bg-gray-50"
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                            <item.icon className="h-6 w-6 text-gray-600" />
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">
                              {item.label}
                            </h3>
                            <p className="text-sm text-gray-500">
                              {item.description}
                            </p>
                          </div>
                        </div>
                        <ChevronRight
                          className={`h-5 w-5 text-gray-400 ${
                            isRTL ? "rotate-180" : ""
                          }`}
                        />
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>

              <div className="border-t p-4">
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  className="w-full justify-center gap-2 text-red-600 hover:bg-red-50 hover:text-red-700"
                >
                  <LogOut className="h-5 w-5" />
                  {texts.logout}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
