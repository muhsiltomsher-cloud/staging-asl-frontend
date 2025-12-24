"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Heart, Truck, Shield, RotateCcw } from "lucide-react";
import { Button } from "@/components/common/Button";
import { Badge } from "@/components/common/Badge";
import { FormattedPrice } from "@/components/common/FormattedPrice";
import { QuantitySelector } from "@/components/shop/QuantitySelector";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { useAuth } from "@/contexts/AuthContext";
import type { WCProduct } from "@/types/woocommerce";
import type { Locale } from "@/config/site";

interface ProductDetailProps {
  product: WCProduct;
  locale: Locale;
}

export function ProductDetail({ product, locale }: ProductDetailProps) {
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isAddingToWishlist, setIsAddingToWishlist] = useState(false);
  const { addToCart } = useCart();
  const { addToWishlist, isInWishlist } = useWishlist();
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const isRTL = locale === "ar";

  const breadcrumbItems = [
    { name: isRTL ? "المتجر" : "Shop", href: `/${locale}/shop` },
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
          {/* Category */}
          {product.categories?.[0] && (
            <p className="text-sm text-gray-500">{product.categories[0].name}</p>
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
              className="text-gray-600"
              dangerouslySetInnerHTML={{ __html: product.short_description }}
            />
          )}

          {/* Quantity and Add to Cart */}
          <div className="flex flex-wrap items-center gap-4">
            <QuantitySelector
              quantity={quantity}
              onChange={setQuantity}
              max={product.add_to_cart.maximum || 99}
              disabled={isOutOfStock}
            />
            <Button
              onClick={handleAddToCart}
              isLoading={isAddingToCart}
              disabled={isOutOfStock || !product.is_purchasable}
              size="lg"
              className="flex-1 md:flex-none"
            >
              {isRTL ? "أضف إلى السلة" : "Add to Cart"}
            </Button>
            <button
              type="button"
              onClick={handleAddToWishlist}
              disabled={isAddingToWishlist}
              className={`rounded-md border p-3 transition-colors ${
                isInWishlist(product.id)
                  ? "border-red-500 bg-red-50 text-red-500"
                  : "border-gray-300 text-gray-600 hover:bg-gray-50"
              } ${isAddingToWishlist ? "opacity-50 cursor-not-allowed" : ""}`}
              aria-label={isRTL ? "أضف إلى المفضلة" : "Add to wishlist"}
            >
              <Heart className={`h-5 w-5 ${isInWishlist(product.id) ? "fill-current" : ""}`} />
            </button>
          </div>

          {/* SKU */}
          {product.sku && (
            <p className="text-sm text-gray-500">
              {isRTL ? "رمز المنتج" : "SKU"}: {product.sku}
            </p>
          )}

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

          {/* Description */}
          {product.description && (
            <div className="border-t border-amber-100 pt-6">
              <h2 className="mb-4 text-lg font-semibold text-amber-900">
                {isRTL ? "الوصف" : "Description"}
              </h2>
              <div
                className="prose prose-amber max-w-none prose-headings:text-amber-900 prose-p:text-gray-700 prose-strong:text-amber-800"
                dangerouslySetInnerHTML={{ __html: product.description }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
