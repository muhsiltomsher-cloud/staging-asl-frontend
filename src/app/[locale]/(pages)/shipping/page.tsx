import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { getDictionary } from "@/i18n";
import { generateMetadata as generateSeoMetadata } from "@/lib/utils/seo";
import { getPageBySlug, stripHtmlTags } from "@/lib/api/wordpress";
import type { Locale } from "@/config/site";
import type { Metadata } from "next";
import { Truck, Clock, MapPin, Package } from "lucide-react";

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

  if (wpPage && wpPage.content.rendered) {
    const pageTitle = stripHtmlTags(wpPage.title.rendered);

    return (
      <div className="container mx-auto px-4 py-8">
        <Breadcrumbs items={breadcrumbItems} locale={locale as Locale} />

        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold text-gray-900">{pageTitle}</h1>
          {wpPage.excerpt.rendered && (
            <p className="mx-auto max-w-2xl text-lg text-gray-600">
              {stripHtmlTags(wpPage.excerpt.rendered)}
            </p>
          )}
          <p className="mt-2 text-sm text-gray-500">
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

        <div className="mx-auto max-w-4xl">
          <div
            className="prose prose-amber max-w-none prose-headings:text-amber-900 prose-p:text-gray-700 prose-strong:text-amber-800 prose-li:text-gray-700 prose-a:text-amber-700 prose-a:underline hover:prose-a:text-amber-900 prose-table:w-full prose-th:bg-gray-50 prose-th:px-6 prose-th:py-4 prose-th:text-start prose-th:text-sm prose-th:font-semibold prose-th:text-gray-900 prose-td:px-6 prose-td:py-4 prose-td:text-sm prose-td:text-gray-600 prose-img:mx-auto prose-img:rounded-lg"
            dangerouslySetInnerHTML={{ __html: wpPage.content.rendered }}
          />

          <div className="mt-12 rounded-lg bg-gray-50 p-6 text-center">
            <p className="text-gray-600">
              {isRTL
                ? "هل لديك أسئلة حول الشحن؟ فريق خدمة العملاء لدينا جاهز لمساعدتك"
                : "Have questions about shipping? Our customer service team is ready to help"}
            </p>
            <a
              href={`/${locale}/contact`}
              className="mt-4 inline-flex items-center justify-center rounded-full bg-gray-900 px-6 py-2 text-sm font-medium text-white hover:bg-gray-800"
            >
              {isRTL ? "اتصل بنا" : "Contact Us"}
            </a>
          </div>
        </div>
      </div>
    );
  }

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
