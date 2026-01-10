import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/common/Button";
import { getDictionary } from "@/i18n";
import { generateMetadata as generateSeoMetadata } from "@/lib/utils/seo";
import { getProducts, getCategories, getFreeGiftProductIds, getBundleEnabledProductSlugs } from "@/lib/api/woocommerce";
import { getHomePageSettings } from "@/lib/api/wordpress";
import {
  HeroSlider,
  ProductSection,
  CategorySection,
  FeaturedProductsSlider,
  CollectionsSection,
  BannersSection,
} from "@/components/sections";
import type { Locale } from "@/config/site";
import type { Metadata } from "next";

export const revalidate = 60;

interface HomePageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: HomePageProps): Promise<Metadata> {
  const { locale } = await params;
  return generateSeoMetadata({
    title: locale === "ar" ? "الرئيسية" : "Home",
    description:
      locale === "ar"
        ? "اكتشف مجموعتنا الفاخرة من العطور والمنتجات العطرية"
        : "Discover our premium collection of fragrances and aromatic products",
    locale: locale as Locale,
    pathname: "",
  });
}

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;
  const dictionary = await getDictionary(locale as Locale);
  const isRTL = locale === "ar";

  // Fetch all data in parallel
  // Fetch both localized categories (for names) and English categories (for URL slugs)
  const [{ products: allProducts }, categories, englishCategories, homeSettings, giftProductIds, bundleProductSlugs] = await Promise.all([
    getProducts({ per_page: 20, locale: locale as Locale }),
    getCategories(locale as Locale),
    getCategories("en"), // Always fetch English categories for URL slugs
    getHomePageSettings(locale as Locale),
    getFreeGiftProductIds(),
    getBundleEnabledProductSlugs(),
  ]);

  // Create a mapping of localized category ID to English slug for URL generation
  // WPML assigns different IDs for different locales, so we match by index position
  // Both category lists are returned in the same order from the API
  const englishCategorySlugs: Record<number, string> = {};
  
  // Filter to root categories only (parent === 0) and exclude uncategorized
  const localizedRootCategories = categories.filter((cat) => cat.parent === 0 && cat.slug !== "uncategorized");
  const englishRootCategories = englishCategories.filter((cat) => cat.parent === 0 && cat.slug !== "uncategorized");
  
  // Map localized category IDs to English slugs by matching index position
  // The API returns categories in a consistent order across locales
  localizedRootCategories.forEach((localizedCat, index) => {
    if (index < englishRootCategories.length) {
      englishCategorySlugs[localizedCat.id] = englishRootCategories[index].slug;
    }
  });

  // Filter out gift products from the home page
  const products = allProducts.filter(
    (product) => !giftProductIds.includes(product.id)
  );

  // Translations for sections - using dictionary for dynamic content
  const sectionTexts = {
    viewAll: dictionary.common.viewAll,
    products: dictionary.sections.products,
    newProducts: {
      title: dictionary.sections.newProducts.title,
      subtitle: dictionary.sections.newProducts.subtitle,
    },
    bestsellers: {
      title: dictionary.sections.bestsellers.title,
      subtitle: dictionary.sections.bestsellers.subtitle,
    },
    shopByCategory: {
      title: dictionary.sections.shopByCategory.title,
      subtitle: dictionary.sections.shopByCategory.subtitle,
    },
    featuredProducts: {
      title: dictionary.sections.featuredProducts.title,
      subtitle: dictionary.sections.featuredProducts.subtitle,
    },
    collections: {
      title: dictionary.sections.collections.title,
      subtitle: dictionary.sections.collections.subtitle,
    },
  };

  // Apply translations to settings if not set from WordPress
  const newProductsSettings = {
    ...homeSettings.new_products,
    section_title: homeSettings.new_products.section_title || sectionTexts.newProducts.title,
    section_subtitle: homeSettings.new_products.section_subtitle || sectionTexts.newProducts.subtitle,
  };

  const bestsellerSettings = {
    ...homeSettings.bestseller_products,
    section_title: homeSettings.bestseller_products.section_title || sectionTexts.bestsellers.title,
    section_subtitle: homeSettings.bestseller_products.section_subtitle || sectionTexts.bestsellers.subtitle,
  };

  const categorySettings = {
    ...homeSettings.shop_by_category,
    section_title: homeSettings.shop_by_category.section_title || sectionTexts.shopByCategory.title,
    section_subtitle: homeSettings.shop_by_category.section_subtitle || sectionTexts.shopByCategory.subtitle,
  };

  const featuredSettings = {
    ...homeSettings.featured_products,
    section_title: homeSettings.featured_products.section_title || sectionTexts.featuredProducts.title,
    section_subtitle: homeSettings.featured_products.section_subtitle || sectionTexts.featuredProducts.subtitle,
  };

  const collectionsSettings = {
    ...homeSettings.collections,
    section_title: homeSettings.collections.section_title || sectionTexts.collections.title,
    section_subtitle: homeSettings.collections.section_subtitle || sectionTexts.collections.subtitle,
  };

    const categoryExtraItems = [
      {
        id: "new-products",
        name: { en: "New Products", ar: "منتجات جديدة" },
        slug: "new-products",
        href: `/${locale}/new-products`,
        image: "https://staging.aromaticscentslab.com/wp-content/uploads/2025/12/New-Products.webp",
      },
      {
        id: "featured-products",
        name: { en: "Featured Products", ar: "منتجات مميزة" },
        slug: "featured-products",
        href: `/${locale}/featured-products`,
        image: "https://staging.aromaticscentslab.com/wp-content/uploads/2025/12/Featured-Products.webp",
      },
    ];

  return (
    <div className="flex flex-col">
      {/* Hero Slider */}
      <HeroSlider settings={homeSettings.hero_slider} />

      {/* Banners - Top Position */}
      <BannersSection settings={homeSettings.banners} />

            {/* New Products Section */}
            <ProductSection
              settings={newProductsSettings}
              products={products}
              locale={locale as Locale}
              isRTL={isRTL}
              viewAllText={sectionTexts.viewAll}
              className="bg-[#f7f6f2]"
              bundleProductSlugs={bundleProductSlugs}
            />

      {/* Shop by Category */}
      <CategorySection
        settings={categorySettings}
        categories={categories}
        locale={locale as Locale}
        isRTL={isRTL}
        viewAllText={sectionTexts.viewAll}
        productsText={sectionTexts.products}
        englishCategorySlugs={englishCategorySlugs}
        extraItems={categoryExtraItems}
      />

      {/* Featured Products Slider */}
      <FeaturedProductsSlider
        settings={featuredSettings}
        products={products}
        locale={locale as Locale}
        isRTL={isRTL}
        viewAllText={sectionTexts.viewAll}
        bundleProductSlugs={bundleProductSlugs}
      />

      {/* Bestseller Products Section */}
      <ProductSection
        settings={bestsellerSettings}
        products={products}
        locale={locale as Locale}
        isRTL={isRTL}
        viewAllText={sectionTexts.viewAll}
        className="bg-[#f7f6f2]"
        bundleProductSlugs={bundleProductSlugs}
      />

      {/* Our Collections */}
      <CollectionsSection settings={collectionsSettings} />

      {/* About Section - Creative Design */}
      <section className="relative overflow-hidden bg-gradient-to-br from-amber-50 via-[#f7f6f2] to-stone-50 py-16 md:py-24">
        {/* Decorative background elements */}
        <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-amber-100/40 blur-3xl" />
        <div className="absolute -bottom-20 -right-20 h-80 w-80 rounded-full bg-stone-100/60 blur-3xl" />
        <div className="absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-50/30 blur-3xl" />
        
        <div className="container relative mx-auto px-4">
          {/* Section header with decorative line */}
          <div className="mb-12 text-center md:mb-16">
            <div className="mb-4 flex items-center justify-center gap-4">
              <div className="h-px w-12 bg-gradient-to-r from-transparent to-amber-400" />
              <span className="text-sm font-medium uppercase tracking-widest text-amber-600">
                {isRTL ? "اكتشف قصتنا" : "Discover Our Journey"}
              </span>
              <div className="h-px w-12 bg-gradient-to-l from-transparent to-amber-400" />
            </div>
            <h2 className="text-3xl font-bold text-amber-900 md:text-4xl lg:text-5xl">
              {dictionary.sections.ourStory.title}
            </h2>
          </div>

          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            {/* Image side with decorative frame */}
            <div className="relative">
              <div className="absolute -inset-4 rounded-2xl bg-gradient-to-br from-amber-200/20 to-stone-200/20 blur-sm" />
              <div className="relative aspect-[4/5] overflow-hidden rounded-2xl shadow-xl lg:aspect-square">
                <Image
                  src="https://staging.aromaticscentslab.com/wp-content/uploads/2025/12/ASL-Website-Images-Patchouli-Glow-06.webp"
                  alt={isRTL ? "قصتنا" : "Our Story"}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
              {/* Floating accent */}
              <div className="absolute -bottom-6 -right-6 h-24 w-24 rounded-full border-4 border-amber-200/50 bg-white/80 shadow-lg backdrop-blur-sm" />
            </div>

            {/* Content side */}
            <div className="relative">
              <div className="space-y-6">
                <p className="text-lg leading-relaxed text-amber-800/80 md:text-xl">
                  {dictionary.sections.ourStory.description1}
                </p>
                <p className="leading-relaxed text-amber-700/70">
                  {dictionary.sections.ourStory.description2}
                </p>
                
                {/* Feature highlights */}
                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div className="rounded-xl bg-white/60 p-4 shadow-sm backdrop-blur-sm">
                    <div className="mb-2 text-2xl font-bold text-amber-900">100%</div>
                    <div className="text-sm text-amber-700/70">{isRTL ? "مكونات طبيعية" : "Natural Ingredients"}</div>
                  </div>
                  <div className="rounded-xl bg-white/60 p-4 shadow-sm backdrop-blur-sm">
                    <div className="mb-2 text-2xl font-bold text-amber-900">10+</div>
                    <div className="text-sm text-amber-700/70">{isRTL ? "سنوات من الخبرة" : "Years of Excellence"}</div>
                  </div>
                </div>

                <div className="pt-4">
                  <Button 
                    variant="outline" 
                    className="group border-2 border-amber-900 px-8 py-3 text-amber-900 transition-all duration-300 hover:bg-amber-900 hover:text-white hover:shadow-lg" 
                    asChild
                  >
                    <Link href={`/${locale}/about`}>
                      {dictionary.common.learnMore}
                      <svg className="ml-2 inline-block h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
