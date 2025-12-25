"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, Minus, Plus, ChevronDown, ShoppingBag, X, ZoomIn } from "lucide-react";
import { Badge } from "@/components/common/Badge";
import { FormattedPrice } from "@/components/common/FormattedPrice";
import { RelatedProducts } from "@/components/shop/RelatedProducts";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { useAuth } from "@/contexts/AuthContext";
import type { WCProduct } from "@/types/woocommerce";
import type { Locale } from "@/config/site";

interface AccordionSectionProps {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

function AccordionSection({ title, isOpen, onToggle, children }: AccordionSectionProps) {
  return (
    <div className="border-b border-gray-200">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between py-4 text-left"
      >
        <span className="text-sm font-medium uppercase tracking-wide text-gray-900">
          {title}
        </span>
        <ChevronDown
          className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-200 ${
          isOpen ? "max-h-[500px] pb-4" : "max-h-0"
        }`}
      >
        {children}
      </div>
    </div>
  );
}

interface FullscreenGalleryProps {
  images: { id: number; src: string; alt: string }[];
  selectedIndex: number;
  onClose: () => void;
  onSelectImage: (index: number) => void;
  productName: string;
}

function FullscreenGallery({ images, selectedIndex, onClose, onSelectImage, productName }: FullscreenGalleryProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onSelectImage(selectedIndex > 0 ? selectedIndex - 1 : images.length - 1);
      if (e.key === "ArrowRight") onSelectImage(selectedIndex < images.length - 1 ? selectedIndex + 1 : 0);
    };
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [selectedIndex, images.length, onClose, onSelectImage]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90">
      <button
        type="button"
        onClick={onClose}
        className="absolute right-4 top-4 z-10 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
        aria-label="Close fullscreen"
      >
        <X className="h-6 w-6" />
      </button>
      
      <div className="relative h-[80vh] w-[90vw] max-w-5xl">
        <Image
          src={images[selectedIndex].src}
          alt={images[selectedIndex].alt || productName}
          fill
          sizes="90vw"
          className="object-contain"
          priority
        />
      </div>

      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
          {images.map((image, index) => (
            <button
              key={image.id}
              type="button"
              onClick={() => onSelectImage(index)}
              className={`h-16 w-16 overflow-hidden rounded border-2 transition-all ${
                selectedIndex === index ? "border-white" : "border-transparent opacity-60 hover:opacity-100"
              }`}
            >
              <Image
                src={image.src}
                alt={image.alt || `${productName} ${index + 1}`}
                width={64}
                height={64}
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

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
  const [openAccordion, setOpenAccordion] = useState<string | null>("characteristics");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { addToCart } = useCart();
  const { addToWishlist, isInWishlist } = useWishlist();
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const isRTL = locale === "ar";

  const toggleAccordion = (section: string) => {
    setOpenAccordion(openAccordion === section ? null : section);
  };

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
  const images = product.images;
  const imageCount = images.length;

  const renderImageGallery = () => {
    if (imageCount === 0) {
      return (
        <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
          <div className="flex h-full items-center justify-center">
            <span className="text-gray-400">{isRTL ? "لا توجد صورة" : "No image"}</span>
          </div>
        </div>
      );
    }

    if (imageCount === 1) {
      return (
        <div 
          className="group relative aspect-square cursor-pointer overflow-hidden rounded-lg bg-gray-100"
          onClick={() => setIsFullscreen(true)}
        >
          <Image
            src={images[0].src}
            alt={images[0].alt || product.name}
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            priority
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all group-hover:bg-black/10 group-hover:opacity-100">
            <ZoomIn className="h-8 w-8 text-white drop-shadow-lg" />
          </div>
        </div>
      );
    }

    if (imageCount === 2) {
      return (
        <div className="space-y-3">
          {images.map((image, index) => (
            <div 
              key={image.id}
              className="group relative aspect-square cursor-pointer overflow-hidden rounded-lg bg-gray-100"
              onClick={() => {
                setSelectedImage(index);
                setIsFullscreen(true);
              }}
            >
              <Image
                src={image.src}
                alt={image.alt || `${product.name} ${index + 1}`}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                priority={index === 0}
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all group-hover:bg-black/10 group-hover:opacity-100">
                <ZoomIn className="h-8 w-8 text-white drop-shadow-lg" />
              </div>
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className="space-y-3">
        <div 
          className="group relative aspect-square cursor-pointer overflow-hidden rounded-lg bg-gray-100"
          onClick={() => {
            setSelectedImage(0);
            setIsFullscreen(true);
          }}
        >
          <Image
            src={images[0].src}
            alt={images[0].alt || product.name}
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            priority
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all group-hover:bg-black/10 group-hover:opacity-100">
            <ZoomIn className="h-8 w-8 text-white drop-shadow-lg" />
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          {images.slice(1, 3).map((image, index) => (
            <div 
              key={image.id}
              className="group relative aspect-square cursor-pointer overflow-hidden rounded-lg bg-gray-100"
              onClick={() => {
                setSelectedImage(index + 1);
                setIsFullscreen(true);
              }}
            >
              <Image
                src={image.src}
                alt={image.alt || `${product.name} ${index + 2}`}
                fill
                sizes="(max-width: 1024px) 50vw, 25vw"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all group-hover:bg-black/10 group-hover:opacity-100">
                <ZoomIn className="h-6 w-6 text-white drop-shadow-lg" />
              </div>
            </div>
          ))}
        </div>

        {imageCount > 3 && (
          <div className="flex gap-2 overflow-x-auto pb-2">
            {images.slice(3).map((image, index) => (
              <button
                key={image.id}
                type="button"
                onClick={() => {
                  setSelectedImage(index + 3);
                  setIsFullscreen(true);
                }}
                className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-gray-200 transition-all hover:border-gray-400"
              >
                <Image
                  src={image.thumbnail || image.src}
                  alt={image.alt || `${product.name} ${index + 4}`}
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumbs items={breadcrumbItems} locale={locale} />

      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        {/* Product Gallery - Sticky on desktop */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          {renderImageGallery()}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          {/* Category - Small uppercase label */}
          {primaryCategory && (
            <Link 
              href={`/${locale}/category/${primaryCategory.slug}`}
              className="inline-block text-xs font-medium uppercase tracking-wider text-gray-500 hover:text-gray-700 transition-colors"
            >
              {primaryCategory.name}
            </Link>
          )}

          {/* Title */}
          <h1 className="text-2xl font-medium text-gray-900 md:text-3xl">{product.name}</h1>

          {/* Price - Bold and main color */}
          <div className="flex items-center gap-3">
            {product.on_sale ? (
              <>
                <FormattedPrice
                  price={parseInt(product.prices.price) / Math.pow(10, product.prices.currency_minor_unit)}
                  className="text-xl font-bold text-amber-800"
                  iconSize="md"
                />
                <FormattedPrice
                  price={parseInt(product.prices.regular_price) / Math.pow(10, product.prices.currency_minor_unit)}
                  className="text-base text-gray-400"
                  iconSize="sm"
                  strikethrough
                />
                <Badge variant="error">{isRTL ? "تخفيض" : "Sale"}</Badge>
              </>
            ) : (
              <FormattedPrice
                price={parseInt(product.prices.price) / Math.pow(10, product.prices.currency_minor_unit)}
                className="text-xl font-bold text-amber-800"
                iconSize="md"
              />
            )}
          </div>

          {/* Short description */}
          {product.short_description && (
            <div
              className="text-sm leading-relaxed text-gray-600"
              dangerouslySetInnerHTML={{ __html: product.short_description }}
            />
          )}

          {/* Stock status - inline with low stock warning */}
          {isOutOfStock && (
            <div className="flex items-center gap-2">
              <Badge variant="error">
                {isRTL ? "غير متوفر" : "Out of Stock"}
              </Badge>
            </div>
          )}
          {!isOutOfStock && product.low_stock_remaining && product.low_stock_remaining < 10 && (
            <span className="text-sm text-orange-600">
              {isRTL
                ? `${product.low_stock_remaining} قطع متبقية فقط`
                : `Only ${product.low_stock_remaining} left`}
            </span>
          )}

          {/* Add to Cart Button - Full width, black style */}
          <div className="space-y-3">
            {/* Quantity Selector */}
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500">{isRTL ? "الكمية" : "Quantity"}</span>
              <div className="flex items-center border border-gray-300">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={isOutOfStock || quantity <= 1}
                  className="flex h-10 w-10 items-center justify-center text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
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
                  className="h-10 w-12 border-x border-gray-300 bg-transparent text-center text-sm font-medium text-gray-900 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                  min={1}
                  max={product.add_to_cart.maximum || 99}
                />
                <button
                  type="button"
                  onClick={() => setQuantity(Math.min(quantity + 1, product.add_to_cart.maximum || 99))}
                  disabled={isOutOfStock || quantity >= (product.add_to_cart.maximum || 99)}
                  className="flex h-10 w-10 items-center justify-center text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label={isRTL ? "زيادة الكمية" : "Increase quantity"}
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              {/* Wishlist Button */}
              <button
                type="button"
                onClick={handleAddToWishlist}
                disabled={isAddingToWishlist}
                className={`flex h-10 w-10 items-center justify-center border transition-all ${
                  isInWishlist(product.id)
                    ? "border-red-300 bg-red-50 text-red-500 hover:bg-red-100"
                    : "border-gray-300 bg-white text-gray-500 hover:border-gray-400 hover:text-gray-700"
                } ${isAddingToWishlist ? "cursor-not-allowed opacity-50" : ""}`}
                aria-label={isRTL ? "أضف إلى المفضلة" : "Add to wishlist"}
              >
                <Heart className={`h-5 w-5 ${isInWishlist(product.id) ? "fill-current" : ""}`} />
              </button>
            </div>

            {/* Add to Cart Button - Black, full width */}
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={isOutOfStock || !product.is_purchasable || isAddingToCart}
              className="flex w-full items-center justify-center gap-2 bg-gray-900 px-6 py-3 text-sm font-medium uppercase tracking-wide text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              <ShoppingBag className="h-4 w-4" />
              {isAddingToCart 
                ? (isRTL ? "جاري الإضافة..." : "Adding...") 
                : (isRTL ? "أضف إلى السلة" : "Add to Bag")}
            </button>
          </div>

          {/* Accordion Sections */}
          <div className="border-t border-gray-200 pt-2">
            {/* Characteristics */}
            <AccordionSection
              title={isRTL ? "الخصائص" : "Characteristics"}
              isOpen={openAccordion === "characteristics"}
              onToggle={() => toggleAccordion("characteristics")}
            >
              <div className="space-y-2 text-sm">
                {primaryCategory && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">{isRTL ? "الفئة" : "Category"}</span>
                    <span className="text-gray-900">{primaryCategory.name}</span>
                  </div>
                )}
                {product.sku && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">{isRTL ? "رمز المنتج" : "SKU"}</span>
                    <span className="text-gray-900">{product.sku}</span>
                  </div>
                )}
                {product.attributes && product.attributes.length > 0 && (
                  product.attributes.map((attr) => (
                    <div key={attr.id} className="flex justify-between">
                      <span className="text-gray-500">{attr.name}</span>
                      <span className="text-gray-900">{attr.terms?.map(t => t.name).join(", ")}</span>
                    </div>
                  ))
                )}
                {product.tags && product.tags.length > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">{isRTL ? "الوسوم" : "Tags"}</span>
                    <span className="text-gray-900">{product.tags.map(t => t.name).join(", ")}</span>
                  </div>
                )}
              </div>
            </AccordionSection>

            {/* Description */}
            <AccordionSection
              title={isRTL ? "الوصف" : "Description"}
              isOpen={openAccordion === "description"}
              onToggle={() => toggleAccordion("description")}
            >
              {product.description ? (
                <div
                  className="prose prose-sm max-w-none text-gray-600"
                  dangerouslySetInnerHTML={{ __html: product.description }}
                />
              ) : (
                <p className="text-sm text-gray-500">
                  {isRTL ? "لا يوجد وصف متاح" : "No description available"}
                </p>
              )}
            </AccordionSection>

            {/* Payment & Delivery */}
            <AccordionSection
              title={isRTL ? "الدفع والتوصيل" : "Payment & Delivery"}
              isOpen={openAccordion === "payment"}
              onToggle={() => toggleAccordion("payment")}
            >
              <div className="space-y-3 text-sm text-gray-600">
                <p>
                  {isRTL 
                    ? "نقبل جميع بطاقات الائتمان الرئيسية والدفع عند الاستلام."
                    : "We accept all major credit cards and cash on delivery."}
                </p>
                <p>
                  {isRTL
                    ? "شحن مجاني للطلبات التي تزيد عن 300 درهم. التوصيل خلال 2-5 أيام عمل."
                    : "Free shipping on orders over 300 AED. Delivery within 2-5 business days."}
                </p>
              </div>
            </AccordionSection>

            {/* Returns */}
            <AccordionSection
              title={isRTL ? "الإرجاع" : "Returns"}
              isOpen={openAccordion === "returns"}
              onToggle={() => toggleAccordion("returns")}
            >
              <div className="space-y-3 text-sm text-gray-600">
                <p>
                  {isRTL
                    ? "نقبل الإرجاع خلال 14 يومًا من تاريخ الشراء. يجب أن تكون المنتجات غير مستخدمة وفي عبوتها الأصلية."
                    : "We accept returns within 14 days of purchase. Products must be unused and in original packaging."}
                </p>
                <p>
                  {isRTL
                    ? "للمزيد من المعلومات، يرجى الاطلاع على سياسة الإرجاع الخاصة بنا."
                    : "For more information, please see our return policy."}
                </p>
              </div>
            </AccordionSection>
          </div>

        </div>
      </div>

      {/* Related Products */}
      <RelatedProducts
        products={relatedProducts}
        currentProductId={product.id}
        locale={locale}
      />

      {/* Fullscreen Gallery Modal */}
      {isFullscreen && images.length > 0 && (
        <FullscreenGallery
          images={images}
          selectedIndex={selectedImage}
          onClose={() => setIsFullscreen(false)}
          onSelectImage={setSelectedImage}
          productName={product.name}
        />
      )}
    </div>
  );
}
