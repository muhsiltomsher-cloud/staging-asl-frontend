# Production Checklist - Items to Enable Before Going Live

This document lists all development mode settings that need to be enabled and performance optimizations to implement before deploying to production.

---

# PART 1: DEV MODE SETTINGS TO ENABLE

## 1. Wishlist API Caching

**File:** `src/app/api/wishlist/route.ts`

**What to do:** Uncomment the caching code (lines 11-24) and update the functions to use the cache.

**Lines 11-24 - Uncomment these:**
```typescript
const PRODUCT_CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds
interface CachedProduct {
  data: WCProduct;
  timestamp: number;
}
const productCache = new Map<number, CachedProduct>();

const SHARE_KEY_CACHE_TTL = 60 * 1000; // 1 minute
interface CachedShareKey {
  shareKey: string;
  timestamp: number;
}
const shareKeyCache = new Map<number, CachedShareKey>();
```

**Lines 26-42 - Replace the stub functions with actual caching logic:**
```typescript
function getCachedProduct(productId: number): WCProduct | null {
  const cached = productCache.get(productId);
  if (cached && Date.now() - cached.timestamp < PRODUCT_CACHE_TTL) {
    return cached.data;
  }
  return null;
}

function setCachedProduct(productId: number, product: WCProduct): void {
  productCache.set(productId, { data: product, timestamp: Date.now() });
}

function getCachedShareKey(userId: number): string | null {
  const cached = shareKeyCache.get(userId);
  if (cached && Date.now() - cached.timestamp < SHARE_KEY_CACHE_TTL) {
    return cached.shareKey;
  }
  return null;
}

function setCachedShareKey(userId: number, shareKey: string): void {
  shareKeyCache.set(userId, { shareKey, timestamp: Date.now() });
}
```

**Benefits:** Reduces WooCommerce API calls, speeds up wishlist operations

---

## 2. Categories Drawer Caching

**File:** `src/components/layout/CategoriesDrawer.tsx`

**What to do:** Uncomment the caching code (lines 17-19) and add cache check logic.

**Lines 17-19 - Uncomment these:**
```typescript
const categoriesCache: Record<string, { data: WCCategory[]; timestamp: number }> = {};
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes cache TTL
```

**Update `fetchCategoriesData` function to check cache first.**

**Benefits:** Reduces API calls when opening categories drawer multiple times

---

## 3. Shop Page Products Caching

**File:** `src/app/[locale]/(shop)/shop/ShopClient.tsx`

**What to do:** Uncomment the caching code (lines 8-10) and update functions.

**Lines 8-10 - Uncomment these:**
```typescript
const PRODUCTS_CACHE_KEY = "asl_products_cache";
const CACHE_TTL_MS = 5 * 60 * 1000;
```

**Benefits:** Caches products in localStorage for faster page loads, persists across refreshes

---

# PART 2: PERFORMANCE OPTIMIZATIONS

## 4. Dynamic Imports for Heavy Components

**Priority: HIGH**

The following heavy libraries should be dynamically imported to reduce initial bundle size:

### 4.1 Swiper (Product Gallery Slider)

**Files to update:**
- `src/components/shop/RelatedProducts.tsx`
- `src/components/sections/HeroSlider.tsx`
- `src/components/sections/FeaturedProductsSlider.tsx`
- `src/app/[locale]/(shop)/product/[slug]/ProductDetail.tsx`

**Implementation:**
```typescript
import dynamic from 'next/dynamic';

const Swiper = dynamic(() => import('swiper/react').then(mod => mod.Swiper), {
  ssr: false,
  loading: () => <div className="animate-pulse bg-gray-200 h-64 rounded-lg" />
});

const SwiperSlide = dynamic(() => import('swiper/react').then(mod => mod.SwiperSlide), {
  ssr: false
});
```

**Benefits:** Swiper is ~50KB gzipped. Dynamic import defers loading until needed.

### 4.2 MUI Components

**Files using MUI:** Components using `@mui/material` (Drawer, etc.)

**Implementation:**
```typescript
import dynamic from 'next/dynamic';

const MuiDrawer = dynamic(() => import('@mui/material/Drawer'), {
  ssr: false
});
```

**Benefits:** MUI is heavy (~100KB+). Only load when drawer/modal is opened.

