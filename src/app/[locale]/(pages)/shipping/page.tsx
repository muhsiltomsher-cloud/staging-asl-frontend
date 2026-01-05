import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { getDictionary } from "@/i18n";
import { generateMetadata as generateSeoMetadata } from "@/lib/utils/seo";
import type { Locale } from "@/config/site";
import type { Metadata } from "next";
import {
  Globe,
  Timer,
  Package,
  Truck,
  ChevronRight,
} from "lucide-react";

interface ShippingPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: ShippingPageProps): Promise<Metadata> {
  const { locale } = await params;
  const dictionary = await getDictionary(locale as Locale);
  const pageContent = dictionary.pages.shipping;

  return generateSeoMetadata({
    title: pageContent.seo.title,
    description: pageContent.seo.description,
    locale: locale as Locale,
    pathname: "/shipping",
  });
}

export default async function ShippingPage({ params }: ShippingPageProps) {
  const { locale } = await params;
  const dictionary = await getDictionary(locale as Locale);
  const pageContent = dictionary.pages.shipping;

  const breadcrumbItems = [
    { name: dictionary.footer.shippingInfo, href: `/${locale}/shipping` },
  ];

  // Map section keys to icons
  const sectionIcons: Record<string, typeof Globe> = {
    shipping_locations: Globe,
    order_processing: Timer,
    shipping_rates: Package,
    tracking: Truck,
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumbs items={breadcrumbItems} locale={locale as Locale} />

      {/* Hero Section with Title */}
      <div className="mb-16 text-center">
        <h1 className="mb-6 font-serif text-5xl font-bold italic text-gray-900 md:text-6xl">
          {pageContent.title}
        </h1>
        <div className="mx-auto h-1 w-24 bg-gray-900" />
      </div>

      {/* Content Sections - Creative Two-Column Layout */}
      <section className="mb-16">
        <div className="space-y-0">
          {pageContent.sections.map((section, index) => {
            const IconComponent = sectionIcons[section.key] || Package;
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
                    {section.content}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Contact CTA */}
      <section className="overflow-hidden rounded-2xl bg-gray-900 p-8 text-center md:p-12">
        <h2 className="mb-4 text-2xl font-bold text-white md:text-3xl">
          {pageContent.haveQuestions}
        </h2>
        <p className="mx-auto mb-8 max-w-xl text-gray-300">
          {pageContent.haveQuestionsText}
        </p>
        <a
          href={`/${locale}/contact`}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-8 py-3 text-sm font-medium text-gray-900 transition-all hover:bg-gray-100"
        >
          {dictionary.common.contact}
          <ChevronRight className="h-4 w-4" />
        </a>
      </section>
    </div>
  );
}
