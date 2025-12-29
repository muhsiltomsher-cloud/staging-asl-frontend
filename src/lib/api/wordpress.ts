import { siteConfig, type Locale } from "@/config/site";
import type {
  HomePageACF,
  SiteSettings,
  WPMenu,
  HeroSliderSettings,
  ProductSectionSettings,
  CategorySectionSettings,
  FeaturedProductsSettings,
  CollectionsSettings,
  BannersSettings,
  WPSiteInfo,
  WPImage,
  WPLink,
  HeroSlide,
  Banner,
  Collection,
} from "@/types/wordpress";

const WP_API_BASE = `${siteConfig.apiUrl}/wp-json`;

// Types for WordPress Plugin API Response (camelCase format)
interface WPPluginHeroSlide {
  image: string;
  mobileImage: string;
  link: string;
}

interface WPPluginHeroSettings {
  enabled: boolean;
  autoplay: boolean;
  autoplayDelay: number;
  loop: boolean;
  slides: WPPluginHeroSlide[];
}

interface WPPluginBannerItem {
  image: string;
  mobileImage: string;
  title: string;
  titleAr: string;
  subtitle: string;
  subtitleAr: string;
  link: string;
}

interface WPPluginBannersSettings {
  enabled: boolean;
  items: WPPluginBannerItem[];
}

interface WPPluginCollectionItem {
  image: string;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  link: string;
}

interface WPPluginCollectionsSettings {
  enabled: boolean;
  title: string;
  titleAr: string;
  subtitle: string;
  subtitleAr: string;
  items: WPPluginCollectionItem[];
}

interface WPPluginProductSectionSettings {
  enabled: boolean;
  title: string;
  titleAr: string;
  subtitle: string;
  subtitleAr: string;
  count: number;
  display?: string;
  autoplay?: boolean;
  responsive?: {
    desktop: number;
    tablet: number;
    mobile: number;
  };
}

interface WPPluginHomeSettings {
  hero: WPPluginHeroSettings;
  newProducts: WPPluginProductSectionSettings;
  bestseller: WPPluginProductSectionSettings;
  categories: WPPluginProductSectionSettings;
  featured: WPPluginProductSectionSettings;
  collections: WPPluginCollectionsSettings;
  banners: WPPluginBannersSettings;
}

// Type for WordPress Plugin site settings from /asl/v1/site-settings
interface WPPluginSiteSettings {
  name: string;
  description: string;
  url: string;
  logo: {
    id: string | number;
    url: string;
  };
  favicon: {
    id: string | number;
    url: string;
  };
}

// Type for WordPress Plugin header settings from /asl/v1/header-settings
interface WPPluginHeaderSettings {
  sticky: boolean;
  logo: string;
  stickyLogo: string;
  logoDark: string;
}

// Type for WordPress Plugin mobile bar item
interface WPPluginMobileBarItem {
  icon: string;
  label: string;
  labelAr: string;
  url: string;
}

// Type for WordPress Plugin mobile bar settings from /asl/v1/mobile-bar
interface WPPluginMobileBarSettings {
  enabled: boolean;
  items: WPPluginMobileBarItem[];
}

// Frontend types for header and mobile bar
export interface HeaderSettings {
  sticky: boolean;
  logo: string | null;
  stickyLogo: string | null;
  logoDark: string | null;
}

// Type for WordPress Plugin topbar settings from /asl/v1/topbar
interface WPPluginTopbarSettings {
  enabled: boolean;
  text: string;
  textAr: string;
  link: string;
  bgColor: string;
  textColor: string;
  dismissible: boolean;
}

// Frontend types for topbar
export interface TopbarSettings {
  enabled: boolean;
  text: string;
  textAr: string;
  link: string | null;
  bgColor: string;
  textColor: string;
  dismissible: boolean;
}

export interface MobileBarItem {
  icon: string;
  label: string;
  labelAr: string;
  url: string;
}

