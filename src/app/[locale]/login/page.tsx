"use client";

import { useState, useEffect } from "react";
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
      findYourScent: "Find Your Scent",
      findYourScentDesc: "We carefully cultivate our fragrances that capture the soul of the world's most popular perfumes.",
      benefits: "Benefits",
      benefit1: "Saving Up to 90%",
      benefit2: "Long Lasting",
      benefit3: "Easy Returns",
      benefit4: "Secure Checkout",
      benefit5: "Free Delivery above 200 AED",
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
      findYourScent: "اكتشف عطرك",
      findYourScentDesc: "نحن نصنع بعناية عطورنا التي تجسد روح أشهر العطور في العالم.",
      benefits: "المزايا",
      benefit1: "وفر حتى 90%",
      benefit2: "يدوم طويلاً",
      benefit3: "إرجاع سهل",
      benefit4: "دفع آمن",
      benefit5: "توصيل مجاني فوق 200 درهم",
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

  const benefits = [
    { text: texts.benefit1, icon: "percent" },
    { text: texts.benefit2, icon: "clock" },
    { text: texts.benefit3, icon: "returns" },
    { text: texts.benefit4, icon: "secure" },
    { text: texts.benefit5, icon: "delivery" },
  ];

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
      <div className="w-full max-w-5xl">
        <div className={`flex flex-col lg:flex-row gap-0 overflow-hidden rounded-2xl shadow-2xl ${isRTL ? "lg:flex-row-reverse" : ""}`}>
          {/* Left Column - Login Form */}
          <div className="flex-1 bg-white p-6 md:p-8 lg:p-12">
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
                {errors.general}
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
                disabled={isLoading}
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

          {/* Right Column - Find Your Scent & Benefits */}
          <div className={`flex-1 bg-gradient-to-br from-[#fef3e2] via-[#fde9d0] to-[#fcd9b8] p-6 md:p-8 lg:p-12 ${isRTL ? "text-right" : "text-left"}`}>
            {/* Find Your Scent Section */}
            <div className="flex items-start gap-4 mb-8 p-4 md:p-6 bg-white/60 backdrop-blur-sm rounded-xl shadow-sm">
              <div className="flex-shrink-0">
                <svg width="70" height="90" viewBox="0 0 80 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-md">
                  <path d="M28 8H52V25L62 45V85C62 90 58 95 52 95H28C22 95 18 90 18 85V45L28 25V8Z" stroke="#92400e" strokeWidth="2" fill="white"/>
                  <rect x="28" y="2" width="24" height="8" stroke="#92400e" strokeWidth="2" fill="white"/>
                  <path d="M25 50H55" stroke="#92400e" strokeWidth="1"/>
                  <text x="40" y="42" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#92400e">Find</text>
                  <text x="40" y="52" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#92400e">Your</text>
                  <text x="40" y="62" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#92400e">Scent</text>
                  <circle cx="32" cy="75" r="3" fill="#d4a574"/>
                  <circle cx="40" cy="80" r="2" fill="#b45309"/>
                  <circle cx="48" cy="75" r="3" fill="#d4a574"/>
                  <path d="M35 3L37 0M43 0L45 3M40 0V4" stroke="#92400e" strokeWidth="1"/>
                </svg>
              </div>
              <div>
                <h3 className="text-lg md:text-xl font-bold text-[#92400e] mb-2">{texts.findYourScent}</h3>
                <p className="text-gray-700 text-sm leading-relaxed">{texts.findYourScentDesc}</p>
              </div>
            </div>

            {/* Benefits Section */}
            <div className="bg-white/40 backdrop-blur-sm rounded-xl p-4 md:p-6">
              <h4 className="text-lg font-bold text-[#92400e] mb-4">{texts.benefits}</h4>
              <div className="space-y-3">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/50 transition-colors">
                    <div className="w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-br from-[#92400e] to-[#b45309] text-white shadow-md">
                      {benefit.icon === "percent" && (
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10"/>
                          <text x="12" y="16" textAnchor="middle" fontSize="10" fill="currentColor" stroke="none">%</text>
                        </svg>
                      )}
                      {benefit.icon === "clock" && (
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10"/>
                          <circle cx="12" cy="12" r="3"/>
                        </svg>
                      )}
                      {benefit.icon === "returns" && (
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M3 12h18M3 12l6-6M3 12l6 6M21 12l-6-6M21 12l-6 6"/>
                        </svg>
                      )}
                      {benefit.icon === "secure" && (
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                          <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                        </svg>
                      )}
                      {benefit.icon === "delivery" && (
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="1" y="3" width="15" height="13"/>
                          <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
                          <circle cx="5.5" cy="18.5" r="2.5"/>
                          <circle cx="18.5" cy="18.5" r="2.5"/>
                        </svg>
                      )}
                    </div>
                    <span className="text-gray-800 font-medium">{benefit.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
