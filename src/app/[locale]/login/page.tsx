"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Home } from "lucide-react";
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
  const [rateLimitSeconds, setRateLimitSeconds] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    params.then((p) => setLocale(p.locale));
  }, [params]);

  const isRTL = locale === "ar";

  const t = {
    en: {
      login: "LOGIN",
      loginTitle: "Welcome Back – Sign In to Continue",
      username: "Username or E-mail",
      usernamePlaceholder: "Username or E-mail",
      password: "Password",
      passwordPlaceholder: "Password",
      loginButton: "Sign In",
      loggingIn: "Signing in...",
      noAccount: "Don't have an account?",
      signUpLink: "Sign up",
      usernameRequired: "Username or email is required",
      passwordRequired: "Password is required",
      loginError: "Invalid username or password",
      forgotPassword: "Forgot your password?",
      rateLimitMessage: "Too many login attempts. Please try again in",
      minutes: "min",
      seconds: "sec",
    },
    ar: {
      login: "تسجيل الدخول",
      loginTitle: "مرحباً بعودتك – سجل دخولك للمتابعة",
      username: "اسم المستخدم أو البريد الإلكتروني",
      usernamePlaceholder: "اسم المستخدم أو البريد الإلكتروني",
      password: "كلمة المرور",
      passwordPlaceholder: "كلمة المرور",
      loginButton: "تسجيل الدخول",
      loggingIn: "جاري تسجيل الدخول...",
      noAccount: "ليس لديك حساب؟",
      signUpLink: "سجل الآن",
      usernameRequired: "اسم المستخدم أو البريد الإلكتروني مطلوب",
      passwordRequired: "كلمة المرور مطلوبة",
      loginError: "اسم المستخدم أو كلمة المرور غير صحيحة",
      forgotPassword: "نسيت كلمة المرور؟",
      rateLimitMessage: "محاولات تسجيل دخول كثيرة. يرجى المحاولة مرة أخرى بعد",
      minutes: "د",
      seconds: "ث",
    },
  };

  const texts = t[locale as keyof typeof t] || t.en;

  const startCountdown = useCallback((seconds: number) => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setRateLimitSeconds(seconds);
    timerRef.current = setInterval(() => {
      setRateLimitSeconds((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          setErrors({});
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const formatCountdown = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    if (mins > 0) {
      return `${mins} ${texts.minutes} ${secs} ${texts.seconds}`;
    }
    return `${secs} ${texts.seconds}`;
  };

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
      if (response.error?.code === "rate_limit_exceeded" && response.error.retry_after) {
        startCountdown(response.error.retry_after);
      }
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
          {/* Login Form */}
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
                <h1 className="text-sm font-bold tracking-widest text-[#92400e] uppercase">{texts.login}</h1>
                <div className="mt-2 h-0.5 bg-gradient-to-r from-[#92400e] to-[#d4a574]"></div>
              </div>
            </div>

            <h2 className={`text-xl md:text-2xl font-semibold text-gray-800 mb-6 md:mb-8 ${isRTL ? "text-right" : "text-left"}`}>
              {texts.loginTitle}
            </h2>

            {errors.general && (
              <div className="mb-6 rounded-md bg-red-50 p-4 text-sm text-red-600">
                {rateLimitSeconds > 0 ? (
                  <div>
                    <p>{texts.rateLimitMessage}</p>
                    <p className="mt-2 text-lg font-semibold text-red-700">
                      {formatCountdown(rateLimitSeconds)}
                    </p>
                  </div>
                ) : (
                  errors.general
                )}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                name="username"
                type="text"
                placeholder={texts.usernamePlaceholder}
                value={formData.username}
                onChange={handleInputChange}
                error={errors.username}
                autoComplete="username"
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
                autoComplete="current-password"
                dir={isRTL ? "rtl" : "ltr"}
                className="border-gray-300 rounded-none"
              />

              <div className={`text-sm ${isRTL ? "text-right" : "text-left"}`}>
                <Link
                  href={`/${locale}/forgot-password`}
                  className="text-[#92400e] hover:underline"
                >
                  {texts.forgotPassword}
                </Link>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-[#92400e] to-[#b45309] text-white border-0 rounded-full hover:from-[#78350f] hover:to-[#92400e] focus-visible:ring-[#92400e] mt-6 py-3 font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                isLoading={isLoading}
                disabled={isLoading || rateLimitSeconds > 0}
              >
                {isLoading ? texts.loggingIn : texts.loginButton}
              </Button>
            </form>

            <div className={`mt-6 text-sm ${isRTL ? "text-right" : "text-left"}`}>
              <span className="text-gray-500">{texts.noAccount} </span>
              <Link
                href={`/${locale}/register`}
                className="font-semibold text-[#92400e] hover:text-[#78350f] transition-colors"
              >
                {texts.signUpLink}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