export interface MobileBarSettings {
  enabled: boolean;
  items: MobileBarItem[];
}

// Helper function to create WPImage from URL string
function createWPImage(url: string, alt: string = ""): WPImage | null {
  if (!url) return null;
  return {
    id: 0,
    url,
    alt,
    title: alt,
    width: 0,
    height: 0,
    sizes: {
      thumbnail: url,
      medium: url,
      large: url,
      full: url,
    },
  };
}

// Helper function to create WPLink from URL string
function createWPLink(url: string, title: string = ""): WPLink | undefined {
  if (!url) return undefined;
  return {
    title,
    url,
    target: "_self",
  };
}

// Transform WordPress Plugin hero settings to frontend format
function transformHeroSettings(pluginHero: WPPluginHeroSettings): HeroSliderSettings {
  const slides: HeroSlide[] = pluginHero.slides
    .filter(slide => slide.image)
    .map((slide, index) => ({
      image: createWPImage(slide.image, `Slide ${index + 1}`) as WPImage,
      mobile_image: createWPImage(slide.mobileImage, `Slide ${index + 1} Mobile`) || undefined,
      link: createWPLink(slide.link),
    }));

  return {
    enabled: pluginHero.enabled,
    slides,
    autoplay: pluginHero.autoplay,
    autoplay_delay: pluginHero.autoplayDelay,
    loop: pluginHero.loop,
  };
}

// Transform WordPress Plugin banners settings to frontend format
function transformBannersSettings(pluginBanners: WPPluginBannersSettings, locale?: Locale): BannersSettings {
  const banners: Banner[] = pluginBanners.items
    .filter(item => item.image)
    .map((item, index) => ({
      image: createWPImage(item.image, item.title || `Banner ${index + 1}`) as WPImage,
      mobile_image: createWPImage(item.mobileImage, item.title || `Banner ${index + 1} Mobile`) || undefined,
      link: createWPLink(item.link, item.title),
      title: locale === "ar" && item.titleAr ? item.titleAr : item.title,
      subtitle: locale === "ar" && item.subtitleAr ? item.subtitleAr : item.subtitle,
    }));

  return {
    enabled: pluginBanners.enabled,
    banners,
  };
}

// Transform WordPress Plugin collections settings to frontend format
function transformCollectionsSettings(pluginCollections: WPPluginCollectionsSettings, locale?: Locale): CollectionsSettings {
  const collections: Collection[] = pluginCollections.items
    .filter(item => item.image || item.title)
    .map((item, index) => ({
      title: locale === "ar" && item.titleAr ? item.titleAr : item.title,
      description: locale === "ar" && item.descriptionAr ? item.descriptionAr : item.description,
      image: createWPImage(item.image, item.title || `Collection ${index + 1}`) as WPImage,
      link: createWPLink(item.link, item.title) as WPLink,
    }));

  return {
    enabled: pluginCollections.enabled,
    section_title: locale === "ar" && pluginCollections.titleAr ? pluginCollections.titleAr : pluginCollections.title,
    section_subtitle: locale === "ar" && pluginCollections.subtitleAr ? pluginCollections.subtitleAr : pluginCollections.subtitle,
    collections,
  };
}

// Transform WordPress Plugin product section settings to frontend format
function transformProductSectionSettings(pluginSection: WPPluginProductSectionSettings, locale?: Locale): ProductSectionSettings {
  return {
    enabled: pluginSection.enabled,
    section_title: locale === "ar" && pluginSection.titleAr ? pluginSection.titleAr : pluginSection.title,
    section_subtitle: locale === "ar" && pluginSection.subtitleAr ? pluginSection.subtitleAr : pluginSection.subtitle,
    products_count: pluginSection.count,
    show_view_all: true,
    view_all_link: "/shop",
  };
}

