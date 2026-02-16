import Link from "next/link";
import Image from "next/image";
import { Facebook, Instagram } from "lucide-react";
import { siteConfig, type Locale } from "@/config/site";
import type { Dictionary } from "@/i18n";
import type { SiteSettings } from "@/types/wordpress";
import { NewsletterForm } from "@/components/common/NewsletterForm";

interface FooterProps {
  locale: Locale;
  dictionary: Dictionary;
  siteSettings?: SiteSettings | null;
}

export function Footer({ locale, dictionary, siteSettings }: FooterProps) {
  const currentYear = new Date().getFullYear();

    const footerLinks = {
      quickLinks: [
        { name: dictionary.common.home, href: `/${locale}` },
        { name: dictionary.common.shop, href: `/${locale}/shop` },
        { name: dictionary.common.about, href: `/${locale}/about` },
        { name: dictionary.common.contact, href: `/${locale}/contact` },
        { name: dictionary.footer.storeLocator, href: `/${locale}/store-locator` },
      ],
    customerService: [
      { name: dictionary.common.faq, href: `/${locale}/faq` },
      { name: dictionary.footer.shippingInfo, href: `/${locale}/shipping` },
      { name: dictionary.footer.returnPolicy, href: `/${locale}/returns` },
      { name: dictionary.footer.privacyPolicy, href: `/${locale}/privacy` },
      { name: dictionary.footer.termsConditions, href: `/${locale}/terms-and-conditions` },
    ],
  };

  return (
    <footer className="main-footer border-t border-gray-100 bg-gray-50 pb-20 md:pb-0">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-2 gap-6 md:grid-cols-2 lg:grid-cols-4 md:gap-8">
          {/* Brand section - Full width on mobile */}
          <div className="col-span-2 space-y-4 text-center md:col-span-1 md:text-left">
            <Link href={`/${locale}`} className="inline-block">
              {siteSettings?.logo?.url ? (
                <Image
                  src={siteSettings.logo.url}
                  alt={siteSettings.logo.alt || siteSettings.site_name || "Logo"}
                  width={150}
                  height={110}
                  className="mx-auto md:mx-0"
                  style={{ width: "auto", height: "auto", maxHeight: "70px" }}
                  loading="lazy"
                />
              ) : (
                <span className="text-xl font-bold tracking-tight text-gray-900">
                  {siteSettings?.site_name || "Aromatic Scents Lab"}
                </span>
              )}
            </Link>
            <p className="text-sm text-gray-600">
              {siteSettings?.tagline || "Premium fragrances and aromatic products crafted with care."}
            </p>
            <div className="flex justify-center gap-4 md:justify-start">
              <a
                href={siteConfig.links.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-gray-200 p-2 text-gray-600 transition-colors hover:bg-gray-300 hover:text-gray-900"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href={siteConfig.links.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-gray-200 p-2 text-gray-600 transition-colors hover:bg-gray-300 hover:text-gray-900"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href={siteConfig.links.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-gray-200 p-2 text-gray-600 transition-colors hover:bg-gray-300 hover:text-gray-900"
                aria-label="X"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-900 md:mb-4">
              {dictionary.footer.quickLinks}
            </h3>
            <ul className="space-y-2 md:space-y-3">
              {footerLinks.quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-600 hover:text-gray-900"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-900 md:mb-4">
              {dictionary.footer.customerService}
            </h3>
            <ul className="space-y-2 md:space-y-3">
              {footerLinks.customerService.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-600 hover:text-gray-900"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter - Full width on mobile */}
          <div className="col-span-2 md:col-span-1">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-900 md:mb-4">
              {dictionary.footer.newsletter}
            </h3>
            <p className="mb-3 text-sm text-gray-600 md:mb-4">
              {dictionary.footer.subscribeText}
            </p>
            <NewsletterForm
              locale={locale}
              dictionary={{
                emailPlaceholder: dictionary.footer.emailPlaceholder,
                subscribe: dictionary.footer.subscribe,
              }}
            />
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 border-t pt-6 md:mt-12 md:pt-8">
          <p className="text-center text-xs text-gray-600 md:text-sm">
            &copy; {currentYear} {siteConfig.name}. {dictionary.footer.copyright}
          </p>
          <p className="mt-2 text-center text-xs text-gray-500">
            Powered by{" "}
            <a
              href="https://cadvil.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 underline hover:text-gray-900"
            >
              Cadvil Solutions
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
