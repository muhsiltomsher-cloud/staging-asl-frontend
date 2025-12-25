import { notFound } from "next/navigation";
import { getProductBySlug, getRelatedProducts, getProducts } from "@/lib/api/woocommerce";
import { generateMetadata as generateSeoMetadata } from "@/lib/utils/seo";
import { ProductDetail } from "./ProductDetail";
import { siteConfig, type Locale } from "@/config/site";
import type { Metadata } from "next";

// Increased revalidate time for better cache hit rates (5 minutes instead of 60 seconds)
export const revalidate = 300;

// Pre-render top products at build time for better performance
export async function generateStaticParams() {
  try {
    // Fetch top 50 products to pre-render
    const { products } = await getProducts({ per_page: 50 });
    
    // Generate params for each locale and product combination
    return products.flatMap((product) =>
      siteConfig.locales.map((locale) => ({
        locale,
        slug: product.slug,
      }))
    );
  } catch {
    // Return empty array if fetch fails - pages will be generated on-demand
    return [];
  }
}

interface ProductPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const product = await getProductBySlug(slug, locale as Locale);

  if (!product) {
    return generateSeoMetadata({
      title: "Product Not Found",
      description: "The requested product could not be found.",
      locale: locale as Locale,
      pathname: `/product/${slug}`,
    });
  }

  return generateSeoMetadata({
    title: product.name,
    description: product.short_description.replace(/<[^>]*>/g, "").slice(0, 160),
    locale: locale as Locale,
    pathname: `/product/${slug}`,
    image: product.images[0]?.src,
  });
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { locale, slug } = await params;
  const product = await getProductBySlug(slug, locale as Locale);

  if (!product) {
    notFound();
  }

  const relatedProducts = await getRelatedProducts(product, {
    per_page: 8,
    locale: locale as Locale,
  });

  return (
    <ProductDetail
      product={product}
      locale={locale as Locale}
      relatedProducts={relatedProducts}
    />
  );
}
