import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { FAQAccordion, type FAQItem } from "@/components/common/FAQAccordion";
import { getDictionary } from "@/i18n";
import { generateMetadata as generateSeoMetadata } from "@/lib/utils/seo";
import type { Locale } from "@/config/site";
import type { Metadata } from "next";

interface FAQPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: FAQPageProps): Promise<Metadata> {
  const { locale } = await params;
  const dictionary = await getDictionary(locale as Locale);
  const pageContent = dictionary.pages.faq;

  return generateSeoMetadata({
    title: pageContent.seo.title,
    description: pageContent.seo.description,
    locale: locale as Locale,
    pathname: "/faq",
  });
}

export default async function FAQPage({ params }: FAQPageProps) {
  const { locale } = await params;
  const dictionary = await getDictionary(locale as Locale);
  const pageContent = dictionary.pages.faq;

  const breadcrumbItems = [
    { name: pageContent.title, href: `/${locale}/faq` },
  ];

  // Convert dictionary items to FAQItem format
  const faqItems: FAQItem[] = pageContent.items.map((item) => ({
    question: item.question,
    answer: item.answer,
  }));

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumbs items={breadcrumbItems} locale={locale as Locale} />

      <div className="mb-12 text-center">
        <h1 className="mb-4 text-4xl font-bold text-gray-900">
          {pageContent.title}
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-gray-600">
          {pageContent.subtitle}
        </p>
      </div>

      <div className="mx-auto max-w-3xl">
        <FAQAccordion items={faqItems} />

        <div className="mt-12 rounded-lg bg-gray-50 p-6 text-center">
          <h2 className="mb-2 text-xl font-semibold text-gray-900">
            {pageContent.notFound}
          </h2>
          <p className="mb-4 text-gray-600">
            {pageContent.notFoundText}
          </p>
          <a
            href={`/${locale}/contact`}
            className="inline-flex items-center justify-center rounded-full bg-gray-900 px-6 py-2 text-sm font-medium text-white hover:bg-gray-800"
          >
            {dictionary.common.contact}
          </a>
        </div>
      </div>
    </div>
  );
}
