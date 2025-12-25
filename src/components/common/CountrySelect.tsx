"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Search, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CountryOption {
  value: string;
  label: string;
  labelAr?: string;
}

export const countries: CountryOption[] = [
  { value: "AE", label: "United Arab Emirates", labelAr: "الإمارات العربية المتحدة" },
  { value: "SA", label: "Saudi Arabia", labelAr: "المملكة العربية السعودية" },
  { value: "KW", label: "Kuwait", labelAr: "الكويت" },
  { value: "BH", label: "Bahrain", labelAr: "البحرين" },
  { value: "OM", label: "Oman", labelAr: "عمان" },
  { value: "QA", label: "Qatar", labelAr: "قطر" },
  { value: "EG", label: "Egypt", labelAr: "مصر" },
  { value: "JO", label: "Jordan", labelAr: "الأردن" },
  { value: "LB", label: "Lebanon", labelAr: "لبنان" },
  { value: "IQ", label: "Iraq", labelAr: "العراق" },
  { value: "SY", label: "Syria", labelAr: "سوريا" },
  { value: "PS", label: "Palestine", labelAr: "فلسطين" },
  { value: "YE", label: "Yemen", labelAr: "اليمن" },
  { value: "LY", label: "Libya", labelAr: "ليبيا" },
  { value: "TN", label: "Tunisia", labelAr: "تونس" },
  { value: "DZ", label: "Algeria", labelAr: "الجزائر" },
  { value: "MA", label: "Morocco", labelAr: "المغرب" },
  { value: "SD", label: "Sudan", labelAr: "السودان" },
  { value: "US", label: "United States", labelAr: "الولايات المتحدة" },
  { value: "GB", label: "United Kingdom", labelAr: "المملكة المتحدة" },
  { value: "CA", label: "Canada", labelAr: "كندا" },
  { value: "AU", label: "Australia", labelAr: "أستراليا" },
  { value: "DE", label: "Germany", labelAr: "ألمانيا" },
  { value: "FR", label: "France", labelAr: "فرنسا" },
  { value: "IT", label: "Italy", labelAr: "إيطاليا" },
  { value: "ES", label: "Spain", labelAr: "إسبانيا" },
  { value: "NL", label: "Netherlands", labelAr: "هولندا" },
  { value: "BE", label: "Belgium", labelAr: "بلجيكا" },
  { value: "CH", label: "Switzerland", labelAr: "سويسرا" },
  { value: "AT", label: "Austria", labelAr: "النمسا" },
  { value: "SE", label: "Sweden", labelAr: "السويد" },
  { value: "NO", label: "Norway", labelAr: "النرويج" },
  { value: "DK", label: "Denmark", labelAr: "الدنمارك" },
  { value: "FI", label: "Finland", labelAr: "فنلندا" },
  { value: "PL", label: "Poland", labelAr: "بولندا" },
  { value: "PT", label: "Portugal", labelAr: "البرتغال" },
  { value: "GR", label: "Greece", labelAr: "اليونان" },
  { value: "TR", label: "Turkey", labelAr: "تركيا" },
  { value: "IN", label: "India", labelAr: "الهند" },
  { value: "PK", label: "Pakistan", labelAr: "باكستان" },
  { value: "BD", label: "Bangladesh", labelAr: "بنغلاديش" },
  { value: "PH", label: "Philippines", labelAr: "الفلبين" },
  { value: "ID", label: "Indonesia", labelAr: "إندونيسيا" },
  { value: "MY", label: "Malaysia", labelAr: "ماليزيا" },
  { value: "SG", label: "Singapore", labelAr: "سنغافورة" },
  { value: "TH", label: "Thailand", labelAr: "تايلاند" },
  { value: "VN", label: "Vietnam", labelAr: "فيتنام" },
  { value: "JP", label: "Japan", labelAr: "اليابان" },
  { value: "KR", label: "South Korea", labelAr: "كوريا الجنوبية" },
  { value: "CN", label: "China", labelAr: "الصين" },
  { value: "HK", label: "Hong Kong", labelAr: "هونغ كونغ" },
  { value: "TW", label: "Taiwan", labelAr: "تايوان" },
  { value: "NZ", label: "New Zealand", labelAr: "نيوزيلندا" },
  { value: "ZA", label: "South Africa", labelAr: "جنوب أفريقيا" },
  { value: "NG", label: "Nigeria", labelAr: "نيجيريا" },
  { value: "KE", label: "Kenya", labelAr: "كينيا" },
  { value: "BR", label: "Brazil", labelAr: "البرازيل" },
  { value: "MX", label: "Mexico", labelAr: "المكسيك" },
  { value: "AR", label: "Argentina", labelAr: "الأرجنتين" },
  { value: "CL", label: "Chile", labelAr: "تشيلي" },
  { value: "CO", label: "Colombia", labelAr: "كولومبيا" },
  { value: "RU", label: "Russia", labelAr: "روسيا" },
  { value: "UA", label: "Ukraine", labelAr: "أوكرانيا" },
];

export interface CountrySelectProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
  placeholder?: string;
  isRTL?: boolean;
  className?: string;
}

export function CountrySelect({
  label,
  value,
  onChange,
  error,
  required,
  placeholder,
  isRTL = false,
  className,
}: CountrySelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedCountry = countries.find((c) => c.value === value);
  const displayLabel = selectedCountry
    ? isRTL && selectedCountry.labelAr
      ? selectedCountry.labelAr
      : selectedCountry.label
    : "";

  const filteredCountries = countries.filter((country) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      country.label.toLowerCase().includes(searchLower) ||
      country.labelAr?.includes(searchQuery) ||
      country.value.toLowerCase().includes(searchLower)
    );
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSelect = (countryValue: string) => {
    onChange(countryValue);
    setIsOpen(false);
    setSearchQuery("");
  };

  return (
    <div className={cn("w-full", className)} ref={containerRef}>
      {label && (
        <label className="mb-1.5 block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "flex h-10 w-full items-center justify-between rounded-md border bg-white px-3 py-2 text-sm transition-colors",
            "focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900",
            error ? "border-red-500" : "border-gray-300",
            !displayLabel && "text-gray-500"
          )}
        >
          <span className="truncate">
            {displayLabel || placeholder || (isRTL ? "اختر الدولة" : "Select country")}
          </span>
          <ChevronDown
            className={cn(
              "h-4 w-4 text-gray-500 transition-transform",
              isOpen && "rotate-180"
            )}
          />
        </button>

        {isOpen && (
          <div className="absolute z-50 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-lg">
            <div className="border-b p-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  ref={inputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={isRTL ? "ابحث عن دولة..." : "Search country..."}
                  className="w-full rounded-md border border-gray-200 py-2 pl-9 pr-3 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
                />
              </div>
            </div>
            <div className="max-h-60 overflow-y-auto">
              {filteredCountries.length === 0 ? (
                <div className="p-3 text-center text-sm text-gray-500">
                  {isRTL ? "لم يتم العثور على نتائج" : "No results found"}
                </div>
              ) : (
                filteredCountries.map((country) => (
                  <button
                    key={country.value}
                    type="button"
                    onClick={() => handleSelect(country.value)}
                    className={cn(
                      "flex w-full items-center justify-between px-3 py-2 text-sm hover:bg-gray-50",
                      value === country.value && "bg-gray-50"
                    )}
                  >
                    <span>
                      {isRTL && country.labelAr ? country.labelAr : country.label}
                    </span>
                    {value === country.value && (
                      <Check className="h-4 w-4 text-gray-900" />
                    )}
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>
      {error && <p className="mt-1.5 text-sm text-red-500">{error}</p>}
    </div>
  );
}
