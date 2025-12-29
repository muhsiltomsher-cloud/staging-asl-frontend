import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { getDictionary } from "@/i18n";
import { generateMetadata as generateSeoMetadata } from "@/lib/utils/seo";
import { getPageBySlug, stripHtmlTags } from "@/lib/api/wordpress";
import type { Locale } from "@/config/site";
import type { Metadata } from "next";
import {
  Truck,
  Clock,
  MapPin,
  Package,
  Globe,
  Timer,
  RefreshCw,
  Headphones,
  ChevronRight,
} from "lucide-react";

interface ShippingPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: ShippingPageProps): Promise<Metadata> {
  const { locale } = await params;
  const wpPage = await getPageBySlug("shipping-information", locale as Locale);

  if (wpPage) {
    return generateSeoMetadata({
      title: stripHtmlTags(wpPage.title.rendered),
      description: wpPage.excerpt.rendered
        ? stripHtmlTags(wpPage.excerpt.rendered).slice(0, 160)
        : locale === "ar"
          ? "تعرف على سياسة الشحن والتوصيل لدى أروماتيك سينتس لاب"
          : "Learn about Aromatic Scents Lab's shipping and delivery policy",
      locale: locale as Locale,
      pathname: "/shipping",
    });
  }

  return generateSeoMetadata({
    title: locale === "ar" ? "معلومات الشحن" : "Shipping Information",
    description:
      locale === "ar"
        ? "تعرف على سياسة الشحن والتوصيل لدى أروماتيك سينتس لاب"
        : "Learn about Aromatic Scents Lab's shipping and delivery policy",
    locale: locale as Locale,
    pathname: "/shipping",
  });
}

