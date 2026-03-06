import React from "react";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { getDictionary } from "@/i18n";
import { generateMetadata as generateSeoMetadata } from "@/lib/utils/seo";
import type { Locale } from "@/config/site";
import type { Metadata } from "next";

/**
 * Converts phone numbers and email addresses in text into clickable links.
 * This ensures cross-browser compatibility (Safari, Edge) since auto-detection
 * only works reliably in Chrome.
 */
function linkifyContent(text: string): React.ReactNode {
  // Match phone numbers (with optional + prefix and spaces/dashes) and email addresses
  const pattern = /(\+?\d[\d\s\-]{7,}\d)|([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    // Add text before the match
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    const matched = match[0];
    if (match[1]) {
      // Phone number
      const cleanPhone = matched.replace(/[\s\-]/g, "");
      parts.push(
        <a key={match.index} href={`tel:${cleanPhone}`} className="text-amber-700 underline hover:text-amber-900">
          {matched}
        </a>
      );
    } else if (match[2]) {
      // Email address
      parts.push(
        <a key={match.index} href={`mailto:${matched}`} className="text-amber-700 underline hover:text-amber-900">
          {matched}
        </a>
      );
    }

    lastIndex = match.index + matched.length;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length > 0 ? parts : text;
}

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

  return (
    <div className="container mx-auto px-4 py-8 md:py-12" dir={locale === "ar" ? "rtl" : "ltr"}>
      <Breadcrumbs items={breadcrumbItems} locale={locale as Locale} />

      <div className="mx-auto max-w-3xl">
        <h1 className="mb-8 text-3xl font-bold text-gray-900 md:text-4xl">
          {pageContent.title}
        </h1>

        <div className="space-y-8">
          {pageContent.sections.map((section, index) => (
            <div key={index}>
              <h2 className="mb-3 text-xl font-semibold text-gray-900">
                {section.title}
              </h2>
              <p className="leading-relaxed text-gray-600">
                {linkifyContent(section.content)}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-12 border-t border-gray-200 pt-8">
          <h2 className="mb-3 text-xl font-semibold text-gray-900">
            {pageContent.haveQuestions}
          </h2>
          <p className="mb-4 text-gray-600">
            {pageContent.haveQuestionsText}
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
