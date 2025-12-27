"use client";

import { useParams } from "next/navigation";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import type { Locale } from "@/config/site";

interface Store {
  id: number;
  name: string;
  nameAr: string;
  floor: string;
  floorAr: string;
  googleMapsUrl: string;
}

const stores: Store[] = [
  {
    id: 1,
    name: "Yas Mall",
    nameAr: "ياس مول",
    floor: "Ground Floor",
    floorAr: "الطابق الأرضي",
    googleMapsUrl: "https://maps.google.com/?q=Yas+Mall+Abu+Dhabi",
  },
  {
    id: 2,
    name: "Bawabat Al Sharq Mall",
    nameAr: "بوابة الشرق مول",
    floor: "First Floor",
    floorAr: "الطابق الأول",
    googleMapsUrl: "https://maps.google.com/?q=Bawabat+Al+Sharq+Mall+Abu+Dhabi",
  },
  {
    id: 3,
    name: "Bawadi Mall",
    nameAr: "بوادي مول",
    floor: "Ground Floor",
    floorAr: "الطابق الأرضي",
    googleMapsUrl: "https://maps.google.com/?q=Bawadi+Mall+Al+Ain",
  },
  {
    id: 4,
    name: "Makani Zakher Mall",
    nameAr: "مكاني زاخر مول",
    floor: "Ground Floor",
    floorAr: "الطابق الأرضي",
    googleMapsUrl: "https://maps.google.com/?q=Makani+Zakher+Mall+Al+Ain",
  },
  {
    id: 5,
    name: "Fujairah City Centre",
    nameAr: "فجيرة سيتي سنتر",
    floor: "Ground Floor",
    floorAr: "الطابق الأرضي",
    googleMapsUrl: "https://maps.google.com/?q=Fujairah+City+Centre",
  },
  {
    id: 6,
    name: "Oman Mall",
    nameAr: "عمان مول",
    floor: "Ground Floor",
    floorAr: "الطابق الأرضي",
    googleMapsUrl: "https://maps.google.com/?q=Oman+Mall+Muscat",
  },
];

export default function StoreLocatorPage() {
  const { locale } = useParams<{ locale: string }>();
  const isRTL = locale === "ar";

  const breadcrumbItems = [
    { name: isRTL ? "مواقع المتاجر" : "Store Locator", href: `/${locale}/store-locator` },
  ];

  return (
    <div 
      className="min-h-screen"
      style={{ 
        backgroundImage: 'url(https://adminasl.stagingndemo.com/wp-content/uploads/2025/12/page-bg.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed'
      }}
    >
      <div className="container mx-auto px-4 py-8">
        <Breadcrumbs items={breadcrumbItems} locale={locale as Locale} />

        <div className="mb-12">
          <h1 className="mb-2 text-4xl font-bold text-[#5C4A3D] uppercase tracking-wide">
            {isRTL ? "مواقع المتاجر" : "Store Locator"}
          </h1>
          <p className="text-sm font-medium uppercase tracking-wider text-[#C4885B]">
            {isRTL ? "أين تجدنا" : "Where to Find Us"}
          </p>
        </div>

        <div className="rounded-2xl bg-white/90 backdrop-blur-sm p-8 shadow-lg">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {stores.map((store) => (
              <a
                key={store.id}
                href={store.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative block rounded-xl bg-[#E8E0D5]/50 p-6 transition-all duration-300 ease-in-out hover:bg-white hover:shadow-lg hover:border-l-4 hover:border-l-[#C4885B] border-l-4 border-l-transparent"
              >
                <div className="text-center">
                  <h3 className="text-lg font-bold text-[#5C4A3D] group-hover:text-[#5C4A3D] transition-colors">
                    {isRTL ? store.nameAr : store.name}
                  </h3>
                  <p className="mt-1 text-sm font-medium text-[#C4885B]">
                    {isRTL ? store.floorAr : store.floor}
                  </p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
