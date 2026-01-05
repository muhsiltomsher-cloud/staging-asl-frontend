import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { getDictionary } from "@/i18n";
import { generateMetadata as generateSeoMetadata } from "@/lib/utils/seo";
import type { Locale } from "@/config/site";
import type { Metadata } from "next";
import { RotateCcw, Clock, CheckCircle, AlertCircle } from "lucide-react";

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

  // Map feature keys to icons
  const featureIcons: Record<string, typeof Clock> = {
    "14_day_returns": Clock,
    "easy_exchange": RotateCcw,
    "full_refund": CheckCircle,
    "simple_conditions": AlertCircle,
  };

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

      {/* Return Features */}
      <section className="mb-16">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {pageContent.features.map((feature, index) => {
            const IconComponent = featureIcons[feature.key] || Clock;
            return (
              <div
                key={index}
                className="rounded-lg border bg-white p-6 text-center shadow-sm"
              >
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                  <IconComponent className="h-6 w-6 text-gray-700" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-gray-900">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-600">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Return Process Steps */}
      <section className="mb-16">
        <h2 className="mb-8 text-center text-2xl font-bold text-gray-900">
          {pageContent.processTitle}
        </h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {pageContent.steps.map((item) => (
            <div key={item.step} className="relative">
              <div className="rounded-lg border bg-white p-6 shadow-sm">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-gray-900 text-lg font-bold text-white">
                  {item.step}
                </div>
                <h3 className="mb-2 text-lg font-semibold text-gray-900">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-600">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Return Conditions */}
      <section className="mb-16">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Eligible for Return */}
          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold text-green-700">
              {pageContent.eligibleTitle}
            </h2>
            <ul className="space-y-3 text-gray-600">
              {pageContent.eligibleItems.map((item, index) => (
                <li key={index} className="flex items-start gap-2">
                  <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Not Eligible for Return */}
          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold text-red-700">
              {pageContent.notEligibleTitle}
            </h2>
            <ul className="space-y-3 text-gray-600">
              {pageContent.notEligibleItems.map((item, index) => (
                <li key={index} className="flex items-start gap-2">
                  <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="rounded-lg bg-gray-50 p-6 text-center md:p-8">
        <h2 className="mb-2 text-xl font-semibold text-gray-900">
          {pageContent.needHelp}
        </h2>
        <p className="mb-4 text-gray-600">
          {pageContent.needHelpText}
        </p>
        <a
          href={`/${locale}/contact`}
          className="inline-flex items-center justify-center rounded-full bg-gray-900 px-6 py-2 text-sm font-medium text-white hover:bg-gray-800"
        >
          {dictionary.common.contact}
        </a>
      </section>
    </div>
  );
}
