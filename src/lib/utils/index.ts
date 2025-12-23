import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatDate(date: string, locale: string = "en") {
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-SA" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date));
}

export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "");
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + "...";
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function getLocaleFromPath(pathname: string): "en" | "ar" {
  const segments = pathname.split("/").filter(Boolean);
  if (segments[0] === "ar") return "ar";
  return "en";
}

export function getPathWithoutLocale(pathname: string): string {
  const segments = pathname.split("/").filter(Boolean);
  if (segments[0] === "en" || segments[0] === "ar") {
    return "/" + segments.slice(1).join("/");
  }
  return pathname;
}

export function getLocalizedPath(pathname: string, locale: string): string {
  const pathWithoutLocale = getPathWithoutLocale(pathname);
  return `/${locale}${pathWithoutLocale}`;
}
