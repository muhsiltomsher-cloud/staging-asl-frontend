"use client";

import { useState } from "react";
import { Heart, Truck, Shield, RotateCcw } from "lucide-react";
import { Button } from "@/components/common/Button";
import { Badge } from "@/components/common/Badge";
import { QuantitySelector } from "@/components/shop/QuantitySelector";
import { ProductGallery } from "@/components/shop/ProductGallery";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useCart } from "@/contexts/CartContext";
import type { Locale } from "@/config/site";

// This is a client component for interactivity
// In production, you would fetch product data server-side

interface ProductPageProps {
  params: { locale: string; slug: string };
}

export default function ProductPage({ params }: ProductPageProps) {
  const { locale, slug } = params;
  const { formatPrice } = useCurrency();
  const { addToCart, isLoading } = useCart();
  const [quantity, setQuantity] = useState(1);
  const isRTL = locale === "ar";

  // Placeholder product data - in production, fetch from GraphQL
  const product = {
    id: "1",
    databaseId: 1,
    name: isRTL ? "عطر فاخر" : "Premium Fragrance",
    slug: slug,
    description: isRTL
      ? "عطر فاخر مصنوع من أجود المكونات الطبيعية. يتميز برائحة فريدة تدوم طويلاً."
      : "A premium fragrance crafted from the finest natural ingredients. Features a unique scent that lasts long.",
    shortDescription: isRTL
      ? "عطر فاخر برائحة مميزة"
      : "Premium fragrance with a distinctive scent",
    sku: "ASL-001",
    price: "150",
    regularPrice: "200",
    salePrice: "150",
    onSale: true,
    stockStatus: "IN_STOCK" as const,
    stockQuantity: 10,
    image: null,
    galleryImages: { nodes: [] },
    productCategories: {
      nodes: [{ id: "1", databaseId: 1, name: isRTL ? "عطور" : "Perfumes", slug: "perfumes", description: "" }],
    },
    attributes: { nodes: [] },
  };

  const breadcrumbItems = [
    { name: isRTL ? "المتجر" : "Shop", href: `/${locale}/shop` },
    { name: product.name, href: `/${locale}/product/${slug}` },
  ];

  const handleAddToCart = async () => {
    await addToCart(product.databaseId, quantity);
  };

  const isOutOfStock = product.stockStatus === "OUT_OF_STOCK";

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumbs items={breadcrumbItems} locale={locale as Locale} />

      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        {/* Product Gallery */}
        <div>
          <ProductGallery
            images={product.galleryImages.nodes}
            productName={product.name}
          />
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          {/* Category */}
          {product.productCategories?.nodes?.[0] && (
            <p className="text-sm text-gray-500">
              {product.productCategories.nodes[0].name}
            </p>
          )}

          {/* Title */}
          <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>

          {/* Price */}
          <div className="flex items-center gap-3">
            {product.onSale && product.salePrice ? (
              <>
                <span className="text-2xl font-bold text-gray-900">
                  {formatPrice(product.salePrice)}
                </span>
                <span className="text-lg text-gray-500 line-through">
                  {formatPrice(product.regularPrice)}
                </span>
                <Badge variant="error">
                  {isRTL ? "تخفيض" : "Sale"}
                </Badge>
              </>
            ) : (
              <span className="text-2xl font-bold text-gray-900">
                {formatPrice(product.price)}
              </span>
            )}
          </div>

          {/* Stock status */}
          <div className="flex items-center gap-2">
            {isOutOfStock ? (
              <Badge variant="error">{isRTL ? "غير متوفر" : "Out of Stock"}</Badge>
            ) : (
              <Badge variant="success">{isRTL ? "متوفر" : "In Stock"}</Badge>
            )}
            {product.stockQuantity && product.stockQuantity < 10 && (
              <span className="text-sm text-orange-600">
                {isRTL
                  ? `${product.stockQuantity} قطع متبقية فقط`
                  : `Only ${product.stockQuantity} left`}
              </span>
            )}
          </div>

          {/* Short description */}
          <p className="text-gray-600">{product.shortDescription}</p>

          {/* Quantity and Add to Cart */}
          <div className="flex flex-wrap items-center gap-4">
            <QuantitySelector
              quantity={quantity}
              onChange={setQuantity}
              max={product.stockQuantity || 99}
              disabled={isOutOfStock}
            />
            <Button
              onClick={handleAddToCart}
              isLoading={isLoading}
              disabled={isOutOfStock}
              size="lg"
              className="flex-1 md:flex-none"
            >
              {isRTL ? "أضف إلى السلة" : "Add to Cart"}
            </Button>
            <button
              type="button"
              className="rounded-md border border-gray-300 p-3 text-gray-600 hover:bg-gray-50"
              aria-label={isRTL ? "أضف إلى المفضلة" : "Add to wishlist"}
            >
              <Heart className="h-5 w-5" />
            </button>
          </div>

          {/* SKU */}
          {product.sku && (
            <p className="text-sm text-gray-500">
              {isRTL ? "رمز المنتج" : "SKU"}: {product.sku}
            </p>
          )}

          {/* Features */}
          <div className="grid gap-4 border-t pt-6 sm:grid-cols-3">
            <div className="flex items-center gap-3">
              <Truck className="h-5 w-5 text-gray-600" />
              <span className="text-sm text-gray-600">
                {isRTL ? "شحن مجاني" : "Free Shipping"}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-gray-600" />
              <span className="text-sm text-gray-600">
                {isRTL ? "منتج أصلي" : "Authentic Product"}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <RotateCcw className="h-5 w-5 text-gray-600" />
              <span className="text-sm text-gray-600">
                {isRTL ? "إرجاع سهل" : "Easy Returns"}
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="border-t pt-6">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              {isRTL ? "الوصف" : "Description"}
            </h2>
            <div
              className="prose prose-gray max-w-none"
              dangerouslySetInnerHTML={{ __html: product.description }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
