"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { User, Package, MapPin, Heart, ChevronRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/common/Button";

interface MyAccountPageProps {
  params: Promise<{ locale: string }>;
}

const translations = {
  en: {
    myAccount: "My Account",
    welcome: "Welcome back",
    profile: "Profile",
    profileDesc: "Manage your personal information",
    orders: "Orders",
    ordersDesc: "View your order history",
    addresses: "Addresses",
    addressesDesc: "Manage your shipping addresses",
    wishlist: "Wishlist",
    wishlistDesc: "View your saved items",
    notLoggedIn: "Please log in to access your account",
    login: "Login",
    register: "Create Account",
  },
  ar: {
    myAccount: "حسابي",
    welcome: "مرحباً بعودتك",
    profile: "الملف الشخصي",
    profileDesc: "إدارة معلوماتك الشخصية",
    orders: "الطلبات",
    ordersDesc: "عرض سجل طلباتك",
    addresses: "العناوين",
    addressesDesc: "إدارة عناوين الشحن",
    wishlist: "قائمة الرغبات",
    wishlistDesc: "عرض العناصر المحفوظة",
    notLoggedIn: "يرجى تسجيل الدخول للوصول إلى حسابك",
    login: "تسجيل الدخول",
    register: "إنشاء حساب",
  },
};

export default function MyAccountPage({ params }: MyAccountPageProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const resolvedParams = use(params);
  const locale = resolvedParams.locale as "en" | "ar";
  const t = translations[locale] || translations.en;
  const isRTL = locale === "ar";

  const menuItems = [
    {
      icon: User,
      label: t.profile,
      description: t.profileDesc,
      href: `/${locale}/my-account/profile`,
    },
    {
      icon: Package,
      label: t.orders,
      description: t.ordersDesc,
      href: `/${locale}/my-account/orders`,
    },
    {
      icon: MapPin,
      label: t.addresses,
      description: t.addressesDesc,
      href: `/${locale}/my-account/addresses`,
    },
    {
      icon: Heart,
      label: t.wishlist,
      description: t.wishlistDesc,
      href: `/${locale}/my-account/wishlist`,
    },
  ];

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 w-48 bg-gray-200 rounded mb-8" />
          <div className="grid gap-4 md:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
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
              <User className="h-12 w-12 text-gray-400" />
            </div>
          </div>
          <h1 className="mb-4 text-2xl font-bold text-gray-900">{t.myAccount}</h1>
          <p className="mb-8 text-gray-500">{t.notLoggedIn}</p>
          <div className="flex flex-col gap-3">
            <Button asChild variant="primary" size="lg" className="w-full">
              <Link href={`/${locale}/login`}>{t.login}</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="w-full">
              <Link href={`/${locale}/register`}>{t.register}</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8" dir={isRTL ? "rtl" : "ltr"}>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">
          {t.myAccount}
        </h1>
        <p className="mt-2 text-gray-600">
          {t.welcome}, {user?.user_display_name}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="group flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-6 transition-all hover:border-gray-300 hover:shadow-md"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 transition-colors group-hover:bg-gray-200">
              <item.icon className="h-6 w-6 text-gray-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">{item.label}</h3>
              <p className="text-sm text-gray-500">{item.description}</p>
            </div>
            <ChevronRight className={`h-5 w-5 text-gray-400 transition-transform group-hover:translate-x-1 ${isRTL ? "rotate-180" : ""}`} />
          </Link>
        ))}
      </div>
    </div>
  );
}