// Transform WordPress Plugin category section settings to frontend format
function transformCategorySectionSettings(pluginSection: WPPluginProductSectionSettings, locale?: Locale): CategorySectionSettings {
  return {
    enabled: pluginSection.enabled,
    section_title: locale === "ar" && pluginSection.titleAr ? pluginSection.titleAr : pluginSection.title,
    section_subtitle: locale === "ar" && pluginSection.subtitleAr ? pluginSection.subtitleAr : pluginSection.subtitle,
    categories_count: pluginSection.count,
    show_view_all: true,
  };
}

// Transform WordPress Plugin featured products settings to frontend format
function transformFeaturedProductsSettings(pluginSection: WPPluginProductSectionSettings, locale?: Locale): FeaturedProductsSettings {
  return {
    enabled: pluginSection.enabled,
    section_title: locale === "ar" && pluginSection.titleAr ? pluginSection.titleAr : pluginSection.title,
    section_subtitle: locale === "ar" && pluginSection.subtitleAr ? pluginSection.subtitleAr : pluginSection.subtitle,
    products_count: pluginSection.count,
    autoplay: pluginSection.autoplay ?? true,
    autoplay_delay: 4000,
  };
}

interface FetchOptions {
  revalidate?: number;
  tags?: string[];
  locale?: Locale;
  noCache?: boolean;
}

async function fetchWPAPI<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T | null> {
  const { revalidate = 60, tags, locale, noCache = false } = options;

  let url = `${WP_API_BASE}${endpoint}`;

  if (locale) {
    const separator = endpoint.includes("?") ? "&" : "?";
    url = `${url}${separator}lang=${locale}`;
  }

  try {
    const fetchOptions: RequestInit = noCache
      ? { cache: "no-store" }
      : {
          next: {
            revalidate,
            tags,
          },
        };

    const response = await fetch(url, fetchOptions);

    if (!response.ok) {
      console.error(`WordPress API Error: ${response.status} ${response.statusText}`);
      return null;
    }

    return response.json();
  } catch (error) {
    console.error("WordPress API fetch error:", error);
    return null;
  }
}

// Default values for when API is not available
const defaultHeroSlider: HeroSliderSettings = {
  enabled: true,
  slides: [],
  autoplay: true,
  autoplay_delay: 5000,
  loop: true,
};

const defaultProductSection: ProductSectionSettings = {
  enabled: true,
  section_title: "Products",
  section_subtitle: "",
  products_count: 8,
  show_view_all: true,
  view_all_link: "/shop",
};

const defaultCategorySection: CategorySectionSettings = {
  enabled: true,
  section_title: "Shop by Category",
  section_subtitle: "Explore our diverse collections",
  categories_count: 6,
  show_view_all: true,
};

const defaultFeaturedProducts: FeaturedProductsSettings = {
  enabled: true,
  section_title: "Featured Products",
  section_subtitle: "Discover our best sellers",
  products_count: 8,
  autoplay: true,
  autoplay_delay: 4000,
};

const defaultCollections: CollectionsSettings = {
  enabled: true,
  section_title: "Our Collections",
  section_subtitle: "Explore our curated collections",
  collections: [],
};

const defaultBanners: BannersSettings = {
  enabled: true,
  banners: [],
};

