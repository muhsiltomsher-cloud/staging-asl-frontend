import { CheckoutFooter } from "@/components/layout/CheckoutFooter";
import { getDictionary } from "@/i18n";
import { getSiteSettings } from "@/lib/api/wordpress";
import { type Locale } from "@/config/site";

interface CheckoutLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function CheckoutLayout({
  children,
  params,
}: CheckoutLayoutProps) {
  const { locale } = await params;
  const validLocale = locale as Locale;
  const dictionary = await getDictionary(validLocale);
  const siteSettings = await getSiteSettings(validLocale);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `.main-footer { display: none !important; }` }} />
      {children}
      <CheckoutFooter
        locale={validLocale}
        dictionary={dictionary}
        siteSettings={siteSettings}
      />
    </>
  );
}
