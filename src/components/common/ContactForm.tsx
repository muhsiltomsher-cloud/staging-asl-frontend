"use client";

/**
 * Contact Form Component
 * 
 * BACKEND INTEGRATION:
 * To connect this form to a backend, we recommend using Contact Form 7 (CF7) WordPress plugin
 * with the CF7 REST API addon. This allows form submissions to be sent to WordPress and
 * stored/emailed through the existing WordPress backend.
 * 
 * Alternative options:
 * - WPForms with REST API
 * - Gravity Forms with REST API
 * - Custom WordPress REST endpoint in the asl-frontend-settings plugin
 * 
 * Implementation steps:
 * 1. Install Contact Form 7 plugin in WordPress
 * 2. Install CF7 REST API addon (or similar)
 * 3. Create a form in CF7 and note the form ID
 * 4. Update handleSubmit to POST to: /wp-json/contact-form-7/v1/contact-forms/{form_id}/feedback
 */

import { useState } from "react";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";

interface ContactFormProps {
  locale: string;
}

export function ContactForm({ locale }: ContactFormProps) {
  const isRTL = locale === "ar";
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
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
    );
  }

  return (
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
  );
}
