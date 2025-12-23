"use client";

import { useState } from "react";
import { X, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/common/Button";
import { Select } from "@/components/common/Select";
import type { ProductCategory } from "@/types";
import type { Dictionary } from "@/i18n";

interface ProductFiltersProps {
  categories: ProductCategory[];
  dictionary: Dictionary;
  selectedCategory?: string;
  sortBy?: string;
  onCategoryChange: (category: string) => void;
  onSortChange: (sort: string) => void;
  onClearFilters: () => void;
}

export function ProductFilters({
  categories,
  dictionary,
  selectedCategory,
  sortBy = "newest",
  onCategoryChange,
  onSortChange,
  onClearFilters,
}: ProductFiltersProps) {
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  const sortOptions = [
    { value: "newest", label: dictionary.filters.newest },
    { value: "price-asc", label: dictionary.filters.priceLowHigh },
    { value: "price-desc", label: dictionary.filters.priceHighLow },
    { value: "best-selling", label: dictionary.filters.bestSelling },
  ];

  const categoryOptions = [
    { value: "", label: "All Categories" },
    ...categories.map((cat) => ({ value: cat.slug, label: cat.name })),
  ];

  const hasActiveFilters = selectedCategory || sortBy !== "newest";

  return (
    <>
      {/* Mobile filter button */}
      <div className="flex items-center justify-between gap-4 md:hidden">
        <Button
          variant="outline"
          onClick={() => setIsMobileFiltersOpen(true)}
          className="flex-1"
        >
          <SlidersHorizontal className="mr-2 h-4 w-4" />
          {dictionary.filters.filters}
        </Button>
        <Select
          options={sortOptions}
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
          className="flex-1"
        />
      </div>

      {/* Desktop filters */}
      <div className="hidden items-center justify-between gap-4 md:flex">
        <div className="flex items-center gap-4">
          <Select
            label={dictionary.filters.categories}
            options={categoryOptions}
            value={selectedCategory || ""}
            onChange={(e) => onCategoryChange(e.target.value)}
          />
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={onClearFilters}>
              <X className="mr-1 h-4 w-4" />
              {dictionary.filters.clearAll}
            </Button>
          )}
        </div>
        <Select
          label={dictionary.filters.sortBy}
          options={sortOptions}
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
        />
      </div>

      {/* Mobile filters drawer */}
      {isMobileFiltersOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsMobileFiltersOpen(false)}
          />
          <div className="absolute bottom-0 left-0 right-0 max-h-[80vh] overflow-y-auto rounded-t-xl bg-white p-4">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">{dictionary.filters.filters}</h2>
              <button
                type="button"
                onClick={() => setIsMobileFiltersOpen(false)}
                className="p-2"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <Select
                label={dictionary.filters.categories}
                options={categoryOptions}
                value={selectedCategory || ""}
                onChange={(e) => onCategoryChange(e.target.value)}
              />
              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={onClearFilters}
                  className="flex-1"
                >
                  {dictionary.filters.clearAll}
                </Button>
                <Button
                  onClick={() => setIsMobileFiltersOpen(false)}
                  className="flex-1"
                >
                  {dictionary.filters.apply}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