---

## 5. Component Memoization

**Priority: HIGH**

Add `React.memo` to frequently re-rendered components:

### 5.1 WCProductCard

**File:** `src/components/shop/WCProductCard.tsx`

```typescript
import { memo } from 'react';

function WCProductCardComponent({ product, locale, className }: WCProductCardProps) {
  // ... existing code
}

export const WCProductCard = memo(WCProductCardComponent);
```

**Benefits:** Product cards render many times in lists. Memoization prevents unnecessary re-renders.

### 5.2 FormattedPrice

**File:** `src/components/common/FormattedPrice.tsx`

```typescript
import { memo } from 'react';

function FormattedPriceComponent({ price, className, ...props }: FormattedPriceProps) {
  // ... existing code
}

export const FormattedPrice = memo(FormattedPriceComponent);
```

**Benefits:** Rendered frequently throughout the app. Memoization reduces render cycles.

### 5.3 ProductListing

**File:** `src/components/shop/ProductListing.tsx`

Wrap the component with `memo` and ensure `useMemo` is used for filtered/sorted products.

---

## 6. Image Optimization

**Priority: MEDIUM**

### 6.1 Add Blur Placeholders

**Files:** All components using `next/image`

```typescript
<Image
  src={image.src}
  alt={image.alt}
  fill
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAAUH/8QAIhAAAgEDBAMBAAAAAAAAAAAAAQIDAAQRBQYSIRMxQVH/xAAVAQEBAAAAAAAAAAAAAAAAAAADBP/EABkRAAIDAQAAAAAAAAAAAAAAAAECAAMRIf/aAAwDAQACEQMRAD8AzjTtPuLy8ht7aF5ppWCIijJYn4K2Lb+0dMsNOgtZbOC5mjQK88sYZnPyT+0pSqZMjMeRJLqoGz//2Q=="
  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
/>
```

**Benefits:** Shows low-quality placeholder while image loads, improving perceived performance.

### 6.2 Priority Loading for Above-the-Fold Images

**Files:** 
- `src/components/sections/HeroSlider.tsx` - First slide image
- `src/app/[locale]/(shop)/product/[slug]/ProductDetail.tsx` - Main product image

```typescript
<Image
  src={mainImage.src}
  alt={mainImage.alt}
  fill
  priority  // Add this for above-the-fold images
/>
```

**Benefits:** Preloads critical images, improving LCP (Largest Contentful Paint).

### 6.3 WebP Format Enforcement

**File:** `next.config.ts`

```typescript
const nextConfig: NextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],  // Add this
    remotePatterns: [
      // ... existing patterns
    ],
  },
};
```

**Benefits:** WebP/AVIF are 25-50% smaller than JPEG/PNG.

---

## 7. Increase ISR Revalidation Times

**Priority: MEDIUM**

Current revalidation times are conservative. For production, consider increasing:

**File:** `src/lib/api/woocommerce.ts`

| Content Type | Current | Recommended |
|--------------|---------|-------------|
| Products | 300s (5 min) | 600s (10 min) |
| Categories | 600s (10 min) | 1800s (30 min) |
| Site Settings | 60s | 300s (5 min) |

**File:** `src/lib/api/wordpress.ts`

| Content Type | Current | Recommended |
|--------------|---------|-------------|
| Pages | 300s | 600s (10 min) |
| Menus | 60s | 600s (10 min) |
| Home Page | 60s | 300s (5 min) |

**Benefits:** Reduces backend API load, improves response times.

---

## 8. Bundle Analysis & Optimization

**Priority: MEDIUM**

### 8.1 Install Bundle Analyzer

```bash
npm install @next/bundle-analyzer --save-dev
```

**File:** `next.config.ts`

```typescript
import bundleAnalyzer from '@next/bundle-analyzer';

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

export default withBundleAnalyzer(nextConfig);
```

**Run:** `ANALYZE=true npm run build`

### 8.2 Tree-Shake Lucide Icons

**Current:** Importing from `lucide-react` may include unused icons.

**Optimization:** Import only specific icons:
```typescript
// Instead of:
import { ShoppingBag, Heart, Search } from 'lucide-react';

// Use direct imports:
import ShoppingBag from 'lucide-react/dist/esm/icons/shopping-bag';
import Heart from 'lucide-react/dist/esm/icons/heart';
```

