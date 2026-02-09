import Image from "next/image";
import Link from "next/link";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  MessageCircle,
  Sparkles,
  ChevronRight,
  Send,
} from "lucide-react";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { ContactForm } from "@/components/common/ContactForm";
import { QuickContactButtons } from "@/components/common/QuickContactButtons";
import { getDictionary } from "@/i18n";
import { generateMetadata as generateSeoMetadata } from "@/lib/utils/seo";
import type { Locale } from "@/config/site";
import type { Metadata } from "next";

interface ContactPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: ContactPageProps): Promise<Metadata> {
  const { locale } = await params;
  const dictionary = await getDictionary(locale as Locale);
  const pageContent = dictionary.pages.contact;

  return generateSeoMetadata({
    title: pageContent.seo.title,
    description: pageContent.seo.description,
    locale: locale as Locale,
    pathname: "/contact",
  });
}

export default async function ContactPage({ params }: ContactPageProps) {
  const { locale } = await params;
  const dictionary = await getDictionary(locale as Locale);
  const pageContent = dictionary.pages.contact;
  const isRTL = locale === "ar";

  const breadcrumbItems = [
    { name: pageContent.title, href: `/${locale}/contact` },
  ];

  const content = {
    heroTitle: isRTL ? "تواصل معنا" : "Get in Touch",
    heroSubtitle: isRTL ? "اتصل بنا" : "Contact Us",
    heroDescription: isRTL
      ? "نحن هنا لمساعدتك. تواصل معنا لأي استفسارات أو ملاحظات وسنرد عليك في أقرب وقت ممكن."
      : "We're here to help. Reach out to us for any inquiries or feedback and we'll get back to you as soon as possible.",
    quickContact: isRTL ? "تواصل سريع" : "Quick Contact",
    whatsapp: isRTL ? "واتساب" : "WhatsApp",
    callUs: isRTL ? "اتصل بنا" : "Call Us",
    emailUs: isRTL ? "راسلنا" : "Email Us",
    ctaTitle: isRTL ? "زورونا في متاجرنا" : "Visit Our Stores",
    ctaSubtitle: isRTL
      ? "تعال واستمتع بتجربة عطرية فريدة في أحد فروعنا"
      : "Come and enjoy a unique aromatic experience at one of our branches",
    ctaButton: isRTL ? "مواقع المتاجر" : "Store Locator",
  };

  // Map info keys to icons and colors
  const infoConfig: Record<string, { icon: typeof MapPin; gradient: string; hoverGradient: string }> = {
    address: { 
      icon: MapPin, 
      gradient: "from-amber-500 to-amber-600",
      hoverGradient: "group-hover:from-amber-600 group-hover:to-amber-700"
    },
    phone: { 
      icon: Phone, 
      gradient: "from-emerald-500 to-emerald-600",
      hoverGradient: "group-hover:from-emerald-600 group-hover:to-emerald-700"
    },
    email: { 
      icon: Mail, 
      gradient: "from-blue-500 to-blue-600",
      hoverGradient: "group-hover:from-blue-600 group-hover:to-blue-700"
    },
    hours: { 
      icon: Clock, 
      gradient: "from-purple-500 to-purple-600",
      hoverGradient: "group-hover:from-purple-600 group-hover:to-purple-700"
    },
  };

  const contactInfoItems = Object.entries(pageContent.info).map(([key, value]) => ({
    key,
    icon: infoConfig[key]?.icon || MapPin,
    gradient: infoConfig[key]?.gradient || "from-amber-500 to-amber-600",
    hoverGradient: infoConfig[key]?.hoverGradient || "group-hover:from-amber-600 group-hover:to-amber-700",
    title: value.title,
    content: value.content,
  }));

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative min-h-[50vh] overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src="https://staging.aromaticscentslab.com/wp-content/uploads/2025/12/ASL-Website-Images-Patchouli-Glow-06.webp"
            alt="Contact Us"
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

        <div className="container relative mx-auto flex min-h-[50vh] items-center px-4 py-16">
          <div className="mx-auto max-w-4xl text-center">
            {/* Decorative Line */}
            <div className="mb-6 flex items-center justify-center gap-4">
              <div className="h-px w-20 bg-gradient-to-r from-transparent to-amber-400" />
              <MessageCircle className="h-6 w-6 text-amber-400" />
              <div className="h-px w-20 bg-gradient-to-l from-transparent to-amber-400" />
            </div>

            <span className="mb-4 inline-block text-sm font-medium uppercase tracking-[0.3em] text-amber-300">
              {content.heroSubtitle}
            </span>

            <h1 className="mb-6 text-4xl font-bold leading-tight text-white md:text-5xl lg:text-6xl">
              {content.heroTitle}
            </h1>

            <p className="mx-auto max-w-2xl text-lg leading-relaxed text-amber-100/90">
              {content.heroDescription}
            </p>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
          <div className="flex h-10 w-6 items-start justify-center rounded-full border-2 border-amber-400/50 p-1">
            <div className="h-2 w-1 animate-bounce rounded-full bg-amber-400" />
          </div>
        </div>
      </section>

      {/* Breadcrumbs */}
      <div className="container mx-auto px-4 py-4">
        <Breadcrumbs items={breadcrumbItems} locale={locale as Locale} />
      </div>

      {/* Quick Contact Buttons */}
      <section className="bg-gradient-to-r from-amber-50 to-stone-50">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6 text-center">
            <h2 className="text-xl font-semibold text-amber-900">{content.quickContact}</h2>
          </div>
          <QuickContactButtons
            whatsappLabel={content.whatsapp}
            callLabel={content.callUs}
            emailLabel={content.emailUs}
          />
        </div>
      </section>

      {/* Main Content Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#f7f6f2] to-white py-16 md:py-24">
        {/* Decorative Elements */}
        <div className="absolute -left-40 top-20 h-80 w-80 rounded-full bg-amber-100/40 blur-3xl" />
        <div className="absolute -right-40 bottom-20 h-80 w-80 rounded-full bg-stone-100/60 blur-3xl" />

        <div className="container relative mx-auto px-4">
          <div className="grid gap-12 lg:grid-cols-2">
            {/* Contact Form */}
            <div className="relative">
              <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-amber-200/30 to-stone-200/30 blur-xl" />
              <div className="relative overflow-hidden rounded-2xl bg-white p-8 shadow-xl shadow-amber-900/5">
                {/* Decorative Corner */}
                <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-amber-100/50" />
                
                <div className="relative">
                  <div className="mb-6 flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 shadow-lg shadow-amber-500/20">
                      <Send className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-amber-900">
                        {pageContent.sendMessage}
                      </h2>
                      <p className="text-sm text-amber-600">
                        {isRTL ? "سنرد عليك في أقرب وقت" : "We'll respond as soon as possible"}
                      </p>
                    </div>
                  </div>
                  <ContactForm locale={locale} />
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-6">
              <div className="mb-8">
                <div className="mb-4 flex items-center gap-3">
                  <div className="h-1 w-12 rounded-full bg-gradient-to-r from-amber-600 to-amber-400" />
                  <span className="text-sm font-medium uppercase tracking-widest text-amber-600">
                    {pageContent.contactInfo}
                  </span>
                </div>
                <h2 className="text-3xl font-bold text-amber-900">
                  {isRTL ? "معلومات التواصل" : "How to Reach Us"}
                </h2>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {contactInfoItems.map((item, index) => (
                  <div
                    key={index}
                    className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-lg transition-all duration-500 hover:-translate-y-1 hover:shadow-xl hover:shadow-amber-900/10"
                  >
                    {/* Decorative Corner */}
                    <div className="absolute -right-4 -top-4 h-12 w-12 rounded-full bg-amber-50 transition-transform duration-500 group-hover:scale-150" />
                    
                    <div className="relative">
                      <div className={`mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${item.gradient} ${item.hoverGradient} shadow-lg transition-all duration-300`}>
                        <item.icon className="h-7 w-7 text-white" />
                      </div>
                      <h3 className="mb-1 text-lg font-bold text-amber-900">{item.title}</h3>
                      {item.key === "phone" ? (
                        <a href={`tel:${item.content.replace(/\s/g, "")}`} className="text-amber-700 transition-colors hover:text-amber-900">
                          {item.content}
                        </a>
                      ) : item.key === "email" ? (
                        <a href={`mailto:${item.content}`} className="text-amber-700 transition-colors hover:text-amber-900">
                          {item.content}
                        </a>
                      ) : item.key === "address" ? (
                        <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.content)}`} target="_blank" rel="noopener noreferrer" className="text-amber-700 transition-colors hover:text-amber-900">
                          {item.content}
                        </a>
                      ) : (
                        <p className="text-amber-700">{item.content}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Social Links */}
              <div className="mt-8 rounded-2xl bg-gradient-to-r from-amber-900 via-amber-800 to-stone-900 p-6">
                <h3 className="mb-4 text-lg font-semibold text-white">
                  {isRTL ? "تابعنا على" : "Follow Us"}
                </h3>
                <div className="flex gap-4">
                  <a
                    href="https://facebook.com/aromaticscentslab"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white transition-all duration-300 hover:bg-white/20"
                  >
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </a>
                  <a
                    href="https://instagram.com/aromaticscentslab"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white transition-all duration-300 hover:bg-white/20"
                  >
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                  </a>
                  <a
                    href="https://twitter.com/aromaticscentslab"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white transition-all duration-300 hover:bg-white/20"
                  >
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-amber-900 via-amber-800 to-stone-900 py-16 md:py-20">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute left-1/4 top-0 h-full w-px bg-gradient-to-b from-transparent via-amber-400/20 to-transparent" />
          <div className="absolute left-1/2 top-0 h-full w-px bg-gradient-to-b from-transparent via-amber-400/20 to-transparent" />
          <div className="absolute left-3/4 top-0 h-full w-px bg-gradient-to-b from-transparent via-amber-400/20 to-transparent" />
        </div>

        <div className="container relative mx-auto px-4 text-center">
          <div className="mb-6 flex items-center justify-center gap-4">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-amber-400" />
            <Sparkles className="h-5 w-5 text-amber-400" />
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-amber-400" />
          </div>

          <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl">
            {content.ctaTitle}
          </h2>
          <p className="mx-auto mb-10 max-w-2xl text-lg text-amber-100/80">
            {content.ctaSubtitle}
          </p>
          <Link
            href={`/${locale}/store-locator`}
            className="group inline-flex items-center gap-3 rounded-full bg-white px-10 py-5 text-lg font-semibold text-amber-900 shadow-lg transition-all duration-300 hover:bg-amber-50 hover:shadow-2xl hover:shadow-amber-900/20"
          >
            <MapPin className="h-5 w-5" />
            <span>{content.ctaButton}</span>
            <ChevronRight
              className={`h-5 w-5 transition-transform duration-300 group-hover:translate-x-1 ${isRTL ? "rotate-180 group-hover:-translate-x-1" : ""}`}
            />
          </Link>
        </div>
      </section>
    </div>
  );
}
