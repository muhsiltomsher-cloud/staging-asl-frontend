import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/common/Button";
import { getDictionary } from "@/i18n";
import { generateMetadata as generateSeoMetadata } from "@/lib/utils/seo";
import type { Locale } from "@/config/site";
import type { Metadata } from "next";

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

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative h-[70vh] min-h-[500px] w-full">
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/30" />
        <div className="absolute inset-0 bg-[url('/hero-bg.jpg')] bg-cover bg-center" />
        <div className="container relative mx-auto flex h-full items-center px-4">
          <div className="max-w-xl text-white">
            <h1 className="mb-4 text-4xl font-bold leading-tight md:text-5xl lg:text-6xl">
              {isRTL
                ? "اكتشف عالم العطور الفاخرة"
                : "Discover the World of Premium Fragrances"}
            </h1>
            <p className="mb-8 text-lg text-white/90 md:text-xl">
              {isRTL
                ? "مجموعة حصرية من العطور المصنوعة بعناية فائقة"
                : "An exclusive collection of carefully crafted aromatic scents"}
            </p>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" asChild>
                <Link href={`/${locale}/shop`}>
                  {dictionary.common.shop}
                  <ArrowRight className={`ml-2 h-5 w-5 ${isRTL ? "rotate-180" : ""}`} />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10" asChild>
                <Link href={`/${locale}/about`}>{dictionary.common.about}</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mb-10 text-center">
            <h2 className="mb-3 text-3xl font-bold text-gray-900">
              {isRTL ? "تسوق حسب الفئة" : "Shop by Category"}
            </h2>
            <p className="text-gray-600">
              {isRTL
                ? "استكشف مجموعاتنا المتنوعة"
                : "Explore our diverse collections"}
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                name: isRTL ? "عطور" : "Perfumes",
                slug: "perfumes",
                image: "/categories/perfumes.jpg",
              },
              {
                name: isRTL ? "بخور" : "Incense",
                slug: "incense",
                image: "/categories/incense.jpg",
              },
              {
                name: isRTL ? "زيوت عطرية" : "Essential Oils",
                slug: "essential-oils",
                image: "/categories/oils.jpg",
              },
            ].map((category) => (
              <Link
                key={category.slug}
                href={`/${locale}/category/${category.slug}`}
                className="group relative aspect-[4/3] overflow-hidden rounded-lg"
              >
                <div className="absolute inset-0 bg-gray-200" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="text-xl font-semibold text-white">
                    {category.name}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="mb-10 flex items-center justify-between">
            <div>
              <h2 className="mb-2 text-3xl font-bold text-gray-900">
                {isRTL ? "منتجات مميزة" : "Featured Products"}
              </h2>
              <p className="text-gray-600">
                {isRTL ? "اكتشف أفضل منتجاتنا" : "Discover our best sellers"}
              </p>
            </div>
            <Link
              href={`/${locale}/shop`}
              className="hidden items-center text-sm font-medium text-gray-900 hover:underline md:flex"
            >
              {dictionary.common.viewAll}
              <ArrowRight className={`ml-1 h-4 w-4 ${isRTL ? "rotate-180" : ""}`} />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 md:gap-6">
            {/* Placeholder product cards */}
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <div className="aspect-square rounded-lg bg-gray-200" />
                <div className="space-y-1">
                  <div className="h-4 w-3/4 rounded bg-gray-200" />
                  <div className="h-4 w-1/2 rounded bg-gray-200" />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 text-center md:hidden">
            <Button variant="outline" asChild>
              <Link href={`/${locale}/shop`}>{dictionary.common.viewAll}</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-200 lg:aspect-[4/3]" />
            <div>
              <h2 className="mb-4 text-3xl font-bold text-gray-900">
                {isRTL ? "قصتنا" : "Our Story"}
              </h2>
              <p className="mb-6 text-gray-600">
                {isRTL
                  ? "في أروماتيك سينتس لاب، نؤمن بأن العطر هو فن. نصنع كل منتج بعناية فائقة باستخدام أجود المكونات من جميع أنحاء العالم."
                  : "At Aromatic Scents Lab, we believe that fragrance is an art. We craft each product with meticulous care using the finest ingredients from around the world."}
              </p>
              <p className="mb-8 text-gray-600">
                {isRTL
                  ? "مهمتنا هي تقديم تجربة عطرية فريدة تدوم طويلاً وتترك انطباعاً لا يُنسى."
                  : "Our mission is to deliver a unique aromatic experience that lasts long and leaves an unforgettable impression."}
              </p>
              <Button variant="outline" asChild>
                <Link href={`/${locale}/about`}>{dictionary.common.learnMore}</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="bg-gray-900 py-16 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-3 text-3xl font-bold">
            {isRTL ? "اشترك في نشرتنا الإخبارية" : "Subscribe to Our Newsletter"}
          </h2>
          <p className="mx-auto mb-8 max-w-md text-gray-300">
            {dictionary.footer.subscribeText}
          </p>
          <form className="mx-auto flex max-w-md gap-2">
            <input
              type="email"
              placeholder={dictionary.footer.emailPlaceholder}
              className="flex-1 rounded-md border-0 bg-white/10 px-4 py-3 text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-white/50"
            />
            <Button className="bg-white text-gray-900 hover:bg-gray-100">
              {dictionary.footer.subscribe}
            </Button>
          </form>
        </div>
      </section>
    </div>
  );
}