export default async function ShippingPage({ params }: ShippingPageProps) {
  const { locale } = await params;
  const dictionary = await getDictionary(locale as Locale);
  const isRTL = locale === "ar";

  const wpPage = await getPageBySlug("shipping-information", locale as Locale);

  const breadcrumbItems = [
    { name: dictionary.footer.shippingInfo, href: `/${locale}/shipping` },
  ];

  const shippingFeatures = [
    {
      icon: Truck,
      title: isRTL ? "شحن مجاني" : "Free Shipping",
      description: isRTL
        ? "شحن مجاني للطلبات التي تزيد عن 200 ريال سعودي داخل المملكة العربية السعودية"
        : "Free shipping on orders over 200 SAR within Saudi Arabia",
    },
    {
      icon: Clock,
      title: isRTL ? "توصيل سريع" : "Fast Delivery",
      description: isRTL
        ? "توصيل خلال 2-5 أيام عمل داخل المملكة العربية السعودية"
        : "Delivery within 2-5 business days within Saudi Arabia",
    },
    {
      icon: MapPin,
      title: isRTL ? "تغطية واسعة" : "Wide Coverage",
      description: isRTL
        ? "نوصل إلى جميع مناطق المملكة العربية السعودية ودول الخليج"
        : "We deliver to all regions of Saudi Arabia and GCC countries",
    },
    {
      icon: Package,
      title: isRTL ? "تغليف آمن" : "Secure Packaging",
      description: isRTL
        ? "تغليف فاخر وآمن لحماية منتجاتك أثناء الشحن"
        : "Premium and secure packaging to protect your products during shipping",
    },
  ];

  const shippingRates = [
    {
      region: isRTL ? "داخل المملكة العربية السعودية" : "Within Saudi Arabia",
      standard: isRTL ? "25 ريال (2-5 أيام عمل)" : "25 SAR (2-5 business days)",
      express: isRTL ? "50 ريال (1-2 أيام عمل)" : "50 SAR (1-2 business days)",
      free: isRTL ? "مجاني للطلبات فوق 200 ريال" : "Free for orders over 200 SAR",
    },
    {
      region: isRTL ? "الإمارات العربية المتحدة" : "United Arab Emirates",
      standard: isRTL ? "50 ريال (3-7 أيام عمل)" : "50 SAR (3-7 business days)",
      express: isRTL ? "100 ريال (2-3 أيام عمل)" : "100 SAR (2-3 business days)",
      free: isRTL ? "مجاني للطلبات فوق 500 ريال" : "Free for orders over 500 SAR",
    },
    {
      region: isRTL ? "دول الخليج الأخرى" : "Other GCC Countries",
      standard: isRTL ? "75 ريال (5-10 أيام عمل)" : "75 SAR (5-10 business days)",
      express: isRTL ? "150 ريال (3-5 أيام عمل)" : "150 SAR (3-5 business days)",
      free: isRTL ? "مجاني للطلبات فوق 750 ريال" : "Free for orders over 750 SAR",
    },
  ];

  // Parse WordPress content to extract sections
  const parseWordPressContent = (html: string) => {
    const sections: Array<{
      title: string;
      content: string;
      link?: { text: string; url: string };
    }> = [];

    // Match sections with h2 titles and their content
    const sectionRegex =
      /<h2[^>]*>([^<]+)<\/h2>[\s\S]*?<\/div>\s*<div[^>]*>\s*<p>([^<]+(?:<[^>]+>[^<]*<\/[^>]+>)*[^<]*)<\/p>(?:\s*<p><a[^>]*href="([^"]*)"[^>]*>([^<]+)<\/a><\/p>)?/g;

    let match;
    while ((match = sectionRegex.exec(html)) !== null) {
      const title = match[1].replace(/<br\s*\/?>/gi, "").trim();
      const content = match[2]
        .replace(/<br\s*\/?>/gi, "\n")
        .replace(/<\/?strong>/gi, "")
        .replace(/&nbsp;/g, " ")
        .trim();
      const link =
        match[3] && match[4] ? { url: match[3], text: match[4] } : undefined;

      sections.push({ title, content, link });
    }

    return sections;
  };

  // Icon mapping for WordPress content sections
  const sectionIcons: Record<string, typeof Globe> = {
    "Shipping Locations": Globe,
    "Order Processing Time": Timer,
    "Trade-in": RefreshCw,
    Support: Headphones,
    // Arabic mappings
    "مواقع الشحن": Globe,
    "وقت معالجة الطلب": Timer,
    "استبدال": RefreshCw,
    "الدعم": Headphones,
  };

  if (wpPage && wpPage.content.rendered) {
    const pageTitle = stripHtmlTags(wpPage.title.rendered);
    const contentSections = parseWordPressContent(wpPage.content.rendered);

    return (
      <div className="container mx-auto px-4 py-8">
        <Breadcrumbs items={breadcrumbItems} locale={locale as Locale} />

        {/* Hero Section with Title */}
        <div className="mb-16 text-center">
          <h1 className="mb-6 font-serif text-5xl font-bold italic text-gray-900 md:text-6xl">
            {pageTitle}
          </h1>
          <div className="mx-auto h-1 w-24 bg-gray-900" />
          <p className="mt-6 text-sm text-gray-500">
            {isRTL ? "آخر تحديث: " : "Last Updated: "}
            {new Date(wpPage.modified).toLocaleDateString(
              isRTL ? "ar-SA" : "en-US",
              {
                year: "numeric",
                month: "long",
                day: "numeric",
              }
            )}
          </p>
        </div>

        {/* Shipping Features Quick Overview */}
        <section className="mb-16">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {shippingFeatures.map((feature, index) => (
              <div
                key={index}
                className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 transition-all duration-300 hover:border-gray-300 hover:shadow-lg"
              >
                <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gray-50 transition-colors group-hover:bg-gray-100">
                  <feature.icon className="h-7 w-7 text-gray-700" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-gray-900">
                  {feature.title}
                </h3>
                <p className="text-sm leading-relaxed text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* WordPress Content Sections - Creative Two-Column Layout */}
        {contentSections.length > 0 && (
          <section className="mb-16">
            <div className="space-y-0">
              {contentSections.map((section, index) => {
                const IconComponent =
                  sectionIcons[section.title] || Package;
                const isEven = index % 2 === 0;

                return (
                  <div
                    key={index}
                    className={`flex flex-col border-b border-gray-200 py-12 md:flex-row md:items-start md:gap-12 ${
                      isEven ? "" : "md:flex-row-reverse"
                    }`}
                  >
                    {/* Title Column */}
                    <div className="mb-6 md:mb-0 md:w-2/5">
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                          <IconComponent className="h-6 w-6 text-gray-700" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 md:text-3xl">
                          {section.title}
                        </h2>
                      </div>
                    </div>

                    {/* Content Column */}
                    <div className="md:w-3/5">
                      <p className="text-lg leading-relaxed text-gray-600">
                        {section.content.split("\n").map((line, i) => (
                          <span key={i}>
                            {line}
                            {i < section.content.split("\n").length - 1 && (
                              <br />
                            )}
                          </span>
                        ))}
                      </p>
                      {section.link && (
                        <a
                          href={section.link.url}
                          className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-gray-900 transition-colors hover:text-gray-600"
                        >
                          {section.link.text}
                          <ChevronRight className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Shipping Rates Table */}
        <section className="mb-16">
          <div className="mb-8 text-center">
            <h2 className="mb-2 text-3xl font-bold text-gray-900">
              {isRTL ? "أسعار الشحن" : "Shipping Rates"}
            </h2>
            <p className="text-gray-600">
              {isRTL
                ? "أسعار شفافة لجميع المناطق"
                : "Transparent pricing for all regions"}
            </p>
          </div>
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="px-6 py-5 text-start text-sm font-semibold uppercase tracking-wider text-gray-600">
                      {isRTL ? "المنطقة" : "Region"}
                    </th>
                    <th className="px-6 py-5 text-start text-sm font-semibold uppercase tracking-wider text-gray-600">
                      {isRTL ? "الشحن العادي" : "Standard"}
                    </th>
                    <th className="px-6 py-5 text-start text-sm font-semibold uppercase tracking-wider text-gray-600">
                      {isRTL ? "الشحن السريع" : "Express"}
                    </th>
                    <th className="px-6 py-5 text-start text-sm font-semibold uppercase tracking-wider text-gray-600">
                      {isRTL ? "الشحن المجاني" : "Free Shipping"}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {shippingRates.map((rate, index) => (
                    <tr
                      key={index}
                      className="transition-colors hover:bg-gray-50"
                    >
                      <td className="px-6 py-5 text-sm font-medium text-gray-900">
                        {rate.region}
                      </td>
                      <td className="px-6 py-5 text-sm text-gray-600">
                        {rate.standard}
                      </td>
                      <td className="px-6 py-5 text-sm text-gray-600">
                        {rate.express}
                      </td>
                      <td className="px-6 py-5">
                        <span className="inline-flex items-center rounded-full bg-green-50 px-3 py-1 text-sm font-medium text-green-700">
                          {rate.free}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Additional Information */}
        <section className="mb-16">
          <div className="rounded-2xl bg-gray-50 p-8 md:p-12">
            <h2 className="mb-8 text-2xl font-bold text-gray-900">
              {isRTL ? "معلومات إضافية" : "Additional Information"}
            </h2>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-white">
                  <Clock className="h-5 w-5 text-gray-600" />
                </div>
                <p className="text-gray-600">
                  {isRTL
                    ? "يتم احتساب أيام العمل من الأحد إلى الخميس، باستثناء العطلات الرسمية."
                    : "Business days are calculated from Sunday to Thursday, excluding public holidays."}
                </p>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-white">
                  <MapPin className="h-5 w-5 text-gray-600" />
                </div>
                <p className="text-gray-600">
                  {isRTL
                    ? "ستتلقى رسالة بريد إلكتروني تحتوي على رقم التتبع بمجرد شحن طلبك."
                    : "You will receive an email with a tracking number once your order is shipped."}
                </p>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-white">
                  <Globe className="h-5 w-5 text-gray-600" />
                </div>
                <p className="text-gray-600">
                  {isRTL
                    ? "للشحن الدولي خارج دول الخليج، يرجى التواصل معنا للحصول على عرض سعر."
                    : "For international shipping outside GCC countries, please contact us for a quote."}
                </p>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-white">
                  <Truck className="h-5 w-5 text-gray-600" />
                </div>
                <p className="text-gray-600">
                  {isRTL
                    ? "قد تختلف أوقات التوصيل خلال فترات الذروة والمواسم."
                    : "Delivery times may vary during peak periods and seasons."}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Contact CTA */}
        <section className="overflow-hidden rounded-2xl bg-gray-900 p-8 text-center md:p-12">
          <h2 className="mb-4 text-2xl font-bold text-white md:text-3xl">
            {isRTL ? "هل لديك أسئلة؟" : "Have Questions?"}
          </h2>
          <p className="mx-auto mb-8 max-w-xl text-gray-300">
            {isRTL
              ? "فريق خدمة العملاء لدينا جاهز لمساعدتك في أي استفسارات حول الشحن والتوصيل"
              : "Our customer service team is ready to help you with any shipping and delivery inquiries"}
          </p>
          <a
            href={`/${locale}/contact`}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-8 py-3 text-sm font-medium text-gray-900 transition-all hover:bg-gray-100"
          >
            {isRTL ? "تواصل معنا" : "Contact Us"}
            <ChevronRight className="h-4 w-4" />
          </a>
        </section>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumbs items={breadcrumbItems} locale={locale as Locale} />

      <div className="mb-12 text-center">
        <h1 className="mb-4 text-4xl font-bold text-gray-900">
          {isRTL ? "معلومات الشحن" : "Shipping Information"}
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-gray-600">
          {isRTL
            ? "نحرص على توصيل طلباتك بأسرع وقت وبأفضل حالة"
            : "We ensure your orders are delivered quickly and in the best condition"}
        </p>
      </div>

      {/* Shipping Features */}
      <section className="mb-16">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {shippingFeatures.map((feature, index) => (
            <div
              key={index}
              className="rounded-lg border bg-white p-6 text-center shadow-sm"
            >
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                <feature.icon className="h-6 w-6 text-gray-700" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900">
                {feature.title}
              </h3>
              <p className="text-sm text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Shipping Rates Table */}
      <section className="mb-16">
        <h2 className="mb-6 text-2xl font-bold text-gray-900">
          {isRTL ? "أسعار الشحن" : "Shipping Rates"}
        </h2>
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-start text-sm font-semibold text-gray-900">
                  {isRTL ? "المنطقة" : "Region"}
                </th>
                <th className="px-6 py-4 text-start text-sm font-semibold text-gray-900">
                  {isRTL ? "الشحن العادي" : "Standard Shipping"}
                </th>
                <th className="px-6 py-4 text-start text-sm font-semibold text-gray-900">
                  {isRTL ? "الشحن السريع" : "Express Shipping"}
                </th>
                <th className="px-6 py-4 text-start text-sm font-semibold text-gray-900">
                  {isRTL ? "الشحن المجاني" : "Free Shipping"}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y bg-white">
              {shippingRates.map((rate, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {rate.region}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {rate.standard}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {rate.express}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{rate.free}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Additional Information */}
      <section className="rounded-lg bg-gray-50 p-6 md:p-8">
        <h2 className="mb-6 text-2xl font-bold text-gray-900">
          {isRTL ? "معلومات إضافية" : "Additional Information"}
        </h2>
        <div className="space-y-4 text-gray-600">
          <p>
            {isRTL
              ? "• يتم احتساب أيام العمل من الأحد إلى الخميس، باستثناء العطلات الرسمية."
              : "• Business days are calculated from Sunday to Thursday, excluding public holidays."}
          </p>
          <p>
            {isRTL
              ? "• ستتلقى رسالة بريد إلكتروني تحتوي على رقم التتبع بمجرد شحن طلبك."
              : "• You will receive an email with a tracking number once your order is shipped."}
          </p>
          <p>
            {isRTL
              ? "• للشحن الدولي خارج دول الخليج، يرجى التواصل معنا للحصول على عرض سعر."
              : "• For international shipping outside GCC countries, please contact us for a quote."}
          </p>
          <p>
            {isRTL
              ? "• قد تختلف أوقات التوصيل خلال فترات الذروة والمواسم."
              : "• Delivery times may vary during peak periods and seasons."}
          </p>
        </div>
      </section>
    </div>
  );
}
