"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Input } from "@/components/common/Input";
import { Button } from "@/components/common/Button";
import { useAuth } from "@/contexts/AuthContext";
import Image from "next/image";

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
      className="flex min-h-[calc(100vh-200px)] items-center justify-center px-4 py-12"
      style={{ 
        backgroundImage: 'url(https://staging.aromaticscentslab.com/wp-content/uploads/2025/12/page-bg.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div className="w-full max-w-5xl">
        <div className={`flex flex-col lg:flex-row gap-8 lg:gap-16 ${isRTL ? "lg:flex-row-reverse" : ""}`}>
          {/* Left Column - Login Form */}
          <div className="flex-1 bg-white p-8 lg:p-12">
            <div className={`mb-6 ${isRTL ? "text-right" : "text-left"}`}>
              <h1 className="text-sm font-bold tracking-widest text-black uppercase">{texts.login}</h1>
              <div className="mt-2 border-b border-gray-300"></div>
            </div>

            <h2 className={`text-xl font-semibold text-black mb-8 ${isRTL ? "text-right" : "text-left"}`}>
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
                className="w-full bg-white text-black border border-black rounded-full hover:bg-gray-100 focus-visible:ring-black mt-6"
                isLoading={isLoading}
                disabled={isLoading}
              >
                {isLoading ? texts.loggingIn : texts.loginButton}
              </Button>
            </form>

            <div className={`mt-6 text-sm ${isRTL ? "text-right" : "text-left"}`}>
              <span className="text-gray-600">{texts.noAccount} </span>
              <Link
                href={`/${locale}/register`}
                className="font-medium text-[#92400e] hover:underline"
              >
                {texts.signUpLink}
              </Link>
            </div>
          </div>

          {/* Right Column - Find Your Scent & Benefits */}
          <div className={`flex-1 bg-white p-8 lg:p-12 ${isRTL ? "text-right" : "text-left"}`}>
            {/* Find Your Scent Section */}
            <div className={`flex items-start gap-4 mb-8 ${isRTL ? "flex-row-reverse" : ""}`}>
              <div className="flex-shrink-0">
                <Image
                  src="https://staging.aromaticscentslab.com/wp-content/uploads/2025/06/find-your-scent.png"
                  alt="Find Your Scent"
                  width={80}
                  height={100}
                  className="object-contain"
                />
              </div>
              <div>
                <h3 className="text-xl font-bold text-black mb-2">{texts.findYourScent}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{texts.findYourScentDesc}</p>
              </div>
            </div>

            {/* Benefits Section */}
            <div>
              <h4 className="text-lg font-bold text-black mb-4">{texts.benefits}</h4>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className={`flex items-center gap-3 ${isRTL ? "flex-row-reverse" : ""}`}>
                    <div className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-300">
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
                    <span className="text-black font-medium">{benefit.text}</span>
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
