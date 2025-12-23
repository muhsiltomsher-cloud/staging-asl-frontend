"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { ArrowLeft, MapPin, Edit2, Plus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/common/Button";
import { getCustomer, type Customer, type CustomerAddress } from "@/lib/api/customer";

interface AddressesPageProps {
  params: Promise<{ locale: string }>;
}

const translations = {
  en: {
    addresses: "Addresses",
    backToAccount: "Back to Account",
    billingAddress: "Billing Address",
    shippingAddress: "Shipping Address",
    noAddress: "No address saved",
    addAddress: "Add Address",
    editAddress: "Edit",
    notLoggedIn: "Please log in to view your addresses",
    login: "Login",
    loading: "Loading addresses...",
  },
  ar: {
    addresses: "العناوين",
    backToAccount: "العودة إلى الحساب",
    billingAddress: "عنوان الفواتير",
    shippingAddress: "عنوان الشحن",
    noAddress: "لا يوجد عنوان محفوظ",
    addAddress: "إضافة عنوان",
    editAddress: "تعديل",
    notLoggedIn: "يرجى تسجيل الدخول لعرض عناوينك",
    login: "تسجيل الدخول",
    loading: "جاري تحميل العناوين...",
  },
};

function AddressCard({
  title,
  address,
  onEdit,
  t,
}: {
  title: string;
  address: CustomerAddress | null;
  onEdit: () => void;
  t: typeof translations.en;
}) {
  const hasAddress = address && (address.address_1 || address.city);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">{title}</h3>
        <Button variant="ghost" size="sm" onClick={onEdit}>
          <Edit2 className="mr-1 h-4 w-4" />
          {t.editAddress}
        </Button>
      </div>

      {hasAddress ? (
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
          {address.email && <p>{address.email}</p>}
        </div>
      ) : (
        <div className="text-center py-6">
          <div className="mb-4 flex justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
              <MapPin className="h-6 w-6 text-gray-400" />
            </div>
          </div>
          <p className="text-gray-500 mb-4">{t.noAddress}</p>
          <Button variant="outline" size="sm" onClick={onEdit}>
            <Plus className="mr-1 h-4 w-4" />
            {t.addAddress}
          </Button>
        </div>
      )}
    </div>
  );
}

export default function AddressesPage({ params }: AddressesPageProps) {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const resolvedParams = use(params);
  const locale = resolvedParams.locale as "en" | "ar";
  const t = translations[locale] || translations.en;
  const isRTL = locale === "ar";

  useEffect(() => {
    const fetchCustomer = async () => {
      if (!user?.user_id) return;

      try {
        setIsLoading(true);
        const response = await getCustomer(user.user_id);
        if (response.success && response.data) {
          setCustomer(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch customer:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated && user) {
      fetchCustomer();
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated, user]);

  const handleEditAddress = (type: "billing" | "shipping") => {
    console.log("Edit address:", type);
  };

  if (authLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 w-48 bg-gray-200 rounded mb-8" />
          <div className="grid gap-6 md:grid-cols-2">
            {[1, 2].map((i) => (
              <div key={i} className="h-48 bg-gray-200 rounded-lg" />
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
              <MapPin className="h-12 w-12 text-gray-400" />
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
          href={`/${locale}/my-account`}
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className={`h-4 w-4 ${isRTL ? "rotate-180" : ""}`} />
          {t.backToAccount}
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">
          {t.addresses}
        </h1>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin h-8 w-8 border-4 border-gray-300 border-t-black rounded-full mx-auto mb-4" />
          <p className="text-gray-500">{t.loading}</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          <AddressCard
            title={t.billingAddress}
            address={customer?.billing || null}
            onEdit={() => handleEditAddress("billing")}
            t={t}
          />
          <AddressCard
            title={t.shippingAddress}
            address={customer?.shipping || null}
            onEdit={() => handleEditAddress("shipping")}
            t={t}
          />
        </div>
      )}
    </div>
  );
}
