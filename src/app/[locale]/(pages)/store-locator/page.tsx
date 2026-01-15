"use client";

import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import type { Locale } from "@/config/site";
import {
  MapPin,
  Navigation,
  Clock,
  Phone,
  ChevronRight,
  Sparkles,
  Building2,
} from "lucide-react";

interface Store {
  id: number;
  name: string;
  nameAr: string;
  floor: string;
  floorAr: string;
  city: string;
  cityAr: string;
  region: string;
  regionAr: string;
  country: string;
  countryAr: string;
  googleMapsUrl: string;
  image: string;
}

interface Region {
  id: string;
  name: string;
  nameAr: string;
  stores: Store[];
}

interface Country {
  id: string;
  name: string;
  nameAr: string;
  regions: Region[];
}

const stores: Store[] = [
  {
    id: 1,
    name: "Yas Mall",
    nameAr: "ياس مول",
    floor: "Ground Floor",
    floorAr: "الطابق الأرضي",
    city: "Abu Dhabi",
    cityAr: "أبوظبي",
    region: "abu-dhabi",
    regionAr: "أبوظبي",
    country: "uae",
    countryAr: "الإمارات",
    googleMapsUrl: "https://maps.google.com/?q=Yas+Mall+Abu+Dhabi",
    image: "https://staging.aromaticscentslab.com/wp-content/uploads/2025/12/ASL-Website-Images-Patchouli-Glow-06.webp",
  },
  {
    id: 2,
    name: "Bawabat Al Sharq Mall",
    nameAr: "بوابة الشرق مول",
    floor: "First Floor",
    floorAr: "الطابق الأول",
    city: "Abu Dhabi",
    cityAr: "أبوظبي",
    region: "abu-dhabi",
    regionAr: "أبوظبي",
    country: "uae",
    countryAr: "الإمارات",
    googleMapsUrl: "https://maps.google.com/?q=Bawabat+Al+Sharq+Mall+Abu+Dhabi",
    image: "https://staging.aromaticscentslab.com/wp-content/uploads/2025/12/ASL-Website-Images-Patchouli-Glow-06.webp",
  },
  {
    id: 3,
    name: "Bawadi Mall",
    nameAr: "بوادي مول",
    floor: "Ground Floor",
    floorAr: "الطابق الأرضي",
    city: "Al Ain",
    cityAr: "العين",
    region: "al-ain",
    regionAr: "العين",
    country: "uae",
    countryAr: "الإمارات",
    googleMapsUrl: "https://maps.google.com/?q=Bawadi+Mall+Al+Ain",
    image: "https://staging.aromaticscentslab.com/wp-content/uploads/2025/12/ASL-Website-Images-Patchouli-Glow-06.webp",
  },
  {
    id: 4,
    name: "Makani Zakher Mall",
    nameAr: "مكاني زاخر مول",
    floor: "Ground Floor",
    floorAr: "الطابق الأرضي",
    city: "Al Ain",
    cityAr: "العين",
    region: "al-ain",
    regionAr: "العين",
    country: "uae",
    countryAr: "الإمارات",
    googleMapsUrl: "https://maps.google.com/?q=Makani+Zakher+Mall+Al+Ain",
    image: "https://staging.aromaticscentslab.com/wp-content/uploads/2025/12/ASL-Website-Images-Patchouli-Glow-06.webp",
  },
  {
    id: 5,
    name: "Fujairah City Centre",
    nameAr: "فجيرة سيتي سنتر",
    floor: "Ground Floor",
    floorAr: "الطابق الأرضي",
    city: "Fujairah",
    cityAr: "الفجيرة",
    region: "fujairah",
    regionAr: "الفجيرة",
    country: "uae",
    countryAr: "الإمارات",
    googleMapsUrl: "https://maps.google.com/?q=Fujairah+City+Centre",
    image: "https://staging.aromaticscentslab.com/wp-content/uploads/2025/12/ASL-Website-Images-Patchouli-Glow-06.webp",
  },
  {
    id: 6,
    name: "Oman Mall",
    nameAr: "عمان مول",
    floor: "Ground Floor",
    floorAr: "الطابق الأرضي",
    city: "Muscat",
    cityAr: "مسقط",
    region: "muscat",
    regionAr: "مسقط",
    country: "oman",
    countryAr: "عمان",
    googleMapsUrl: "https://maps.google.com/?q=Oman+Mall+Muscat",
    image: "https://staging.aromaticscentslab.com/wp-content/uploads/2025/12/ASL-Website-Images-Patchouli-Glow-06.webp",
  },
];

