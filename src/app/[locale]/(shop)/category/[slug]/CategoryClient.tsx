"use client";

import { ProductListing } from "@/components/shop/ProductListing";
import type { WCProduct } from "@/types/woocommerce";
import type { Locale } from "@/config/site";

interface CategoryClientProps {
  products: WCProduct[];
  locale: Locale;
  bundleProductSlugs?: string[];
}

export function CategoryClient({ products, locale, bundleProductSlugs = [] }: CategoryClientProps) {
  return (
    <ProductListing
      products={products}
      locale={locale}
      showToolbar={true}
      bundleProductSlugs={bundleProductSlugs}
    />
  );
}
