/**
 * WooCommerce Custom Product Addons (WCPA) Types
 * 
 * Types for the Acowebs WooCommerce Custom Product Addons plugin.
 * These types define the structure of addon forms and fields.
 */

// Field types supported by WCPA
export type WCPAFieldType =
  | "text"
  | "number"
  | "email"
  | "url"
  | "textarea"
  | "file"
  | "hidden"
  | "color-picker"
  | "select"
  | "checkbox"
  | "checkbox-group"
  | "radio-group"
  | "image-group"
  | "color-group"
  | "product-group"
  | "date"
  | "time"
  | "datetime"
  | "content"
  | "header"
  | "separator";

// Price type for addon fields
export type WCPAPriceType = "fixed" | "percentage" | "custom_formula";

// Option for select, radio, checkbox, image, and color group fields
export interface WCPAFieldOption {
  label: string;
  value: string;
  price?: number;
  price_type?: WCPAPriceType;
  image?: string;
  color?: string;
  selected?: boolean;
  product_id?: number;
}

// Conditional logic rule
export interface WCPAConditionalRule {
  field: string;
  operator: "is" | "is_not" | "contains" | "not_contains" | "greater_than" | "less_than";
  value: string | number;
}

// Conditional logic configuration
export interface WCPAConditionalLogic {
  enabled: boolean;
  action: "show" | "hide";
  match: "all" | "any";
  rules: WCPAConditionalRule[];
}

// Base field interface
export interface WCPAFieldBase {
  id: string;
  name: string;
  type: WCPAFieldType;
  label: string;
  placeholder?: string;
  description?: string;
  required?: boolean;
  default_value?: string | number | boolean;
  price?: number;
  price_type?: WCPAPriceType;
  price_formula?: string;
  class_name?: string;
  conditional_logic?: WCPAConditionalLogic;
  min?: number;
  max?: number;
  step?: number;
}

// Text field
export interface WCPATextField extends WCPAFieldBase {
  type: "text" | "email" | "url" | "hidden";
  min_length?: number;
  max_length?: number;
  pattern?: string;
}

// Number field
export interface WCPANumberField extends WCPAFieldBase {
  type: "number";
  min?: number;
  max?: number;
  step?: number;
}

// Textarea field
export interface WCPATextareaField extends WCPAFieldBase {
  type: "textarea";
  rows?: number;
  min_length?: number;
  max_length?: number;
}

// File upload field
export interface WCPAFileField extends WCPAFieldBase {
  type: "file";
  allowed_types?: string[];
  max_size?: number;
  multiple?: boolean;
}

// Color picker field
export interface WCPAColorPickerField extends WCPAFieldBase {
  type: "color-picker";
  default_color?: string;
}

// Select field
export interface WCPASelectField extends WCPAFieldBase {
  type: "select";
  options: WCPAFieldOption[];
  multiple?: boolean;
}

// Checkbox field (single)
export interface WCPACheckboxField extends WCPAFieldBase {
  type: "checkbox";
  checked_value?: string;
  unchecked_value?: string;
}

// Checkbox group field
export interface WCPACheckboxGroupField extends WCPAFieldBase {
  type: "checkbox-group";
  options: WCPAFieldOption[];
  min_selections?: number;
  max_selections?: number;
}

// Radio group field
export interface WCPARadioGroupField extends WCPAFieldBase {
  type: "radio-group";
  options: WCPAFieldOption[];
}

// Image group field
export interface WCPAImageGroupField extends WCPAFieldBase {
  type: "image-group";
  options: WCPAFieldOption[];
  multiple?: boolean;
  image_size?: "thumbnail" | "medium" | "large" | "full";
}

// Color group field
export interface WCPAColorGroupField extends WCPAFieldBase {
  type: "color-group";
  options: WCPAFieldOption[];
  multiple?: boolean;
}

// Product group field
export interface WCPAProductGroupField extends WCPAFieldBase {
  type: "product-group";
  options: WCPAFieldOption[];
  multiple?: boolean;
  show_price?: boolean;
  show_image?: boolean;
}

// Date field
export interface WCPADateField extends WCPAFieldBase {
  type: "date";
  min_date?: string;
  max_date?: string;
  date_format?: string;
  disabled_dates?: string[];
  disabled_days?: number[];
}

// Time field
export interface WCPATimeField extends WCPAFieldBase {
  type: "time";
  min_time?: string;
  max_time?: string;
  time_format?: string;
  time_interval?: number;
}

// DateTime field
export interface WCPADateTimeField extends WCPAFieldBase {
  type: "datetime";
  min_datetime?: string;
  max_datetime?: string;
}

// Content field (display only)
export interface WCPAContentField extends WCPAFieldBase {
  type: "content";
  content: string;
}

// Header field (display only)
export interface WCPAHeaderField extends WCPAFieldBase {
  type: "header";
  heading_level?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
}

// Separator field (display only)
export interface WCPASeparatorField extends WCPAFieldBase {
  type: "separator";
}

// Union type for all field types
export type WCPAField =
  | WCPATextField
  | WCPANumberField
  | WCPATextareaField
  | WCPAFileField
  | WCPAColorPickerField
  | WCPASelectField
  | WCPACheckboxField
  | WCPACheckboxGroupField
  | WCPARadioGroupField
  | WCPAImageGroupField
  | WCPAColorGroupField
  | WCPAProductGroupField
  | WCPADateField
  | WCPATimeField
  | WCPADateTimeField
  | WCPAContentField
  | WCPAHeaderField
  | WCPASeparatorField;

// Form section
export interface WCPAFormSection {
  id: string;
  title?: string;
  description?: string;
  fields: WCPAField[];
  collapsed?: boolean;
}

// Complete addon form
export interface WCPAForm {
  id: number;
  title: string;
  sections: WCPAFormSection[];
  product_ids?: number[];
  category_ids?: number[];
  exclude_product_ids?: number[];
  exclude_category_ids?: number[];
  priority?: number;
  status: "publish" | "draft";
}

// Product addons response (from Store API extensions)
export interface WCPAProductAddons {
  forms: WCPAForm[];
  settings?: {
    price_display: "show" | "hide";
    required_indicator: string;
    date_format: string;
    time_format: string;
  };
}

// Field value types for form submission
export type WCPAFieldValue = string | number | boolean | string[] | File | File[] | null;

// Form values for submission
export interface WCPAFormValues {
  [fieldId: string]: WCPAFieldValue;
}

// Cart item addon data
export interface WCPACartItemAddon {
  field_id: string;
  field_label: string;
  field_type: WCPAFieldType;
  value: WCPAFieldValue;
  display_value: string;
  price: number;
  price_type: WCPAPriceType;
}

// Extended product type with WCPA addons
export interface WCPAExtensions {
  wcpa?: WCPAProductAddons;
}