const uaeRegions: Region[] = [
  {
    id: "abu-dhabi",
    name: "Abu Dhabi",
    nameAr: "أبوظبي",
    stores: stores.filter((s) => s.region === "abu-dhabi"),
  },
  {
    id: "al-ain",
    name: "Al Ain",
    nameAr: "العين",
    stores: stores.filter((s) => s.region === "al-ain"),
  },
  {
    id: "fujairah",
    name: "Fujairah",
    nameAr: "الفجيرة",
    stores: stores.filter((s) => s.region === "fujairah"),
  },
];

const omanRegions: Region[] = [
  {
    id: "muscat",
    name: "Muscat",
    nameAr: "مسقط",
    stores: stores.filter((s) => s.region === "muscat"),
  },
];

const countries: Country[] = [
  {
    id: "uae",
    name: "United Arab Emirates",
    nameAr: "الإمارات العربية المتحدة",
    regions: uaeRegions,
  },
  {
    id: "oman",
    name: "Oman",
    nameAr: "عمان",
    regions: omanRegions,
  },
];

export default function StoreLocatorPage() {
  const { locale } = useParams<{ locale: string }>();
  const isRTL = locale === "ar";

  const breadcrumbItems = [
    { name: isRTL ? "مواقع المتاجر" : "Store Locator", href: `/${locale}/store-locator` },
  ];

  const content = {
    heroTitle: isRTL ? "اكتشف متاجرنا" : "Discover Our Stores",
    heroSubtitle: isRTL ? "مواقع المتاجر" : "Store Locator",
    heroDescription: isRTL
      ? "زورونا في أحد فروعنا واستمتعوا بتجربة عطرية فريدة. فريقنا المتخصص في انتظاركم لمساعدتكم في اختيار العطر المثالي."
      : "Visit us at one of our locations and enjoy a unique aromatic experience. Our specialized team is waiting to help you choose the perfect fragrance.",
    storesCount: isRTL ? `${stores.length} متاجر` : `${stores.length} Stores`,
    countriesCount: isRTL ? `${countries.length} دول` : `${countries.length} Countries`,
    getDirections: isRTL ? "احصل على الاتجاهات" : "Get Directions",
    openingHours: isRTL ? "ساعات العمل" : "Opening Hours",
    openingHoursValue: isRTL ? "10:00 ص - 10:00 م" : "10:00 AM - 10:00 PM",
    ctaTitle: isRTL ? "لا تستطيع زيارتنا؟" : "Can't Visit Us?",
    ctaSubtitle: isRTL
      ? "تسوق من مجموعتنا الكاملة عبر الإنترنت واحصل على توصيل مجاني للطلبات فوق 500 درهم"
      : "Shop our full collection online and get free delivery on orders over 500 AED",
    ctaButton: isRTL ? "تسوق الآن" : "Shop Now",
  };

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative min-h-[50vh] overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src="https://staging.aromaticscentslab.com/wp-content/uploads/2025/12/ASL-Website-Images-Patchouli-Glow-06.webp"
            alt="Store Locator"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-amber-950/90 via-amber-900/80 to-stone-900/70" />
        </div>

        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -left-20 -top-20 h-96 w-96 animate-pulse rounded-full bg-amber-600/10 blur-3xl" />
          <div
            className="absolute -bottom-32 -right-32 h-[500px] w-[500px] animate-pulse rounded-full bg-amber-400/10 blur-3xl"
            style={{ animationDelay: "1s" }}
          />
        </div>

        {/* Decorative Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div
            className="h-full w-full"
            style={{
              backgroundImage:
                "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
              backgroundSize: "40px 40px",
            }}
          />
        </div>

        <div className="container relative mx-auto flex min-h-[50vh] items-center px-4 py-16">
          <div className="mx-auto max-w-4xl text-center">
            {/* Decorative Line */}
            <div className="mb-6 flex items-center justify-center gap-4">
              <div className="h-px w-20 bg-gradient-to-r from-transparent to-amber-400" />
              <MapPin className="h-6 w-6 text-amber-400" />
              <div className="h-px w-20 bg-gradient-to-l from-transparent to-amber-400" />
            </div>

            <span className="mb-4 inline-block text-sm font-medium uppercase tracking-[0.3em] text-amber-300">
              {content.heroSubtitle}
            </span>

            <h1 className="mb-6 text-4xl font-bold leading-tight text-white md:text-5xl lg:text-6xl">
              {content.heroTitle}
            </h1>

            <p className="mx-auto max-w-2xl text-lg leading-relaxed text-amber-100/90">
              {content.heroDescription}
            </p>

            {/* Stats Row */}
            <div className="mt-10 flex items-center justify-center gap-8">
              <div className="flex items-center gap-3 rounded-full border border-amber-400/30 bg-white/10 px-6 py-3 backdrop-blur-sm">
                <Building2 className="h-5 w-5 text-amber-400" />
                <span className="text-sm font-medium text-amber-100">{content.storesCount}</span>
              </div>
              <div className="flex items-center gap-3 rounded-full border border-amber-400/30 bg-white/10 px-6 py-3 backdrop-blur-sm">
                <MapPin className="h-5 w-5 text-amber-400" />
                <span className="text-sm font-medium text-amber-100">{content.countriesCount}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
          <div className="flex h-10 w-6 items-start justify-center rounded-full border-2 border-amber-400/50 p-1">
            <div className="h-2 w-1 animate-bounce rounded-full bg-amber-400" />
          </div>
        </div>
      </section>

      {/* Breadcrumbs */}
      <div className="container mx-auto px-4 py-4">
        <Breadcrumbs items={breadcrumbItems} locale={locale as Locale} />
      </div>

      {/* Opening Hours Banner */}
      <section className="bg-gradient-to-r from-amber-50 to-stone-50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col items-center justify-center gap-4 md:flex-row md:gap-8">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
                <Clock className="h-5 w-5 text-amber-700" />
              </div>
              <div>
                <p className="text-sm font-medium text-amber-900">{content.openingHours}</p>
                <p className="text-sm text-amber-700">{content.openingHoursValue}</p>
              </div>
            </div>
            <div className="hidden h-8 w-px bg-amber-200 md:block" />
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
                <Phone className="h-5 w-5 text-amber-700" />
              </div>
              <div>
                <p className="text-sm font-medium text-amber-900">{isRTL ? "اتصل بنا" : "Contact Us"}</p>
                <p className="text-sm text-amber-700">+971 50 607 1405</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stores by Country */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#f7f6f2] to-white py-16 md:py-24">
        {/* Decorative Elements */}
        <div className="absolute -left-40 top-20 h-80 w-80 rounded-full bg-amber-100/40 blur-3xl" />
        <div className="absolute -right-40 bottom-20 h-80 w-80 rounded-full bg-stone-100/60 blur-3xl" />

        <div className="container relative mx-auto px-4">
          {countries.map((country, countryIndex) => (
            <div key={country.id} className={countryIndex > 0 ? "mt-20" : ""}>
              {/* Country Header */}
              <div className="mb-10 border-b-2 border-amber-200 pb-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-600 to-amber-700 shadow-lg shadow-amber-500/30">
                    <MapPin className="h-7 w-7 text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-amber-900 md:text-4xl">
                      {isRTL ? country.nameAr : country.name}
                    </h2>
                    <p className="text-sm text-amber-600">
                      {isRTL
                        ? `${country.regions.reduce((acc, r) => acc + r.stores.length, 0)} متاجر في ${country.regions.length} ${country.regions.length === 1 ? "منطقة" : "مناطق"}`
                        : `${country.regions.reduce((acc, r) => acc + r.stores.length, 0)} Stores in ${country.regions.length} ${country.regions.length === 1 ? "Region" : "Regions"}`}
                    </p>
                  </div>
                </div>
              </div>

              {/* Regions within Country */}
              {country.regions.map((region, regionIndex) => (
                <div key={region.id} className={regionIndex > 0 ? "mt-12" : ""}>
                  {/* Region Header */}
                  <div className="mb-6 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-amber-500 shadow-md shadow-amber-400/20">
                      <MapPin className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-amber-800 md:text-2xl">
                        {isRTL ? region.nameAr : region.name}
                      </h3>
                      <p className="text-xs text-amber-500">
                        {isRTL
                          ? `${region.stores.length} ${region.stores.length === 1 ? "متجر" : "متاجر"}`
                          : `${region.stores.length} ${region.stores.length === 1 ? "Store" : "Stores"}`}
                      </p>
                    </div>
                  </div>

                  {/* Store Cards Grid */}
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {region.stores.map((store) => (
                      <div
                        key={store.id}
                        className="group relative overflow-hidden rounded-2xl bg-white shadow-lg transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-amber-900/10"
                      >
                        {/* Store Image */}
                        <div className="relative h-48 overflow-hidden">
                          <Image
                            src={store.image}
                            alt={isRTL ? store.nameAr : store.name}
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                          
                          {/* City Badge */}
                          <div className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-amber-900 backdrop-blur-sm">
                            {isRTL ? region.nameAr : region.name}
                          </div>

                          {/* Store Name Overlay */}
                          <div className="absolute bottom-4 left-4 right-4">
                            <h4 className="text-xl font-bold text-white drop-shadow-lg">
                              {isRTL ? store.nameAr : store.name}
                            </h4>
                          </div>
                        </div>

                        {/* Store Details */}
                        <div className="p-5">
                          <div className="mb-4 space-y-3">
                            <div className="flex items-center gap-3 text-amber-700">
                              <Building2 className="h-4 w-4 flex-shrink-0" />
                              <span className="text-sm">{isRTL ? store.floorAr : store.floor}</span>
                            </div>
                            <div className="flex items-center gap-3 text-amber-700">
                              <Clock className="h-4 w-4 flex-shrink-0" />
                              <span className="text-sm">{content.openingHoursValue}</span>
                            </div>
                          </div>

                          {/* Action Button */}
                          <a
                            href={store.googleMapsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-amber-500/20 transition-all duration-300 hover:from-amber-600 hover:to-amber-700 hover:shadow-xl hover:shadow-amber-500/30"
                          >
                            <Navigation className="h-4 w-4" />
                            {content.getDirections}
                          </a>
                        </div>

                        {/* Decorative Corner */}
                        <div className="absolute -right-8 -top-8 h-16 w-16 rounded-full bg-amber-100/50 transition-transform duration-500 group-hover:scale-150" />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* Map Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-amber-900 via-amber-800 to-stone-900 py-16 md:py-20">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute left-1/4 top-0 h-full w-px bg-gradient-to-b from-transparent via-amber-400/20 to-transparent" />
          <div className="absolute left-1/2 top-0 h-full w-px bg-gradient-to-b from-transparent via-amber-400/20 to-transparent" />
          <div className="absolute left-3/4 top-0 h-full w-px bg-gradient-to-b from-transparent via-amber-400/20 to-transparent" />
        </div>

        <div className="container relative mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-6 flex items-center justify-center gap-4">
              <div className="h-px w-16 bg-gradient-to-r from-transparent to-amber-400" />
              <Sparkles className="h-5 w-5 text-amber-400" />
              <div className="h-px w-16 bg-gradient-to-l from-transparent to-amber-400" />
            </div>

            <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl">
              {isRTL ? "نحن في انتظارك" : "We're Waiting for You"}
            </h2>
            <p className="mb-8 text-lg text-amber-100/80">
              {isRTL
                ? "زورونا في أقرب فرع واستمتعوا بتجربة تسوق فريدة"
                : "Visit us at the nearest branch and enjoy a unique shopping experience"}
            </p>

            {/* Country Quick Links */}
            <div className="flex flex-wrap items-center justify-center gap-3">
              {countries.map((country) => (
                <a
                  key={country.id}
                  href={country.regions[0]?.stores[0]?.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-2 rounded-full border border-amber-400/30 bg-white/10 px-5 py-2.5 text-sm font-medium text-amber-100 backdrop-blur-sm transition-all duration-300 hover:border-amber-400 hover:bg-white/20"
                >
                  <MapPin className="h-4 w-4 text-amber-400" />
                  {isRTL ? country.nameAr : country.name}
                  <ChevronRight className={`h-4 w-4 text-amber-400 transition-transform duration-300 group-hover:translate-x-1 ${isRTL ? "rotate-180 group-hover:-translate-x-1" : ""}`} />
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#f7f6f2] to-white py-16 md:py-24">
        {/* Decorative Elements */}
        <div className="absolute -left-20 top-1/2 h-64 w-64 -translate-y-1/2 rounded-full bg-amber-50 blur-3xl" />
        <div className="absolute -right-20 top-1/3 h-64 w-64 rounded-full bg-stone-50 blur-3xl" />

        <div className="container relative mx-auto px-4 text-center">
          <div className="mb-6 flex items-center justify-center gap-4">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-amber-400" />
            <Sparkles className="h-5 w-5 text-amber-600" />
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-amber-400" />
          </div>

          <h2 className="mb-4 text-3xl font-bold text-amber-900 md:text-4xl lg:text-5xl">
            {content.ctaTitle}
          </h2>
          <p className="mx-auto mb-10 max-w-2xl text-lg text-amber-700/80">
            {content.ctaSubtitle}
          </p>
          <Link
            href={`/${locale}/shop`}
            className="group inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 px-10 py-5 text-lg font-semibold text-white shadow-lg shadow-amber-500/30 transition-all duration-300 hover:from-amber-600 hover:to-amber-700 hover:shadow-xl hover:shadow-amber-500/40"
          >
            <span>{content.ctaButton}</span>
            <ChevronRight
              className={`h-5 w-5 transition-transform duration-300 group-hover:translate-x-1 ${isRTL ? "rotate-180 group-hover:-translate-x-1" : ""}`}
            />
          </Link>
        </div>
      </section>
    </div>
  );
}
