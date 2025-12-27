"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Home, Search, ArrowLeft } from "lucide-react";
import { Button } from "@/components/common/Button";

export default function NotFound() {
  const params = useParams<{ locale: string }>();
  const locale = params?.locale || "en";
  const isRTL = locale === "ar";

  const t = {
    en: {
      title: "Page Not Found",
      heading: "404",
      description: "Oops! The page you're looking for doesn't exist or has been moved.",
      backHome: "Back to Home",
      browseShop: "Browse Shop",
      searchProducts: "Search Products",
    },
    ar: {
      title: "الصفحة غير موجودة",
      heading: "404",
      description: "عذراً! الصفحة التي تبحث عنها غير موجودة أو تم نقلها.",
      backHome: "العودة للرئيسية",
      browseShop: "تصفح المتجر",
      searchProducts: "البحث عن المنتجات",
    },
  };

  const texts = t[locale as keyof typeof t] || t.en;

  return (
    <div
      className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-16"
      style={{ backgroundColor: "#F5F0E8" }}
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div className="text-center">
        <h1 className="mb-2 text-9xl font-bold text-[#C4885B]">{texts.heading}</h1>
        <h2 className="mb-4 text-2xl font-semibold text-gray-900 md:text-3xl">
          {texts.title}
        </h2>
        <p className="mx-auto mb-8 max-w-md text-gray-600">{texts.description}</p>

        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Button asChild>
            <Link href={`/${locale}`} className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              {texts.backHome}
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/${locale}/shop`} className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              {texts.browseShop}
            </Link>
          </Button>
        </div>

        <div className="mt-8">
          <Link
            href={`/${locale}`}
            className="inline-flex items-center gap-2 text-sm text-gray-500 transition-colors hover:text-[#C4885B]"
          >
            <ArrowLeft className={`h-4 w-4 ${isRTL ? "rotate-180" : ""}`} />
            {texts.backHome}
          </Link>
        </div>
      </div>
    </div>
  );
}
