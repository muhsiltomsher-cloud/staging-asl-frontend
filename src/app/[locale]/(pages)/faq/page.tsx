import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { FAQAccordion, type FAQItem } from "@/components/common/FAQAccordion";
import { generateMetadata as generateSeoMetadata } from "@/lib/utils/seo";
import { getPageBySlug, stripHtmlTags } from "@/lib/api/wordpress";
import type { Locale } from "@/config/site";
import type { Metadata } from "next";

interface FAQPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: FAQPageProps): Promise<Metadata> {
  const { locale } = await params;
  const wpPage = await getPageBySlug("faq", locale as Locale);

  if (wpPage) {
    const seoTitle = wpPage.yoast_head_json?.title
      ? wpPage.yoast_head_json.title
      : stripHtmlTags(wpPage.title.rendered);
    const seoDescription = wpPage.yoast_head_json?.description
      ? wpPage.yoast_head_json.description
      : wpPage.excerpt.rendered
        ? stripHtmlTags(wpPage.excerpt.rendered).slice(0, 160)
        : locale === "ar"
          ? "إجابات على الأسئلة الأكثر شيوعاً حول منتجاتنا وخدماتنا"
          : "Answers to the most common questions about our products and services";

    return generateSeoMetadata({
      title: seoTitle,
      description: seoDescription,
      locale: locale as Locale,
      pathname: "/faq",
    });
  }

  return generateSeoMetadata({
    title: locale === "ar" ? "الأسئلة الشائعة" : "Frequently Asked Questions",
    description:
      locale === "ar"
        ? "إجابات على الأسئلة الأكثر شيوعاً حول منتجاتنا وخدماتنا"
        : "Answers to the most common questions about our products and services",
    locale: locale as Locale,
    pathname: "/faq",
  });
}

