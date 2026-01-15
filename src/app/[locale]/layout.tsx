import type { Metadata } from "next";
import { notFound } from "next/navigation";
import NextTopLoader from "nextjs-toploader";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MobileBottomBar } from "@/components/layout/MobileBottomBar";
import { MiniCartDrawer } from "@/components/cart/MiniCartDrawer";
import { AccountDrawer } from "@/components/account/AccountDrawer";
import { CurrencyProvider } from "@/contexts/CurrencyContext";
import { CartProvider } from "@/contexts/CartContext";
import { WishlistProvider } from "@/contexts/WishlistContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { FreeGiftProvider } from "@/contexts/FreeGiftContext";
import { getDictionary } from "@/i18n";
import { siteConfig, localeConfig, type Locale } from "@/config/site";
import { generateOrganizationJsonLd } from "@/lib/utils/seo";
import { JsonLd } from "@/components/seo/JsonLd";
import { LocationCurrencyBanner } from "@/components/common/LocationCurrencyBanner";
import { CookieConsentBanner } from "@/components/common/CookieConsentBanner";
import { WhatsAppFloatingButton } from "@/components/common/WhatsAppFloatingButton";
import { getSiteSettings, getHeaderSettings, getMobileBarSettings, getPrimaryMenu, getTopbarSettings } from "@/lib/api/wordpress";

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
  const validLocale = locale as Locale;
  
  // Fetch site settings to get favicon from backend
  const siteSettings = await getSiteSettings(validLocale);
  
  // Build favicon URL with cache-busting parameter
  const faviconUrl = siteSettings.favicon?.url;
  const faviconWithCacheBust = faviconUrl 
    ? `${faviconUrl}${faviconUrl.includes('?') ? '&' : '?'}v=${siteSettings.favicon?.id || Date.now()}`
    : undefined;
  
  return {
    title: {
      default: siteConfig.name,
      template: `%s | ${siteConfig.name}`,
    },
    description: siteConfig.description,
    metadataBase: new URL(siteConfig.url),
    icons: faviconWithCacheBust ? {
      icon: faviconWithCacheBust,
      shortcut: faviconWithCacheBust,
      apple: faviconWithCacheBust,
    } : undefined,
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

  // Fetch site settings, header settings, mobile bar settings, topbar settings, and menu in parallel
  const [siteSettings, headerSettings, mobileBarSettings, topbarSettings, menuItems] = await Promise.all([
    getSiteSettings(validLocale),
    getHeaderSettings(),
    getMobileBarSettings(validLocale),
    getTopbarSettings(validLocale),
    getPrimaryMenu(validLocale),
  ]);

  return (
    <AuthProvider>
      <CurrencyProvider>
        <NotificationProvider>
                                        <CartProvider locale={validLocale}>
                                          <FreeGiftProvider locale={validLocale}>
                      <WishlistProvider>
              <JsonLd data={generateOrganizationJsonLd()} />
              <NextTopLoader
                color="#92400e"
                initialPosition={0.08}
                crawlSpeed={200}
                height={3}
                crawl={true}
                showSpinner={false}
                easing="ease"
                speed={200}
                shadow="0 0 10px #92400e,0 0 5px #92400e"
              />
              <div dir={dir} lang={validLocale} className="flex min-h-screen flex-col bg-[#f7f6f2] overflow-x-clip max-w-full">
                <div className="print:hidden">
                  <Header
                    locale={validLocale}
                    dictionary={dictionary}
                    siteSettings={siteSettings}
                    headerSettings={headerSettings}
                    menuItems={menuItems?.items}
                    topbarSettings={topbarSettings}
                  />
                </div>
                <main className="flex-1">{children}</main>
                <div className="print:hidden">
                  <Footer locale={validLocale} dictionary={dictionary} siteSettings={siteSettings} />
                </div>
                <div className="print:hidden">
                  <MobileBottomBar
                    locale={validLocale}
                    settings={mobileBarSettings}
                    dictionary={dictionary}
                  />
                </div>
              </div>
              <MiniCartDrawer
                locale={validLocale}
                dictionary={{
                  cart: dictionary.common.cart,
                  emptyCart: dictionary.cart.emptyCart,
                  continueShopping: dictionary.cart.continueShopping,
                  subtotal: dictionary.cart.subtotal,
                  viewCart: dictionary.miniCart.viewCart,
                  checkout: dictionary.miniCart.checkout,
                  remove: dictionary.common.remove,
                }}
              />
                          <AccountDrawer
                            locale={validLocale}
                            dictionary={{
                              myAccount: dictionary.account.myAccount,
                              orders: dictionary.account.orders,
                              addresses: dictionary.account.addresses,
                              wishlist: dictionary.account.wishlist,
                              settings: dictionary.account.settings,
                              logout: dictionary.account.logout,
                              welcome: dictionary.account.welcome,
                              login: dictionary.account.login,
                              register: dictionary.account.register,
                              notLoggedIn: dictionary.account.notLoggedIn,
                              profile: dictionary.account.profile,
                              more: dictionary.common.more,
                            }}
                          />
                                                                                                <LocationCurrencyBanner locale={validLocale} />
                                                                                                <CookieConsentBanner locale={validLocale} />
                                                                                                <WhatsAppFloatingButton phoneNumber="971506071405" />
                                                        </WishlistProvider>
                                            </FreeGiftProvider>
                    </CartProvider>
        </NotificationProvider>
      </CurrencyProvider>
    </AuthProvider>
  );
}