**Benefits:** Reduces bundle size by only including used icons.

---

## 9. Prefetching & Preloading

**Priority: MEDIUM**

### 9.1 Prefetch Critical Routes

**File:** `src/components/layout/Header.tsx`

```typescript
import { useRouter } from 'next/navigation';

// Prefetch shop page on header mount
useEffect(() => {
  router.prefetch(`/${locale}/shop`);
  router.prefetch(`/${locale}/cart`);
}, [locale, router]);
```

### 9.2 Preload Product Images on Hover

**File:** `src/components/shop/WCProductCard.tsx`

```typescript
const handleMouseEnter = () => {
  // Preload product detail page
  router.prefetch(`/${locale}/product/${productSlug}`);
};

<article onMouseEnter={handleMouseEnter}>
  // ... existing code
</article>
```

**Benefits:** Faster navigation by preloading likely next pages.

---

## 10. API Response Compression

**Priority: LOW**

### 10.1 Enable Gzip/Brotli Compression

Ensure your hosting provider (Vercel/Netlify) has compression enabled. For custom servers:

**File:** `next.config.ts`

```typescript
const nextConfig: NextConfig = {
  compress: true,  // Enable gzip compression
  // ... existing config
};
```

### 10.2 Add Cache Headers for Static Assets

**File:** `next.config.ts` (already configured, verify these are active)

```typescript
async headers() {
  return [
    {
      source: '/_next/static/:path*',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=31536000, immutable',
        },
      ],
    },
  ];
}
```

---

## 11. Third-Party Script Optimization

**Priority: LOW**

### 11.1 Defer Analytics Scripts

If adding Google Analytics or other tracking:

```typescript
import Script from 'next/script';

<Script
  src="https://www.googletagmanager.com/gtag/js?id=GA_ID"
  strategy="lazyOnload"  // Load after page is interactive
/>
```

### 11.2 Lazy Load Chat Widgets

Load customer support chat widgets only after user interaction or scroll.

---

## 12. Database/Backend Optimizations

**Priority: MEDIUM** (Requires WordPress backend changes)

### 12.1 Enable Object Caching on WordPress

Install Redis or Memcached on the WordPress backend for faster database queries.

### 12.2 Enable WooCommerce REST API Caching

Use a caching plugin like WP Super Cache or W3 Total Cache with REST API caching enabled.

### 12.3 CDN for WordPress Media

Ensure WordPress media files are served through a CDN (Cloudflare, AWS CloudFront).

---

# SUMMARY TABLE

| # | Item | Priority | Type | Status |
|---|------|----------|------|--------|
| 1 | Wishlist API Caching | HIGH | Dev Mode | Disabled |
| 2 | Categories Drawer Caching | HIGH | Dev Mode | Disabled |
| 3 | Shop Products Caching | HIGH | Dev Mode | Disabled |
| 4 | Dynamic Imports (Swiper, MUI) | HIGH | Performance | Not Implemented |
| 5 | Component Memoization | HIGH | Performance | Partial |
| 6 | Image Optimization | MEDIUM | Performance | Partial |
| 7 | Increase ISR Revalidation | MEDIUM | Performance | Not Implemented |
| 8 | Bundle Analysis | MEDIUM | Performance | Not Implemented |
| 9 | Prefetching | MEDIUM | Performance | Not Implemented |
| 10 | API Compression | LOW | Performance | Verify |
| 11 | Third-Party Scripts | LOW | Performance | N/A |
| 12 | Backend Optimizations | MEDIUM | Backend | Verify |

---

# QUICK WINS (Do First)

1. **Enable all disabled caches** (Items 1-3) - Immediate performance boost
2. **Add React.memo to WCProductCard** - High impact, low effort
3. **Add priority to hero/product images** - Improves LCP score
4. **Increase ISR revalidation times** - Reduces backend load

# NOTES

- All "Dev Mode" items have comments like "DEV MODE: Cache disabled for faster development"
- Test thoroughly after enabling caches to ensure data freshness meets requirements
- Use Lighthouse and Web Vitals to measure improvements
- Consider implementing cache invalidation webhooks from WordPress for real-time updates
