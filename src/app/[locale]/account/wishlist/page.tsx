"use client";

import { useEffect, use } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Heart, ShoppingCart, Trash2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/common/Button";

interface WishlistPageProps {
  params: Promise<{ locale: string }>;
}

const translations = {
  en: {
    wishlist: "Wishlist",
    backToAccount: "Back to Account",
    emptyWishlist: "Your wishlist is empty",
    startShopping: "Start Shopping",
    addToCart: "Add to Cart",
    remove: "Remove",
    notLoggedIn: "Please log in to view your wishlist",
    login: "Login",
    loading: "Loading wishlist...",
    addedToCart: "Added to cart",
  },
  ar: {
    wishlist: "قائمة الرغبات",
    backToAccount: "العودة إلى الحساب",
    emptyWishlist: "قائمة رغباتك فارغة",
    startShopping: "ابدأ التسوق",
    addToCart: "أضف إلى السلة",
    remove: "إزالة",
    notLoggedIn: "يرجى تسجيل الدخول لعرض قائمة رغباتك",
    login: "تسجيل الدخول",
    loading: "جاري تحميل قائمة الرغبات...",
    addedToCart: "تمت الإضافة إلى السلة",
  },
};

export default function WishlistPage({ params }: WishlistPageProps) {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { wishlistItems, isLoading: wishlistLoading, removeFromWishlist, refreshWishlist } = useWishlist();
  const { addToCart, isLoading: cartLoading } = useCart();

  const resolvedParams = use(params);
  const locale = resolvedParams.locale as "en" | "ar";
  const t = translations[locale] || translations.en;
  const isRTL = locale === "ar";

  useEffect(() => {
    if (isAuthenticated) {
      refreshWishlist();
    }
  }, [isAuthenticated, refreshWishlist]);

  const handleAddToCart = async (productId: number) => {
    try {
      await addToCart(productId, 1);
    } catch (error) {
      console.error("Failed to add to cart:", error);
    }
  };

  const handleRemove = async (productId: number) => {
    try {
      await removeFromWishlist(productId);
    } catch (error) {
      console.error("Failed to remove from wishlist:", error);
    }
  };

  const formatPrice = (price: string) => {
    const numPrice = parseFloat(price);
    return new Intl.NumberFormat(locale === "ar" ? "ar-SA" : "en-SA", {
      style: "currency",
      currency: "SAR",
    }).format(numPrice);
  };

  if (authLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 w-48 bg-gray-200 rounded mb-8" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 bg-gray-200 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-md text-center">
          <div className="mb-6 flex justify-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-gray-100 to-gray-200">
              <Heart className="h-12 w-12 text-gray-400" />
            </div>
          </div>
          <p className="mb-8 text-gray-500">{t.notLoggedIn}</p>
          <Button asChild variant="primary" size="lg">
            <Link href={`/${locale}/login`}>{t.login}</Link>
          </Button>
        </div>
      </div>
    );
  }

  const isLoading = wishlistLoading;

  return (
    <div className="container mx-auto px-4 py-8" dir={isRTL ? "rtl" : "ltr"}>
      <div className="mb-8">
        <Link
          href={`/${locale}/account`}
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className={`h-4 w-4 ${isRTL ? "rotate-180" : ""}`} />
          {t.backToAccount}
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">
          {t.wishlist}
        </h1>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin h-8 w-8 border-4 border-gray-300 border-t-black rounded-full mx-auto mb-4" />
          <p className="text-gray-500">{t.loading}</p>
        </div>
      ) : wishlistItems.length === 0 ? (
        <div className="text-center py-12">
          <div className="mb-6 flex justify-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-gray-100 to-gray-200">
              <Heart className="h-12 w-12 text-gray-400" />
            </div>
          </div>
          <h3 className="mb-2 text-lg font-semibold text-gray-900">
            {t.wishlist}
          </h3>
          <p className="mb-8 text-gray-500">{t.emptyWishlist}</p>
          <Button asChild variant="primary" size="lg">
            <Link href={`/${locale}/shop`}>{t.startShopping}</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {wishlistItems.map((item) => (
            <div
              key={item.product_id}
              className="group rounded-xl border border-gray-200 bg-white overflow-hidden transition-all hover:shadow-md"
            >
              <div className="relative aspect-square bg-gray-100">
                {item.product_image ? (
                  <Image
                    src={item.product_image}
                    alt={item.product_name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <Heart className="h-12 w-12 text-gray-300" />
                  </div>
                )}
                <button
                  onClick={() => handleRemove(item.product_id)}
                  className="absolute top-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-md hover:bg-red-50 transition-colors"
                  aria-label={t.remove}
                >
                  <Trash2 className="h-4 w-4 text-gray-600 hover:text-red-500" />
                </button>
              </div>

              <div className="p-4">
                <h3 className="font-medium text-gray-900 line-clamp-2 mb-2">
                  {item.product_name}
                </h3>
                <p className="text-lg font-semibold text-gray-900 mb-4">
                  {formatPrice(item.product_price)}
                </p>
                <Button
                  variant="primary"
                  size="sm"
                  className="w-full"
                  onClick={() => handleAddToCart(item.product_id)}
                  disabled={cartLoading}
                >
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  {t.addToCart}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
