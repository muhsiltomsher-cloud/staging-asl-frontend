"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Globe } from "lucide-react";
import { localeConfig, type Locale } from "@/config/site";
import { getPathWithoutLocale } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface LanguageSwitcherProps {
  locale: Locale;
  className?: string;
}

export function LanguageSwitcher({ locale, className }: LanguageSwitcherProps) {
  const pathname = usePathname();
  const pathWithoutLocale = getPathWithoutLocale(pathname);

  const alternateLocale: Locale = locale === "en" ? "ar" : "en";
  const alternateHref = `/${alternateLocale}${pathWithoutLocale}`;

  return (
    <Link
      href={alternateHref}
      className={cn(
        "flex items-center gap-1.5 text-sm font-medium text-gray-700 transition-colors hover:text-gray-900",
        className
      )}
      hrefLang={localeConfig[alternateLocale].hrefLang}
    >
      <Globe className="h-4 w-4" />
      <span>{localeConfig[alternateLocale].name}</span>
    </Link>
  );
}
