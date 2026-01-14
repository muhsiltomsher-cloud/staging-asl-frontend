import type { ProductAddonsTranslations } from "./types";

export const translations: Record<"en" | "ar", ProductAddonsTranslations> = {
  en: {
    required: "Required",
    optional: "Optional",
    selectOption: "Select an option",
    uploadFile: "Upload file",
    chooseFile: "Choose file",
    noFileChosen: "No file chosen",
    charactersRemaining: "characters remaining",
    minCharacters: "Minimum characters",
    maxCharacters: "Maximum characters",
    addPrice: "Add",
  },
  ar: {
    required: "مطلوب",
    optional: "اختياري",
    selectOption: "اختر خيار",
    uploadFile: "رفع ملف",
    chooseFile: "اختر ملف",
    noFileChosen: "لم يتم اختيار ملف",
    charactersRemaining: "حرف متبقي",
    minCharacters: "الحد الأدنى للأحرف",
    maxCharacters: "الحد الأقصى للأحرف",
    addPrice: "إضافة",
  },
};
