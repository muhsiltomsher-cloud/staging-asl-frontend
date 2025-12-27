"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingBag, Heart } from "lucide-react";
import { Badge } from "@/components/common/Badge";
import { Button } from "@/components/common/Button";
import { FormattedPrice } from "@/components/common/FormattedPrice";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { cn } from "@/lib/utils";
import type { Product } from "@/types";
import type { Locale } from "@/config/site";

interface ProductCardProps {
  product: Product;
  locale: Locale;
  className?: string;
}

export function ProductCard({ product, locale, className }: ProductCardProps) {
  const { addToCart, isLoading } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist, isLoading: isWishlistLoading } = useWishlist();

  const isWishlisted = isInWishlist(product.databaseId);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await addToCart(product.databaseId);
  };

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isWishlisted) {
      await removeFromWishlist(product.databaseId);
    } else {
      await addToWishlist(product.databaseId);
    }
  };

  const isOutOfStock = product.stockStatus === "OUT_OF_STOCK";

  return (
    <article className={cn("group relative", className)}>
      <Link href={`/${locale}/product/${product.slug}`} className="block">
        {/* Image container */}
        <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
          {product.image ? (
            <Image
              src={product.image.sourceUrl}
              alt={product.image.altText || product.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <span className="text-gray-400">No image</span>
            </div>
          )}

          {/* Badges */}
          <div className="absolute left-2 top-2 flex flex-col gap-1">
            {product.onSale && <Badge variant="error">Sale</Badge>}
            {isOutOfStock && <Badge variant="default">Out of Stock</Badge>}
          </div>

                    {/* Quick actions */}
                    <div className="absolute right-2 top-2 flex flex-col gap-2">
                      <button
                        type="button"
                        onClick={handleWishlistToggle}
                        disabled={isWishlistLoading}
                        className={cn(
                          "rounded-full p-2 shadow-md transition-colors",
                          isWishlisted
                            ? "bg-[#c67a46]/10 text-[#c67a46] hover:bg-[#c67a46]/20"
                            : "bg-white text-gray-600 hover:bg-gray-100 opacity-0 group-hover:opacity-100"
                        )}
                        aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                      >
                        <Heart className={cn("h-4 w-4", isWishlisted && "fill-[#c67a46]")} />
                      </button>
                    </div>

          {/* Add to cart button */}
          {!isOutOfStock && (
            <div className="absolute bottom-2 left-2 right-2 opacity-0 transition-opacity group-hover:opacity-100">
              <Button
                onClick={handleAddToCart}
                isLoading={isLoading}
                className="w-full"
                size="sm"
              >
                <ShoppingBag className="mr-2 h-4 w-4" />
                Add to Cart
              </Button>
            </div>
          )}
        </div>

        {/* Product info */}
        <div className="mt-3 space-y-1">
          {/* Category */}
          {product.productCategories?.nodes?.[0] && (
            <p className="text-xs text-gray-500">
              {product.productCategories.nodes[0].name}
            </p>
          )}

          {/* Name */}
          <h3 className="text-sm font-medium text-gray-900 line-clamp-2 uppercase">
            {product.name}
          </h3>

          {/* Price */}
          <div className="flex items-center gap-2">
            {product.onSale && product.salePrice ? (
              <>
                <FormattedPrice
                  price={product.salePrice}
                  className="text-sm font-semibold text-gray-900"
                  iconSize="xs"
                />
                <FormattedPrice
                  price={product.regularPrice}
                  className="text-sm text-gray-500"
                  iconSize="xs"
                  strikethrough
                />
              </>
            ) : (
              <FormattedPrice
                price={product.price}
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
