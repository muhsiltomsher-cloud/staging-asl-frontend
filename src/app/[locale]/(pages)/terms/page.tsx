import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { getDictionary } from "@/i18n";
import { generateMetadata as generateSeoMetadata } from "@/lib/utils/seo";
import type { Locale } from "@/config/site";
import type { Metadata } from "next";

interface TermsPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: TermsPageProps): Promise<Metadata> {
  const { locale } = await params;
  const dictionary = await getDictionary(locale as Locale);
  const pageContent = dictionary.pages.terms;

  return generateSeoMetadata({
    title: pageContent.seo.title,
    description: pageContent.seo.description,
    locale: locale as Locale,
    pathname: "/terms",
  });
}

export default async function TermsPage({ params }: TermsPageProps) {
  const { locale } = await params;
  const dictionary = await getDictionary(locale as Locale);
  const pageContent = dictionary.pages.terms;

  const breadcrumbItems = [
    { name: dictionary.footer.termsConditions, href: `/${locale}/terms` },
  ];

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
        <p className="mt-2 text-sm text-gray-500">
          {pageContent.lastUpdated}
        </p>
      </div>

      <div className="mx-auto max-w-4xl">
        <div className="space-y-6">
          {pageContent.sections.map((section, index) => (
            <section key={index} className="rounded-lg border bg-white p-6 shadow-sm">
              <h2 className="mb-3 text-xl font-semibold text-gray-900">
                {index + 1}. {section.title}
              </h2>
              <p className="leading-relaxed text-gray-600">{section.content}</p>
            </section>
          ))}
        </div>

        <div className="mt-12 rounded-lg bg-gray-50 p-6 text-center">
          <p className="text-gray-600">
            {pageContent.agreement}
          </p>
          <a
            href={`/${locale}/contact`}
            className="mt-4 inline-flex items-center justify-center rounded-full bg-gray-900 px-6 py-2 text-sm font-medium text-white hover:bg-gray-800"
          >
            {dictionary.common.contact}
          </a>
        </div>
      </div>
    </div>
  );
}
