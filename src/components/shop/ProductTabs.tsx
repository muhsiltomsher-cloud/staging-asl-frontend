"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { WCProductAttribute } from "@/types/woocommerce";

interface ProductTabsProps {
  description: string;
  attributes: WCProductAttribute[];
  isRTL: boolean;
}

type TabId = "description" | "additional";

export function ProductTabs({
  description,
  attributes,
  isRTL,
}: ProductTabsProps) {
  const [activeTab, setActiveTab] = useState<TabId>("description");

  const tabs: { id: TabId; label: string; labelAr: string }[] = [
    { id: "description", label: "Description", labelAr: "الوصف" },
    { id: "additional", label: "Additional Information", labelAr: "معلومات إضافية" },
  ];

  const hasDescription = description && description.trim() !== "" && description !== "<p></p>";
  const hasAttributes = attributes && attributes.length > 0;

  if (!hasDescription && !hasAttributes) {
    return null;
  }

  return (
    <div className="mt-12 border-t border-amber-100 pt-8">
      <div className="flex border-b border-amber-200">
        {tabs.map((tab) => {
          if (tab.id === "description" && !hasDescription) return null;
          if (tab.id === "additional" && !hasAttributes) return null;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "relative px-6 py-3 text-sm font-medium transition-colors",
                activeTab === tab.id
                  ? "text-amber-900"
                  : "text-gray-500 hover:text-gray-700"
              )}
            >
              {isRTL ? tab.labelAr : tab.label}
              {activeTab === tab.id && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-700" />
              )}
            </button>
          );
        })}
      </div>

      <div className="py-6">
        {activeTab === "description" && hasDescription && (
          <div
            className="prose prose-amber max-w-none prose-headings:text-amber-900 prose-p:text-gray-700 prose-strong:text-amber-800 prose-li:text-gray-700"
            dangerouslySetInnerHTML={{ __html: description }}
          />
        )}

        {activeTab === "additional" && hasAttributes && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <tbody className="divide-y divide-amber-100">
                {attributes.map((attr) => (
                  <tr key={attr.id}>
                    <th className="py-3 pe-4 text-start text-sm font-medium text-amber-900 w-1/3">
                      {attr.name}
                    </th>
                    <td className="py-3 text-sm text-gray-700">
                      {attr.terms.map((term) => term.name).join(", ")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
