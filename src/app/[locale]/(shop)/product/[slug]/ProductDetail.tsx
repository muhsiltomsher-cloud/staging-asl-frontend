"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, Minus, Plus, ChevronDown, X, ChevronLeft, ChevronRight, ZoomIn, Grid, Layers } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Thumbs, FreeMode } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import { Badge } from "@/components/common/Badge";
import { FormattedPrice } from "@/components/common/FormattedPrice";
import { RelatedProducts } from "@/components/shop/RelatedProducts";
import { ProductAddons } from "@/components/shop/ProductAddons";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { useAuth } from "@/contexts/AuthContext";
import type { WCProduct } from "@/types/woocommerce";
import type { WCPAForm, WCPAFormValues } from "@/types/wcpa";
import type { Locale } from "@/config/site";
import { decodeHtmlEntities } from "@/lib/utils";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/thumbs";
import "swiper/css/free-mode";

function sanitizeProductDescription(html: string): string {
  if (!html) return "";
  
  let sanitized = html;
  
  sanitized = sanitized.replace(/<div[^>]*class="[^"]*tinv[^"]*"[^>]*>[\s\S]*?<\/div>/gi, "");
  sanitized = sanitized.replace(/<div[^>]*class="[^"]*yith[^"]*"[^>]*>[\s\S]*?<\/div>/gi, "");
  sanitized = sanitized.replace(/<a[^>]*class="[^"]*tinvwl[^"]*"[^>]*>[\s\S]*?<\/a>/gi, "");
  sanitized = sanitized.replace(/<a[^>]*aria-label="Add to Wishlist"[^>]*>[\s\S]*?<\/a>/gi, "");
  sanitized = sanitized.replace(/<p>\s*<\/p>/gi, "");
  sanitized = sanitized.replace(/Add to Wishlist/gi, "");
  sanitized = sanitized.trim();
  
  return sanitized;
}

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
  addonForms?: WCPAForm[];
}

