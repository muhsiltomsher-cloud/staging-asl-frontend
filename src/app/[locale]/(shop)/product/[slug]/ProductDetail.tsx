"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, Truck, Shield, RotateCcw, Minus, Plus, Tag } from "lucide-react";
import { Button } from "@/components/common/Button";
import { Badge } from "@/components/common/Badge";
import { FormattedPrice } from "@/components/common/FormattedPrice";
import { ProductTabs } from "@/components/shop/ProductTabs";
import { RelatedProducts } from "@/components/shop/RelatedProducts";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { useAuth } from "@/contexts/AuthContext";
import type { WCProduct } from "@/types/woocommerce";
import type { Locale } from "@/config/site";

interface ProductDetailProps {
  product: WCProduct;
  locale: Locale;
  relatedProducts?: WCProduct[];
}

export function ProductDetail({ product, locale, relatedProducts = [] }: ProductDetailProps) {
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isAddingToWishlist, setIsAddingToWishlist] = useState(false);
  const { addToCart } = useCart();
  const { addToWishlist, isInWishlist } = useWishlist();
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const isRTL = locale === "ar";

  const primaryCategory = product.categories?.[0];
  const breadcrumbItems = [
    { name: isRTL ? "المتجر" : "Shop", href: `/${locale}/shop` },
    ...(primaryCategory ? [{ name: primaryCategory.name, href: `/${locale}/category/${primaryCategory.slug}` }] : []),
    { name: product.name, href: `/${locale}/product/${product.slug}` },
  ];

  const handleAddToCart = async () => {
    setIsAddingToCart(true);
    try {
      await addToCart(product.id, quantity);
    } catch (error) {
      console.error("Failed to add to cart:", error);
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleAddToWishlist = async () => {
    if (!isAuthenticated) {
      router.push(`/${locale}/login`);
      return;
    }
    
    setIsAddingToWishlist(true);
    try {
      await addToWishlist(product.id);
    } catch (error) {
      console.error("Failed to add to wishlist:", error);
    } finally {
      setIsAddingToWishlist(false);
    }
  };

  const isOutOfStock = !product.is_in_stock;
  const mainImage = product.images[selectedImage] || product.images[0];

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumbs items={breadcrumbItems} locale={locale} />

      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        {/* Product Gallery */}
        <div className="space-y-4">
          {/* Main Image */}
          <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
            {mainImage ? (
              <Image
                src={mainImage.src}
                alt={mainImage.alt || product.name}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
                priority
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <span className="text-gray-400">No image</span>
              </div>
            )}
          </div>

          {/* Thumbnail Gallery */}
          {product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {product.images.map((image, index) => (
                <button
                  key={image.id}
                  type="button"
                  onClick={() => setSelectedImage(index)}
                  className={`relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border-2 ${
                    selectedImage === index
                      ? "border-black"
                      : "border-transparent"
                  }`}
                >
                  <Image
                    src={image.thumbnail || image.src}
                    alt={image.alt || `${product.name} ${index + 1}`}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          {/* Category - Clickable for SEO */}
          {primaryCategory && (
            <Link 
              href={`/${locale}/category/${primaryCategory.slug}`}
              className="inline-block text-sm text-amber-700 hover:text-amber-900 hover:underline transition-colors"
            >
              {primaryCategory.name}
            </Link>
          )}

          {/* Title */}
          <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>

          {/* Price */}
          <div className="flex items-center gap-3">
            {product.on_sale ? (
              <>
                <FormattedPrice
                  price={parseInt(product.prices.price) / Math.pow(10, product.prices.currency_minor_unit)}
                  className="text-2xl font-bold text-amber-900"
                  iconSize="lg"
                />
                <FormattedPrice
                  price={parseInt(product.prices.regular_price) / Math.pow(10, product.prices.currency_minor_unit)}
                  className="text-lg text-gray-400"
                  iconSize="md"
                  strikethrough
                />
                <Badge variant="error">{isRTL ? "تخفيض" : "Sale"}</Badge>
              </>
            ) : (
              <FormattedPrice
                price={parseInt(product.prices.price) / Math.pow(10, product.prices.currency_minor_unit)}
                className="text-2xl font-bold text-amber-900"
                iconSize="lg"
              />
            )}
          </div>

          {/* Stock status */}
          <div className="flex items-center gap-2">
            {isOutOfStock ? (
              <Badge variant="error">
                {isRTL ? "غير متوفر" : "Out of Stock"}
              </Badge>
            ) : (
              <Badge variant="success">{isRTL ? "متوفر" : "In Stock"}</Badge>
            )}
            {product.low_stock_remaining && product.low_stock_remaining < 10 && (
              <span className="text-sm text-orange-600">
                {isRTL
                  ? `${product.low_stock_remaining} قطع متبقية فقط`
                  : `Only ${product.low_stock_remaining} left`}
              </span>
            )}
          </div>

          {/* Short description */}
          {product.short_description && (
            <div
              className="prose prose-sm prose-amber max-w-none prose-p:text-gray-600 prose-p:leading-relaxed prose-a:text-amber-700 prose-a:no-underline hover:prose-a:underline"
              dangerouslySetInnerHTML={{ __html: product.short_description }}
            />
          )}

          {/* Quantity and Add to Cart - Unified Design */}
          <div className="flex flex-wrap items-stretch gap-3">
            {/* Quantity Selector - Custom inline design */}
            <div className="flex items-center rounded-lg border border-gray-200 bg-white">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={isOutOfStock || quantity <= 1}
                className="flex h-12 w-12 items-center justify-center text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label={isRTL ? "تقليل الكمية" : "Decrease quantity"}
              >
                <Minus className="h-4 w-4" />
              </button>
              <input
                type="number"
                value={quantity}
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 1;
                  const max = product.add_to_cart.maximum || 99;
                  setQuantity(Math.min(Math.max(1, val), max));
                }}
                disabled={isOutOfStock}
                className="h-12 w-14 border-x border-gray-200 bg-transparent text-center text-sm font-medium text-gray-900 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                min={1}
                max={product.add_to_cart.maximum || 99}
              />
              <button
                type="button"
                onClick={() => setQuantity(Math.min(quantity + 1, product.add_to_cart.maximum || 99))}
                disabled={isOutOfStock || quantity >= (product.add_to_cart.maximum || 99)}
                className="flex h-12 w-12 items-center justify-center text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label={isRTL ? "زيادة الكمية" : "Increase quantity"}
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            {/* Add to Cart Button */}
            <Button
              onClick={handleAddToCart}
              isLoading={isAddingToCart}
              disabled={isOutOfStock || !product.is_purchasable}
              size="lg"
              className="h-12 flex-1 px-8 md:flex-none"
            >
              {isRTL ? "أضف إلى السلة" : "Add to Cart"}
            </Button>

            {/* Wishlist Button - Matching height */}
            <button
              type="button"
              onClick={handleAddToWishlist}
              disabled={isAddingToWishlist}
              className={`flex h-12 w-12 items-center justify-center rounded-lg border transition-all ${
                isInWishlist(product.id)
                  ? "border-red-300 bg-red-50 text-red-500 hover:bg-red-100"
                  : "border-gray-200 bg-white text-gray-500 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-700"
              } ${isAddingToWishlist ? "cursor-not-allowed opacity-50" : ""}`}
              aria-label={isRTL ? "أضف إلى المفضلة" : "Add to wishlist"}
            >
              <Heart className={`h-5 w-5 ${isInWishlist(product.id) ? "fill-current" : ""}`} />
            </button>
          </div>

          {/* SKU & Tags */}
          <div className="space-y-3">
            {product.sku && (
              <p className="text-sm text-gray-500">
                {isRTL ? "رمز المنتج" : "SKU"}: {product.sku}
              </p>
            )}
            
            {/* Tags */}
            {product.tags && product.tags.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="flex items-center gap-1 text-sm text-gray-500">
                  <Tag className="h-4 w-4" />
                  {isRTL ? "الوسوم:" : "Tags:"}
                </span>
                {product.tags.map((tag) => (
                  <span
                    key={tag.id}
                    className="inline-flex items-center rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-800 ring-1 ring-inset ring-amber-600/20 transition-colors hover:bg-amber-100"
                  >
                    {tag.name}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Features */}
          <div className="grid gap-4 border-t border-amber-100 pt-6 sm:grid-cols-3">
            <div className="flex items-center gap-3 rounded-lg bg-amber-50 p-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
                <Truck className="h-5 w-5 text-amber-700" />
              </div>
              <span className="text-sm font-medium text-amber-900">
                {isRTL ? "شحن مجاني" : "Free Shipping"}
              </span>
            </div>
            <div className="flex items-center gap-3 rounded-lg bg-amber-50 p-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
                <Shield className="h-5 w-5 text-amber-700" />
              </div>
              <span className="text-sm font-medium text-amber-900">
                {isRTL ? "منتج أصلي" : "Authentic Product"}
              </span>
            </div>
            <div className="flex items-center gap-3 rounded-lg bg-amber-50 p-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
                <RotateCcw className="h-5 w-5 text-amber-700" />
              </div>
              <span className="text-sm font-medium text-amber-900">
                {isRTL ? "إرجاع سهل" : "Easy Returns"}
              </span>
            </div>
          </div>

        </div>
      </div>

      {/* Product Tabs - Description & Additional Information */}
      <ProductTabs
        description={product.description}
        attributes={product.attributes}
        isRTL={isRTL}
      />

      {/* Related Products */}
      <RelatedProducts
        products={relatedProducts}
        currentProductId={product.id}
        locale={locale}
      />
    </div>
  );
}
