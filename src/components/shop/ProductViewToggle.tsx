"use client";

import { Grid2X2, Grid3X3, LayoutGrid, List, Columns4 } from "lucide-react";
import { cn } from "@/lib/utils";

export type ViewMode = "grid" | "list";
export type GridColumns = 2 | 3 | 4 | 5;

interface ProductViewToggleProps {
  viewMode: ViewMode;
  gridColumns: GridColumns;
  onViewModeChange: (mode: ViewMode) => void;
  onGridColumnsChange: (columns: GridColumns) => void;
  locale: "en" | "ar";
  className?: string;
}

export function ProductViewToggle({
  viewMode,
  gridColumns,
  onViewModeChange,
  onGridColumnsChange,
  locale,
  className,
}: ProductViewToggleProps) {
  const isRTL = locale === "ar";

  const translations = {
    en: {
      view: "View",
      grid: "Grid",
      list: "List",
      columns: "Columns",
    },
    ar: {
      view: "العرض",
      grid: "شبكة",
      list: "قائمة",
      columns: "الأعمدة",
    },
  };

  const t = translations[locale];

  const gridOptions: { columns: GridColumns; icon: React.ReactNode; label: string }[] = [
    { columns: 2, icon: <Grid2X2 className="h-4 w-4" />, label: "2" },
    { columns: 3, icon: <Grid3X3 className="h-4 w-4" />, label: "3" },
    { columns: 4, icon: <LayoutGrid className="h-4 w-4" />, label: "4" },
    { columns: 5, icon: <Columns4 className="h-4 w-4" />, label: "5" },
  ];

  return (
    <div className={cn("flex flex-wrap items-center gap-4", className)} dir={isRTL ? "rtl" : "ltr"}>
      {/* View Mode Toggle */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-600">{t.view}:</span>
        <div className="flex rounded-lg border border-gray-200 bg-white p-1 shadow-sm">
          <button
            type="button"
            onClick={() => onViewModeChange("grid")}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-all",
              viewMode === "grid"
                ? "bg-amber-100 text-amber-800"
                : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
            )}
            aria-label={t.grid}
          >
            <LayoutGrid className="h-4 w-4" />
            <span className="hidden sm:inline">{t.grid}</span>
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange("list")}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-all",
              viewMode === "list"
                ? "bg-amber-100 text-amber-800"
                : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
            )}
            aria-label={t.list}
          >
            <List className="h-4 w-4" />
            <span className="hidden sm:inline">{t.list}</span>
          </button>
        </div>
      </div>

      {/* Grid Columns Toggle (only show when in grid mode) */}
      {viewMode === "grid" && (
        <div className="flex items-center gap-2">
          <span className="hidden text-sm font-medium text-gray-600 sm:inline">{t.columns}:</span>
          <div className="flex rounded-lg border border-gray-200 bg-white p-1 shadow-sm">
            {gridOptions.map((option) => (
              <button
                key={option.columns}
                type="button"
                onClick={() => onGridColumnsChange(option.columns)}
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-md text-sm font-medium transition-all",
                  gridColumns === option.columns
                    ? "bg-amber-100 text-amber-800"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-700",
                  option.columns === 5 && "hidden lg:flex"
                )}
                aria-label={`${option.columns} ${t.columns}`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