export function ProductDetail({ product, locale, relatedProducts = [], addonForms = [] }: ProductDetailProps) {
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isAddingToWishlist, setIsAddingToWishlist] = useState(false);
  const [openAccordion, setOpenAccordion] = useState<string | null>("characteristics");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [thumbsSwiper, setThumbsSwiper] = useState<SwiperType | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "slider">("grid");
  const [addonValues, setAddonValues] = useState<WCPAFormValues>({});
  const [addonPrice, setAddonPrice] = useState(0);
  const [addonErrors, setAddonErrors] = useState<Record<string, string>>({});
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist, getWishlistItemId } = useWishlist();
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const isRTL = locale === "ar";

  const toggleAccordion = (section: string) => {
    setOpenAccordion(openAccordion === section ? null : section);
  };

  const primaryCategory = product.categories?.[0];
  const breadcrumbItems = [
    { name: isRTL ? "المتجر" : "Shop", href: `/${locale}/shop` },
    ...(primaryCategory ? [{ name: decodeHtmlEntities(primaryCategory.name), href: `/${locale}/category/${primaryCategory.slug}` }] : []),
    { name: decodeHtmlEntities(product.name), href: `/${locale}/product/${product.slug}` },
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

  const isWishlisted = isInWishlist(product.id);

  const handleWishlistToggle = async () => {
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

    // View mode toggle buttons (only show if more than 1 image)
    const ViewToggle = () => imageCount > 1 ? (
      <div className="mb-3 flex justify-end gap-2">
        <button
          type="button"
          onClick={() => setViewMode("grid")}
          className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
            viewMode === "grid"
              ? "bg-amber-800 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
          aria-label={isRTL ? "عرض الشبكة" : "Grid view"}
        >
          <Grid className="h-3.5 w-3.5" />
          {isRTL ? "شبكة" : "Grid"}
        </button>
        <button
          type="button"
          onClick={() => setViewMode("slider")}
          className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
            viewMode === "slider"
              ? "bg-amber-800 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
          aria-label={isRTL ? "عرض الشرائح" : "Slider view"}
        >
          <Layers className="h-3.5 w-3.5" />
          {isRTL ? "شرائح" : "Slider"}
        </button>
      </div>
    ) : null;

    // Grid View - Original design with main image full width, 2nd/3rd in grid
    if (viewMode === "grid") {
      if (imageCount === 1) {
        return (
          <div>
            <ViewToggle />
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
          </div>
        );
      }

      if (imageCount === 2) {
        return (
          <div>
            <ViewToggle />
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
          </div>
        );
      }

      // 3 images: show all in single column (same as 2 images layout)
      if (imageCount === 3) {
        return (
          <div>
            <ViewToggle />
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
          </div>
        );
      }

      // 4+ images: main full width, 2nd/3rd in grid, rest as thumbnails
      return (
        <div>
          <ViewToggle />
          <div className="space-y-3">
            {/* Main Image - Full Width */}
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
            
            {/* 2nd and 3rd Images - Grid Row */}
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

            {/* Additional Images - Thumbnail Row */}
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
                    className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-gray-200 transition-all hover:border-gray-400 cursor-pointer"
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
        </div>
      );
    }

    // Slider View
    return (
      <div className="w-full max-w-full overflow-hidden">
        <ViewToggle />
        <div className="space-y-3">
          {/* Main Slider */}
          <div className="relative w-full max-w-full">
            <Swiper
              key={viewMode}
              modules={[Navigation, Thumbs]}
              thumbs={{ swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null }}
              navigation={{
                prevEl: ".gallery-prev",
                nextEl: ".gallery-next",
              }}
              onSlideChange={(swiper) => setSelectedImage(swiper.activeIndex)}
              className="product-gallery-swiper w-full overflow-hidden rounded-lg bg-gray-100"
            >
              {images.map((image, index) => (
                <SwiperSlide key={image.id}>
                  <div 
                    className="relative w-full cursor-pointer"
                    style={{ paddingBottom: '100%' }}
                    onClick={() => setIsFullscreen(true)}
                  >
                    <Image
                      src={image.src}
                      alt={image.alt || `${product.name} ${index + 1}`}
                      fill
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      className="object-cover"
                      priority={index === 0}
                    />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
            <style jsx global>{`
              .product-gallery-swiper .swiper-slide {
                height: auto !important;
                width: 100% !important;
              }
            `}</style>

            {/* Navigation Arrows */}
            {imageCount > 1 && (
              <>
                <button
                  type="button"
                  className="gallery-prev absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/90 p-1.5 shadow-md transition-all hover:bg-white hover:shadow-lg disabled:opacity-50 sm:left-3 sm:p-2"
                  aria-label={isRTL ? "الصورة السابقة" : "Previous image"}
                >
                  <ChevronLeft className="h-4 w-4 text-gray-800 sm:h-5 sm:w-5" />
                </button>
                <button
                  type="button"
                  className="gallery-next absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/90 p-1.5 shadow-md transition-all hover:bg-white hover:shadow-lg disabled:opacity-50 sm:right-3 sm:p-2"
                  aria-label={isRTL ? "الصورة التالية" : "Next image"}
                >
                  <ChevronRight className="h-4 w-4 text-gray-800 sm:h-5 sm:w-5" />
                </button>
              </>
            )}

            {/* Image Counter */}
            {imageCount > 1 && (
              <div className="absolute bottom-3 left-1/2 z-10 -translate-x-1/2 rounded-full bg-black/60 px-3 py-1 text-xs font-medium text-white">
                {selectedImage + 1} / {imageCount}
              </div>
            )}
          </div>

          {/* Thumbnails Slider */}
          {imageCount > 1 && (
            <Swiper
              modules={[FreeMode, Thumbs]}
              onSwiper={setThumbsSwiper}
              spaceBetween={6}
              slidesPerView={3}
              freeMode={true}
              watchSlidesProgress={true}
              breakpoints={{
                360: { slidesPerView: 4, spaceBetween: 8 },
                480: { slidesPerView: 5, spaceBetween: 8 },
                640: { slidesPerView: 6, spaceBetween: 8 },
              }}
              className="thumbs-slider w-full max-w-full"
            >
              {images.map((image, index) => (
                <SwiperSlide key={image.id}>
                  <button
                    type="button"
                    className={`relative aspect-square w-full overflow-hidden rounded-md border-2 transition-all ${
                      selectedImage === index 
                        ? "border-amber-800 ring-1 ring-amber-800" 
                        : "border-transparent hover:border-gray-300"
                    }`}
                  >
                    <Image
                      src={image.thumbnail || image.src}
                      alt={image.alt || `${product.name} thumbnail ${index + 1}`}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </button>
                </SwiperSlide>
              ))}
            </Swiper>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumbs items={breadcrumbItems} locale={locale} />

      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12 lg:items-start">
        {/* Product Gallery */}
        <div>
          {renderImageGallery()}
        </div>

        {/* Product Info - Sticky on desktop */}
        <div className="space-y-6 lg:sticky lg:top-32 lg:self-start">
          {/* Category - Small uppercase label */}
          {primaryCategory && (
            <Link 
              href={`/${locale}/category/${primaryCategory.slug}`}
              className="inline-block text-xs font-medium uppercase tracking-wider text-gray-500 hover:text-gray-700 transition-colors"
            >
              {decodeHtmlEntities(primaryCategory.name)}
            </Link>
          )}

          {/* Title */}
          <h1 className="text-2xl font-medium text-gray-900 md:text-3xl uppercase">{product.name}</h1>

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

          {/* Product Addons - WCPA Integration */}
          {addonForms && addonForms.length > 0 && (
            <div className="border-t border-gray-200 pt-4">
              <ProductAddons
                forms={addonForms}
                locale={locale}
                basePrice={parseInt(product.prices.price) / Math.pow(10, product.prices.currency_minor_unit)}
                onValuesChange={(values, price) => {
                  setAddonValues(values);
                  setAddonPrice(price);
                }}
                onValidationChange={(isValid, errors) => {
                  setAddonErrors(errors);
                }}
              />
            </div>
          )}

          {/* Add to Cart Section */}
          <div className="space-y-4">
            {/* Quantity Selector and Add to Cart Button Row */}
            <div className="flex items-center gap-4 flex-wrap">
              {/* Pill-shaped Quantity Selector */}
              <div className="flex items-center rounded-full bg-[#E8E0D5] overflow-hidden">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={isOutOfStock || quantity <= 1}
                  className="flex h-10 w-10 items-center justify-center bg-[#C4885B] text-white rounded-full transition-all duration-300 hover:bg-[#b07a4f] disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
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
                  className="h-10 w-10 bg-transparent text-center text-sm font-bold text-[#5C4A3D] focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                  min={1}
                  max={product.add_to_cart.maximum || 99}
                />
                <button
                  type="button"
                  onClick={() => setQuantity(Math.min(quantity + 1, product.add_to_cart.maximum || 99))}
                  disabled={isOutOfStock || quantity >= (product.add_to_cart.maximum || 99)}
                  className="flex h-10 w-10 items-center justify-center bg-[#C4885B] text-white rounded-full transition-all duration-300 hover:bg-[#b07a4f] disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                  aria-label={isRTL ? "زيادة الكمية" : "Increase quantity"}
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              {/* Add to Cart Button */}
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={isOutOfStock || !product.is_purchasable || isAddingToCart}
                className="flex items-center justify-center gap-2 bg-[#C4885B] px-8 py-3 text-sm font-medium uppercase tracking-wide text-white transition-all duration-300 border-2 border-[#C4885B] rounded-full hover:bg-transparent hover:text-[#C4885B] disabled:cursor-not-allowed disabled:bg-gray-400 disabled:border-gray-400 cursor-pointer"
              >
                {isAddingToCart 
                  ? (isRTL ? "جاري الإضافة..." : "Adding...") 
                  : (isRTL ? "أضف إلى السلة" : "Add to Cart")}
              </button>

              {/* Wishlist Button */}
              <button
                type="button"
                onClick={handleWishlistToggle}
                disabled={isAddingToWishlist}
                className={`flex h-10 w-10 items-center justify-center rounded-full transition-all duration-300 ${
                  isWishlisted
                    ? "bg-red-50 text-red-500 hover:bg-red-100"
                    : "bg-[#E8E0D5] text-[#5C4A3D] hover:bg-[#d9d0c3]"
                } ${isAddingToWishlist ? "cursor-not-allowed opacity-50" : ""}`}
                aria-label={isWishlisted ? (isRTL ? "إزالة من المفضلة" : "Remove from wishlist") : (isRTL ? "أضف إلى المفضلة" : "Add to wishlist")}
              >
                <Heart className={`h-5 w-5 ${isWishlisted ? "fill-current" : ""}`} />
              </button>
            </div>
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
                    <span className="text-gray-900">{decodeHtmlEntities(primaryCategory.name)}</span>
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
              {product.description && sanitizeProductDescription(product.description) ? (
                <div
                  className="prose prose-sm max-w-none text-gray-600"
                  dangerouslySetInnerHTML={{ __html: sanitizeProductDescription(product.description) }}
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
