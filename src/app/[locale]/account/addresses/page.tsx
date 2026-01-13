"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { ArrowLeft, MapPin, Edit2, Plus, X, Save } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { getCustomer, updateCustomerAddress, type Customer, type CustomerAddress } from "@/lib/api/customer";

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
    editBillingAddress: "Edit Billing Address",
    editShippingAddress: "Edit Shipping Address",
    firstName: "First Name",
    lastName: "Last Name",
    company: "Company (optional)",
    address1: "Address Line 1",
    address2: "Address Line 2 (optional)",
    city: "City",
    state: "State/Province",
    postcode: "Postal Code",
    country: "Country",
    phone: "Phone",
    email: "Email",
    cancel: "Cancel",
    save: "Save Address",
    saving: "Saving...",
    saved: "Address saved successfully",
    error: "Failed to save address",
    copyFromBilling: "Copy from Billing",
    copyFromShipping: "Copy from Shipping",
    copying: "Copying...",
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
    editBillingAddress: "تعديل عنوان الفواتير",
    editShippingAddress: "تعديل عنوان الشحن",
    firstName: "الاسم الأول",
    lastName: "اسم العائلة",
    company: "الشركة (اختياري)",
    address1: "العنوان السطر 1",
    address2: "العنوان السطر 2 (اختياري)",
    city: "المدينة",
    state: "الولاية/المقاطعة",
    postcode: "الرمز البريدي",
    country: "البلد",
    phone: "الهاتف",
    email: "البريد الإلكتروني",
    cancel: "إلغاء",
    save: "حفظ العنوان",
    saving: "جاري الحفظ...",
    saved: "تم حفظ العنوان بنجاح",
    error: "فشل في حفظ العنوان",
    copyFromBilling: "نسخ من عنوان الفواتير",
    copyFromShipping: "نسخ من عنوان الشحن",
    copying: "جاري النسخ...",
  },
};

const emptyAddress: CustomerAddress = {
  first_name: "",
  last_name: "",
  company: "",
  address_1: "",
  address_2: "",
  city: "",
  state: "",
  postcode: "",
  country: "",
  phone: "",
  email: "",
};

