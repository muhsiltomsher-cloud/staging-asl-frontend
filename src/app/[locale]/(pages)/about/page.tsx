import Link from "next/link";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { getDictionary } from "@/i18n";
import { generateMetadata as generateSeoMetadata } from "@/lib/utils/seo";
import type { Locale } from "@/config/site";
import type { Metadata } from "next";
import {
  BookOpen,
  Compass,
  Package,
  Heart,
  ChevronRight,
} from "lucide-react";

interface AboutPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: AboutPageProps): Promise<Metadata> {
  const { locale } = await params;
  const dictionary = await getDictionary(locale as Locale);
  const pageContent = dictionary.pages.about;

  return generateSeoMetadata({
    title: pageContent.seo.title,
    description: pageContent.seo.description,
    locale: locale as Locale,
    pathname: "/about",
  });
}

export default async function AboutPage({ params }: AboutPageProps) {
  const { locale } = await params;
  const dictionary = await getDictionary(locale as Locale);
  const pageContent = dictionary.pages.about;
  const isRTL = locale === "ar";

  const breadcrumbItems = [
    { name: dictionary.common.about, href: `/${locale}/about` },
  ];

  // Icon mapping for section keys
  const sectionIcons: Record<string, typeof BookOpen> = {
    our_story: BookOpen,
    our_journey: Compass,
    our_collection: Package,
    our_promise: Heart,
  };

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative min-h-[40vh] overflow-hidden bg-gradient-to-br from-amber-900 via-amber-800 to-stone-900">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -left-20 -top-20 h-96 w-96 animate-pulse rounded-full bg-amber-600/20 blur-3xl" />
          <div
            className="absolute -bottom-32 -right-32 h-[500px] w-[500px] animate-pulse rounded-full bg-stone-600/20 blur-3xl"
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

        <div className="container relative mx-auto flex min-h-[40vh] items-center px-4 py-20">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-6 flex items-center justify-center gap-4">
              <div className="h-px w-16 bg-gradient-to-r from-transparent to-amber-400" />
              <span className="text-sm font-medium uppercase tracking-[0.3em] text-amber-300">
                {pageContent.heroSubtitle}
              </span>
              <div className="h-px w-16 bg-gradient-to-l from-transparent to-amber-400" />
            </div>

            <h1 className="mb-8 text-4xl font-bold leading-tight text-white md:text-5xl lg:text-6xl">
              {pageContent.title}
            </h1>
          </div>
        </div>
      </section>

      {/* Breadcrumbs */}
      <div className="container mx-auto px-4 py-4">
        <Breadcrumbs items={breadcrumbItems} locale={locale as Locale} />
      </div>

      {/* Content Sections */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="space-y-0">
            {pageContent.sections.map((section, index) => {
              const IconComponent = sectionIcons[section.key] || Package;
              const isEven = index % 2 === 0;

              return (
                <div
                  key={section.key}
                  className={`flex flex-col border-b border-gray-200 py-12 md:flex-row md:items-start md:gap-12 ${
                    isEven ? "" : "md:flex-row-reverse"
                  }`}
                >
                  {/* Title Column */}
                  <div className="mb-6 md:mb-0 md:w-2/5">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
                        <IconComponent className="h-6 w-6 text-amber-700" />
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
                    {section.link && (
                      <Link
                        href={`/${locale}${section.link.url}`}
                        className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-amber-700 transition-colors hover:text-amber-600"
                      >
                        {section.link.text}
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-amber-800 via-amber-900 to-stone-900 py-16 md:py-20">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute left-1/4 top-0 h-full w-px bg-gradient-to-b from-transparent via-amber-400/20 to-transparent" />
          <div className="absolute left-1/2 top-0 h-full w-px bg-gradient-to-b from-transparent via-amber-400/20 to-transparent" />
          <div className="absolute left-3/4 top-0 h-full w-px bg-gradient-to-b from-transparent via-amber-400/20 to-transparent" />
        </div>

        <div className="container relative mx-auto px-4 text-center">
          <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl">
            {pageContent.cta.title}
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-amber-100/80">
            {pageContent.cta.subtitle}
          </p>
          <Link
            href={`/${locale}/shop`}
            className="group inline-flex items-center gap-3 rounded-full bg-white px-8 py-4 text-lg font-semibold text-amber-900 shadow-lg transition-all duration-300 hover:bg-amber-50 hover:shadow-xl"
          >
            <span>{pageContent.cta.button}</span>
            <ChevronRight
              className={`h-5 w-5 transition-transform duration-300 group-hover:translate-x-1 ${isRTL ? "rotate-180 group-hover:-translate-x-1" : ""}`}
            />
          </Link>
        </div>
      </section>
    </div>
  );
}