// Fetch site settings from WordPress Customizer (Appearance > Customize)
// This uses the WordPress Plugin API and root endpoint for site identity settings
export async function getSiteSettings(locale?: Locale): Promise<SiteSettings> {
  // First try to get site settings from WordPress Plugin API endpoint
  const pluginSiteData = await fetchWPAPI<WPPluginSiteSettings>(
    "/asl/v1/site-settings",
    {
      tags: ["site-settings"],
      locale,
      revalidate: 60, // Cache for 1 minute for faster updates
    }
  );

  // Also get site info from WordPress root endpoint as fallback
  const siteInfo = await fetchWPAPI<WPSiteInfo>(
    "",
    {
      tags: ["site-settings"],
      locale,
      revalidate: 60,
    }
  );

  // Determine logo URL from plugin data or WordPress media
  let logoUrl: string | null = pluginSiteData?.logo?.url || null;
  if (!logoUrl && siteInfo?.site_logo) {
    const mediaData = await fetchWPAPI<{ source_url: string }>(
      `/wp/v2/media/${siteInfo.site_logo}`,
      {
        tags: ["site-settings", "logo"],
        revalidate: 60,
      }
    );
    logoUrl = mediaData?.source_url || null;
  }

  // Determine favicon URL from plugin data or WordPress site icon
  const faviconUrl: string | null = pluginSiteData?.favicon?.url || siteInfo?.site_icon_url || null;

  // Get site name and tagline - prioritize plugin data, then WordPress root endpoint
  const siteName = pluginSiteData?.name || siteInfo?.name || siteConfig.name;
  const siteTagline = pluginSiteData?.description || siteInfo?.description || siteConfig.description;

  // Build site settings from available sources
  const settings: SiteSettings = {
    logo: logoUrl ? {
      id: pluginSiteData?.logo?.id ? Number(pluginSiteData.logo.id) : (siteInfo?.site_logo || 0),
      url: logoUrl,
      alt: siteName,
      title: siteName,
      width: 200,
      height: 60,
      sizes: {
        thumbnail: logoUrl,
        medium: logoUrl,
        large: logoUrl,
        full: logoUrl,
      },
    } : null,
    logo_dark: null,
    favicon: faviconUrl ? {
      id: pluginSiteData?.favicon?.id ? Number(pluginSiteData.favicon.id) : (siteInfo?.site_icon || 0),
      url: faviconUrl,
      alt: "Favicon",
      title: "Favicon",
      width: 32,
      height: 32,
      sizes: {
        thumbnail: faviconUrl,
        medium: faviconUrl,
        large: faviconUrl,
        full: faviconUrl,
      },
    } : null,
    site_name: siteName,
    tagline: siteTagline,
  };

  return settings;
}

// Fetch home page settings from WordPress Plugin API
export async function getHomePageSettings(locale?: Locale): Promise<HomePageACF> {
  // First try to fetch from the WordPress Plugin API endpoint
  const pluginData = await fetchWPAPI<WPPluginHomeSettings>(
    "/asl/v1/home-settings",
    {
      tags: ["home-page-settings"],
      locale,
      revalidate: 60,
    }
  );

  // If plugin data is available, transform it to the expected format
  if (pluginData) {
    return {
      hero_slider: transformHeroSettings(pluginData.hero),
      new_products: transformProductSectionSettings(pluginData.newProducts, locale),
      bestseller_products: transformProductSectionSettings(pluginData.bestseller, locale),
      shop_by_category: transformCategorySectionSettings(pluginData.categories, locale),
      featured_products: transformFeaturedProductsSettings(pluginData.featured, locale),
      collections: transformCollectionsSettings(pluginData.collections, locale),
      banners: transformBannersSettings(pluginData.banners, locale),
    };
  }

  // Fallback: Try ACF endpoint (for backwards compatibility)
  const acfData = await fetchWPAPI<{ acf: Partial<HomePageACF> }>(
    "/acf/v3/options/home-page",
    {
      tags: ["home-page-settings"],
      locale,
      revalidate: 60,
    }
  );

  // Merge with defaults to ensure all fields exist
  return {
    hero_slider: acfData?.acf?.hero_slider || defaultHeroSlider,
    new_products: {
      ...defaultProductSection,
      section_title: "New Products",
      section_subtitle: "Discover our latest arrivals",
      ...acfData?.acf?.new_products,
    },
    bestseller_products: {
      ...defaultProductSection,
      section_title: "Bestsellers",
      section_subtitle: "Our most popular products",
      ...acfData?.acf?.bestseller_products,
    },
    shop_by_category: acfData?.acf?.shop_by_category || defaultCategorySection,
    featured_products: acfData?.acf?.featured_products || defaultFeaturedProducts,
    collections: acfData?.acf?.collections || defaultCollections,
    banners: acfData?.acf?.banners || defaultBanners,
  };
}

