"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingBag, Heart, Eye } from "lucide-react";
import { Badge } from "@/components/common/Badge";
import { FormattedPrice } from "@/components/common/FormattedPrice";
import { cn, decodeHtmlEntities, getProductSlugFromPermalink, BLUR_DATA_URL } from "@/lib/utils";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { useAuth } from "@/contexts/AuthContext";
import type { WCProduct } from "@/types/woocommerce";
import type { Locale } from "@/config/site";

interface WCProductCardProps {
  product: WCProduct;
  locale: Locale;
  className?: string;
  bundleProductSlugs?: string[];
  englishSlug?: string;
}

export function WCProductCard({
  product,
  locale,
  className,
  bundleProductSlugs = [],
  englishSlug,
}: WCProductCardProps) {
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isAddingToWishlist, setIsAddingToWishlist] = useState(false);
  const [imageError, setImageError] = useState(false);
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
  
  // Use English slug for URL generation to ensure consistent URLs across locales
  // Priority: 1) explicitly passed englishSlug, 2) extract from permalink, 3) fallback to product.slug
  const productSlug = englishSlug || getProductSlugFromPermalink(product.permalink, product.slug);
  
  // Check if this product is a bundle product
  const isBundleProduct = bundleProductSlugs.includes(productSlug) || bundleProductSlugs.includes(product.slug);

  return (
    <article className={cn("group relative", className)}>
      <Link href={`/${locale}/product/${productSlug}`} className="block">
        <div className="relative aspect-square overflow-hidden rounded-xl bg-gradient-to-br from-amber-50 to-amber-100 shadow-sm transition-all duration-500 ease-out group-hover:shadow-[0_20px_50px_rgba(180,83,9,0.15)] group-hover:-translate-y-1">
          {mainImage && !imageError ? (
            <Image
              src={mainImage.src}
              alt={mainImage.alt || product.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-contain transition-transform duration-500 group-hover:scale-110"
              loading="lazy"
              placeholder="blur"
              blurDataURL={BLUR_DATA_URL}
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-amber-50 to-amber-100">
              <Image
                src="https://staging.aromaticscentslab.com/wp-content/uploads/2024/12/ASL-Logo-1.png"
                alt="Aromatic Scents Lab"
                width={80}
                height={80}
                className="object-contain opacity-40"
                unoptimized
              />
            </div>
          )}

          <div className={cn("absolute top-3 flex flex-col gap-1.5", isRTL ? "right-3" : "left-3")}>
            {product.on_sale && (
              <Badge variant="error" className="shadow-sm">
                {isRTL ? "تخفيض" : "Sale"}
              </Badge>
            )}
            {isOutOfStock && (
              <Badge variant="default" className="shadow-sm">
                {isRTL ? "غير متوفر" : "Out of Stock"}
              </Badge>
            )}
          </div>

          <div className={cn("absolute top-3 flex flex-col gap-2", isRTL ? "left-3" : "right-3")}>
            <button
              type="button"
              onClick={handleWishlistToggle}
              disabled={isAddingToWishlist}
              className={cn(
                "rounded-full p-2.5 shadow-lg transition-all duration-300",
                isWishlisted
                  ? "bg-[#c67a46]/10 text-[#c67a46] hover:bg-[#c67a46]/20"
                  : "bg-white/90 backdrop-blur-sm text-gray-600 hover:bg-white opacity-0 group-hover:opacity-100",
                isAddingToWishlist && "opacity-50 cursor-not-allowed"
              )}
              aria-label={isWishlisted ? (isRTL ? "إزالة من المفضلة" : "Remove from wishlist") : (isRTL ? "أضف إلى المفضلة" : "Add to wishlist")}
            >
              <Heart className={cn("h-4 w-4", isWishlisted && "fill-[#c67a46]")} />
            </button>
          </div>

          {!isOutOfStock && product.is_purchasable && (
            <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 translate-y-full transition-all duration-500 ease-out group-hover:opacity-100 group-hover:translate-y-0">
              {isBundleProduct ? (
                <span
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 text-sm font-medium uppercase tracking-wide text-white bg-[#C4885B] rounded-full shadow-lg transition-all duration-300 hover:text-[#C4885B] hover:bg-white/70 hover:backdrop-blur-md hover:border hover:border-[#C4885B]/30"
                >
                  <Eye className="h-4 w-4" />
                  {isRTL ? "تخصيص" : "Customize"}
                </span>
              ) : (
                <button
                  onClick={handleAddToCart}
                  disabled={isAddingToCart}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 text-sm font-medium uppercase tracking-wide text-white bg-[#C4885B] rounded-full shadow-lg transition-all duration-300 hover:text-[#C4885B] hover:bg-white/70 hover:backdrop-blur-md hover:border hover:border-[#C4885B]/30 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ShoppingBag className="h-4 w-4" />
                  {isAddingToCart ? (isRTL ? "جاري الإضافة..." : "Adding...") : (isRTL ? "أضف للسلة" : "Add to Cart")}
                </button>
              )}
            </div>
          )}
        </div>

        <div className="mt-4 space-y-2">
                                        {product.categories?.[0] && (
                                <p className="text-[10px] font-medium uppercase tracking-wider text-amber-600 md:text-xs">
                                  {decodeHtmlEntities(product.categories[0].name)}
                                </p>
                              )}

                              <h3 className="text-xs font-semibold text-gray-900 line-clamp-2 group-hover:text-amber-800 transition-colors uppercase md:text-sm">
                                {product.name}
                              </h3>

          <div className="flex items-center gap-2">
            {product.on_sale ? (
              <>
                <FormattedPrice
                  price={parseInt(product.prices.price) / Math.pow(10, product.prices.currency_minor_unit)}
                  className="text-sm font-bold text-amber-900"
                  iconSize="xs"
                />
                <FormattedPrice
                  price={parseInt(product.prices.regular_price) / Math.pow(10, product.prices.currency_minor_unit)}
                  className="text-xs text-gray-400"
                  iconSize="xs"
                  strikethrough
                />
              </>
            ) : (
              <FormattedPrice
                price={parseInt(product.prices.price) / Math.pow(10, product.prices.currency_minor_unit)}
                className="text-sm font-bold text-amber-900"
                iconSize="xs"
              />
            )}
          </div>
        </div>
      </Link>
    </article>
  );
}
