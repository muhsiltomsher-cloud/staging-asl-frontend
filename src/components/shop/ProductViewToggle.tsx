"use client";

import { useState, useRef, useEffect } from "react";
import { Grid2X2, Grid3X3, LayoutGrid, List, Columns4, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export type ViewMode = "grid" | "list";
export type GridColumns = 2 | 3 | 4 | 5;
export type SortOption = "default" | "price-asc" | "price-desc" | "name-asc" | "name-desc" | "date-desc";

interface ProductViewToggleProps {
  viewMode: ViewMode;
  gridColumns: GridColumns;
  onViewModeChange: (mode: ViewMode) => void;
  onGridColumnsChange: (columns: GridColumns) => void;
  locale: "en" | "ar";
  className?: string;
  productCount?: number;
  sortBy?: SortOption;
  onSortChange?: (sort: SortOption) => void;
}

export function ProductViewToggle({
  viewMode,
  gridColumns,
  onViewModeChange,
  onGridColumnsChange,
  locale,
  className,
  productCount,
  sortBy = "default",
  onSortChange,
}: ProductViewToggleProps) {
  const isRTL = locale === "ar";
  const [isSortOpen, setIsSortOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setIsSortOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const translations = {
    en: {
      grid: "Grid",
      list: "List",
      columns: "Columns",
      products: "Products",
      product: "Product",
      sortBy: "Sort by",
      default: "Default",
      priceAsc: "Price: Low to High",
      priceDesc: "Price: High to Low",
      nameAsc: "Name: A to Z",
      nameDesc: "Name: Z to A",
      dateDesc: "Newest First",
    },
    ar: {
      grid: "شبكة",
      list: "قائمة",
      columns: "الأعمدة",
      products: "منتجات",
      product: "منتج",
      sortBy: "ترتيب حسب",
      default: "الافتراضي",
      priceAsc: "السعر: من الأقل للأعلى",
      priceDesc: "السعر: من الأعلى للأقل",
      nameAsc: "الاسم: أ إلى ي",
      nameDesc: "الاسم: ي إلى أ",
      dateDesc: "الأحدث أولاً",
    },
  };

  const t = translations[locale];

  const sortOptions: { value: SortOption; label: string }[] = [
    { value: "default", label: t.default },
    { value: "price-asc", label: t.priceAsc },
    { value: "price-desc", label: t.priceDesc },
    { value: "name-asc", label: t.nameAsc },
    { value: "name-desc", label: t.nameDesc },
    { value: "date-desc", label: t.dateDesc },
  ];

  const currentSortLabel = sortOptions.find(opt => opt.value === sortBy)?.label || t.default;

  const gridOptions: { columns: GridColumns; icon: React.ReactNode }[] = [
    { columns: 2, icon: <Grid2X2 className="h-4 w-4" /> },
    { columns: 3, icon: <Grid3X3 className="h-4 w-4" /> },
    { columns: 4, icon: <LayoutGrid className="h-4 w-4" /> },
    { columns: 5, icon: <Columns4 className="h-4 w-4" /> },
  ];

  return (
    <div 
      className={cn(
        "flex flex-wrap items-center justify-between gap-4 rounded-xl border border-gray-100 bg-white px-4 py-3 shadow-sm",
        className
      )} 
      dir={isRTL ? "rtl" : "ltr"}
    >
      {/* Left: Product Count */}
      <div className="flex items-center">
        {productCount !== undefined && (
          <span className="text-sm font-medium text-gray-700">
            {productCount} {productCount === 1 ? t.product : t.products}
          </span>
        )}
      </div>

      {/* Center: View Mode + Grid Columns */}
      <div className="flex items-center gap-3">
        {/* View Mode Toggle */}
        <div className="flex items-center rounded-lg border border-gray-200 bg-gray-50 p-1">
          <button
            type="button"
            onClick={() => onViewModeChange("grid")}
            className={cn(
              "flex items-center justify-center rounded-md p-2 transition-all",
              viewMode === "grid"
                ? "bg-white text-amber-700 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            )}
            aria-label={t.grid}
            title={t.grid}
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange("list")}
            className={cn(
              "flex items-center justify-center rounded-md p-2 transition-all",
              viewMode === "list"
                ? "bg-white text-amber-700 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            )}
            aria-label={t.list}
            title={t.list}
          >
            <List className="h-4 w-4" />
          </button>
        </div>

        {/* Grid Columns Toggle (only show when in grid mode) */}
        {viewMode === "grid" && (
          <div className="flex items-center rounded-lg border border-gray-200 bg-gray-50 p-1">
            {gridOptions.map((option) => (
              <button
                key={option.columns}
                type="button"
                onClick={() => onGridColumnsChange(option.columns)}
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-md transition-all",
                  gridColumns === option.columns
                    ? "bg-white text-amber-700 shadow-sm"
                    : "text-gray-500 hover:text-gray-700",
                  option.columns === 5 && "hidden lg:flex"
                )}
                aria-label={`${option.columns} ${t.columns}`}
                title={`${option.columns} ${t.columns}`}
              >
                {option.icon}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Right: Sorting Dropdown */}
      <div className="relative" ref={sortRef}>
        <button
          type="button"
          onClick={() => setIsSortOpen(!isSortOpen)}
          className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-medium text-gray-700 transition-all hover:bg-gray-100"
        >
          <span className="hidden sm:inline">{t.sortBy}:</span>
          <span className="text-gray-900">{currentSortLabel}</span>
          <ChevronDown className={cn("h-4 w-4 text-gray-500 transition-transform", isSortOpen && "rotate-180")} />
        </button>

        {isSortOpen && (
          <div className={cn(
            "absolute top-full z-50 mt-1 min-w-[180px] rounded-lg border border-gray-200 bg-white py-1 shadow-lg",
            isRTL ? "left-0" : "right-0"
          )}>
            {sortOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onSortChange?.(option.value);
                  setIsSortOpen(false);
                }}
                className={cn(
                  "w-full px-4 py-2 text-sm transition-colors",
                  isRTL ? "text-right" : "text-left",
                  sortBy === option.value
                    ? "bg-amber-50 text-amber-800"
                    : "text-gray-700 hover:bg-gray-50"
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