// Fetch hero slider settings
export async function getHeroSlider(locale?: Locale): Promise<HeroSliderSettings> {
  const settings = await getHomePageSettings(locale);
  return settings.hero_slider;
}

// Fetch new products section settings
export async function getNewProductsSettings(locale?: Locale): Promise<ProductSectionSettings> {
  const settings = await getHomePageSettings(locale);
  return settings.new_products;
}

// Fetch bestseller products section settings
export async function getBestsellerProductsSettings(locale?: Locale): Promise<ProductSectionSettings> {
  const settings = await getHomePageSettings(locale);
  return settings.bestseller_products;
}

// Fetch category section settings
export async function getCategorySectionSettings(locale?: Locale): Promise<CategorySectionSettings> {
  const settings = await getHomePageSettings(locale);
  return settings.shop_by_category;
}

// Fetch featured products settings
export async function getFeaturedProductsSettings(locale?: Locale): Promise<FeaturedProductsSettings> {
  const settings = await getHomePageSettings(locale);
  return settings.featured_products;
}

// Fetch collections settings
export async function getCollectionsSettings(locale?: Locale): Promise<CollectionsSettings> {
  const settings = await getHomePageSettings(locale);
  return settings.collections;
}

// Fetch banners settings
export async function getBannersSettings(locale?: Locale): Promise<BannersSettings> {
  const settings = await getHomePageSettings(locale);
  return settings.banners;
}

// Fetch WordPress menu by location
export async function getMenu(location: string, locale?: Locale): Promise<WPMenu | null> {
  const data = await fetchWPAPI<WPMenu>(
    `/menus/v1/locations/${location}`,
    {
      tags: ["menus", `menu-${location}`],
      locale,
      revalidate: 300,
    }
  );

  return data;
}

// Fetch primary navigation menu
export async function getPrimaryMenu(locale?: Locale): Promise<WPMenu | null> {
  return getMenu("primary", locale);
}

// Fetch footer menu
export async function getFooterMenu(locale?: Locale): Promise<WPMenu | null> {
  return getMenu("footer", locale);
}

// Default mobile bar items when WordPress settings are empty
const defaultMobileBarItems: MobileBarItem[] = [
  { icon: "home", label: "Home", labelAr: "الرئيسية", url: "/" },
  { icon: "grid", label: "Categories", labelAr: "الفئات", url: "/shop" },
  { icon: "search", label: "Search", labelAr: "بحث", url: "/search" },
  { icon: "heart", label: "Wishlist", labelAr: "المفضلة", url: "/wishlist" },
  { icon: "user", label: "Account", labelAr: "حسابي", url: "/account" },
];

// Fetch header settings from WordPress Plugin API
export async function getHeaderSettings(): Promise<HeaderSettings> {
  const data = await fetchWPAPI<WPPluginHeaderSettings>(
    "/asl/v1/header-settings",
    {
      tags: ["header-settings"],
      revalidate: 60,
    }
  );

  return {
    sticky: data?.sticky ?? true,
    logo: data?.logo || null,
    stickyLogo: data?.stickyLogo || null,
    logoDark: data?.logoDark || null,
  };
}

// Fetch mobile bar settings from WordPress Plugin API
export async function getMobileBarSettings(locale?: Locale): Promise<MobileBarSettings> {
  const data = await fetchWPAPI<WPPluginMobileBarSettings>(
    "/asl/v1/mobile-bar",
    {
      tags: ["mobile-bar-settings"],
      locale,
      revalidate: 60,
    }
  );

  // If mobile bar is disabled, return disabled state
  if (!data?.enabled) {
    return {
      enabled: false,
      items: [],
    };
  }

  // Check if all items are empty (no icon, label, or url configured)
  const hasConfiguredItems = data.items.some(
    (item) => item.icon || item.label || item.labelAr || item.url
  );

  // Use default items if no items are configured
  const items = hasConfiguredItems
    ? data.items.map((item) => ({
        icon: item.icon || "",
        label: item.label || "",
        labelAr: item.labelAr || "",
        url: item.url || "",
      }))
    : defaultMobileBarItems;

  return {
    enabled: data.enabled,
    items,
  };
}

