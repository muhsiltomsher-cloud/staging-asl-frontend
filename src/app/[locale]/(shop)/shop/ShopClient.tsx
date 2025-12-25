"use client";

import { ProductListing } from "@/components/shop/ProductListing";
import type { WCProduct } from "@/types/woocommerce";
import type { Locale } from "@/config/site";

interface ShopClientProps {
  products: WCProduct[];
  locale: Locale;
}

export function ShopClient({ products, locale }: ShopClientProps) {
  return (
    <ProductListing
      products={products}
      locale={locale}
      showToolbar={true}
    />
  );
}
