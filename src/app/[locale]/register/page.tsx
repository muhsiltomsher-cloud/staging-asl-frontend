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
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<{
    username?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    general?: string;
  }>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    params.then((p) => setLocale(p.locale));
  }, [params]);

  const isRTL = locale === "ar";

  const t = {
    en: {
      registerTitle: "Create Account",
      registerSubtitle: "Join us and start shopping",
      username: "Username",
      usernamePlaceholder: "Enter your username",
      email: "Email Address",
      emailPlaceholder: "Enter your email",
      password: "Password",
      passwordPlaceholder: "Enter your password",
      confirmPassword: "Confirm Password",
      confirmPasswordPlaceholder: "Confirm your password",
      registerButton: "Create Account",
      registering: "Creating account...",
      hasAccount: "Already have an account?",
      signInLink: "Sign in",
      usernameRequired: "Username is required",
      emailRequired: "Email is required",
      emailInvalid: "Please enter a valid email address",
      passwordRequired: "Password is required",
      passwordMinLength: "Password must be at least 6 characters",
      passwordsNotMatch: "Passwords do not match",
      registerSuccess: "Registration successful! Please login.",
      registerError: "Registration failed. Please try again.",
    },
    ar: {
      registerTitle: "إنشاء حساب",
      registerSubtitle: "انضم إلينا وابدأ التسوق",
      username: "اسم المستخدم",
      usernamePlaceholder: "أدخل اسم المستخدم",
      email: "البريد الإلكتروني",
      emailPlaceholder: "أدخل بريدك الإلكتروني",
      password: "كلمة المرور",
      passwordPlaceholder: "أدخل كلمة المرور",
      confirmPassword: "تأكيد كلمة المرور",
      confirmPasswordPlaceholder: "أعد إدخال كلمة المرور",
      registerButton: "إنشاء حساب",
      registering: "جاري إنشاء الحساب...",
      hasAccount: "لديك حساب بالفعل؟",
      signInLink: "تسجيل الدخول",
      usernameRequired: "اسم المستخدم مطلوب",
      emailRequired: "البريد الإلكتروني مطلوب",
      emailInvalid: "يرجى إدخال بريد إلكتروني صحيح",
      passwordRequired: "كلمة المرور مطلوبة",
      passwordMinLength: "يجب أن تكون كلمة المرور 6 أحرف على الأقل",
      passwordsNotMatch: "كلمات المرور غير متطابقة",
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

    if (!formData.username.trim()) {
      newErrors.username = texts.usernameRequired;
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

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = texts.passwordsNotMatch;
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
        username: formData.username,
        email: formData.email,
        password: formData.password,
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
    <div className="flex min-h-[calc(100vh-200px)] items-center justify-center px-4 py-12" style={{ backgroundColor: '#F5F0E8' }}>
      <div className="w-full max-w-md">
        <div className="rounded-lg border border-[#E8E0D5] bg-white p-8 shadow-sm">
          <div className={`mb-8 text-center ${isRTL ? "rtl" : ""}`}>
            <h1 className="text-2xl font-bold text-[#5C4A3D]">{texts.registerTitle}</h1>
            <p className="mt-2 text-[#8B7355]">{texts.registerSubtitle}</p>
          </div>

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

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label={texts.username}
              name="username"
              type="text"
              placeholder={texts.usernamePlaceholder}
              value={formData.username}
              onChange={handleInputChange}
              error={errors.username}
              autoComplete="username"
              dir={isRTL ? "rtl" : "ltr"}
              required
            />

            <Input
              label={texts.email}
              name="email"
              type="email"
              placeholder={texts.emailPlaceholder}
              value={formData.email}
              onChange={handleInputChange}
              error={errors.email}
              autoComplete="email"
              dir={isRTL ? "rtl" : "ltr"}
              required
            />

            <Input
              label={texts.password}
              name="password"
              type="password"
              placeholder={texts.passwordPlaceholder}
              value={formData.password}
              onChange={handleInputChange}
              error={errors.password}
              autoComplete="new-password"
              dir={isRTL ? "rtl" : "ltr"}
              required
            />

            <Input
              label={texts.confirmPassword}
              name="confirmPassword"
              type="password"
              placeholder={texts.confirmPasswordPlaceholder}
              value={formData.confirmPassword}
              onChange={handleInputChange}
              error={errors.confirmPassword}
              autoComplete="new-password"
              dir={isRTL ? "rtl" : "ltr"}
              required
            />

            <Button
              type="submit"
              className="w-full bg-[#92400e] hover:bg-[#78350f] focus-visible:ring-[#92400e]"
              isLoading={isLoading}
              disabled={isLoading}
            >
              {isLoading ? texts.registering : texts.registerButton}
            </Button>
          </form>

          <div className={`mt-6 text-center text-sm ${isRTL ? "rtl" : ""}`}>
            <span className="text-[#8B7355]">{texts.hasAccount} </span>
            <Link
              href={`/${locale}/login`}
              className="font-medium text-[#92400e] hover:underline"
            >
              {texts.signInLink}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
