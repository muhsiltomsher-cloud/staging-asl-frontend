"use client";

import { useState } from "react";
import { BundleManager } from "@/components/bundle-manager";
import { useNotification } from "@/contexts/NotificationContext";
import type { BundleConfiguration } from "@/types/bundle";
import type { WCCategory, WCProduct } from "@/types/woocommerce";
import type { Locale } from "@/config/site";

interface BundleManagerClientProps {
  locale: Locale;
  categories: WCCategory[];
  products: WCProduct[];
  tags: { id: number; name: string }[];
  productId?: number;
  initialConfig?: BundleConfiguration;
}

export function BundleManagerClient({
  locale,
  categories,
  products,
  tags,
  productId,
  initialConfig,
}: BundleManagerClientProps) {
  const isRTL = locale === "ar";
  const { notify } = useNotification();
  const [savedConfig, setSavedConfig] = useState<BundleConfiguration | undefined>(initialConfig);

  const handleSave = async (config: BundleConfiguration) => {
    try {
      const response = await fetch("/api/bundles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(config),
      });

      if (!response.ok) {
        throw new Error("Failed to save bundle configuration");
      }

      const savedData = await response.json();
      setSavedConfig(savedData);
      notify(
        "success",
        isRTL ? "تم حفظ تكوين الحزمة بنجاح" : "Bundle configuration saved successfully"
      );
    } catch (error) {
      console.error("Failed to save bundle:", error);
      notify(
        "error",
        isRTL ? "فشل في حفظ تكوين الحزمة" : "Failed to save bundle configuration"
      );
      throw error;
    }
  };

  return (
    <BundleManager
      locale={locale}
      categories={categories}
      products={products}
      tags={tags}
      productId={productId}
      initialConfig={savedConfig}
      onSave={handleSave}
    />
  );
}
