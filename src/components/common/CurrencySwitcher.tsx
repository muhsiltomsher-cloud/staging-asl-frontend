"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import { useCurrency } from "@/contexts/CurrencyContext";
import { currencies, type Currency } from "@/config/site";
import { cn } from "@/lib/utils";

interface CurrencySwitcherProps {
  className?: string;
}

export function CurrencySwitcher({ className }: CurrencySwitcherProps) {
  const { currency, setCurrency } = useCurrency();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentCurrency = currencies.find((c) => c.code === currency);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (code: Currency) => {
    setCurrency(code);
    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 text-sm font-medium text-gray-700 transition-colors hover:text-gray-900"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span>{currentCurrency?.code}</span>
        <ChevronDown className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full z-50 mt-2 w-48 rounded-md border bg-white py-1 shadow-lg">
          <ul role="listbox" aria-label="Select currency">
            {currencies.map((curr) => (
              <li key={curr.code}>
                <button
                  type="button"
                  onClick={() => handleSelect(curr.code as Currency)}
                  className={cn(
                    "flex w-full items-center justify-between px-4 py-2 text-sm hover:bg-gray-100",
                    currency === curr.code ? "bg-gray-50 font-medium" : "text-gray-700"
                  )}
                  role="option"
                  aria-selected={currency === curr.code}
                >
                  <span>{curr.label}</span>
                  {currency === curr.code && <Check className="h-4 w-4 text-gray-900" />}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
