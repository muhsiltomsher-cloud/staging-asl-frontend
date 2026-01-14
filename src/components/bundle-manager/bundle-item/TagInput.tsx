"use client";

import { useState } from "react";
import { HelpCircle } from "lucide-react";
import type { TagInputProps } from "./types";

export function TagInput({ label, placeholder, selectedIds, options, onChange, helpText }: TagInputProps) {
  const [inputValue, setInputValue] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  const filteredOptions = options.filter(
    (opt) => 
      !selectedIds.includes(opt.id) && 
      opt.name.toLowerCase().includes(inputValue.toLowerCase())
  );

  const selectedItems = options.filter((opt) => selectedIds.includes(opt.id));

  const handleSelect = (id: number) => {
    onChange([...selectedIds, id]);
    setInputValue("");
    setShowDropdown(false);
  };

  const handleRemove = (id: number) => {
    onChange(selectedIds.filter((i) => i !== id));
  };

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        {helpText && (
          <div className="group relative">
            <HelpCircle className="h-4 w-4 text-gray-400 cursor-help" />
            <div className="absolute left-0 top-6 z-10 hidden w-48 rounded bg-gray-800 p-2 text-xs text-white group-hover:block">
              {helpText}
            </div>
          </div>
        )}
      </div>
      <div className="relative">
        <div className="min-h-[42px] rounded-md border border-gray-300 bg-white p-2">
          <div className="flex flex-wrap gap-1">
            {selectedItems.map((item) => (
              <span
                key={item.id}
                className="inline-flex items-center gap-1 rounded bg-blue-600 px-2 py-1 text-xs text-white"
              >
                {item.name}
                <button
                  type="button"
                  onClick={() => handleRemove(item.id)}
                  className="hover:text-blue-200"
                >
                  ×
                </button>
              </span>
            ))}
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onFocus={() => setShowDropdown(true)}
              onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
              placeholder={selectedItems.length === 0 ? placeholder : ""}
              className="flex-1 min-w-[120px] border-none p-0 text-sm focus:outline-none focus:ring-0"
            />
          </div>
        </div>
        {showDropdown && filteredOptions.length > 0 && (
          <div className="absolute z-10 mt-1 max-h-48 w-full overflow-auto rounded-md border border-gray-200 bg-white shadow-lg">
            {filteredOptions.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => handleSelect(opt.id)}
                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100"
              >
                {opt.name}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
