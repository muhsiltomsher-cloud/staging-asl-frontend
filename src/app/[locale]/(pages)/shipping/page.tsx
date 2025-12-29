import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { getDictionary } from "@/i18n";
import { generateMetadata as generateSeoMetadata } from "@/lib/utils/seo";
import { getPageBySlug, stripHtmlTags } from "@/lib/api/wordpress";
import type { Locale } from "@/config/site";
import type { Metadata } from "next";
import {
  Globe,
  Timer,
  RefreshCw,
  Headphones,
  Package,
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
    استبدال: RefreshCw,
    الدعم: Headphones,
  };

  if (!wpPage || !wpPage.content.rendered) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Breadcrumbs items={breadcrumbItems} locale={locale as Locale} />
        <div className="py-16 text-center">
          <h1 className="mb-4 text-4xl font-bold text-gray-900">
            {isRTL ? "معلومات الشحن" : "Shipping Information"}
          </h1>
          <p className="text-gray-600">
            {isRTL
              ? "المحتوى غير متوفر حالياً"
              : "Content is not available at the moment"}
          </p>
        </div>
      </div>
    );
  }

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

      {/* WordPress Content Sections - Creative Two-Column Layout */}
      {contentSections.length > 0 && (
        <section className="mb-16">
          <div className="space-y-0">
            {contentSections.map((section, index) => {
              const IconComponent = sectionIcons[section.title] || Package;
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
                          {i < section.content.split("\n").length - 1 && <br />}
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
