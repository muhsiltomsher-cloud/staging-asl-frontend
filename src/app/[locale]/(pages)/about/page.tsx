import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { getDictionary } from "@/i18n";
import { generateMetadata as generateSeoMetadata } from "@/lib/utils/seo";
import type { Locale } from "@/config/site";
import type { Metadata } from "next";

interface AboutPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: AboutPageProps): Promise<Metadata> {
  const { locale } = await params;
  return generateSeoMetadata({
    title: locale === "ar" ? "من نحن" : "About Us",
    description:
      locale === "ar"
        ? "تعرف على قصة أروماتيك سينتس لاب ورحلتنا في صناعة العطور الفاخرة"
        : "Learn about Aromatic Scents Lab's story and our journey in crafting premium fragrances",
    locale: locale as Locale,
    pathname: "/about",
  });
}

export default async function AboutPage({ params }: AboutPageProps) {
  const { locale } = await params;
  const dictionary = await getDictionary(locale as Locale);
  const isRTL = locale === "ar";

  const breadcrumbItems = [
    { name: dictionary.common.about, href: `/${locale}/about` },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumbs items={breadcrumbItems} locale={locale as Locale} />

      {/* Hero Section */}
      <section className="mb-16">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <h1 className="mb-6 text-4xl font-bold text-gray-900 lg:text-5xl">
              {isRTL ? "قصتنا" : "Our Story"}
            </h1>
            <p className="mb-4 text-lg text-gray-600">
              {isRTL
                ? "في أروماتيك سينتس لاب، نؤمن بأن العطر ليس مجرد رائحة، بل هو تجربة تلامس الروح وتخلق ذكريات لا تُنسى."
                : "At Aromatic Scents Lab, we believe that fragrance is not just a scent, but an experience that touches the soul and creates unforgettable memories."}
            </p>
            <p className="text-lg text-gray-600">
              {isRTL
                ? "بدأت رحلتنا من شغف عميق بفن صناعة العطور، ومنذ ذلك الحين نسعى لتقديم أفضل المنتجات العطرية المصنوعة من أجود المكونات الطبيعية."
                : "Our journey began from a deep passion for the art of perfumery, and since then we strive to deliver the finest aromatic products crafted from the highest quality natural ingredients."}
            </p>
          </div>
          <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-200">
            {/* Placeholder for about image */}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="mb-16">
        <h2 className="mb-10 text-center text-3xl font-bold text-gray-900">
          {isRTL ? "قيمنا" : "Our Values"}
        </h2>
        <div className="grid gap-8 md:grid-cols-3">
          {[
            {
              title: isRTL ? "الجودة" : "Quality",
              description: isRTL
                ? "نختار أجود المكونات من مصادر موثوقة حول العالم لضمان أعلى مستويات الجودة."
                : "We select the finest ingredients from trusted sources around the world to ensure the highest quality standards.",
              icon: "✨",
            },
            {
              title: isRTL ? "الأصالة" : "Authenticity",
              description: isRTL
                ? "نحافظ على التراث العطري العربي الأصيل مع لمسة عصرية تناسب جميع الأذواق."
                : "We preserve authentic Arabian fragrance heritage with a modern touch that suits all tastes.",
              icon: "🌟",
            },
            {
              title: isRTL ? "الاستدامة" : "Sustainability",
              description: isRTL
                ? "نلتزم بممارسات صديقة للبيئة في جميع مراحل الإنتاج والتعبئة."
                : "We are committed to eco-friendly practices in all stages of production and packaging.",
              icon: "🌿",
            },
          ].map((value, index) => (
            <div
              key={index}
              className="rounded-lg border bg-white p-6 text-center shadow-sm"
            >
              <div className="mb-4 text-4xl">{value.icon}</div>
              <h3 className="mb-3 text-xl font-semibold text-gray-900">
                {value.title}
              </h3>
              <p className="text-gray-600">{value.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Mission Section */}
      <section className="mb-16 rounded-lg bg-gray-900 p-8 text-white md:p-12">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="mb-6 text-3xl font-bold">
            {isRTL ? "مهمتنا" : "Our Mission"}
          </h2>
          <p className="text-lg text-gray-300">
            {isRTL
              ? "مهمتنا هي تقديم تجربة عطرية فريدة تجمع بين الفخامة والأصالة، ونسعى لأن نكون الوجهة الأولى لعشاق العطور الفاخرة في المنطقة."
              : "Our mission is to deliver a unique aromatic experience that combines luxury and authenticity. We strive to be the premier destination for premium fragrance enthusiasts in the region."}
          </p>
        </div>
      </section>

      {/* Team Section */}
      <section>
        <h2 className="mb-10 text-center text-3xl font-bold text-gray-900">
          {isRTL ? "فريقنا" : "Our Team"}
        </h2>
        <div className="grid gap-8 md:grid-cols-3">
          {[
            {
              name: isRTL ? "أحمد الخليفي" : "Ahmed Al-Khalifi",
              role: isRTL ? "المؤسس والرئيس التنفيذي" : "Founder & CEO",
            },
            {
              name: isRTL ? "سارة المنصور" : "Sara Al-Mansour",
              role: isRTL ? "مديرة الإبداع" : "Creative Director",
            },
            {
              name: isRTL ? "محمد العلي" : "Mohammed Al-Ali",
              role: isRTL ? "خبير العطور" : "Master Perfumer",
            },
          ].map((member, index) => (
            <div key={index} className="text-center">
              <div className="mx-auto mb-4 h-32 w-32 overflow-hidden rounded-full bg-gray-200" />
              <h3 className="text-lg font-semibold text-gray-900">
                {member.name}
              </h3>
              <p className="text-gray-600">{member.role}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
