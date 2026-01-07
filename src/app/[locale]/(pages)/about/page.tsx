import Link from "next/link";
import Image from "next/image";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { getDictionary } from "@/i18n";
import { generateMetadata as generateSeoMetadata } from "@/lib/utils/seo";
import type { Locale } from "@/config/site";
import type { Metadata } from "next";
import {
  Sparkles,
  Leaf,
  MapPin,
  Calendar,
  ChevronRight,
} from "lucide-react";
import { IngredientsCarousel } from "./IngredientsCarousel";

interface AboutPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: AboutPageProps): Promise<Metadata> {
  const { locale } = await params;
  const dictionary = await getDictionary(locale as Locale);
  const pageContent = dictionary.pages.about;

  return generateSeoMetadata({
    title: pageContent.seo.title,
    description: pageContent.seo.description,
    locale: locale as Locale,
    pathname: "/about",
  });
}

export default async function AboutPage({ params }: AboutPageProps) {
  const { locale } = await params;
  const dictionary = await getDictionary(locale as Locale);
  const pageContent = dictionary.pages.about;
  const isRTL = locale === "ar";

  const breadcrumbItems = [
    { name: dictionary.common.about, href: `/${locale}/about` },
  ];

  return (
    <div className="flex flex-col">
      {/* Hero Section - Full Width with Gradient Overlay */}
      <section className="relative min-h-[70vh] overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src="https://staging.aromaticscentslab.com/wp-content/uploads/2025/12/ASL-Website-Images-Patchouli-Glow-06.webp"
            alt="Aromatic Scents Lab"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-amber-950/90 via-amber-900/80 to-stone-900/70" />
        </div>

        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -left-20 -top-20 h-96 w-96 animate-pulse rounded-full bg-amber-600/10 blur-3xl" />
          <div
            className="absolute -bottom-32 -right-32 h-[500px] w-[500px] animate-pulse rounded-full bg-amber-400/10 blur-3xl"
            style={{ animationDelay: "1s" }}
          />
          <div
            className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 animate-pulse rounded-full bg-amber-500/5 blur-3xl"
            style={{ animationDelay: "2s" }}
          />
        </div>

        {/* Decorative Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div
            className="h-full w-full"
            style={{
              backgroundImage:
                "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
              backgroundSize: "40px 40px",
            }}
          />
        </div>

        <div className="container relative mx-auto flex min-h-[70vh] items-center px-4 py-20">
          <div className="mx-auto max-w-4xl text-center">
            {/* Decorative Line */}
            <div className="mb-8 flex items-center justify-center gap-4">
              <div className="h-px w-20 bg-gradient-to-r from-transparent to-amber-400" />
              <Sparkles className="h-6 w-6 text-amber-400" />
              <div className="h-px w-20 bg-gradient-to-l from-transparent to-amber-400" />
            </div>

            <span className="mb-4 inline-block text-sm font-medium uppercase tracking-[0.3em] text-amber-300">
              {pageContent.heroSubtitle}
            </span>

            <h1 className="mb-8 text-4xl font-bold leading-tight text-white md:text-5xl lg:text-7xl">
              {pageContent.title}
            </h1>

            <p className="mx-auto max-w-2xl text-lg leading-relaxed text-amber-100/90 md:text-xl">
              {pageContent.heroDescription}
            </p>

            {/* Stats Row */}
            <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-8">
              <div className="rounded-xl border border-amber-400/20 bg-white/5 p-4 backdrop-blur-sm">
                <Calendar className="mx-auto mb-2 h-6 w-6 text-amber-400" />
                <div className="text-sm font-medium text-amber-100">{pageContent.stats.since}</div>
              </div>
              <div className="rounded-xl border border-amber-400/20 bg-white/5 p-4 backdrop-blur-sm">
                <MapPin className="mx-auto mb-2 h-6 w-6 text-amber-400" />
                <div className="text-sm font-medium text-amber-100">{pageContent.stats.location}</div>
              </div>
              <div className="rounded-xl border border-amber-400/20 bg-white/5 p-4 backdrop-blur-sm">
                <Sparkles className="mx-auto mb-2 h-6 w-6 text-amber-400" />
                <div className="text-sm font-medium text-amber-100">{pageContent.stats.handcrafted}</div>
              </div>
              <div className="rounded-xl border border-amber-400/20 bg-white/5 p-4 backdrop-blur-sm">
                <Leaf className="mx-auto mb-2 h-6 w-6 text-amber-400" />
                <div className="text-sm font-medium text-amber-100">{pageContent.stats.sustainable}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <div className="flex h-10 w-6 items-start justify-center rounded-full border-2 border-amber-400/50 p-1">
            <div className="h-2 w-1 animate-bounce rounded-full bg-amber-400" />
          </div>
        </div>
      </section>

      {/* Breadcrumbs */}
      <div className="container mx-auto px-4 py-4">
        <Breadcrumbs items={breadcrumbItems} locale={locale as Locale} />
      </div>

      {/* Main Story Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#f7f6f2] to-white py-16 md:py-24">
        {/* Decorative Elements */}
        <div className="absolute -left-40 top-20 h-80 w-80 rounded-full bg-amber-100/40 blur-3xl" />
        <div className="absolute -right-40 bottom-20 h-80 w-80 rounded-full bg-stone-100/60 blur-3xl" />

        <div className="container relative mx-auto px-4">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
            {/* Image Column */}
            <div className={`relative ${isRTL ? "lg:order-2" : ""}`}>
              <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-amber-200/30 to-stone-200/30 blur-xl" />
              <div className="relative">
                {/* Main Image */}
                <div className="relative aspect-[4/5] overflow-hidden rounded-3xl shadow-2xl">
                  <Image
                    src="https://staging.aromaticscentslab.com/wp-content/uploads/2025/12/ASL-Website-Images-Patchouli-Glow-06.webp"
                    alt={isRTL ? "قصتنا" : "Our Story"}
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover"
                  />
                </div>
                {/* Floating Accent Card */}
                <div className="absolute -bottom-6 -right-6 rounded-2xl border border-amber-200/50 bg-white/90 p-6 shadow-xl backdrop-blur-sm md:-bottom-8 md:-right-8">
                  <div className="text-3xl font-bold text-amber-900">2021</div>
                  <div className="text-sm text-amber-700">{isRTL ? "بداية الرحلة" : "Journey Started"}</div>
                </div>
                {/* Decorative Circle */}
                <div className="absolute -left-4 -top-4 h-20 w-20 rounded-full border-4 border-amber-200/50 bg-gradient-to-br from-amber-100 to-white" />
              </div>
            </div>

            {/* Content Column */}
            <div className={`${isRTL ? "lg:order-1" : ""}`}>
              <div className="mb-6 flex items-center gap-3">
                <div className="h-1 w-12 rounded-full bg-gradient-to-r from-amber-600 to-amber-400" />
                <span className="text-sm font-medium uppercase tracking-widest text-amber-600">
                  {pageContent.mainContent.title}
                </span>
              </div>

              <h2 className="mb-8 text-3xl font-bold text-amber-900 md:text-4xl lg:text-5xl">
                {isRTL ? "رحلتنا العطرية" : "Our Fragrance Journey"}
              </h2>

              <div className="space-y-6">
                <p className="text-lg leading-relaxed text-amber-800/80">
                  {pageContent.mainContent.paragraph1}
                </p>
                <p className="leading-relaxed text-amber-700/70">
                  {pageContent.mainContent.paragraph2}
                </p>
                <p className="leading-relaxed text-amber-700/70">
                  {pageContent.mainContent.paragraph3}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Uniqueness Section - Full Width Banner */}
      <section className="relative overflow-hidden bg-gradient-to-r from-amber-900 via-amber-800 to-stone-900 py-16 md:py-24">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute left-1/4 top-0 h-full w-px bg-gradient-to-b from-transparent via-amber-400/20 to-transparent" />
          <div className="absolute left-1/2 top-0 h-full w-px bg-gradient-to-b from-transparent via-amber-400/20 to-transparent" />
          <div className="absolute left-3/4 top-0 h-full w-px bg-gradient-to-b from-transparent via-amber-400/20 to-transparent" />
        </div>

        <div className="container relative mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-6 flex items-center justify-center gap-4">
              <div className="h-px w-16 bg-gradient-to-r from-transparent to-amber-400" />
              <Sparkles className="h-5 w-5 text-amber-400" />
              <div className="h-px w-16 bg-gradient-to-l from-transparent to-amber-400" />
            </div>

            <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl lg:text-5xl">
              {pageContent.uniqueness.title}
            </h2>
            <p className="mb-8 text-lg text-amber-300">
              {pageContent.uniqueness.subtitle}
            </p>
            <p className="mx-auto max-w-3xl text-lg leading-relaxed text-amber-100/80">
              {pageContent.uniqueness.content}
            </p>
          </div>
        </div>
      </section>

      {/* Journey Quote Section */}
      <section className="relative overflow-hidden bg-[#f7f6f2] py-16 md:py-20">
        <div className="absolute inset-0 opacity-5">
          <div
            className="h-full w-full"
            style={{
              backgroundImage:
                "radial-gradient(circle at 2px 2px, #92400e 1px, transparent 0)",
              backgroundSize: "30px 30px",
            }}
          />
        </div>

        <div className="container relative mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-8 text-6xl text-amber-300">&ldquo;</div>
            <h3 className="mb-4 text-2xl font-bold text-amber-900 md:text-3xl">
              {pageContent.journey.title}
            </h3>
            <p className="text-xl italic leading-relaxed text-amber-700/80 md:text-2xl">
              {pageContent.journey.content}
            </p>
            <div className="mt-8 text-6xl text-amber-300">&rdquo;</div>
          </div>
        </div>
      </section>

      {/* Ingredients Section */}
      <section className="relative overflow-hidden bg-white py-16 md:py-24">
        <div className="absolute -left-20 top-1/2 h-64 w-64 -translate-y-1/2 rounded-full bg-amber-50 blur-3xl" />
        <div className="absolute -right-20 top-1/3 h-64 w-64 rounded-full bg-stone-50 blur-3xl" />

        <div className="container relative mx-auto px-4">
          {/* Section Header */}
          <div className="mb-12 text-center md:mb-16">
            <div className="mb-4 flex items-center justify-center gap-4">
              <div className="h-px w-12 bg-gradient-to-r from-transparent to-amber-400" />
              <span className="text-sm font-medium uppercase tracking-widest text-amber-600">
                {isRTL ? "استكشف" : "Explore"}
              </span>
              <div className="h-px w-12 bg-gradient-to-l from-transparent to-amber-400" />
            </div>
            <h2 className="mb-4 text-3xl font-bold text-amber-900 md:text-4xl lg:text-5xl">
              {pageContent.ingredients.title}
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-amber-700/70">
              {pageContent.ingredients.subtitle}
            </p>
          </div>

          {/* Description */}
          <div className="mx-auto mb-12 max-w-4xl">
            <p className="text-center leading-relaxed text-amber-700/80">
              {pageContent.ingredients.description}
            </p>
          </div>

          {/* Ingredients Carousel */}
          <IngredientsCarousel
            items={pageContent.ingredients.items}
            isRTL={isRTL}
          />
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-amber-900 via-amber-800 to-stone-900 py-16 md:py-24">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -left-20 -top-20 h-96 w-96 animate-pulse rounded-full bg-amber-600/10 blur-3xl" />
          <div
            className="absolute -bottom-20 -right-20 h-80 w-80 animate-pulse rounded-full bg-stone-600/10 blur-3xl"
            style={{ animationDelay: "1s" }}
          />
        </div>

        <div className="container relative mx-auto px-4 text-center">
          <div className="mb-6 flex items-center justify-center gap-4">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-amber-400" />
            <Sparkles className="h-5 w-5 text-amber-400" />
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-amber-400" />
          </div>

          <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl lg:text-5xl">
            {pageContent.cta.title}
          </h2>
          <p className="mx-auto mb-10 max-w-2xl text-lg text-amber-100/80">
            {pageContent.cta.subtitle}
          </p>
          <Link
            href={`/${locale}/shop`}
            className="group inline-flex items-center gap-3 rounded-full bg-white px-10 py-5 text-lg font-semibold text-amber-900 shadow-lg transition-all duration-300 hover:bg-amber-50 hover:shadow-2xl hover:shadow-amber-900/20"
          >
            <span>{pageContent.cta.button}</span>
            <ChevronRight
              className={`h-5 w-5 transition-transform duration-300 group-hover:translate-x-1 ${isRTL ? "rotate-180 group-hover:-translate-x-1" : ""}`}
            />
          </Link>
        </div>
      </section>
    </div>
  );
}
