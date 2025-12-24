import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { getDictionary } from "@/i18n";
import { generateMetadata as generateSeoMetadata } from "@/lib/utils/seo";
import type { Locale } from "@/config/site";
import type { Metadata } from "next";

interface PrivacyPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: PrivacyPageProps): Promise<Metadata> {
  const { locale } = await params;
  return generateSeoMetadata({
    title: locale === "ar" ? "سياسة الخصوصية" : "Privacy Policy",
    description:
      locale === "ar"
        ? "تعرف على كيفية حماية أروماتيك سينتس لاب لخصوصيتك وبياناتك الشخصية"
        : "Learn how Aromatic Scents Lab protects your privacy and personal data",
    locale: locale as Locale,
    pathname: "/privacy",
  });
}

export default async function PrivacyPage({ params }: PrivacyPageProps) {
  const { locale } = await params;
  const dictionary = await getDictionary(locale as Locale);
  const isRTL = locale === "ar";

  const breadcrumbItems = [
    { name: dictionary.footer.privacyPolicy, href: `/${locale}/privacy` },
  ];

  const sections = [
    {
      title: isRTL ? "جمع المعلومات" : "Information Collection",
      content: isRTL
        ? "نقوم بجمع المعلومات التي تقدمها لنا مباشرة عند إنشاء حساب، أو إجراء عملية شراء، أو الاشتراك في نشرتنا الإخبارية، أو التواصل معنا. تشمل هذه المعلومات: الاسم، عنوان البريد الإلكتروني، رقم الهاتف، عنوان الشحن والفوترة، ومعلومات الدفع."
        : "We collect information you provide directly to us when you create an account, make a purchase, subscribe to our newsletter, or contact us. This information includes: name, email address, phone number, shipping and billing address, and payment information.",
    },
    {
      title: isRTL ? "استخدام المعلومات" : "Use of Information",
      content: isRTL
        ? "نستخدم المعلومات التي نجمعها لمعالجة طلباتك وإدارتها، والتواصل معك بشأن طلباتك ومنتجاتنا وخدماتنا، وتحسين موقعنا وخدماتنا، وإرسال رسائل تسويقية (إذا وافقت على ذلك)، والامتثال للالتزامات القانونية."
        : "We use the information we collect to process and manage your orders, communicate with you about your orders and our products and services, improve our website and services, send marketing communications (if you have opted in), and comply with legal obligations.",
    },
    {
      title: isRTL ? "مشاركة المعلومات" : "Information Sharing",
      content: isRTL
        ? "لا نبيع أو نؤجر معلوماتك الشخصية لأطراف ثالثة. قد نشارك معلوماتك مع مزودي الخدمات الذين يساعدوننا في تشغيل أعمالنا (مثل شركات الشحن ومعالجي الدفع)، وذلك فقط بالقدر اللازم لتقديم خدماتهم."
        : "We do not sell or rent your personal information to third parties. We may share your information with service providers who help us operate our business (such as shipping companies and payment processors), only to the extent necessary to provide their services.",
    },
    {
      title: isRTL ? "أمان البيانات" : "Data Security",
      content: isRTL
        ? "نتخذ تدابير أمنية معقولة لحماية معلوماتك الشخصية من الوصول غير المصرح به أو التغيير أو الإفصاح أو التدمير. نستخدم تشفير SSL لحماية البيانات المنقولة عبر موقعنا."
        : "We take reasonable security measures to protect your personal information from unauthorized access, alteration, disclosure, or destruction. We use SSL encryption to protect data transmitted through our website.",
    },
    {
      title: isRTL ? "ملفات تعريف الارتباط" : "Cookies",
      content: isRTL
        ? "نستخدم ملفات تعريف الارتباط والتقنيات المشابهة لتحسين تجربتك على موقعنا، وتذكر تفضيلاتك، وتحليل كيفية استخدام موقعنا. يمكنك التحكم في ملفات تعريف الارتباط من خلال إعدادات متصفحك."
        : "We use cookies and similar technologies to improve your experience on our website, remember your preferences, and analyze how our website is used. You can control cookies through your browser settings.",
    },
    {
      title: isRTL ? "حقوقك" : "Your Rights",
      content: isRTL
        ? "لديك الحق في الوصول إلى معلوماتك الشخصية وتصحيحها وحذفها. يمكنك أيضاً إلغاء الاشتراك في الرسائل التسويقية في أي وقت. للممارسة أي من هذه الحقوق، يرجى التواصل معنا."
        : "You have the right to access, correct, and delete your personal information. You can also unsubscribe from marketing communications at any time. To exercise any of these rights, please contact us.",
    },
    {
      title: isRTL ? "التغييرات على هذه السياسة" : "Changes to This Policy",
      content: isRTL
        ? "قد نقوم بتحديث سياسة الخصوصية هذه من وقت لآخر. سنقوم بإخطارك بأي تغييرات جوهرية عن طريق نشر السياسة الجديدة على موقعنا وتحديث تاريخ 'آخر تحديث'."
        : "We may update this privacy policy from time to time. We will notify you of any material changes by posting the new policy on our website and updating the 'Last Updated' date.",
    },
    {
      title: isRTL ? "اتصل بنا" : "Contact Us",
      content: isRTL
        ? "إذا كانت لديك أي أسئلة حول سياسة الخصوصية هذه أو ممارساتنا المتعلقة بالخصوصية، يرجى التواصل معنا عبر البريد الإلكتروني: privacy@aromaticscentslab.com"
        : "If you have any questions about this privacy policy or our privacy practices, please contact us at: privacy@aromaticscentslab.com",
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumbs items={breadcrumbItems} locale={locale as Locale} />

      <div className="mb-12 text-center">
        <h1 className="mb-4 text-4xl font-bold text-gray-900">
          {isRTL ? "سياسة الخصوصية" : "Privacy Policy"}
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-gray-600">
          {isRTL
            ? "نحن ملتزمون بحماية خصوصيتك وبياناتك الشخصية"
            : "We are committed to protecting your privacy and personal data"}
        </p>
        <p className="mt-2 text-sm text-gray-500">
          {isRTL ? "آخر تحديث: ديسمبر 2024" : "Last Updated: December 2024"}
        </p>
      </div>

      <div className="mx-auto max-w-4xl">
        <div className="space-y-8">
          {sections.map((section, index) => (
            <section key={index} className="rounded-lg border bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-xl font-semibold text-gray-900">
                {index + 1}. {section.title}
              </h2>
              <p className="leading-relaxed text-gray-600">{section.content}</p>
            </section>
          ))}
        </div>

        <div className="mt-12 rounded-lg bg-gray-50 p-6 text-center">
          <p className="text-gray-600">
            {isRTL
              ? "إذا كانت لديك أي أسئلة أو استفسارات، لا تتردد في التواصل معنا"
              : "If you have any questions or concerns, don't hesitate to contact us"}
          </p>
          <a
            href={`/${locale}/contact`}
            className="mt-4 inline-flex items-center justify-center rounded-md bg-gray-900 px-6 py-2 text-sm font-medium text-white hover:bg-gray-800"
          >
            {isRTL ? "اتصل بنا" : "Contact Us"}
          </a>
        </div>
      </div>
    </div>
  );
}
