import Image from "next/image";
import Link from "next/link";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { getDictionary } from "@/i18n";
import { generateMetadata as generateSeoMetadata } from "@/lib/utils/seo";
import type { Locale } from "@/config/site";
import type { Metadata } from "next";

export const revalidate = 60;

interface AboutPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: AboutPageProps): Promise<Metadata> {
  const { locale } = await params;
  return generateSeoMetadata({
    title: locale === "ar" ? "أروماتيك سينتس لاب" : "Aromatic Scents Lab",
    description:
      locale === "ar"
        ? "اكتشف رحلتنا في صناعة العطور الفاخرة - نأخذك في رحلة عبر المكونات لتجربة واستكشاف المكون الأساسي للعطر"
        : "Discover our journey in crafting premium fragrances - we take you on a journey through ingredients to experience and explore the bare essential component of the Scent",
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

  const ingredients = [
    {
      id: "vanilla",
      title: isRTL ? "الفانيليا في العطور" : "Vanilla in Perfumes",
      description: isRTL
        ? "الفانيليا هي نوتة عطرية شائعة، تغوي حواسنا وأرواحنا منذ قرون عديدة وتظل محبوبة على نطاق واسع..."
        : "Vanilla is an ever-popular fragrance note, that seduces our noses and soul for almost many centuries and remains widely loved...",
      href: `/${locale}/ingredients/vanilla`,
      gradient: "from-amber-100 to-orange-50",
      iconBg: "bg-amber-200",
    },
    {
      id: "musk",
      title: isRTL ? "المسك في العطور" : "Musk in Perfumes",
      description: isRTL
        ? "منذ العصور الكلاسيكية، استخدم الناس مكونات معطرة مشتقة من الطبيعة لصنع العطور. واليوم، بعض هذه المكونات الطبيعية..."
        : "Since classical times, people have used scented ingredients derived from nature to make fragrances. And today, some of these natural...",
      href: `/${locale}/ingredients/musk`,
      gradient: "from-stone-100 to-neutral-50",
      iconBg: "bg-stone-200",
    },
    {
      id: "leather",
      title: isRTL ? "الجلد في العطور" : "Leather in Perfumes",
      description: isRTL
        ? "العطور والجلد كانا لا ينفصلان تاريخياً. الرابط بينهما يعود إلى حوالي 2000 سنة قبل ميلاد المسيح..."
        : "Perfumes & leather have been inseparable, historically. The link between these dates to about 2000 years before the birth of Christ...",
      href: `/${locale}/ingredients/leather`,
      gradient: "from-yellow-50 to-amber-50",
      iconBg: "bg-yellow-200",
    },
  ];

  return (
    <div className="flex flex-col">
      {/* Hero Section with Parallax Effect */}
      <section className="relative min-h-[60vh] overflow-hidden bg-gradient-to-br from-amber-900 via-amber-800 to-stone-900">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -left-20 -top-20 h-96 w-96 animate-pulse rounded-full bg-amber-600/20 blur-3xl" />
          <div className="absolute -bottom-32 -right-32 h-[500px] w-[500px] animate-pulse rounded-full bg-stone-600/20 blur-3xl" style={{ animationDelay: "1s" }} />
          <div className="absolute left-1/3 top-1/4 h-64 w-64 animate-pulse rounded-full bg-amber-500/10 blur-2xl" style={{ animationDelay: "2s" }} />
        </div>
        
        {/* Decorative Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="h-full w-full" style={{ backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)", backgroundSize: "40px 40px" }} />
        </div>

        <div className="container relative mx-auto flex min-h-[60vh] items-center px-4 py-20">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-6 flex items-center justify-center gap-4">
              <div className="h-px w-16 bg-gradient-to-r from-transparent to-amber-400" />
              <span className="text-sm font-medium uppercase tracking-[0.3em] text-amber-300">
                {isRTL ? "اكتشف قصتنا" : "Discover Our Story"}
              </span>
              <div className="h-px w-16 bg-gradient-to-l from-transparent to-amber-400" />
            </div>
            
            <h1 className="mb-8 text-4xl font-bold leading-tight text-white md:text-5xl lg:text-6xl">
              {isRTL ? "أروماتيك سينتس لاب" : "Aromatic Scents Lab"}
            </h1>
            
            <p className="mx-auto max-w-3xl text-lg leading-relaxed text-amber-100/90 md:text-xl">
              {isRTL
                ? "شم العطر هو تجربة، وهنا في أروماتيك سينتس لاب، نأخذك في رحلة عبر المكونات لتجربة واستكشاف المكون الأساسي للعطر."
                : "Smelling a fragrance is an experience, and here at Aromatic Scents Lab, we take you on a journey through ingredients to experience and explore the bare essential component of the Scent."}
            </p>

            {/* Scroll Indicator */}
            <div className="mt-12 flex justify-center">
              <div className="flex h-12 w-7 items-start justify-center rounded-full border-2 border-amber-400/50 p-2">
                <div className="h-2 w-1 animate-bounce rounded-full bg-amber-400" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Breadcrumbs */}
      <div className="container mx-auto px-4 py-4">
        <Breadcrumbs items={breadcrumbItems} locale={locale as Locale} />
      </div>

      {/* Main Content Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#f7f6f2] to-white py-16 md:py-24">
        {/* Decorative Elements */}
        <div className="absolute left-0 top-0 h-full w-1/3 bg-gradient-to-r from-amber-50/50 to-transparent" />
        <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-stone-50/50 to-transparent" />
        
        <div className="container relative mx-auto px-4">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
            {/* Image Side with Creative Frame */}
            <div className="relative order-2 lg:order-1">
              <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-amber-200/30 via-transparent to-stone-200/30 blur-xl" />
              <div className="relative">
                {/* Main Image */}
                <div className="relative aspect-[4/5] overflow-hidden rounded-2xl shadow-2xl">
                  <Image
                    src="https://adminasl.stagingndemo.com/wp-content/uploads/2025/12/ASL-Website-Images-Patchouli-Glow-06.webp"
                    alt={isRTL ? "أروماتيك سينتس لاب" : "Aromatic Scents Lab"}
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-amber-900/20 to-transparent" />
                </div>
                
                {/* Floating Badge */}
                <div className="absolute -bottom-6 -right-6 flex h-28 w-28 flex-col items-center justify-center rounded-full border-4 border-white bg-gradient-to-br from-amber-600 to-amber-800 text-white shadow-xl md:h-32 md:w-32">
                  <span className="text-2xl font-bold md:text-3xl">2021</span>
                  <span className="text-xs uppercase tracking-wider">{isRTL ? "تأسست" : "Est."}</span>
                </div>
                
                {/* Decorative Corner */}
                <div className="absolute -left-4 -top-4 h-20 w-20 rounded-full border-4 border-amber-200/50" />
              </div>
            </div>

            {/* Content Side */}
            <div className="order-1 lg:order-2">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-amber-100 px-4 py-2">
                <div className="h-2 w-2 rounded-full bg-amber-600" />
                <span className="text-sm font-medium text-amber-800">
                  {isRTL ? "الإمارات العربية المتحدة" : "UAE Based Boutique"}
                </span>
              </div>

              <h2 className="mb-6 text-3xl font-bold text-amber-900 md:text-4xl">
                {isRTL ? "نصنع عطوراً فريدة من نوعها" : "We Create Truly One-of-a-Kind Fragrances"}
              </h2>

              <div className="space-y-6 text-lg leading-relaxed text-amber-800/80">
                <p>
                  {isRTL
                    ? "نصنع عطوراً فريدة من نوعها بأكثر التقنيات ابتكاراً واستدامة. من خلال تقديم عطور تلهم وتأسر وتجمّل، نطور رابطة عطرية غير مرئية معك."
                    : "We create truly one-of-a-kind fragrances with the most innovative & sustainable technologies. By offering fragrances to inspire, captivate and beautify, we develop an invisible fragrant bond with you."}
                </p>
                <p>
                  {isRTL
                    ? "بدأنا رحلتنا العطرية في عام 2021، كمتجر عطور مقره الإمارات العربية المتحدة، بمهمة بسيطة للغاية - صنع عطور مميزة بأجود المكونات."
                    : "We began our fragrance journey in 2021, as a UAE-based fragrance boutique, with quite a simple mission – to create statement-making fragrances with the highest quality ingredients."}
                </p>
              </div>

              {/* Stats Grid */}
              <div className="mt-8 grid grid-cols-2 gap-4">
                <div className="rounded-xl bg-gradient-to-br from-amber-50 to-white p-5 shadow-sm">
                  <div className="mb-1 text-3xl font-bold text-amber-900">100%</div>
                  <div className="text-sm text-amber-700/70">{isRTL ? "مصنوعة يدوياً" : "Handcrafted"}</div>
                </div>
                <div className="rounded-xl bg-gradient-to-br from-stone-50 to-white p-5 shadow-sm">
                  <div className="mb-1 text-3xl font-bold text-amber-900">6+</div>
                  <div className="text-sm text-amber-700/70">{isRTL ? "فئات المنتجات" : "Product Categories"}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Products Range Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-amber-900 via-stone-900 to-amber-950 py-16 md:py-24">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="h-full w-full" style={{ backgroundImage: "linear-gradient(45deg, transparent 45%, rgba(255,255,255,0.1) 50%, transparent 55%)", backgroundSize: "20px 20px" }} />
        </div>

        <div className="container relative mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="mb-6 text-3xl font-bold text-white md:text-4xl">
              {isRTL ? "مجموعتنا المتنوعة" : "Our Diverse Collection"}
            </h2>
            <p className="mb-12 text-lg text-amber-100/80">
              {isRTL
                ? "أنتجنا عطوراً فاخرة بمهارة لتشكيل تلك التجربة في خط عطور يجمع بين العناية الشخصية والعناية بالهواء."
                : "We produced fine fragrances with proficiency to shape that experience into a fragrance line that combines personal care and air care."}
            </p>

            {/* Product Categories Grid */}
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
              {[
                { name: isRTL ? "العطور" : "Perfumes", icon: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" },
                { name: isRTL ? "رذاذ الشعر" : "Hair Mist", icon: "M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" },
                { name: isRTL ? "زيت العطر" : "Fragrance Oil", icon: "M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" },
                { name: isRTL ? "الشموع" : "Candles", icon: "M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" },
                { name: isRTL ? "الموزعات" : "Diffusers", icon: "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" },
                { name: isRTL ? "معطرات الجو" : "Air Fresheners", icon: "M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" },
              ].map((product, index) => (
                <div
                  key={index}
                  className="group rounded-xl bg-white/10 p-6 backdrop-blur-sm transition-all duration-300 hover:bg-white/20 hover:shadow-lg"
                >
                  <div className="mb-3 flex justify-center">
                    <svg className="h-8 w-8 text-amber-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={product.icon} />
                    </svg>
                  </div>
                  <div className="text-sm font-medium text-white">{product.name}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Uniqueness Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-white to-[#f7f6f2] py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
            {/* Content */}
            <div>
              <div className="mb-4 flex items-center gap-3">
                <div className="h-1 w-12 rounded-full bg-gradient-to-r from-amber-600 to-amber-400" />
                <span className="text-sm font-medium uppercase tracking-widest text-amber-600">
                  {isRTL ? "ما يميزنا" : "What Makes Us Unique"}
                </span>
              </div>

              <h2 className="mb-6 text-3xl font-bold text-amber-900 md:text-4xl">
                {isRTL ? "فريدون بأكثر من طريقة" : "Unique in More Ways Than One"}
              </h2>

              <div className="space-y-6 text-lg leading-relaxed text-amber-800/80">
                <p>
                  {isRTL
                    ? "نحن علامة تجارية خالدة ونؤمن بأن الثراء الحقيقي يكمن في البساطة والجودة مع إنشاء منتج يمكن تقديره من قبل العملاء المحليين والأجانب."
                    : "We are a timeless brand and believe that the real richness lies in simplicity and quality while creating a product that can be appreciated by both domestic and foreign clients."}
                </p>
                <p>
                  {isRTL
                    ? "خزانة شمية حصرية ومثيرة للإعجاب يبنيها أكثر العطارين موهبة بأجود المواد الخام النادرة."
                    : "An exclusive and admirable olfactory wardrobe is built by the most talented perfumers with the finest and rare raw materials."}
                </p>
                <p>
                  {isRTL
                    ? "نحب البساطة، وتغليفنا ذو المظهر العتيق مع العروض ينقل لك الجوهر الخالص لعطرنا."
                    : "We love simplicity, and our vintage-look packaging along with displays convey to you the bare essence of our fragrance."}
                </p>
              </div>

              {/* Feature List */}
              <div className="mt-8 space-y-4">
                {[
                  { text: isRTL ? "مكونات طبيعية فاخرة" : "Premium Natural Ingredients" },
                  { text: isRTL ? "تقنيات مستدامة" : "Sustainable Technologies" },
                  { text: isRTL ? "تغليف عتيق أنيق" : "Elegant Vintage Packaging" },
                  { text: isRTL ? "حرفية يدوية" : "Handcrafted Excellence" },
                ].map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-100">
                      <svg className="h-4 w-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-amber-800">{feature.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Visual Element */}
            <div className="relative">
              <div className="relative mx-auto max-w-md">
                {/* Decorative Circles */}
                <div className="absolute -left-8 -top-8 h-64 w-64 rounded-full border-2 border-dashed border-amber-200/50" />
                <div className="absolute -bottom-8 -right-8 h-48 w-48 rounded-full border-2 border-dashed border-stone-200/50" />
                
                {/* Main Card */}
                <div className="relative rounded-2xl bg-gradient-to-br from-amber-100 via-white to-stone-100 p-8 shadow-xl md:p-12">
                  <div className="mb-6 text-center">
                    <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-amber-600 to-amber-800">
                      <svg className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </div>
                    <h3 className="mb-2 text-2xl font-bold text-amber-900">
                      {isRTL ? "رحلة عبر الجوهر" : "A Journey Through Essence"}
                    </h3>
                    <p className="text-amber-700/70">
                      {isRTL
                        ? "رحلة عبر الجوهر الدافئ والمثير للمكونات يصنعها أروماتيك سينتس لاب بأجمل طريقة..."
                        : "A Journey through the warm and sultry essence of ingredients is created by Aromatic Scents Lab most beautifully..."}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Ingredients Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#f7f6f2] via-amber-50/30 to-stone-50 py-16 md:py-24">
        {/* Decorative Background */}
        <div className="absolute -left-40 top-1/4 h-80 w-80 rounded-full bg-amber-100/40 blur-3xl" />
        <div className="absolute -right-40 bottom-1/4 h-80 w-80 rounded-full bg-stone-100/40 blur-3xl" />

        <div className="container relative mx-auto px-4">
          {/* Section Header */}
          <div className="mb-12 text-center md:mb-16">
            <div className="mb-4 flex items-center justify-center gap-4">
              <div className="h-px w-16 bg-gradient-to-r from-transparent to-amber-400" />
              <span className="text-sm font-medium uppercase tracking-[0.2em] text-amber-600">
                {isRTL ? "استكشف المكونات" : "Explore Ingredients"}
              </span>
              <div className="h-px w-16 bg-gradient-to-l from-transparent to-amber-400" />
            </div>
            <h2 className="mb-4 text-3xl font-bold text-amber-900 md:text-4xl lg:text-5xl">
              {isRTL ? "تعرف على المكونات" : "Know More About Ingredients"}
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-amber-700/70">
              {isRTL
                ? "مدفوعين بالفن والكمال، استكشف قصة وحرفية المكونات من بيت العطور لدينا."
                : "Driven by artistry and perfection, explore the story and craftsmanship of ingredients from our house of perfumery."}
            </p>
          </div>

          {/* Ingredients Description */}
          <div className="mx-auto mb-12 max-w-4xl rounded-2xl bg-white/60 p-6 text-center shadow-sm backdrop-blur-sm md:p-8">
            <p className="text-lg leading-relaxed text-amber-800/80">
              {isRTL
                ? "كل عطر في بيتنا يعكس الجوهر الحقيقي للمكونات مثل حديقة العطور الثمينة والقوية بما في ذلك الفانيليا الدافئة والحلوة، والجلد الرقيق، والعنبر المريح، والأزهار الخفيفة والمنعشة، والمسك الأخلاقي والفريد، إلى جانب خشب الصندل المريح والمهدئ."
                : "Each perfume in our house reflects the true essence of ingredients like the aromatic garden of precious and powerful fragrances including the warm and sweet vanilla, the savoir-faire of delicate leather, comforting amber, light, and refreshing florals, ethical and unique musk, along with the relaxing and calming sandalwood."}
            </p>
            <p className="mt-4 text-amber-700/70">
              {isRTL
                ? "إيقاظ حواسك برحلة معبرة من البهجة الطازجة والزهرية والفاكهية، كل عطر يتطور ليكون توقيع بشرتك."
                : "Awakening your senses with an expressive journey of fresh, floral, and fruity delight, each fragrance evolves to be the signature of your skin."}
            </p>
          </div>

          {/* Ingredient Cards */}
          <div className="grid gap-6 md:grid-cols-3 md:gap-8">
            {ingredients.map((ingredient) => (
              <Link
                key={ingredient.id}
                href={ingredient.href}
                className="group relative overflow-hidden rounded-2xl bg-white shadow-lg transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl"
              >
                {/* Card Background Gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${ingredient.gradient} opacity-50 transition-opacity duration-300 group-hover:opacity-70`} />
                
                <div className="relative p-6 md:p-8">
                  {/* Icon */}
                  <div className={`mb-4 inline-flex h-14 w-14 items-center justify-center rounded-xl ${ingredient.iconBg} transition-transform duration-300 group-hover:scale-110`}>
                    <svg className="h-7 w-7 text-amber-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                    </svg>
                  </div>

                  {/* Content */}
                  <h3 className="mb-3 text-xl font-bold text-amber-900 transition-colors group-hover:text-amber-700">
                    {ingredient.title}
                  </h3>
                  <p className="mb-4 text-amber-700/70">
                    {ingredient.description}
                  </p>

                  {/* Read More Link */}
                  <div className="flex items-center gap-2 text-sm font-medium text-amber-600 transition-colors group-hover:text-amber-800">
                    <span>{isRTL ? "اقرأ المزيد" : "Read More"}</span>
                    <svg className={`h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 ${isRTL ? "rotate-180 group-hover:-translate-x-1" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </div>
                </div>

                {/* Decorative Corner */}
                <div className="absolute -bottom-4 -right-4 h-24 w-24 rounded-full bg-gradient-to-br from-amber-200/30 to-transparent blur-xl transition-all duration-300 group-hover:scale-150" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-amber-800 via-amber-900 to-stone-900 py-16 md:py-20">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute left-1/4 top-0 h-full w-px bg-gradient-to-b from-transparent via-amber-400/20 to-transparent" />
          <div className="absolute left-1/2 top-0 h-full w-px bg-gradient-to-b from-transparent via-amber-400/20 to-transparent" />
          <div className="absolute left-3/4 top-0 h-full w-px bg-gradient-to-b from-transparent via-amber-400/20 to-transparent" />
        </div>

        <div className="container relative mx-auto px-4 text-center">
          <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl">
            {isRTL ? "ابدأ رحلتك العطرية" : "Begin Your Fragrance Journey"}
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-amber-100/80">
            {isRTL
              ? "اكتشف مجموعتنا الحصرية من العطور المصنوعة يدوياً"
              : "Discover our exclusive collection of handcrafted fragrances"}
          </p>
          <Link
            href={`/${locale}/shop`}
            className="group inline-flex items-center gap-3 rounded-full bg-white px-8 py-4 text-lg font-semibold text-amber-900 shadow-lg transition-all duration-300 hover:bg-amber-50 hover:shadow-xl"
          >
            <span>{isRTL ? "تسوق الآن" : "Shop Now"}</span>
            <svg className={`h-5 w-5 transition-transform duration-300 group-hover:translate-x-1 ${isRTL ? "rotate-180 group-hover:-translate-x-1" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </section>
    </div>
  );
}