export default async function FAQPage({ params }: FAQPageProps) {
  const { locale } = await params;
  const isRTL = locale === "ar";

  const wpPage = await getPageBySlug("faq", locale as Locale);

  const breadcrumbItems = [
    { name: isRTL ? "الأسئلة الشائعة" : "FAQ", href: `/${locale}/faq` },
  ];

  // If WordPress content is available, render it
  if (wpPage && wpPage.content.rendered) {
    const pageTitle = stripHtmlTags(wpPage.title.rendered);

    return (
      <div className="container mx-auto px-4 py-8">
        <Breadcrumbs items={breadcrumbItems} locale={locale as Locale} />

        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold text-gray-900">{pageTitle}</h1>
          {wpPage.excerpt.rendered && (
            <p className="mx-auto max-w-2xl text-lg text-gray-600">
              {stripHtmlTags(wpPage.excerpt.rendered)}
            </p>
          )}
          <p className="mt-2 text-sm text-gray-500">
            {isRTL ? "آخر تحديث: " : "Last Updated: "}
            {new Date(wpPage.modified).toLocaleDateString(
              isRTL ? "ar-SA" : "en-US",
              {
                year: "numeric",
                month: "long",
                day: "numeric",
              }
            )}
          </p>
        </div>

        <div className="mx-auto max-w-4xl">
          <div
            className="prose prose-amber max-w-none prose-headings:text-amber-900 prose-p:text-gray-700 prose-strong:text-amber-800 prose-li:text-gray-700 prose-a:text-amber-700 prose-a:underline hover:prose-a:text-amber-900"
            dangerouslySetInnerHTML={{ __html: wpPage.content.rendered }}
          />

          <div className="mt-12 rounded-lg bg-gray-50 p-6 text-center">
            <h2 className="mb-2 text-xl font-semibold text-gray-900">
              {isRTL ? "لم تجد إجابة لسؤالك؟" : "Didn't find your answer?"}
            </h2>
            <p className="mb-4 text-gray-600">
              {isRTL
                ? "تواصل معنا وسنكون سعداء بمساعدتك"
                : "Contact us and we'll be happy to help"}
            </p>
            <a
              href={`/${locale}/contact`}
              className="inline-flex items-center justify-center rounded-full bg-gray-900 px-6 py-2 text-sm font-medium text-white hover:bg-gray-800"
            >
              {isRTL ? "اتصل بنا" : "Contact Us"}
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Fallback: Use default FAQ items with interactive accordion
  const faqItems: FAQItem[] = isRTL
    ? [
        {
          question: "ما هي سياسة الشحن لديكم؟",
          answer:
            "نقدم شحن مجاني للطلبات التي تزيد عن 200 ريال سعودي داخل المملكة العربية السعودية. يتم توصيل الطلبات خلال 2-5 أيام عمل. للشحن الدولي، يرجى التواصل معنا للحصول على تفاصيل الأسعار ومدة التوصيل.",
        },
        {
          question: "هل يمكنني إرجاع المنتج؟",
          answer:
            "نعم، نقبل الإرجاع خلال 14 يوماً من تاريخ الاستلام بشرط أن يكون المنتج غير مفتوح وفي حالته الأصلية. يرجى التواصل مع خدمة العملاء لبدء عملية الإرجاع.",
        },
        {
          question: "كيف يمكنني تتبع طلبي؟",
          answer:
            "بعد شحن طلبك، ستتلقى رسالة بريد إلكتروني تحتوي على رقم التتبع ورابط لتتبع شحنتك. يمكنك أيضاً تتبع طلبك من خلال حسابك على موقعنا.",
        },
        {
          question: "ما هي طرق الدفع المتاحة؟",
          answer:
            "نقبل الدفع عبر بطاقات الائتمان (فيزا، ماستركارد)، مدى، Apple Pay، وكذلك الدفع عند الاستلام للطلبات داخل المملكة العربية السعودية.",
        },
        {
          question: "هل منتجاتكم أصلية؟",
          answer:
            "نعم، جميع منتجاتنا أصلية 100% ومصنوعة من أجود المكونات الطبيعية. نحن نضمن جودة وأصالة كل منتج نقدمه.",
        },
        {
          question: "كيف أختار العطر المناسب لي؟",
          answer:
            "نوصي بتجربة العطر على بشرتك قبل الشراء. يمكنك طلب عينات من عطوراتنا أو زيارة أحد فروعنا للتجربة. كما يمكنك التواصل مع فريقنا للحصول على توصيات شخصية بناءً على تفضيلاتك.",
        },
        {
          question: "هل تقدمون خدمة تغليف الهدايا؟",
          answer:
            "نعم، نقدم خدمة تغليف الهدايا الفاخرة مجاناً. يمكنك اختيار هذه الخدمة عند إتمام الطلب وإضافة رسالة شخصية إذا رغبت.",
        },
        {
          question: "كيف أحافظ على عطري لفترة أطول؟",
          answer:
            "للحفاظ على جودة العطر، يُنصح بتخزينه في مكان بارد وجاف بعيداً عن أشعة الشمس المباشرة. أغلق الغطاء بإحكام بعد كل استخدام ولا تعرض العطر لدرجات حرارة عالية.",
        },
      ]
    : [
        {
          question: "What is your shipping policy?",
          answer:
            "We offer free shipping on orders over 200 SAR within Saudi Arabia. Orders are delivered within 2-5 business days. For international shipping, please contact us for pricing details and delivery times.",
        },
        {
          question: "Can I return a product?",
          answer:
            "Yes, we accept returns within 14 days of receipt, provided the product is unopened and in its original condition. Please contact customer service to initiate a return.",
        },
        {
          question: "How can I track my order?",
          answer:
            "After your order is shipped, you will receive an email with a tracking number and a link to track your shipment. You can also track your order through your account on our website.",
        },
        {
          question: "What payment methods do you accept?",
          answer:
            "We accept credit cards (Visa, Mastercard), Mada, Apple Pay, and cash on delivery for orders within Saudi Arabia.",
        },
        {
          question: "Are your products authentic?",
          answer:
            "Yes, all our products are 100% authentic and made from the finest natural ingredients. We guarantee the quality and authenticity of every product we offer.",
        },
        {
          question: "How do I choose the right fragrance for me?",
          answer:
            "We recommend testing the fragrance on your skin before purchasing. You can request samples of our fragrances or visit one of our stores to try them. You can also contact our team for personalized recommendations based on your preferences.",
        },
        {
          question: "Do you offer gift wrapping?",
          answer:
            "Yes, we offer complimentary luxury gift wrapping. You can select this service at checkout and add a personal message if desired.",
        },
        {
          question: "How do I preserve my fragrance longer?",
          answer:
            "To maintain fragrance quality, store it in a cool, dry place away from direct sunlight. Close the cap tightly after each use and avoid exposing the fragrance to high temperatures.",
        },
      ];

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumbs items={breadcrumbItems} locale={locale as Locale} />

      <div className="mb-12 text-center">
        <h1 className="mb-4 text-4xl font-bold text-gray-900">
          {isRTL ? "الأسئلة الشائعة" : "Frequently Asked Questions"}
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-gray-600">
          {isRTL
            ? "إجابات على الأسئلة الأكثر شيوعاً حول منتجاتنا وخدماتنا"
            : "Answers to the most common questions about our products and services"}
        </p>
      </div>

      <div className="mx-auto max-w-3xl">
        <FAQAccordion items={faqItems} />

        <div className="mt-12 rounded-lg bg-gray-50 p-6 text-center">
          <h2 className="mb-2 text-xl font-semibold text-gray-900">
            {isRTL ? "لم تجد إجابة لسؤالك؟" : "Didn't find your answer?"}
          </h2>
          <p className="mb-4 text-gray-600">
            {isRTL
              ? "تواصل معنا وسنكون سعداء بمساعدتك"
              : "Contact us and we'll be happy to help"}
          </p>
          <a
            href={`/${locale}/contact`}
            className="inline-flex items-center justify-center rounded-full bg-gray-900 px-6 py-2 text-sm font-medium text-white hover:bg-gray-800"
          >
            {isRTL ? "اتصل بنا" : "Contact Us"}
          </a>
        </div>
      </div>
    </div>
  );
}
