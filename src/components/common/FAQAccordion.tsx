"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FAQItem {
  question: string;
  answer: string;
}

interface FAQAccordionProps {
  items: FAQItem[];
  defaultOpenIndex?: number;
}

export function FAQAccordion({ items, defaultOpenIndex = 0 }: FAQAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(defaultOpenIndex);

  return (
    <div className="divide-y rounded-lg border">
      {items.map((item, index) => (
        <div key={index} className="bg-white">
          <button
            type="button"
            onClick={() => setOpenIndex(openIndex === index ? null : index)}
            className="flex w-full items-center justify-between px-6 py-4 text-left"
            aria-expanded={openIndex === index}
          >
            <span className="font-medium text-gray-900">{item.question}</span>
            <ChevronDown
              className={cn(
                "h-5 w-5 flex-shrink-0 text-gray-500 transition-transform",
                openIndex === index && "rotate-180"
              )}
            />
          </button>
          <div
            className={cn(
              "overflow-hidden transition-all duration-200",
              openIndex === index ? "max-h-96" : "max-h-0"
            )}
          >
            <p className="px-6 pb-4 text-gray-600">{item.answer}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
