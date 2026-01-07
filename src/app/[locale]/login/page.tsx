"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Input } from "@/components/common/Input";
import { Button } from "@/components/common/Button";
import { useAuth } from "@/contexts/AuthContext";

interface LoginPageProps {
  params: Promise<{ locale: string }>;
}

export default function LoginPage({ params }: LoginPageProps) {
  const router = useRouter();
  const { login, isLoading } = useAuth();
  const [locale, setLocale] = useState<string>("en");
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [errors, setErrors] = useState<{
    username?: string;
    password?: string;
    general?: string;
  }>({});

  useState(() => {
    params.then((p) => setLocale(p.locale));
  });

  const isRTL = locale === "ar";

  const t = {
    en: {
      loginTitle: "Welcome Back",
      loginSubtitle: "Sign in to your account to continue",
      username: "Username",
      usernamePlaceholder: "Enter your username",
      password: "Password",
      passwordPlaceholder: "Enter your password",
      loginButton: "Sign In",
      loggingIn: "Signing in...",
      noAccount: "Don't have an account?",
      signUpLink: "Sign up",
      usernameRequired: "Username is required",
      passwordRequired: "Password is required",
      loginError: "Invalid username or password",
      forgotPassword: "Forgot your password?",
    },
    ar: {
      loginTitle: "مرحباً بعودتك",
      loginSubtitle: "سجل دخولك للمتابعة",
      username: "اسم المستخدم",
      usernamePlaceholder: "أدخل اسم المستخدم",
      password: "كلمة المرور",
      passwordPlaceholder: "أدخل كلمة المرور",
      loginButton: "تسجيل الدخول",
      loggingIn: "جاري تسجيل الدخول...",
      noAccount: "ليس لديك حساب؟",
      signUpLink: "سجل الآن",
      usernameRequired: "اسم المستخدم مطلوب",
      passwordRequired: "كلمة المرور مطلوبة",
      loginError: "اسم المستخدم أو كلمة المرور غير صحيحة",
      forgotPassword: "نسيت كلمة المرور؟",
    },
  };

  const texts = t[locale as keyof typeof t] || t.en;

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    if (!formData.username.trim()) {
      newErrors.username = texts.usernameRequired;
    }

    if (!formData.password) {
      newErrors.password = texts.passwordRequired;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    const response = await login({
      username: formData.username,
      password: formData.password,
    });

    if (response.success) {
      router.push(`/${locale}/account`);
    } else {
      setErrors({
        general: response.error?.message || texts.loginError,
      });
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
        className="flex min-h-[calc(100vh-200px)] items-center justify-center px-4 py-12"
        style={{ 
          backgroundImage: 'url(https://staging.aromaticscentslab.com/wp-content/uploads/2025/12/page-bg.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
      <div className="w-full max-w-md">
        <div className="rounded-lg border border-[#E8E0D5] bg-white p-8 shadow-sm">
          <div className={`mb-8 text-center ${isRTL ? "rtl" : ""}`}>
            <h1 className="text-2xl font-bold text-[#5C4A3D]">{texts.loginTitle}</h1>
            <p className="mt-2 text-[#8B7355]">{texts.loginSubtitle}</p>
          </div>

          {errors.general && (
            <div className="mb-6 rounded-md bg-red-50 p-4 text-sm text-red-600">
              {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
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
              label={texts.password}
              name="password"
              type="password"
              placeholder={texts.passwordPlaceholder}
              value={formData.password}
              onChange={handleInputChange}
              error={errors.password}
              autoComplete="current-password"
              dir={isRTL ? "rtl" : "ltr"}
              required
            />

            <Button
              type="submit"
              className="w-full bg-[#92400e] hover:bg-[#78350f] focus-visible:ring-[#92400e]"
              isLoading={isLoading}
              disabled={isLoading}
            >
              {isLoading ? texts.loggingIn : texts.loginButton}
            </Button>
          </form>

          <div className={`mt-6 text-center text-sm ${isRTL ? "rtl" : ""}`}>
            <span className="text-[#8B7355]">{texts.noAccount} </span>
            <Link
              href={`/${locale}/register`}
              className="font-medium text-[#92400e] hover:underline"
            >
              {texts.signUpLink}
            </Link>
          </div>

          <div className={`mt-4 text-center text-sm ${isRTL ? "rtl" : ""}`}>
            <Link
              href={`/${locale}/forgot-password`}
              className="font-medium text-[#92400e] hover:underline"
            >
              {texts.forgotPassword}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
