import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CurrencyProvider } from "@/contexts/CurrencyContext";
import { CartProvider } from "@/contexts/CartContext";
import { getDictionary } from "@/i18n";
import { siteConfig, localeConfig, type Locale } from "@/config/site";
import { generateOrganizationJsonLd } from "@/lib/utils/seo";
import { JsonLd } from "@/components/seo/JsonLd";
import "@/app/globals.css";

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export async function generateStaticParams() {
  return siteConfig.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: {
      default: siteConfig.name,
      template: `%s | ${siteConfig.name}`,
    },
    description: siteConfig.description,
    metadataBase: new URL(siteConfig.url),
  };
}

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale } = await params;

  // Validate locale
  if (!siteConfig.locales.includes(locale as Locale)) {
    notFound();
  }

  const validLocale = locale as Locale;
  const dictionary = await getDictionary(validLocale);
  const { dir } = localeConfig[validLocale];

  return (
    <html lang={validLocale} dir={dir}>
      <body className="min-h-screen bg-white font-sans antialiased">
        <CurrencyProvider>
          <CartProvider>
            <JsonLd data={generateOrganizationJsonLd()} />
            <div className="flex min-h-screen flex-col">
              <Header locale={validLocale} dictionary={dictionary} />
              <main className="flex-1">{children}</main>
              <Footer locale={validLocale} dictionary={dictionary} />
            </div>
          </CartProvider>
        </CurrencyProvider>
      </body>
    </html>
  );
}
