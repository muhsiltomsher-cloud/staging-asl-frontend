import type { Locale } from "@/config/site";
import type {
  WCPAField,
  WCPAFormValues,
} from "@/types/wcpa";

export interface ProductAddonsProps {
  forms: import("@/types/wcpa").WCPAForm[];
  locale: Locale;
  basePrice: number;
  onValuesChange?: (values: WCPAFormValues, addonPrice: number) => void;
  onValidationChange?: (isValid: boolean, errors: Record<string, string>) => void;
}

export interface FieldRendererProps {
  field: WCPAField;
  value: WCPAFormValues[string];
  error?: string;
  onChange: (value: WCPAFormValues[string]) => void;
  locale: Locale;
  t: ProductAddonsTranslations;
}

export interface ProductAddonsTranslations {
  required: string;
  optional: string;
  selectOption: string;
  uploadFile: string;
  chooseFile: string;
  noFileChosen: string;
  charactersRemaining: string;
  minCharacters: string;
  maxCharacters: string;
  addPrice: string;
}
