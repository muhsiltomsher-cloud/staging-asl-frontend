"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Home } from "lucide-react";
import { Input } from "@/components/common/Input";
import { Button } from "@/components/common/Button";
import { PhoneInput } from "@/components/common/PhoneInput";
import { register } from "@/lib/api/auth";
import { validatePhoneNumber, parsePhoneNumber } from "@/lib/utils/phone";
import { useNotification } from "@/contexts/NotificationContext";
import { useAuth } from "@/contexts/AuthContext";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";

interface RegisterPageProps {
  params: Promise<{ locale: string }>;
}

export default function RegisterPage({ params }: RegisterPageProps) {
  const router = useRouter();
  const { notify } = useNotification();
  const { googleLogin } = useAuth();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [locale, setLocale] = useState<string>("en");
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
  });
  const [newsletter, setNewsletter] = useState(true);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [errors, setErrors] = useState<{
    name?: string;
    phone?: string;
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
      name: "Name",
      namePlaceholder: "Name",
      phone: "Phone number",
      phonePlaceholder: "Phone number",
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
      nameRequired: "Name is required",
      phoneRequired: "Phone number is required",
      emailRequired: "Email is required",
      emailInvalid: "Please enter a valid email address",
      passwordRequired: "Password is required",
      passwordMinLength: "Password must be at least 6 characters",
      termsRequired: "You must accept the Terms & Conditions",
      registerSuccess: "Registration successful! Please login.",
      registerError: "Registration failed. Please try again.",
      orDivider: "or",
      googleSignUpError: "Google sign-up failed. Please try again.",
    },
    ar: {
      register: "التسجيل",
      registerTitle: "إنشاء حساب – ابدأ التسوق",
      name: "الاسم",
      namePlaceholder: "الاسم",
      phone: "رقم الهاتف",
      phonePlaceholder: "رقم الهاتف",
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
      nameRequired: "الاسم مطلوب",
      phoneRequired: "رقم الهاتف مطلوب",
      emailRequired: "البريد الإلكتروني مطلوب",
      emailInvalid: "يرجى إدخال بريد إلكتروني صحيح",
      passwordRequired: "كلمة المرور مطلوبة",
      passwordMinLength: "يجب أن تكون كلمة المرور 6 أحرف على الأقل",
      termsRequired: "يجب الموافقة على الشروط والأحكام",
      registerSuccess: "تم إنشاء الحساب بنجاح! يرجى تسجيل الدخول.",
      registerError: "فشل إنشاء الحساب. يرجى المحاولة مرة أخرى.",
      orDivider: "أو",
      googleSignUpError: "فشل التسجيل بحساب جوجل. يرجى المحاولة مرة أخرى.",
    },
  };

  const texts = t[locale as keyof typeof t] || t.en;

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    if (!formData.name.trim()) {
      newErrors.name = texts.nameRequired;
    }

    if (!formData.phone.trim()) {
      newErrors.phone = texts.phoneRequired;
    } else {
      const parsed = parsePhoneNumber(formData.phone);
      if (parsed.localNumber) {
        const validation = validatePhoneNumber(parsed.localNumber, "AE");
        if (!validation.isValid) {
          newErrors.phone = isRTL ? validation.errorAr : validation.error;
        }
      }
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
        username: formData.email,
        email: formData.email,
        password: formData.password,
        first_name: formData.name,
        last_name: "",
        phone: formData.phone,
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
        backgroundImage: 'url(https://cms.aromaticscentslab.com/wp-content/uploads/2025/12/page-bg.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div className="w-full max-w-md">
        <div className="overflow-hidden rounded-2xl shadow-2xl">
          {/* Registration Form */}
          <div className="bg-white p-6 md:p-8 lg:p-12">
            {/* Home Icon */}
            <div className="mb-4">
              <Link
                href={`/${locale}`}
                className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[#f7f6f2] text-[#92400e] hover:bg-[#92400e] hover:text-white transition-all duration-300"
                aria-label="Home"
              >
                <Home className="h-5 w-5" />
              </Link>
            </div>
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

            <GoogleSignInButton
              onSuccess={async (credential) => {
                setIsGoogleLoading(true);
                setErrors({});
                try {
                  const response = await googleLogin(credential);
                  if (response.success) {
                    router.push(`/${locale}/account`);
                  } else {
                    setErrors({ general: response.error?.message || texts.googleSignUpError });
                  }
                } catch {
                  setErrors({ general: texts.googleSignUpError });
                } finally {
                  setIsGoogleLoading(false);
                }
              }}
              onError={() => setErrors({ general: texts.googleSignUpError })}
              text="signup_with"
              locale={locale}
            />

            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 h-px bg-gray-300"></div>
              <span className="text-sm text-gray-500">{texts.orDivider}</span>
              <div className="flex-1 h-px bg-gray-300"></div>
            </div>

            {isGoogleLoading && (
              <div className="mb-6 rounded-md bg-blue-50 p-4 text-sm text-blue-600 text-center">
                {texts.registering}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                name="name"
                type="text"
                placeholder={texts.namePlaceholder}
                value={formData.name}
                onChange={handleInputChange}
                error={errors.name}
                autoComplete="name"
                dir={isRTL ? "rtl" : "ltr"}
                className="border-gray-300 rounded-none"
              />

              <PhoneInput
                label={texts.phone}
                value={formData.phone}
                onChange={(phone) => {
                  setFormData((prev) => ({ ...prev, phone }));
                  if (errors.phone) {
                    setErrors((prev) => ({ ...prev, phone: undefined }));
                  }
                }}
                error={errors.phone}
                isRTL={isRTL}
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
