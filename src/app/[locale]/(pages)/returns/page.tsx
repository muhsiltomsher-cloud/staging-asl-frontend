import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { getDictionary } from "@/i18n";
import { generateMetadata as generateSeoMetadata } from "@/lib/utils/seo";
import type { Locale } from "@/config/site";
import type { Metadata } from "next";

interface ReturnsPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: ReturnsPageProps): Promise<Metadata> {
  const { locale } = await params;
  const dictionary = await getDictionary(locale as Locale);
  const pageContent = dictionary.pages.returns;

  return generateSeoMetadata({
    title: pageContent.seo.title,
    description: pageContent.seo.description,
    locale: locale as Locale,
    pathname: "/returns",
  });
}

export default async function ReturnsPage({ params }: ReturnsPageProps) {
  const { locale } = await params;
  const dictionary = await getDictionary(locale as Locale);
  const pageContent = dictionary.pages.returns;

  const breadcrumbItems = [
    { name: dictionary.footer.returnPolicy, href: `/${locale}/returns` },
  ];

  return (
    <div className="container mx-auto px-4 py-8 md:py-12" dir={locale === "ar" ? "rtl" : "ltr"}>
      <Breadcrumbs items={breadcrumbItems} locale={locale as Locale} />

      <div className="mx-auto max-w-3xl">
        <h1 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">
          {pageContent.title}
        </h1>
        <p className="mb-8 text-lg text-gray-600">
          {pageContent.subtitle}
        </p>

        <div className="space-y-8">
          {pageContent.features.map((feature, index) => (
            <div key={index}>
              <h2 className="mb-2 text-xl font-semibold text-gray-900">
                {feature.title}
              </h2>
              <p className="leading-relaxed text-gray-600">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-12 border-t border-gray-200 pt-8">
          <h2 className="mb-6 text-2xl font-semibold text-gray-900">
            {pageContent.processTitle}
          </h2>
          <div className="space-y-6">
            {pageContent.steps.map((item) => (
              <div key={item.step}>
                <h3 className="mb-2 text-lg font-semibold text-gray-900">
                  {item.step}. {item.title}
                </h3>
                <p className="leading-relaxed text-gray-600">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 border-t border-gray-200 pt-8">
          <h2 className="mb-4 text-xl font-semibold text-gray-900">
            {pageContent.eligibleTitle}
          </h2>
          <ul className="mb-8 list-disc space-y-2 ps-5 text-gray-600">
            {pageContent.eligibleItems.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>

          <h2 className="mb-4 text-xl font-semibold text-gray-900">
            {pageContent.notEligibleTitle}
          </h2>
          <ul className="list-disc space-y-2 ps-5 text-gray-600">
            {pageContent.notEligibleItems.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>

        <div className="mt-12 border-t border-gray-200 pt-8">
          <h2 className="mb-3 text-xl font-semibold text-gray-900">
            {pageContent.needHelp}
          </h2>
          <p className="mb-4 text-gray-600">
            {pageContent.needHelpText}
          </p>
          <a
            href={`/${locale}/contact`}
            className="inline-flex items-center text-gray-900 underline hover:text-gray-700"
          >
            {dictionary.common.contact}
          </a>
        </div>
      </div>
    </div>
  );
}
