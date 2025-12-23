"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import type { Locale } from "@/config/site";

export default function ContactPage() {
  const { locale } = useParams<{ locale: string }>();
  const isRTL = locale === "ar";
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const breadcrumbItems = [
    { name: isRTL ? "اتصل بنا" : "Contact", href: `/${locale}/contact` },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  const contactInfo = [
    {
      icon: MapPin,
      title: isRTL ? "العنوان" : "Address",
      content: isRTL
        ? "الرياض، المملكة العربية السعودية"
        : "Riyadh, Saudi Arabia",
    },
    {
      icon: Phone,
      title: isRTL ? "الهاتف" : "Phone",
      content: "+966 11 XXX XXXX",
    },
    {
      icon: Mail,
      title: isRTL ? "البريد الإلكتروني" : "Email",
      content: "info@aromaticscentslab.com",
    },
    {
      icon: Clock,
      title: isRTL ? "ساعات العمل" : "Working Hours",
      content: isRTL
        ? "السبت - الخميس: 9 صباحاً - 9 مساءً"
        : "Sat - Thu: 9 AM - 9 PM",
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumbs items={breadcrumbItems} locale={locale as Locale} />

      <div className="mb-12 text-center">
        <h1 className="mb-4 text-4xl font-bold text-gray-900">
          {isRTL ? "اتصل بنا" : "Contact Us"}
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-gray-600">
          {isRTL
            ? "نحن هنا لمساعدتك. تواصل معنا لأي استفسارات أو ملاحظات."
            : "We're here to help. Reach out to us for any inquiries or feedback."}
        </p>
      </div>

      <div className="grid gap-12 lg:grid-cols-2">
        {/* Contact Form */}
        <div className="rounded-lg border bg-white p-6 shadow-sm md:p-8">
          <h2 className="mb-6 text-2xl font-semibold text-gray-900">
            {isRTL ? "أرسل لنا رسالة" : "Send us a Message"}
          </h2>

          {isSubmitted ? (
            <div className="py-12 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <svg
                  className="h-8 w-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h3 className="mb-2 text-xl font-semibold text-gray-900">
                {isRTL ? "شكراً لتواصلك!" : "Thank you for reaching out!"}
              </h3>
              <p className="text-gray-600">
                {isRTL
                  ? "سنرد عليك في أقرب وقت ممكن."
                  : "We'll get back to you as soon as possible."}
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label={isRTL ? "الاسم الأول" : "First Name"}
                  required
                />
                <Input
                  label={isRTL ? "اسم العائلة" : "Last Name"}
                  required
                />
              </div>
              <Input
                label={isRTL ? "البريد الإلكتروني" : "Email"}
                type="email"
                required
              />
              <Input
                label={isRTL ? "رقم الهاتف" : "Phone Number"}
                type="tel"
              />
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  {isRTL ? "الموضوع" : "Subject"}
                </label>
                <select className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900">
                  <option value="">
                    {isRTL ? "اختر الموضوع" : "Select a subject"}
                  </option>
                  <option value="general">
                    {isRTL ? "استفسار عام" : "General Inquiry"}
                  </option>
                  <option value="order">
                    {isRTL ? "استفسار عن طلب" : "Order Inquiry"}
                  </option>
                  <option value="product">
                    {isRTL ? "استفسار عن منتج" : "Product Inquiry"}
                  </option>
                  <option value="feedback">
                    {isRTL ? "ملاحظات واقتراحات" : "Feedback & Suggestions"}
                  </option>
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  {isRTL ? "الرسالة" : "Message"}
                </label>
                <textarea
                  className="w-full rounded-md border border-gray-300 p-3 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
                  rows={5}
                  required
                  placeholder={
                    isRTL ? "اكتب رسالتك هنا..." : "Write your message here..."
                  }
                />
              </div>
              <Button type="submit" className="w-full" isLoading={isSubmitting}>
                {isRTL ? "إرسال الرسالة" : "Send Message"}
              </Button>
            </form>
          )}
        </div>

        {/* Contact Information */}
        <div className="space-y-8">
          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <h2 className="mb-6 text-2xl font-semibold text-gray-900">
              {isRTL ? "معلومات الاتصال" : "Contact Information"}
            </h2>
            <div className="space-y-6">
              {contactInfo.map((item, index) => (
                <div key={index} className="flex items-start gap-4">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gray-100">
                    <item.icon className="h-5 w-5 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{item.title}</h3>
                    <p className="text-gray-600">{item.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Map placeholder */}
          <div className="aspect-video overflow-hidden rounded-lg bg-gray-200">
            <div className="flex h-full items-center justify-center text-gray-500">
              {isRTL ? "خريطة الموقع" : "Map Location"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
