"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { ArrowLeft, User, Mail, Phone, Save } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { getCustomer, updateCustomer, type Customer } from "@/lib/api/customer";

interface ProfilePageProps {
  params: Promise<{ locale: string }>;
}

const translations = {
  en: {
    profile: "Profile",
    backToAccount: "Back to Account",
    personalInfo: "Personal Information",
    firstName: "First Name",
    lastName: "Last Name",
    email: "Email Address",
    phone: "Phone Number",
    saveChanges: "Save Changes",
    saving: "Saving...",
    saved: "Changes saved successfully",
    notLoggedIn: "Please log in to view your profile",
    login: "Login",
    error: "Failed to save changes",
    loading: "Loading profile...",
  },
  ar: {
    profile: "الملف الشخصي",
    backToAccount: "العودة إلى الحساب",
    personalInfo: "المعلومات الشخصية",
    firstName: "الاسم الأول",
    lastName: "اسم العائلة",
    email: "البريد الإلكتروني",
    phone: "رقم الهاتف",
    saveChanges: "حفظ التغييرات",
    saving: "جاري الحفظ...",
    saved: "تم حفظ التغييرات بنجاح",
    notLoggedIn: "يرجى تسجيل الدخول لعرض ملفك الشخصي",
    login: "تسجيل الدخول",
    error: "فشل في حفظ التغييرات",
    loading: "جاري تحميل الملف الشخصي...",
  },
};

export default function ProfilePage({ params }: ProfilePageProps) {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const resolvedParams = use(params);
  const locale = resolvedParams.locale as "en" | "ar";
  const t = translations[locale] || translations.en;
  const isRTL = locale === "ar";

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });

  useEffect(() => {
    const fetchCustomer = async () => {
      if (!user?.user_id) return;

      try {
        setIsLoading(true);
        const response = await getCustomer(user.user_id);
        if (response.success && response.data) {
          setCustomer(response.data);
          setFormData({
            firstName: response.data.first_name || "",
            lastName: response.data.last_name || "",
            email: response.data.email || "",
            phone: response.data.billing?.phone || "",
          });
        } else {
          const nameParts = user.user_display_name?.split(" ") || ["", ""];
          setFormData({
            firstName: nameParts[0] || "",
            lastName: nameParts.slice(1).join(" ") || "",
            email: user.user_email || "",
            phone: "",
          });
        }
      } catch (error) {
        console.error("Failed to fetch customer:", error);
        const nameParts = user.user_display_name?.split(" ") || ["", ""];
        setFormData({
          firstName: nameParts[0] || "",
          lastName: nameParts.slice(1).join(" ") || "",
          email: user.user_email || "",
          phone: "",
        });
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.user_id) return;

    setIsSaving(true);
    setMessage(null);

    try {
      const response = await updateCustomer(user.user_id, {
        first_name: formData.firstName,
        last_name: formData.lastName,
        billing: {
          ...customer?.billing,
          first_name: formData.firstName,
          last_name: formData.lastName,
          phone: formData.phone,
        } as Customer["billing"],
      });

      if (response.success && response.data) {
        setCustomer(response.data);
        setMessage({ type: "success", text: t.saved });
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: "error", text: response.error?.message || t.error });
      }
    } catch (error) {
      console.error("Failed to save profile:", error);
      setMessage({ type: "error", text: t.error });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 w-48 bg-gray-200 rounded mb-8" />
          <div className="max-w-xl space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-12 bg-gray-200 rounded" />
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
          {t.profile}
        </h1>
      </div>

      <div className="max-w-xl">
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <div className="mb-6 flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-gray-100 to-gray-200">
              <User className="h-8 w-8 text-gray-600" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">{t.personalInfo}</h2>
              <p className="text-sm text-gray-500">{user?.user_email}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  {t.firstName}
                </label>
                <Input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) =>
                    setFormData({ ...formData, firstName: e.target.value })
                  }
                  placeholder={t.firstName}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  {t.lastName}
                </label>
                <Input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) =>
                    setFormData({ ...formData, lastName: e.target.value })
                  }
                  placeholder={t.lastName}
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                {t.email}
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder={t.email}
                  className="pl-10"
                  disabled
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                {t.phone}
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <Input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  placeholder={t.phone}
                  className="pl-10"
                />
              </div>
            </div>

            {message && (
              <div
                className={`rounded-lg p-3 text-sm ${
                  message.type === "success"
                    ? "bg-green-50 text-green-800"
                    : "bg-red-50 text-red-800"
                }`}
              >
                {message.text}
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              isLoading={isSaving}
            >
              <Save className="mr-2 h-4 w-4" />
              {isSaving ? t.saving : t.saveChanges}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
