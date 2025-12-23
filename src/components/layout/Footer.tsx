import Link from "next/link";
import { Facebook, Instagram, Twitter } from "lucide-react";
import { siteConfig, type Locale } from "@/config/site";
import type { Dictionary } from "@/i18n";

interface FooterProps {
  locale: Locale;
  dictionary: Dictionary;
}

export function Footer({ locale, dictionary }: FooterProps) {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    quickLinks: [
      { name: dictionary.common.home, href: `/${locale}` },
      { name: dictionary.common.shop, href: `/${locale}/shop` },
      { name: dictionary.common.about, href: `/${locale}/about` },
      { name: dictionary.common.contact, href: `/${locale}/contact` },
    ],
    customerService: [
      { name: dictionary.common.faq, href: `/${locale}/faq` },
      { name: dictionary.footer.shippingInfo, href: `/${locale}/shipping` },
      { name: dictionary.footer.returnPolicy, href: `/${locale}/returns` },
      { name: dictionary.footer.privacyPolicy, href: `/${locale}/privacy` },
      { name: dictionary.footer.termsConditions, href: `/${locale}/terms` },
    ],
  };

  return (
    <footer className="border-t bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand section */}
          <div className="space-y-4">
            <Link href={`/${locale}`} className="inline-block">
              <span className="text-xl font-bold tracking-tight text-gray-900">
                Aromatic Scents Lab
              </span>
            </Link>
            <p className="text-sm text-gray-600">
              Premium fragrances and aromatic products crafted with care.
            </p>
            <div className="flex gap-4">
              <a
                href={siteConfig.links.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-gray-900"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href={siteConfig.links.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-gray-900"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-gray-600 hover:text-gray-900"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-900">
              {dictionary.footer.quickLinks}
            </h3>
            <ul className="space-y-3">
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
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-900">
              {dictionary.footer.customerService}
            </h3>
            <ul className="space-y-3">
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

          {/* Newsletter */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-900">
              {dictionary.footer.newsletter}
            </h3>
            <p className="mb-4 text-sm text-gray-600">
              {dictionary.footer.subscribeText}
            </p>
            <form className="flex gap-2">
              <input
                type="email"
                placeholder={dictionary.footer.emailPlaceholder}
                className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
              />
              <button
                type="submit"
                className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
              >
                {dictionary.footer.subscribe}
              </button>
            </form>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 border-t pt-8">
          <p className="text-center text-sm text-gray-600">
            &copy; {currentYear} {siteConfig.name}. {dictionary.footer.copyright}
          </p>
        </div>
      </div>
    </footer>
  );
}
