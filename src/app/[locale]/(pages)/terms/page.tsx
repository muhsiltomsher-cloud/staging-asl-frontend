import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { getDictionary } from "@/i18n";
import { generateMetadata as generateSeoMetadata } from "@/lib/utils/seo";
import type { Locale } from "@/config/site";
import type { Metadata } from "next";

interface TermsPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: TermsPageProps): Promise<Metadata> {
  const { locale } = await params;
  return generateSeoMetadata({
    title: locale === "ar" ? "الشروط والأحكام" : "Terms & Conditions",
    description:
      locale === "ar"
        ? "اقرأ الشروط والأحكام الخاصة باستخدام موقع أروماتيك سينتس لاب"
        : "Read the terms and conditions for using Aromatic Scents Lab website",
    locale: locale as Locale,
    pathname: "/terms",
  });
}

export default async function TermsPage({ params }: TermsPageProps) {
  const { locale } = await params;
  const dictionary = await getDictionary(locale as Locale);
  const isRTL = locale === "ar";

  const breadcrumbItems = [
    { name: dictionary.footer.termsConditions, href: `/${locale}/terms` },
  ];

  const sections = [
    {
      title: isRTL ? "قبول الشروط" : "Acceptance of Terms",
      content: isRTL
        ? "باستخدامك لموقع أروماتيك سينتس لاب، فإنك توافق على الالتزام بهذه الشروط والأحكام. إذا كنت لا توافق على أي جزء من هذه الشروط، يرجى عدم استخدام موقعنا أو خدماتنا."
        : "By using the Aromatic Scents Lab website, you agree to be bound by these terms and conditions. If you do not agree to any part of these terms, please do not use our website or services.",
    },
    {
      title: isRTL ? "استخدام الموقع" : "Use of Website",
      content: isRTL
        ? "يُسمح لك باستخدام هذا الموقع للأغراض الشخصية وغير التجارية فقط. يُحظر استخدام الموقع لأي غرض غير قانوني أو محظور بموجب هذه الشروط. لا يجوز لك نسخ أو تعديل أو توزيع أو بيع أي محتوى من هذا الموقع دون إذن كتابي مسبق."
        : "You are permitted to use this website for personal and non-commercial purposes only. You may not use the website for any unlawful or prohibited purpose under these terms. You may not copy, modify, distribute, or sell any content from this website without prior written permission.",
    },
    {
      title: isRTL ? "حسابات المستخدمين" : "User Accounts",
      content: isRTL
        ? "عند إنشاء حساب، يجب عليك تقديم معلومات دقيقة وكاملة. أنت مسؤول عن الحفاظ على سرية معلومات حسابك وكلمة المرور الخاصة بك. أنت توافق على إخطارنا فوراً بأي استخدام غير مصرح به لحسابك."
        : "When creating an account, you must provide accurate and complete information. You are responsible for maintaining the confidentiality of your account information and password. You agree to notify us immediately of any unauthorized use of your account.",
    },
    {
      title: isRTL ? "المنتجات والأسعار" : "Products and Pricing",
      content: isRTL
        ? "نسعى جاهدين لعرض معلومات دقيقة عن منتجاتنا وأسعارها. ومع ذلك، قد تحدث أخطاء. نحتفظ بالحق في تصحيح أي أخطاء وتغيير الأسعار دون إشعار مسبق. جميع الأسعار المعروضة بالريال السعودي ما لم يُذكر خلاف ذلك."
        : "We strive to display accurate information about our products and prices. However, errors may occur. We reserve the right to correct any errors and change prices without prior notice. All prices are displayed in Saudi Riyals unless otherwise stated.",
    },
    {
      title: isRTL ? "الطلبات والدفع" : "Orders and Payment",
      content: isRTL
        ? "بتقديم طلب، فإنك تقدم عرضاً لشراء المنتجات. نحتفظ بالحق في قبول أو رفض أي طلب لأي سبب. يجب أن يتم الدفع بالكامل قبل شحن الطلب. نقبل طرق الدفع المحددة على موقعنا."
        : "By placing an order, you are making an offer to purchase products. We reserve the right to accept or reject any order for any reason. Payment must be made in full before the order is shipped. We accept the payment methods specified on our website.",
    },
    {
      title: isRTL ? "الشحن والتوصيل" : "Shipping and Delivery",
      content: isRTL
        ? "أوقات التوصيل المذكورة هي تقديرات وليست مضمونة. لسنا مسؤولين عن التأخيرات الناجمة عن ظروف خارجة عن سيطرتنا. يرجى مراجعة سياسة الشحن الخاصة بنا للحصول على معلومات مفصلة."
        : "Delivery times stated are estimates and are not guaranteed. We are not responsible for delays caused by circumstances beyond our control. Please review our shipping policy for detailed information.",
    },
    {
      title: isRTL ? "الإرجاع والاستبدال" : "Returns and Exchanges",
      content: isRTL
        ? "نقبل الإرجاع وفقاً لسياسة الإرجاع الخاصة بنا. يجب أن تكون المنتجات في حالتها الأصلية وغير مفتوحة للتأهل للإرجاع. يرجى مراجعة سياسة الإرجاع الخاصة بنا للحصول على التفاصيل الكاملة."
        : "We accept returns in accordance with our return policy. Products must be in their original condition and unopened to qualify for return. Please review our return policy for full details.",
    },
    {
      title: isRTL ? "الملكية الفكرية" : "Intellectual Property",
      content: isRTL
        ? "جميع المحتويات على هذا الموقع، بما في ذلك النصوص والصور والشعارات والعلامات التجارية، هي ملك لأروماتيك سينتس لاب أو مرخصيها. يُحظر استخدام أي محتوى دون إذن كتابي مسبق."
        : "All content on this website, including text, images, logos, and trademarks, is the property of Aromatic Scents Lab or its licensors. Use of any content without prior written permission is prohibited.",
    },
    {
      title: isRTL ? "تحديد المسؤولية" : "Limitation of Liability",
      content: isRTL
        ? "لن نكون مسؤولين عن أي أضرار مباشرة أو غير مباشرة أو عرضية أو تبعية ناتجة عن استخدامك لموقعنا أو منتجاتنا. مسؤوليتنا القصوى تقتصر على المبلغ الذي دفعته مقابل المنتج المعني."
        : "We shall not be liable for any direct, indirect, incidental, or consequential damages arising from your use of our website or products. Our maximum liability is limited to the amount you paid for the product in question.",
    },
    {
      title: isRTL ? "القانون الحاكم" : "Governing Law",
      content: isRTL
        ? "تخضع هذه الشروط والأحكام لقوانين المملكة العربية السعودية وتُفسر وفقاً لها. أي نزاعات تنشأ عن هذه الشروط ستخضع للاختصاص القضائي الحصري لمحاكم المملكة العربية السعودية."
        : "These terms and conditions are governed by and construed in accordance with the laws of the Kingdom of Saudi Arabia. Any disputes arising from these terms shall be subject to the exclusive jurisdiction of the courts of Saudi Arabia.",
    },
    {
      title: isRTL ? "التعديلات" : "Modifications",
      content: isRTL
        ? "نحتفظ بالحق في تعديل هذه الشروط والأحكام في أي وقت. ستصبح التغييرات سارية المفعول فور نشرها على الموقع. استمرارك في استخدام الموقع بعد أي تغييرات يعني قبولك للشروط المعدلة."
        : "We reserve the right to modify these terms and conditions at any time. Changes will become effective immediately upon posting on the website. Your continued use of the website after any changes constitutes acceptance of the modified terms.",
    },
    {
      title: isRTL ? "اتصل بنا" : "Contact Us",
      content: isRTL
        ? "إذا كانت لديك أي أسئلة حول هذه الشروط والأحكام، يرجى التواصل معنا عبر البريد الإلكتروني: legal@aromaticscentslab.com"
        : "If you have any questions about these terms and conditions, please contact us at: legal@aromaticscentslab.com",
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumbs items={breadcrumbItems} locale={locale as Locale} />

      <div className="mb-12 text-center">
        <h1 className="mb-4 text-4xl font-bold text-gray-900">
          {isRTL ? "الشروط والأحكام" : "Terms & Conditions"}
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-gray-600">
          {isRTL
            ? "يرجى قراءة هذه الشروط والأحكام بعناية قبل استخدام موقعنا"
            : "Please read these terms and conditions carefully before using our website"}
        </p>
        <p className="mt-2 text-sm text-gray-500">
          {isRTL ? "آخر تحديث: ديسمبر 2024" : "Last Updated: December 2024"}
        </p>
      </div>

      <div className="mx-auto max-w-4xl">
        <div className="space-y-6">
          {sections.map((section, index) => (
            <section key={index} className="rounded-lg border bg-white p-6 shadow-sm">
              <h2 className="mb-3 text-xl font-semibold text-gray-900">
                {index + 1}. {section.title}
              </h2>
              <p className="leading-relaxed text-gray-600">{section.content}</p>
            </section>
          ))}
        </div>

        <div className="mt-12 rounded-lg bg-gray-50 p-6 text-center">
          <p className="text-gray-600">
            {isRTL
              ? "باستخدامك لموقعنا، فإنك توافق على هذه الشروط والأحكام"
              : "By using our website, you agree to these terms and conditions"}
          </p>
          <a
            href={`/${locale}/contact`}
            className="mt-4 inline-flex items-center justify-center rounded-full bg-gray-900 px-6 py-2 text-sm font-medium text-white hover:bg-gray-800"
          >
            {isRTL ? "اتصل بنا" : "Contact Us"}
          </a>
        </div>
      </div>
    </div>
  );
}