// Default topbar settings
const defaultTopbarSettings: TopbarSettings = {
  enabled: true,
  text: "Free shipping on orders over 200 SAR",
  textAr: "شحن مجاني للطلبات فوق 200 ريال",
  link: null,
  bgColor: "#f3f4f6",
  textColor: "#4b5563",
  dismissible: false,
};

// Fetch topbar settings from WordPress Plugin API
export async function getTopbarSettings(locale?: Locale): Promise<TopbarSettings> {
  const data = await fetchWPAPI<WPPluginTopbarSettings>(
    "/asl/v1/topbar",
    {
      tags: ["topbar-settings"],
      locale,
      revalidate: 60,
    }
  );

  if (!data) {
    return defaultTopbarSettings;
  }

  return {
    enabled: data.enabled,
    text: data.text || defaultTopbarSettings.text,
    textAr: data.textAr || defaultTopbarSettings.textAr,
    link: data.link || null,
    bgColor: data.bgColor || defaultTopbarSettings.bgColor,
    textColor: data.textColor || defaultTopbarSettings.textColor,
    dismissible: data.dismissible,
  };
}

// WordPress Page types from REST API
export interface WPPage {
  id: number;
  date: string;
  date_gmt: string;
  modified: string;
  modified_gmt: string;
  slug: string;
  status: string;
  type: string;
  link: string;
  title: {
    rendered: string;
  };
  content: {
    rendered: string;
    protected: boolean;
  };
  excerpt: {
    rendered: string;
    protected: boolean;
  };
  featured_media: number;
  parent: number;
  menu_order: number;
  template: string;
  meta: Record<string, unknown>;
  yoast_head_json?: {
    title?: string;
    description?: string;
    og_title?: string;
    og_description?: string;
    og_image?: Array<{ url: string }>;
  };
}

// Functional page slugs that should NOT be rendered from WordPress
// These have custom Next.js implementations
const FUNCTIONAL_PAGE_SLUGS = [
  "cart",
  "checkout",
  "shop",
  "account",
  "my-account",
  "wishlist",
  "login",
  "register",
  "forgot-password",
  "reset-password",
  "order-confirmation",
];

// Check if a slug is a functional page that should not be rendered from WordPress
export function isFunctionalPageSlug(slug: string): boolean {
  return FUNCTIONAL_PAGE_SLUGS.includes(slug.toLowerCase());
}

// Fetch a single WordPress page by slug
// Uses no-cache to ensure content updates are reflected immediately
export async function getPageBySlug(slug: string, locale?: Locale): Promise<WPPage | null> {
  // Don't fetch functional pages from WordPress
  if (isFunctionalPageSlug(slug)) {
    return null;
  }

  const data = await fetchWPAPI<WPPage[]>(
    `/wp/v2/pages?slug=${encodeURIComponent(slug)}&_embed`,
    {
      tags: ["pages", `page-${slug}`],
      locale,
      noCache: true,
    }
  );

  // WordPress returns an array, get the first matching page
  if (data && data.length > 0) {
    return data[0];
  }

  return null;
}

// Fetch all published WordPress pages
export async function getPages(locale?: Locale): Promise<WPPage[]> {
  const data = await fetchWPAPI<WPPage[]>(
    "/wp/v2/pages?per_page=100&status=publish&_embed",
    {
      tags: ["pages"],
      locale,
      revalidate: 300, // Cache for 5 minutes
    }
  );

  if (!data) {
    return [];
  }

  // Filter out functional pages
  return data.filter((page) => !isFunctionalPageSlug(page.slug));
}

// Helper function to strip HTML tags from a string (for SEO metadata)
export function stripHtmlTags(html: string): string {
  return html.replace(/<[^>]*>/g, "").trim();
}
