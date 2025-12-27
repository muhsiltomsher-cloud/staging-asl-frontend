import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { getDictionary } from "@/i18n";
import { generateMetadata as generateSeoMetadata } from "@/lib/utils/seo";
import type { Locale } from "@/config/site";
import type { Metadata } from "next";
import { RotateCcw, Clock, CheckCircle, AlertCircle } from "lucide-react";

interface ReturnsPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: ReturnsPageProps): Promise<Metadata> {
  const { locale } = await params;
  return generateSeoMetadata({
    title: locale === "ar" ? "سياسة الإرجاع" : "Return Policy",
    description:
      locale === "ar"
        ? "تعرف على سياسة الإرجاع والاستبدال لدى أروماتيك سينتس لاب"
        : "Learn about Aromatic Scents Lab's return and exchange policy",
    locale: locale as Locale,
    pathname: "/returns",
  });
}

export default async function ReturnsPage({ params }: ReturnsPageProps) {
  const { locale } = await params;
  const dictionary = await getDictionary(locale as Locale);
  const isRTL = locale === "ar";

  const breadcrumbItems = [
    { name: dictionary.footer.returnPolicy, href: `/${locale}/returns` },
  ];

  const returnFeatures = [
    {
      icon: Clock,
      title: isRTL ? "14 يوم للإرجاع" : "14-Day Returns",
      description: isRTL
        ? "يمكنك إرجاع المنتجات خلال 14 يوماً من تاريخ الاستلام"
        : "You can return products within 14 days of receipt",
    },
    {
      icon: RotateCcw,
      title: isRTL ? "استبدال سهل" : "Easy Exchange",
      description: isRTL
        ? "استبدل منتجك بمنتج آخر بنفس القيمة أو أعلى"
        : "Exchange your product for another of equal or higher value",
    },
    {
      icon: CheckCircle,
      title: isRTL ? "استرداد كامل" : "Full Refund",
      description: isRTL
        ? "استرداد كامل المبلغ للمنتجات غير المفتوحة"
        : "Full refund for unopened products",
    },
    {
      icon: AlertCircle,
      title: isRTL ? "شروط بسيطة" : "Simple Conditions",
      description: isRTL
        ? "شروط واضحة وبسيطة لعملية الإرجاع"
        : "Clear and simple conditions for the return process",
    },
  ];

  const returnSteps = [
    {
      step: 1,
      title: isRTL ? "تواصل معنا" : "Contact Us",
      description: isRTL
        ? "تواصل مع خدمة العملاء عبر البريد الإلكتروني أو الهاتف لبدء عملية الإرجاع"
        : "Contact customer service via email or phone to initiate the return process",
    },
    {
      step: 2,
      title: isRTL ? "احصل على رقم الإرجاع" : "Get Return Number",
      description: isRTL
        ? "ستحصل على رقم إرجاع (RMA) وتعليمات الشحن"
        : "You will receive a Return Merchandise Authorization (RMA) number and shipping instructions",
    },
    {
      step: 3,
      title: isRTL ? "أرسل المنتج" : "Ship the Product",
      description: isRTL
        ? "قم بتغليف المنتج بشكل آمن وأرسله إلى العنوان المحدد"
        : "Pack the product securely and ship it to the specified address",
    },
    {
      step: 4,
      title: isRTL ? "استلم الاسترداد" : "Receive Refund",
      description: isRTL
        ? "بعد استلام المنتج وفحصه، سيتم معالجة الاسترداد خلال 5-7 أيام عمل"
        : "After receiving and inspecting the product, your refund will be processed within 5-7 business days",
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumbs items={breadcrumbItems} locale={locale as Locale} />

      <div className="mb-12 text-center">
        <h1 className="mb-4 text-4xl font-bold text-gray-900">
          {isRTL ? "سياسة الإرجاع والاستبدال" : "Return & Exchange Policy"}
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-gray-600">
          {isRTL
            ? "رضاك هو أولويتنا. إذا لم تكن راضياً عن مشترياتك، نحن هنا للمساعدة"
            : "Your satisfaction is our priority. If you're not happy with your purchase, we're here to help"}
        </p>
      </div>

      {/* Return Features */}
      <section className="mb-16">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {returnFeatures.map((feature, index) => (
            <div
              key={index}
              className="rounded-lg border bg-white p-6 text-center shadow-sm"
            >
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                <feature.icon className="h-6 w-6 text-gray-700" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900">
                {feature.title}
              </h3>
              <p className="text-sm text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Return Process Steps */}
      <section className="mb-16">
        <h2 className="mb-8 text-center text-2xl font-bold text-gray-900">
          {isRTL ? "خطوات الإرجاع" : "Return Process"}
        </h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {returnSteps.map((item) => (
            <div key={item.step} className="relative">
              <div className="rounded-lg border bg-white p-6 shadow-sm">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-gray-900 text-lg font-bold text-white">
                  {item.step}
                </div>
                <h3 className="mb-2 text-lg font-semibold text-gray-900">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-600">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Return Conditions */}
      <section className="mb-16">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Eligible for Return */}
          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold text-green-700">
              {isRTL ? "المنتجات المؤهلة للإرجاع" : "Eligible for Return"}
            </h2>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-start gap-2">
                <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
                <span>
                  {isRTL
                    ? "المنتجات غير المفتوحة في عبوتها الأصلية"
                    : "Unopened products in their original packaging"}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
                <span>
                  {isRTL
                    ? "المنتجات التالفة أو المعيبة عند الاستلام"
                    : "Damaged or defective products upon receipt"}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
                <span>
                  {isRTL
                    ? "المنتجات الخاطئة (مختلفة عن الطلب)"
                    : "Wrong products (different from order)"}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
                <span>
                  {isRTL
                    ? "الإرجاع خلال 14 يوماً من تاريخ الاستلام"
                    : "Returns within 14 days of receipt"}
                </span>
              </li>
            </ul>
          </div>

          {/* Not Eligible for Return */}
          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold text-red-700">
              {isRTL ? "المنتجات غير المؤهلة للإرجاع" : "Not Eligible for Return"}
            </h2>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-start gap-2">
                <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600" />
                <span>
                  {isRTL
                    ? "المنتجات المفتوحة أو المستخدمة"
                    : "Opened or used products"}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600" />
                <span>
                  {isRTL
                    ? "المنتجات بدون عبوتها الأصلية"
                    : "Products without original packaging"}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600" />
                <span>
                  {isRTL
                    ? "العينات والهدايا المجانية"
                    : "Samples and free gifts"}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600" />
                <span>
                  {isRTL
                    ? "المنتجات المشتراة في التخفيضات النهائية"
                    : "Products purchased during final sales"}
                </span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="rounded-lg bg-gray-50 p-6 text-center md:p-8">
        <h2 className="mb-2 text-xl font-semibold text-gray-900">
          {isRTL ? "هل تحتاج إلى مساعدة؟" : "Need Help?"}
        </h2>
        <p className="mb-4 text-gray-600">
          {isRTL
            ? "فريق خدمة العملاء لدينا جاهز لمساعدتك في أي استفسارات حول الإرجاع"
            : "Our customer service team is ready to help you with any return inquiries"}
        </p>
        <a
          href={`/${locale}/contact`}
          className="inline-flex items-center justify-center rounded-full bg-gray-900 px-6 py-2 text-sm font-medium text-white hover:bg-gray-800"
        >
          {isRTL ? "اتصل بنا" : "Contact Us"}
        </a>
      </section>
    </div>
  );
}
