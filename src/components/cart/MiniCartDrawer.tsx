"use client";

import { Minus, Plus, Trash2, ShoppingBag, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/contexts/CartContext";
import { FormattedPrice } from "@/components/common/FormattedPrice";
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
    cartItems,
    cartSubtotal,
    isCartOpen,
    setIsCartOpen,
    isLoading,
    updateCartItem,
    removeCartItem,
  } = useCart();

  const isRTL = locale === "ar";

  const handleQuantityChange = async (itemKey: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    try {
      await updateCartItem(itemKey, newQuantity);
    } catch (error) {
      console.error("Failed to update quantity:", error);
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
          price={parseInt(cartSubtotal) / 100}
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

  const renderCartItems = () => (
    <ul className="divide-y">
      {cartItems.map((item) => (
        <li key={item.item_key} className="p-4">
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
            </div>

            <div className="flex flex-1 flex-col">
              <div className="flex justify-between">
                <h3 className="text-sm font-medium text-gray-900 line-clamp-2">
                  {item.name}
                </h3>
                <button
                  onClick={() => handleRemoveItem(item.item_key)}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                  aria-label={dictionary.remove}
                  disabled={isLoading}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <p className="mt-1 text-sm font-medium text-gray-900 inline-flex items-center gap-1">
                <FormattedPrice
                  price={parseInt(item.price) / 100}
                  iconSize="xs"
                /> x {item.quantity.value}
              </p>

              <div className="mt-2 flex items-center gap-2">
                <button
                  onClick={() =>
                    handleQuantityChange(
                      item.item_key,
                      item.quantity.value - 1
                    )
                  }
                  className="flex h-8 w-8 items-center justify-center rounded-full border hover:bg-gray-100 disabled:opacity-50 transition-colors"
                  disabled={isLoading || item.quantity.value <= 1}
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-8 text-center text-sm font-medium">
                  {item.quantity.value}
                </span>
                <button
                  onClick={() =>
                    handleQuantityChange(
                      item.item_key,
                      item.quantity.value + 1
                    )
                  }
                  className="flex h-8 w-8 items-center justify-center rounded-full border hover:bg-gray-100 disabled:opacity-50 transition-colors"
                  disabled={isLoading}
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </li>
      ))}
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
          {cartItems.length === 0 ? renderEmptyCart() : renderCartItems()}
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
