// WordPress REST API Types for ACF and Site Options

export interface WPImage {
  id: number;
  url: string;
  alt: string;
  title: string;
  width: number;
  height: number;
  sizes: {
    thumbnail: string;
    medium: string;
    large: string;
    full: string;
  };
}

export interface WPLink {
  title: string;
  url: string;
  target: string;
}

// Hero Slider Types
export interface HeroSlide {
  image: WPImage;
  mobile_image?: WPImage;
  link?: WPLink;
}

export interface HeroSliderSettings {
  enabled: boolean;
  slides: HeroSlide[];
  autoplay: boolean;
  autoplay_delay: number;
  loop: boolean;
}

// Banner Types
export interface Banner {
  image: WPImage;
  mobile_image?: WPImage;
  link?: WPLink;
  title?: string;
  subtitle?: string;
}

export interface BannersSettings {
  enabled: boolean;
  banners: Banner[];
  hide_on_mobile?: boolean;
}

// Collection Types
export interface Collection {
  title: string;
  description?: string;
  image: WPImage;
  link: WPLink;
}

export interface CollectionsSettings {
  enabled: boolean;
  section_title: string;
  section_subtitle?: string;
  collections: Collection[];
  hide_on_mobile?: boolean;
}

// Product Section Types
export interface ProductSectionSettings {
  enabled: boolean;
  section_title: string;
  section_subtitle?: string;
  products_count: number;
  show_view_all: boolean;
  view_all_link?: string;
  hide_on_mobile?: boolean;
}

// Category Section Types
export interface CategorySectionSettings {
  enabled: boolean;
  section_title: string;
  section_subtitle?: string;
  categories_count: number;
  show_view_all: boolean;
  hide_on_mobile?: boolean;
}

// Featured Products Slider Types
export interface FeaturedProductsSettings {
  enabled: boolean;
  section_title: string;
  section_subtitle?: string;
  products_count: number;
  autoplay: boolean;
  autoplay_delay: number;
  hide_on_mobile?: boolean;
}

// Site Settings Types
export interface SiteSettings {
  logo: WPImage | null;
  logo_dark?: WPImage | null;
  favicon?: WPImage | null;
  site_name?: string;
  tagline?: string;
}

// Menu Types
export interface WPMenuItem {
  id: number;
  title: string;
  url: string;
  target: string;
  parent: number;
  order: number;
  children?: WPMenuItem[];
}

export interface WPMenu {
  id: number;
  name: string;
  slug: string;
  items: WPMenuItem[];
}

// Home Page ACF Fields
export interface HomePageACF {
  hero_slider: HeroSliderSettings;
  new_products: ProductSectionSettings;
  bestseller_products: ProductSectionSettings;
  shop_by_category: CategorySectionSettings;
  featured_products: FeaturedProductsSettings;
  collections: CollectionsSettings;
  banners: BannersSettings;
}

// API Response Types
export interface WPOptionsResponse {
  site_settings: SiteSettings;
  home_page: HomePageACF;
}

export interface WPMenuResponse {
  menus: WPMenu[];
}

// WordPress Customizer Settings (Appearance > Customize)
// These settings are stored in wp_options and exposed via custom REST endpoint
export interface CustomizerSettings {
  // Site Identity
  site_title?: string;
  site_tagline?: string;
  site_logo?: string; // URL string from Customizer
  site_icon?: string; // Favicon URL
  
  // Custom Logo (from theme support)
  custom_logo?: number; // Attachment ID
  custom_logo_url?: string; // Full URL
  
  // Home Page Settings
  hero_slider_enabled?: boolean;
  hero_autoplay?: boolean;
  hero_autoplay_delay?: number;
  hero_loop?: boolean;
  
  // Section Toggles
  new_products_enabled?: boolean;
  new_products_title?: string;
  new_products_subtitle?: string;
  new_products_count?: number;
  
  bestseller_enabled?: boolean;
  bestseller_title?: string;
  bestseller_subtitle?: string;
  bestseller_count?: number;
  
  categories_enabled?: boolean;
  categories_title?: string;
  categories_subtitle?: string;
  categories_count?: number;
  
  featured_enabled?: boolean;
  featured_title?: string;
  featured_subtitle?: string;
  featured_count?: number;
  featured_autoplay?: boolean;
  
  collections_enabled?: boolean;
  collections_title?: string;
  collections_subtitle?: string;
  
  banners_enabled?: boolean;
}

// WordPress Site Info from /wp-json (root endpoint)
export interface WPSiteInfo {
  name: string;
  description: string;
  url: string;
  home: string;
  gmt_offset: number;
  timezone_string: string;
  site_logo?: number;
  site_icon?: number;
  site_icon_url?: string;
}
