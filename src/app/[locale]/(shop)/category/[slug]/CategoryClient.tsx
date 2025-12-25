"use client";

import { ProductListing } from "@/components/shop/ProductListing";
import type { WCProduct } from "@/types/woocommerce";
import type { Locale } from "@/config/site";

interface CategoryClientProps {
  products: WCProduct[];
  locale: Locale;
}

export function CategoryClient({ products, locale }: CategoryClientProps) {
  return (
    <ProductListing
      products={products}
      locale={locale}
      showToolbar={true}
    />
  );
}
