"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Input } from "@/components/common/Input";
import { Button } from "@/components/common/Button";
import { register } from "@/lib/api/auth";
import { useNotification } from "@/contexts/NotificationContext";

interface RegisterPageProps {
  params: Promise<{ locale: string }>;
}

export default function RegisterPage({ params }: RegisterPageProps) {
  const router = useRouter();
  const { notify } = useNotification();
  const [locale, setLocale] = useState<string>("en");
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });
  const [newsletter, setNewsletter] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [errors, setErrors] = useState<{
    firstName?: string;
    lastName?: string;
    email?: string;
    password?: string;
    terms?: string;
    general?: string;
  }>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    params.then((p) => setLocale(p.locale));
  }, [params]);

  const isRTL = locale === "ar";

  const t = {
    en: {
      register: "REGISTER",
      registerTitle: "Create an Account – Start Shopping",
      firstName: "First name",
      firstNamePlaceholder: "First name",
      lastName: "Last name",
      lastNamePlaceholder: "Last name",
      email: "E-mail",
      emailPlaceholder: "E-mail",
      password: "Password",
      passwordPlaceholder: "Password",
      newsletterLabel: "Register to our newsletter",
      termsLabel: "By signing up, you are agreeing to our",
      termsLink: "Terms & Conditions",
      registerButton: "Create account",
      registering: "Creating account...",
      hasAccount: "Already have an account?",
      signInLink: "Sign in",
      firstNameRequired: "First name is required",
      lastNameRequired: "Last name is required",
      emailRequired: "Email is required",
      emailInvalid: "Please enter a valid email address",
      passwordRequired: "Password is required",
      passwordMinLength: "Password must be at least 6 characters",
      termsRequired: "You must accept the Terms & Conditions",
      registerSuccess: "Registration successful! Please login.",
      registerError: "Registration failed. Please try again.",
    },
    ar: {
      register: "التسجيل",
      registerTitle: "إنشاء حساب – ابدأ التسوق",
      firstName: "الاسم الأول",
      firstNamePlaceholder: "الاسم الأول",
      lastName: "اسم العائلة",
      lastNamePlaceholder: "اسم العائلة",
      email: "البريد الإلكتروني",
      emailPlaceholder: "البريد الإلكتروني",
      password: "كلمة المرور",
      passwordPlaceholder: "كلمة المرور",
      newsletterLabel: "اشترك في نشرتنا الإخبارية",
      termsLabel: "بالتسجيل، أنت توافق على",
      termsLink: "الشروط والأحكام",
      registerButton: "إنشاء حساب",
      registering: "جاري إنشاء الحساب...",
      hasAccount: "لديك حساب بالفعل؟",
      signInLink: "تسجيل الدخول",
      firstNameRequired: "الاسم الأول مطلوب",
      lastNameRequired: "اسم العائلة مطلوب",
      emailRequired: "البريد الإلكتروني مطلوب",
      emailInvalid: "يرجى إدخال بريد إلكتروني صحيح",
      passwordRequired: "كلمة المرور مطلوبة",
      passwordMinLength: "يجب أن تكون كلمة المرور 6 أحرف على الأقل",
      termsRequired: "يجب الموافقة على الشروط والأحكام",
      registerSuccess: "تم إنشاء الحساب بنجاح! يرجى تسجيل الدخول.",
      registerError: "فشل إنشاء الحساب. يرجى المحاولة مرة أخرى.",
    },
  };

  const texts = t[locale as keyof typeof t] || t.en;

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = texts.firstNameRequired;
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = texts.lastNameRequired;
    }

    if (!formData.email.trim()) {
      newErrors.email = texts.emailRequired;
    } else if (!validateEmail(formData.email)) {
      newErrors.email = texts.emailInvalid;
    }

    if (!formData.password) {
      newErrors.password = texts.passwordRequired;
    } else if (formData.password.length < 6) {
      newErrors.password = texts.passwordMinLength;
    }

    if (!termsAccepted) {
      newErrors.terms = texts.termsRequired;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage(null);

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const response = await register({
        username: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        password: formData.password,
        first_name: formData.firstName,
        last_name: formData.lastName,
        newsletter: newsletter,
      });

      if (response.success) {
        setSuccessMessage(texts.registerSuccess);
        notify("success", texts.registerSuccess);
        setTimeout(() => {
          router.push(`/${locale}/login`);
        }, 2000);
      } else {
        setErrors({
          general: response.error?.message || texts.registerError,
        });
      }
    } catch {
      setErrors({
        general: texts.registerError,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  return (
    <div 
      className="flex min-h-[calc(100vh-200px)] items-center justify-center px-4 py-8 md:py-12"
      style={{ 
        backgroundImage: 'url(https://staging.aromaticscentslab.com/wp-content/uploads/2025/12/page-bg.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div className="w-full max-w-md">
        <div className="overflow-hidden rounded-2xl shadow-2xl">
          {/* Registration Form */}
          <div className="bg-white p-6 md:p-8 lg:p-12">
            <div className={`mb-6 ${isRTL ? "text-right" : "text-left"}`}>
              <div className="inline-block">
                <h1 className="text-sm font-bold tracking-widest text-[#92400e] uppercase">{texts.register}</h1>
                <div className="mt-2 h-0.5 bg-gradient-to-r from-[#92400e] to-[#d4a574]"></div>
              </div>
            </div>

            <h2 className={`text-xl md:text-2xl font-semibold text-gray-800 mb-6 md:mb-8 ${isRTL ? "text-right" : "text-left"}`}>
              {texts.registerTitle}
            </h2>

            {errors.general && (
              <div className="mb-6 rounded-md bg-red-50 p-4 text-sm text-red-600">
                {errors.general}
              </div>
            )}

            {successMessage && (
              <div className="mb-6 rounded-md bg-green-50 p-4 text-sm text-green-600">
                {successMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                name="firstName"
                type="text"
                placeholder={texts.firstNamePlaceholder}
                value={formData.firstName}
                onChange={handleInputChange}
                error={errors.firstName}
                autoComplete="given-name"
                dir={isRTL ? "rtl" : "ltr"}
                className="border-gray-300 rounded-none"
              />

              <Input
                name="lastName"
                type="text"
                placeholder={texts.lastNamePlaceholder}
                value={formData.lastName}
                onChange={handleInputChange}
                error={errors.lastName}
                autoComplete="family-name"
                dir={isRTL ? "rtl" : "ltr"}
                className="border-gray-300 rounded-none"
              />

              <Input
                name="email"
                type="email"
                placeholder={texts.emailPlaceholder}
                value={formData.email}
                onChange={handleInputChange}
                error={errors.email}
                autoComplete="email"
                dir={isRTL ? "rtl" : "ltr"}
                className="border-gray-300 rounded-none"
              />

              <Input
                name="password"
                type="password"
                placeholder={texts.passwordPlaceholder}
                value={formData.password}
                onChange={handleInputChange}
                error={errors.password}
                autoComplete="new-password"
                dir={isRTL ? "rtl" : "ltr"}
                className="border-gray-300 rounded-none"
              />

              {/* Newsletter Checkbox */}
              <div className={`flex items-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
                <input
                  type="checkbox"
                  id="newsletter"
                  checked={newsletter}
                  onChange={(e) => setNewsletter(e.target.checked)}
                  className="w-4 h-4 border-gray-300 rounded accent-[#92400e]"
                />
                <label htmlFor="newsletter" className="text-sm text-[#92400e]">
                  {texts.newsletterLabel}
                </label>
              </div>

              {/* Terms Checkbox */}
              <div className={`flex items-start gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
                <input
                  type="checkbox"
                  id="terms"
                  checked={termsAccepted}
                  onChange={(e) => {
                    setTermsAccepted(e.target.checked);
                    if (errors.terms) {
                      setErrors((prev) => ({ ...prev, terms: undefined }));
                    }
                  }}
                  className="w-4 h-4 mt-0.5 border-gray-300 rounded accent-[#92400e]"
                />
                <label htmlFor="terms" className="text-sm text-black">
                  {texts.termsLabel}{" "}
                  <Link href={`/${locale}/terms-and-conditions`} className="text-[#92400e] hover:underline">
                    {texts.termsLink}
                  </Link>
                </label>
              </div>
              {errors.terms && (
                <p className="text-sm text-red-600">{errors.terms}</p>
              )}

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-[#92400e] to-[#b45309] text-white border-0 rounded-full hover:from-[#78350f] hover:to-[#92400e] focus-visible:ring-[#92400e] mt-6 py-3 font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                isLoading={isLoading}
                disabled={isLoading}
              >
                {isLoading ? texts.registering : texts.registerButton}
              </Button>
            </form>

            <div className={`mt-6 text-sm ${isRTL ? "text-right" : "text-left"}`}>
              <span className="text-gray-500">{texts.hasAccount} </span>
              <Link
                href={`/${locale}/login`}
                className="font-semibold text-[#92400e] hover:text-[#78350f] transition-colors"
              >
                {texts.signInLink}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
