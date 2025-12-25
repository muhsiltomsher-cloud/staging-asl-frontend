import Link from "next/link";
import { Button } from "@/components/common/Button";
import { getDictionary } from "@/i18n";
import { generateMetadata as generateSeoMetadata } from "@/lib/utils/seo";
import { getProducts, getCategories } from "@/lib/api/woocommerce";
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
  const [{ products }, categories, homeSettings] = await Promise.all([
    getProducts({ per_page: 20 }),
    getCategories(),
    getHomePageSettings(locale as Locale),
  ]);

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

  return (
    <div className="flex flex-col">
      {/* Hero Slider */}
      <HeroSlider settings={homeSettings.hero_slider} />

      {/* Fallback Hero if no slider images */}
      {(!homeSettings.hero_slider.enabled || homeSettings.hero_slider.slides.length === 0) && (
        <section className="relative h-[50vh] min-h-[400px] w-full md:h-[70vh] md:min-h-[500px]">
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/30" />
          <div className="absolute inset-0 bg-[url('/hero-bg.jpg')] bg-cover bg-center" />
          <div className="container relative mx-auto flex h-full items-center px-4">
            <div className="max-w-xl text-white">
              <h1 className="mb-4 text-3xl font-bold leading-tight md:text-4xl lg:text-5xl">
                {dictionary.sections.hero.title}
              </h1>
              <p className="mb-6 text-base text-white/90 md:mb-8 md:text-lg">
                {dictionary.sections.hero.subtitle}
              </p>
              <Button size="lg" asChild>
                <Link href={`/${locale}/shop`}>
                  {dictionary.common.shop}
                </Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Banners - Top Position */}
      <BannersSection settings={homeSettings.banners} />

      {/* New Products Section */}
      <ProductSection
        settings={newProductsSettings}
        products={products}
        locale={locale as Locale}
        isRTL={isRTL}
        viewAllText={sectionTexts.viewAll}
      />

      {/* Shop by Category */}
      <CategorySection
        settings={categorySettings}
        categories={categories}
        locale={locale as Locale}
        isRTL={isRTL}
        viewAllText={sectionTexts.viewAll}
        productsText={sectionTexts.products}
      />

      {/* Featured Products Slider */}
      <FeaturedProductsSlider
        settings={featuredSettings}
        products={products}
        locale={locale as Locale}
        isRTL={isRTL}
        viewAllText={sectionTexts.viewAll}
      />

      {/* Bestseller Products Section */}
      <ProductSection
        settings={bestsellerSettings}
        products={products}
        locale={locale as Locale}
        isRTL={isRTL}
        viewAllText={sectionTexts.viewAll}
        className="bg-stone-50"
      />

      {/* Our Collections */}
      <CollectionsSection settings={collectionsSettings} />

      {/* About Section */}
      <section className="bg-white py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
            <div className="relative aspect-square overflow-hidden rounded-xl bg-stone-200 lg:aspect-[4/3]" />
            <div>
              <h2 className="mb-4 text-2xl font-bold text-amber-900 md:text-3xl">
                {dictionary.sections.ourStory.title}
              </h2>
              <p className="mb-4 text-amber-800/70 md:mb-6">
                {dictionary.sections.ourStory.description1}
              </p>
              <p className="mb-6 text-amber-800/70 md:mb-8">
                {dictionary.sections.ourStory.description2}
              </p>
              <Button variant="outline" className="border-amber-900 text-amber-900 hover:bg-amber-900 hover:text-white" asChild>
                <Link href={`/${locale}/about`}>{dictionary.common.learnMore}</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="bg-amber-900 py-12 text-white md:py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-3 text-2xl font-bold md:text-3xl">
            {dictionary.sections.newsletter.title}
          </h2>
          <p className="mx-auto mb-6 max-w-md text-amber-100/80 md:mb-8">
            {dictionary.footer.subscribeText}
          </p>
          <form className="mx-auto flex max-w-md flex-col gap-2 sm:flex-row">
            <input
              type="email"
              placeholder={dictionary.footer.emailPlaceholder}
              className="flex-1 rounded-md border-0 bg-white/10 px-4 py-3 text-white placeholder:text-amber-200/60 focus:outline-none focus:ring-2 focus:ring-white/50"
            />
            <Button className="bg-white text-amber-900 hover:bg-amber-50">
              {dictionary.footer.subscribe}
            </Button>
          </form>
        </div>
      </section>
    </div>
  );
}
