import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { ContactForm } from "@/components/common/ContactForm";
import { generateMetadata as generateSeoMetadata } from "@/lib/utils/seo";
import { getPageBySlug, stripHtmlTags } from "@/lib/api/wordpress";
import type { Locale } from "@/config/site";
import type { Metadata } from "next";

interface ContactPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: ContactPageProps): Promise<Metadata> {
  const { locale } = await params;
  const wpPage = await getPageBySlug("contact", locale as Locale);

  if (wpPage) {
    const seoTitle = wpPage.yoast_head_json?.title
      ? wpPage.yoast_head_json.title
      : stripHtmlTags(wpPage.title.rendered);
    const seoDescription = wpPage.yoast_head_json?.description
      ? wpPage.yoast_head_json.description
      : wpPage.excerpt.rendered
        ? stripHtmlTags(wpPage.excerpt.rendered).slice(0, 160)
        : locale === "ar"
          ? "نحن هنا لمساعدتك. تواصل معنا لأي استفسارات أو ملاحظات."
          : "We're here to help. Reach out to us for any inquiries or feedback.";

    return generateSeoMetadata({
      title: seoTitle,
      description: seoDescription,
      locale: locale as Locale,
      pathname: "/contact",
    });
  }

  return generateSeoMetadata({
    title: locale === "ar" ? "اتصل بنا" : "Contact Us",
    description:
      locale === "ar"
        ? "نحن هنا لمساعدتك. تواصل معنا لأي استفسارات أو ملاحظات."
        : "We're here to help. Reach out to us for any inquiries or feedback.",
    locale: locale as Locale,
    pathname: "/contact",
  });
}

export default async function ContactPage({ params }: ContactPageProps) {
  const { locale } = await params;
  const isRTL = locale === "ar";

  const wpPage = await getPageBySlug("contact", locale as Locale);

  const breadcrumbItems = [
    { name: isRTL ? "اتصل بنا" : "Contact", href: `/${locale}/contact` },
  ];

  const contactInfo = [
    {
      icon: MapPin,
      title: isRTL ? "العنوان" : "Address",
      content: isRTL
        ? "الرياض، المملكة العربية السعودية"
        : "Riyadh, Saudi Arabia",
    },
    {
      icon: Phone,
      title: isRTL ? "الهاتف" : "Phone",
      content: "+966 11 XXX XXXX",
    },
    {
      icon: Mail,
      title: isRTL ? "البريد الإلكتروني" : "Email",
      content: "info@aromaticscentslab.com",
    },
    {
      icon: Clock,
      title: isRTL ? "ساعات العمل" : "Working Hours",
      content: isRTL
        ? "السبت - الخميس: 9 صباحاً - 9 مساءً"
        : "Sat - Thu: 9 AM - 9 PM",
    },
  ];

  // If WordPress content is available, render it with the form
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
        </div>

        <div className="grid gap-12 lg:grid-cols-2">
          {/* Contact Form */}
          <div className="rounded-lg border bg-white p-6 shadow-sm md:p-8">
            <h2 className="mb-6 text-2xl font-semibold text-gray-900">
              {isRTL ? "أرسل لنا رسالة" : "Send us a Message"}
            </h2>
            <ContactForm locale={locale} />
          </div>

          {/* WordPress Content + Contact Information */}
          <div className="space-y-8">
            <div
              className="prose prose-amber max-w-none prose-headings:text-amber-900 prose-p:text-gray-700 prose-strong:text-amber-800 prose-li:text-gray-700 prose-a:text-amber-700 prose-a:underline hover:prose-a:text-amber-900"
              dangerouslySetInnerHTML={{ __html: wpPage.content.rendered }}
            />

            <div className="rounded-lg border bg-white p-6 shadow-sm">
              <h2 className="mb-6 text-2xl font-semibold text-gray-900">
                {isRTL ? "معلومات الاتصال" : "Contact Information"}
              </h2>
              <div className="space-y-6">
                {contactInfo.map((item, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gray-100">
                      <item.icon className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{item.title}</h3>
                      <p className="text-gray-600">{item.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Fallback: Default layout without WordPress content
  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumbs items={breadcrumbItems} locale={locale as Locale} />

      <div className="mb-12 text-center">
        <h1 className="mb-4 text-4xl font-bold text-gray-900">
          {isRTL ? "اتصل بنا" : "Contact Us"}
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-gray-600">
          {isRTL
            ? "نحن هنا لمساعدتك. تواصل معنا لأي استفسارات أو ملاحظات."
            : "We're here to help. Reach out to us for any inquiries or feedback."}
        </p>
      </div>

      <div className="grid gap-12 lg:grid-cols-2">
        {/* Contact Form */}
        <div className="rounded-lg border bg-white p-6 shadow-sm md:p-8">
          <h2 className="mb-6 text-2xl font-semibold text-gray-900">
            {isRTL ? "أرسل لنا رسالة" : "Send us a Message"}
          </h2>
          <ContactForm locale={locale} />
        </div>

        {/* Contact Information */}
        <div className="space-y-8">
          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <h2 className="mb-6 text-2xl font-semibold text-gray-900">
              {isRTL ? "معلومات الاتصال" : "Contact Information"}
            </h2>
            <div className="space-y-6">
              {contactInfo.map((item, index) => (
                <div key={index} className="flex items-start gap-4">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gray-100">
                    <item.icon className="h-5 w-5 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{item.title}</h3>
                    <p className="text-gray-600">{item.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Map placeholder */}
          <div className="aspect-video overflow-hidden rounded-lg bg-gray-200">
            <div className="flex h-full items-center justify-center text-gray-500">
              {isRTL ? "خريطة الموقع" : "Map Location"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
