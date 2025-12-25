"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingBag, Heart } from "lucide-react";
import { Badge } from "@/components/common/Badge";
import { Button } from "@/components/common/Button";
import { FormattedPrice } from "@/components/common/FormattedPrice";
import { cn, decodeHtmlEntities } from "@/lib/utils";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { useAuth } from "@/contexts/AuthContext";
import type { WCProduct } from "@/types/woocommerce";
import type { Locale } from "@/config/site";

interface WCProductListCardProps {
  product: WCProduct;
  locale: Locale;
  className?: string;
}

export function WCProductListCard({
  product,
  locale,
  className,
}: WCProductListCardProps) {
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isAddingToWishlist, setIsAddingToWishlist] = useState(false);
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist, getWishlistItemId } = useWishlist();
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const isRTL = locale === "ar";

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsAddingToCart(true);
    try {
      await addToCart(product.id, 1);
    } catch (error) {
      console.error("Failed to add to cart:", error);
    } finally {
      setIsAddingToCart(false);
    }
  };

  const isWishlisted = isInWishlist(product.id);

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      router.push(`/${locale}/login`);
      return;
    }
    
    setIsAddingToWishlist(true);
    try {
      if (isWishlisted) {
        const itemId = getWishlistItemId(product.id);
        await removeFromWishlist(product.id, itemId);
      } else {
        await addToWishlist(product.id);
      }
    } catch (error) {
      console.error("Failed to update wishlist:", error);
    } finally {
      setIsAddingToWishlist(false);
    }
  };

  const isOutOfStock = !product.is_in_stock;
  const mainImage = product.images[0];

  const shortDescription = product.short_description
    ? product.short_description.replace(/<[^>]*>/g, "").slice(0, 150)
    : "";

  return (
    <article className={cn("group relative", className)}>
      <Link 
        href={`/${locale}/product/${product.slug}`} 
        className="flex gap-4 rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition-all duration-300 hover:border-amber-200 hover:shadow-md md:gap-6"
      >
        {/* Product Image */}
        <div className="relative h-32 w-32 flex-shrink-0 overflow-hidden rounded-lg bg-gradient-to-br from-amber-50 to-amber-100 md:h-40 md:w-40">
          {mainImage ? (
            <Image
              src={mainImage.src}
              alt={mainImage.alt || product.name}
              fill
              sizes="160px"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <span className="text-sm text-gray-400">{isRTL ? "لا توجد صورة" : "No image"}</span>
            </div>
          )}

          {/* Badges */}
          <div className={cn("absolute top-2 flex flex-col gap-1", isRTL ? "right-2" : "left-2")}>
            {product.on_sale && (
              <Badge variant="error" className="text-xs shadow-sm">
                {isRTL ? "تخفيض" : "Sale"}
              </Badge>
            )}
            {isOutOfStock && (
              <Badge variant="default" className="text-xs shadow-sm">
                {isRTL ? "غير متوفر" : "Out of Stock"}
              </Badge>
            )}
          </div>
        </div>

        {/* Product Info */}
        <div className="flex flex-1 flex-col justify-between">
          <div>
                        {/* Category */}
                        {product.categories?.[0] && (
                          <p className="mb-1 text-xs font-medium uppercase tracking-wider text-amber-600">
                            {decodeHtmlEntities(product.categories[0].name)}
                          </p>
                        )}

            {/* Name */}
            <h3 className="mb-2 text-base font-semibold text-gray-900 transition-colors group-hover:text-amber-800 md:text-lg">
              {product.name}
            </h3>

            {/* Description */}
            {shortDescription && (
              <p className="mb-3 hidden text-sm text-gray-500 line-clamp-2 md:block">
                {shortDescription}...
              </p>
            )}

            {/* Price */}
            <div className="flex items-center gap-2">
              {product.on_sale ? (
                <>
                  <FormattedPrice
                    price={parseInt(product.prices.price) / Math.pow(10, product.prices.currency_minor_unit)}
                    className="text-base font-bold text-amber-900 md:text-lg"
                    iconSize="sm"
                  />
                  <FormattedPrice
                    price={parseInt(product.prices.regular_price) / Math.pow(10, product.prices.currency_minor_unit)}
                    className="text-sm text-gray-400"
                    iconSize="xs"
                    strikethrough
                  />
                </>
              ) : (
                <FormattedPrice
                  price={parseInt(product.prices.price) / Math.pow(10, product.prices.currency_minor_unit)}
                  className="text-base font-bold text-amber-900 md:text-lg"
                  iconSize="sm"
                />
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="mt-4 flex items-center gap-2">
            {!isOutOfStock && product.is_purchasable && (
              <Button 
                onClick={handleAddToCart} 
                size="sm" 
                isLoading={isAddingToCart}
                className="shadow-sm"
              >
                <ShoppingBag className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
                {isRTL ? "أضف للسلة" : "Add to Cart"}
              </Button>
            )}
            <button
              type="button"
              onClick={handleWishlistToggle}
              disabled={isAddingToWishlist}
              className={cn(
                "rounded-lg border p-2 transition-all",
                isWishlisted
                  ? "border-red-200 bg-red-50 text-red-500 hover:bg-red-100"
                  : "border-gray-200 bg-white text-gray-500 hover:border-gray-300 hover:text-gray-700",
                isAddingToWishlist && "opacity-50 cursor-not-allowed"
              )}
              aria-label={isWishlisted ? (isRTL ? "إزالة من المفضلة" : "Remove from wishlist") : (isRTL ? "أضف إلى المفضلة" : "Add to wishlist")}
            >
              <Heart className={cn("h-4 w-4", isWishlisted && "fill-current")} />
            </button>
          </div>
        </div>
      </Link>
    </article>
  );
}
