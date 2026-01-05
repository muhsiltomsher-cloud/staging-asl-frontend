import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { ContactForm } from "@/components/common/ContactForm";
import { getDictionary } from "@/i18n";
import { generateMetadata as generateSeoMetadata } from "@/lib/utils/seo";
import type { Locale } from "@/config/site";
import type { Metadata } from "next";

interface ContactPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: ContactPageProps): Promise<Metadata> {
  const { locale } = await params;
  const dictionary = await getDictionary(locale as Locale);
  const pageContent = dictionary.pages.contact;

  return generateSeoMetadata({
    title: pageContent.seo.title,
    description: pageContent.seo.description,
    locale: locale as Locale,
    pathname: "/contact",
  });
}

export default async function ContactPage({ params }: ContactPageProps) {
  const { locale } = await params;
  const dictionary = await getDictionary(locale as Locale);
  const pageContent = dictionary.pages.contact;

  const breadcrumbItems = [
    { name: pageContent.title, href: `/${locale}/contact` },
  ];

  // Map info keys to icons
  const infoIcons: Record<string, typeof MapPin> = {
    address: MapPin,
    phone: Phone,
    email: Mail,
    hours: Clock,
  };

  const contactInfoItems = Object.entries(pageContent.info).map(([key, value]) => ({
    icon: infoIcons[key] || MapPin,
    title: value.title,
    content: value.content,
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

      <div className="grid gap-12 lg:grid-cols-2">
        {/* Contact Form */}
        <div className="rounded-lg border bg-white p-6 shadow-sm md:p-8">
          <h2 className="mb-6 text-2xl font-semibold text-gray-900">
            {pageContent.sendMessage}
          </h2>
          <ContactForm locale={locale} />
        </div>

        {/* Contact Information */}
        <div className="space-y-8">
          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <h2 className="mb-6 text-2xl font-semibold text-gray-900">
              {pageContent.contactInfo}
            </h2>
            <div className="space-y-6">
              {contactInfoItems.map((item, index) => (
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
              {pageContent.mapPlaceholder}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