function AddressCard({
  title,
  address,
  onEdit,
  onCopyFrom,
  copyFromLabel,
  canCopyFrom,
  isCopying,
  t,
}: {
  title: string;
  address: CustomerAddress | null;
  onEdit: () => void;
  onCopyFrom?: () => void;
  copyFromLabel?: string;
  canCopyFrom?: boolean;
  isCopying?: boolean;
  t: typeof translations.en;
}) {
  const hasAddress = address && (address.address_1 || address.city);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">{title}</h3>
        <div className="flex items-center gap-2">
          {canCopyFrom && onCopyFrom && copyFromLabel && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onCopyFrom}
              disabled={isCopying}
            >
              {isCopying ? t.copying : copyFromLabel}
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={onEdit}>
            <Edit2 className="mr-1 h-4 w-4" />
            {t.editAddress}
          </Button>
        </div>
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
          <div className="flex flex-col gap-2 items-center">
            <Button variant="outline" size="sm" onClick={onEdit}>
              <Plus className="mr-1 h-4 w-4" />
              {t.addAddress}
            </Button>
            {canCopyFrom && onCopyFrom && copyFromLabel && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onCopyFrom}
                disabled={isCopying}
              >
                {isCopying ? t.copying : copyFromLabel}
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function AddressModal({
  isOpen,
  onClose,
  addressType,
  initialAddress,
  onSave,
  isSaving,
  t,
  isRTL,
}: {
  isOpen: boolean;
  onClose: () => void;
  addressType: "billing" | "shipping";
  initialAddress: CustomerAddress | null;
  onSave: (address: CustomerAddress) => Promise<void>;
  isSaving: boolean;
  t: typeof translations.en;
  isRTL: boolean;
}) {
  const [formData, setFormData] = useState<CustomerAddress>(emptyAddress);
  const [prevIsOpen, setPrevIsOpen] = useState(false);

  if (isOpen && !prevIsOpen) {
    setFormData(initialAddress || emptyAddress);
  }
  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(formData);
  };

  const handleChange = (field: keyof CustomerAddress) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  if (!isOpen) return null;

  const title = addressType === "billing" ? t.editBillingAddress : t.editShippingAddress;

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/50 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        dir={isRTL ? "rtl" : "ltr"}
      >
        <div className="w-full max-w-lg rounded-xl bg-white shadow-xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between border-b p-4">
            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
            <button
              onClick={onClose}
              className="rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-4 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label={t.firstName}
                value={formData.first_name}
                onChange={handleChange("first_name")}
                required
              />
              <Input
                label={t.lastName}
                value={formData.last_name}
                onChange={handleChange("last_name")}
                required
              />
            </div>

            <Input
              label={t.company}
              value={formData.company}
              onChange={handleChange("company")}
            />

            <Input
              label={t.address1}
              value={formData.address_1}
              onChange={handleChange("address_1")}
              required
            />

            <Input
              label={t.address2}
              value={formData.address_2}
              onChange={handleChange("address_2")}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label={t.city}
                value={formData.city}
                onChange={handleChange("city")}
                required
              />
              <Input
                label={t.state}
                value={formData.state}
                onChange={handleChange("state")}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label={t.postcode}
                value={formData.postcode}
                onChange={handleChange("postcode")}
              />
              <Input
                label={t.country}
                value={formData.country}
                onChange={handleChange("country")}
                required
              />
            </div>

            <Input
              label={t.phone}
              type="tel"
              value={formData.phone || ""}
              onChange={handleChange("phone")}
            />

            {addressType === "billing" && (
              <Input
                label={t.email}
                type="email"
                value={formData.email || ""}
                onChange={handleChange("email")}
              />
            )}

            <div className="flex gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                size="lg"
                className="flex-1"
                onClick={onClose}
                disabled={isSaving}
              >
                {t.cancel}
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="flex-1"
                isLoading={isSaving}
              >
                <Save className="mr-2 h-4 w-4" />
                {isSaving ? t.saving : t.save}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

export default function AddressesPage({ params }: AddressesPageProps) {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [editingAddress, setEditingAddress] = useState<"billing" | "shipping" | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

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

  const handleSaveAddress = async (address: CustomerAddress) => {
    if (!user?.user_id || !editingAddress) return;

    setIsSaving(true);
    setMessage(null);

    try {
      const response = await updateCustomerAddress(user.user_id, editingAddress, address);
      if (response.success && response.data) {
        setCustomer(response.data);
        setEditingAddress(null);
        setMessage({ type: "success", text: t.saved });
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: "error", text: response.error?.message || t.error });
      }
    } catch (error) {
      console.error("Failed to save address:", error);
      setMessage({ type: "error", text: t.error });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopyAddress = async (from: "billing" | "shipping", to: "billing" | "shipping") => {
    if (!user?.user_id || !customer) return;

    const sourceAddress = from === "billing" ? customer.billing : customer.shipping;
    if (!sourceAddress || (!sourceAddress.address_1 && !sourceAddress.city)) return;

    setIsSaving(true);
    setMessage(null);

    try {
      const response = await updateCustomerAddress(user.user_id, to, sourceAddress);
      if (response.success && response.data) {
        setCustomer(response.data);
        setMessage({ type: "success", text: t.saved });
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: "error", text: response.error?.message || t.error });
      }
    } catch (error) {
      console.error("Failed to copy address:", error);
      setMessage({ type: "error", text: t.error });
    } finally {
      setIsSaving(false);
    }
  };

  const hasBillingAddress = customer?.billing && (customer.billing.address_1 || customer.billing.city);
  const hasShippingAddress = customer?.shipping && (customer.shipping.address_1 || customer.shipping.city);

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
          href={`/${locale}/account`}
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className={`h-4 w-4 ${isRTL ? "rotate-180" : ""}`} />
          {t.backToAccount}
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">
          {t.addresses}
        </h1>
      </div>

      {message && (
        <div
          className={`mb-6 rounded-lg p-4 ${
            message.type === "success"
              ? "bg-green-50 text-green-800"
              : "bg-red-50 text-red-800"
          }`}
        >
          {message.text}
        </div>
      )}

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
            onEdit={() => setEditingAddress("billing")}
            onCopyFrom={() => handleCopyAddress("shipping", "billing")}
            copyFromLabel={t.copyFromShipping}
            canCopyFrom={!!hasShippingAddress}
            isCopying={isSaving}
            t={t}
          />
          <AddressCard
            title={t.shippingAddress}
            address={customer?.shipping || null}
            onEdit={() => setEditingAddress("shipping")}
            onCopyFrom={() => handleCopyAddress("billing", "shipping")}
            copyFromLabel={t.copyFromBilling}
            canCopyFrom={!!hasBillingAddress}
            isCopying={isSaving}
            t={t}
          />
        </div>
      )}

      <AddressModal
        isOpen={editingAddress !== null}
        onClose={() => setEditingAddress(null)}
        addressType={editingAddress || "billing"}
        initialAddress={editingAddress === "billing" ? customer?.billing || null : customer?.shipping || null}
        onSave={handleSaveAddress}
        isSaving={isSaving}
        t={t}
        isRTL={isRTL}
      />
    </div>
  );
}
