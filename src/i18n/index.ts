import "server-only";
import type { Locale } from "@/config/site";

const dictionaries = {
  en: () => import("./dictionaries/en.json").then((module) => module.default),
  ar: () => import("./dictionaries/ar.json").then((module) => module.default),
};

export const getDictionary = async (locale: Locale) => {
  const dictionaryLoader = dictionaries[locale];
  if (!dictionaryLoader) {
    // Fallback to English if locale is invalid
    return dictionaries.en();
  }
  return dictionaryLoader();
};

export type Dictionary = Awaited<ReturnType<typeof getDictionary>>;
