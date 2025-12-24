"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingBag, Heart } from "lucide-react";
import { Badge } from "@/components/common/Badge";
import { Button } from "@/components/common/Button";
import { FormattedPrice } from "@/components/common/FormattedPrice";
import { cn } from "@/lib/utils";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { useAuth } from "@/contexts/AuthContext";
import type { WCProduct } from "@/types/woocommerce";
import type { Locale } from "@/config/site";

interface WCProductCardProps {
  product: WCProduct;
  locale: Locale;
  className?: string;
}

export function WCProductCard({
  product,
  locale,
  className,
}: WCProductCardProps) {
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isAddingToWishlist, setIsAddingToWishlist] = useState(false);
  const { addToCart } = useCart();
  const { addToWishlist, isInWishlist } = useWishlist();
  const { isAuthenticated } = useAuth();
  const router = useRouter();

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

  const handleAddToWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
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
  const mainImage = product.images[0];

  return (
    <article className={cn("group relative", className)}>
      <Link href={`/${locale}/product/${product.slug}`} className="block">
        {/* Image container */}
        <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
          {mainImage ? (
            <Image
              src={mainImage.src}
              alt={mainImage.alt || product.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <span className="text-gray-400">No image</span>
            </div>
          )}

          {/* Badges */}
          <div className="absolute left-2 top-2 flex flex-col gap-1">
            {product.on_sale && <Badge variant="error">Sale</Badge>}
            {isOutOfStock && <Badge variant="default">Out of Stock</Badge>}
          </div>

          {/* Quick actions */}
          <div className="absolute right-2 top-2 flex flex-col gap-2 opacity-0 transition-opacity group-hover:opacity-100">
            <button
              type="button"
              onClick={handleAddToWishlist}
              disabled={isAddingToWishlist}
              className={`rounded-full p-2 shadow-md transition-colors ${
                isInWishlist(product.id)
                  ? "bg-red-50 text-red-500"
                  : "bg-white hover:bg-gray-100"
              } ${isAddingToWishlist ? "opacity-50 cursor-not-allowed" : ""}`}
              aria-label="Add to wishlist"
            >
              <Heart className={`h-4 w-4 ${isInWishlist(product.id) ? "fill-current" : ""}`} />
            </button>
          </div>

          {/* Add to cart button */}
          {!isOutOfStock && product.is_purchasable && (
            <div className="absolute bottom-2 left-2 right-2 opacity-0 transition-opacity group-hover:opacity-100">
              <Button onClick={handleAddToCart} className="w-full" size="sm" isLoading={isAddingToCart}>
                <ShoppingBag className="mr-2 h-4 w-4" />
                Add to Cart
              </Button>
            </div>
          )}
        </div>

        {/* Product info */}
        <div className="mt-3 space-y-1">
          {/* Category */}
          {product.categories?.[0] && (
            <p className="text-xs text-gray-500">{product.categories[0].name}</p>
          )}

          {/* Name */}
          <h3 className="text-sm font-medium text-gray-900 line-clamp-2">
            {product.name}
          </h3>

          {/* Price */}
          <div className="flex items-center gap-2">
            {product.on_sale ? (
              <>
                <FormattedPrice
                  price={parseInt(product.prices.price) / Math.pow(10, product.prices.currency_minor_unit)}
                  className="text-sm font-semibold text-gray-900"
                  iconSize="xs"
                />
                <FormattedPrice
                  price={parseInt(product.prices.regular_price) / Math.pow(10, product.prices.currency_minor_unit)}
                  className="text-sm text-gray-500"
                  iconSize="xs"
                  strikethrough
                />
              </>
            ) : (
              <FormattedPrice
                price={parseInt(product.prices.price) / Math.pow(10, product.prices.currency_minor_unit)}
                className="text-sm font-semibold text-gray-900"
                iconSize="xs"
              />
            )}
          </div>
        </div>
      </Link>
    </article>
  );
}
