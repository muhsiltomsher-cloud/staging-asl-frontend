"use client";

import { useState, useEffect } from "react";
import { Minus, Plus, Trash2, ShoppingBag, X, Gift } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/contexts/CartContext";
import { useFreeGift, NEW_GIFT_ADDED_EVENT } from "@/contexts/FreeGiftContext";
import { FormattedPrice } from "@/components/common/FormattedPrice";
import { BundleItemsList } from "@/components/cart/BundleItemsList";
import { CartItemSkeleton } from "@/components/common/Skeleton";
import MuiDrawer from "@mui/material/Drawer";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import { Button } from "@/components/common/Button";

interface MiniCartDrawerProps {
  locale: string;
  dictionary: {
    cart: string;
    emptyCart: string;
    continueShopping: string;
    subtotal: string;
    viewCart: string;
    checkout: string;
    remove: string;
  };
}

export function MiniCartDrawer({ locale, dictionary }: MiniCartDrawerProps) {
    const {
      cart,
      cartItems,
      cartSubtotal,
      isCartOpen,
      setIsCartOpen,
      isLoading,
      updateCartItem,
      removeCartItem,
    } = useCart();

    const { isFreeGiftItem, activeGifts, getGiftProgress } = useFreeGift();
    const giftProgress = getGiftProgress();

    const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set());
    const [newlyAddedGiftId, setNewlyAddedGiftId] = useState<number | null>(null);
    const isRTL = locale === "ar";

    // Listen for new gift added events to show highlight effect
    useEffect(() => {
      const handleNewGift = (event: CustomEvent<{ giftName: string; productId: number }>) => {
        setNewlyAddedGiftId(event.detail.productId);
        // Clear the highlight after 3 seconds
        setTimeout(() => {
          setNewlyAddedGiftId(null);
        }, 3000);
      };

      window.addEventListener(NEW_GIFT_ADDED_EVENT, handleNewGift as EventListener);
      return () => {
        window.removeEventListener(NEW_GIFT_ADDED_EVENT, handleNewGift as EventListener);
      };
    }, []);
  const currencyMinorUnit = cart?.currency?.currency_minor_unit ?? 2;
  const divisor = Math.pow(10, currencyMinorUnit);

  const handleQuantityChange = async (itemKey: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    setUpdatingItems(prev => new Set(prev).add(itemKey));
    try {
      await updateCartItem(itemKey, newQuantity);
    } catch (error) {
      console.error("Failed to update quantity:", error);
    } finally {
      setUpdatingItems(prev => {
        const next = new Set(prev);
        next.delete(itemKey);
        return next;
      });
    }
  };

  const handleRemoveItem = async (itemKey: string) => {
    try {
      await removeCartItem(itemKey);
    } catch (error) {
      console.error("Failed to remove item:", error);
    }
  };

  const cartFooter = cartItems.length > 0 ? (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-gray-600">{dictionary.subtotal}</span>
        <FormattedPrice
          price={parseFloat(cartSubtotal) / divisor}
          className="text-lg font-semibold"
          iconSize="sm"
        />
      </div>

      <div className="flex flex-col gap-3">
        <Button asChild variant="outline" size="lg" className="w-full">
          <Link href={`/${locale}/cart`} onClick={() => setIsCartOpen(false)}>
            {dictionary.viewCart}
          </Link>
        </Button>
        <Button asChild variant="primary" size="lg" className="w-full">
          <Link href={`/${locale}/checkout`} onClick={() => setIsCartOpen(false)}>
            {dictionary.checkout}
          </Link>
        </Button>
      </div>
    </div>
  ) : undefined;

  const renderEmptyCart = () => (
    <div className="flex flex-col items-center justify-center p-8 text-center h-full">
      <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-gray-100 to-gray-200">
        <ShoppingBag className="h-12 w-12 text-gray-400" />
      </div>
      <h3 className="mb-2 text-lg font-semibold text-gray-900">
        {dictionary.cart}
      </h3>
      <p className="mb-8 text-gray-500">{dictionary.emptyCart}</p>
      <Button asChild variant="primary" size="lg" className="w-full max-w-xs">
        <Link href={`/${locale}/shop`} onClick={() => setIsCartOpen(false)}>
          {dictionary.continueShopping}
        </Link>
      </Button>
    </div>
  );

        const renderGiftSection = () => (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-200">
            {/* Gift Progress - Show how much more to spend */}
            {giftProgress.hasNextGift && (
              <div className="p-3 border-b border-amber-200 bg-white/50">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-amber-400 to-orange-400 flex-shrink-0">
                    <Gift className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-amber-900">
                      {isRTL 
                        ? `أضف ${giftProgress.amountNeeded} درهم للحصول على هدية مجانية!`
                        : `Add ${giftProgress.amountNeeded} AED more to get a free gift!`
                      }
                    </p>
                  </div>
                </div>
                {/* Progress Bar */}
                <div className="mt-2 h-1.5 bg-amber-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-500"
                    style={{ 
                      width: `${Math.min(100, (giftProgress.currentSubtotal / (giftProgress.nextGiftRule?.min_cart_value || 1)) * 100)}%` 
                    }}
                  />
                </div>
              </div>
            )}

            {/* Active Gifts - Show unlocked gifts */}
            {activeGifts.length > 0 && (
              <div className="p-3">
                <p className="text-xs font-semibold text-amber-900 mb-2">
                  {isRTL ? "هداياك المجانية:" : "Your free gifts:"}
                </p>
                <div className="space-y-1">
                  {activeGifts.map((gift, index) => (
                    <div key={index} className="flex items-center gap-2 bg-white/60 rounded px-2 py-1">
                      <Gift className="h-3 w-3 text-amber-600" />
                      <span className="text-xs text-amber-900 flex-1">
                        {gift.product?.name || (isRTL ? "هدية مجانية" : "Free Gift")}
                      </span>
                      <span className="text-[10px] font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded">
                        {isRTL ? "مجاني" : "FREE"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

        const renderCartItems = () => (
          <ul className="divide-y">
            {cartItems.map((item) => {
              const isAddingItem = item.item_key.startsWith("temp-");
              const isGiftItem = isFreeGiftItem(item.item_key);
              const isNewlyAddedGift = isGiftItem && newlyAddedGiftId === item.id;
        
              if (isAddingItem) {
                return (
                  <li key={item.item_key}>
                    <CartItemSkeleton />
                  </li>
                );
              }
        
              return (
              <li 
                key={item.item_key} 
                className={`p-4 transition-all duration-500 ${isGiftItem ? "bg-gradient-to-r from-amber-50 to-orange-50" : ""} ${isNewlyAddedGift ? "animate-pulse ring-2 ring-amber-400 ring-inset" : ""}`}
              >
                <div className="flex gap-4">
                  <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                    {item.featured_image ? (
                      <Image
                        src={item.featured_image}
                        alt={item.name}
                        fill
                        sizes="80px"
                        className="object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <ShoppingBag className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                    {isGiftItem && (
                      <div className="absolute top-0 left-0 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-br-lg flex items-center gap-0.5">
                        <Gift className="h-3 w-3" />
                        FREE
                      </div>
                    )}
                  </div>

                  <div className="flex flex-1 flex-col">
                    <div className="flex justify-between">
                      <h3 className="text-sm font-medium text-gray-900 line-clamp-2">
                        {item.name}
                      </h3>
                      {!isGiftItem && (
                        <button
                          onClick={() => handleRemoveItem(item.item_key)}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                          aria-label={dictionary.remove}
                          disabled={isLoading}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>

                    {isGiftItem ? (
                      <p className="mt-1 text-sm font-medium text-amber-600 inline-flex items-center gap-1">
                        <Gift className="h-3 w-3" />
                        {locale === "ar" ? "هدية مجانية" : "Free Gift"}
                      </p>
                    ) : (
                      <p className="mt-1 text-sm font-medium text-gray-900 inline-flex items-center gap-1">
                        <FormattedPrice
                          price={parseFloat(item.price) / divisor}
                          iconSize="xs"
                        /> x {item.quantity.value}
                      </p>
                    )}

                    <BundleItemsList item={item} locale={locale} compact />

                    {!isGiftItem && (
                      <div className="mt-2 flex items-center gap-2">
                        <button
                          onClick={() =>
                            handleQuantityChange(
                              item.item_key,
                              item.quantity.value - 1
                            )
                          }
                          className="flex h-8 w-8 items-center justify-center rounded-full border hover:bg-[#633d1f] hover:text-white hover:border-[#633d1f] disabled:opacity-50 transition-colors"
                          disabled={isLoading || updatingItems.has(item.item_key) || item.quantity.value <= 1}
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="w-8 text-center text-sm font-medium relative">
                          {updatingItems.has(item.item_key) ? (
                            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-[#633d1f]"></span>
                          ) : (
                            item.quantity.value
                          )}
                        </span>
                        <button
                          onClick={() =>
                            handleQuantityChange(
                              item.item_key,
                              item.quantity.value + 1
                            )
                          }
                          className="flex h-8 w-8 items-center justify-center rounded-full border hover:bg-[#633d1f] hover:text-white hover:border-[#633d1f] disabled:opacity-50 transition-colors"
                          disabled={isLoading || updatingItems.has(item.item_key)}
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </li>
            );
            })}
          </ul>
        );

  return (
    <MuiDrawer
      anchor={isRTL ? "left" : "right"}
      open={isCartOpen}
      onClose={() => setIsCartOpen(false)}
      PaperProps={{
        sx: {
          width: { xs: "100%", sm: 400 },
          maxWidth: "100%",
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
        }}
        dir={isRTL ? "rtl" : "ltr"}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid",
            borderColor: "divider",
            px: 2,
            py: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <ShoppingBag className="h-5 w-5" />
            <Typography variant="h6" component="h2" sx={{ fontWeight: 600 }}>
              {dictionary.cart}
            </Typography>
          </Box>
          <IconButton
            onClick={() => setIsCartOpen(false)}
            aria-label="Close drawer"
            sx={{ color: "text.secondary" }}
          >
            <X className="h-5 w-5" />
          </IconButton>
        </Box>

        <Box sx={{ flex: 1, overflow: "auto" }}>
          {cartItems.length === 0 ? renderEmptyCart() : (
            <>
              {(giftProgress.hasNextGift || activeGifts.length > 0) && renderGiftSection()}
              {renderCartItems()}
            </>
          )}
        </Box>

        {cartFooter && (
          <Box sx={{ borderTop: "1px solid", borderColor: "divider", p: 2 }}>
            {cartFooter}
          </Box>
        )}
      </Box>
    </MuiDrawer>
  );
}
