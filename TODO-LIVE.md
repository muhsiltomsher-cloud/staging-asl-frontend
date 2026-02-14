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

### 6.1 Add Blur Placeholders - IMPLEMENTED

**Status:** ✓ Completed (PR #536)

**Files updated:**
- `src/app/[locale]/(shop)/product/[slug]/ProductDetail.tsx` - All product gallery images
- `src/components/shop/WCProductCard.tsx` - Product card images

**Implementation:**
```typescript
import { BLUR_DATA_URL } from "@/lib/utils";

<Image
  src={image.src}
  alt={image.alt}
  fill
  placeholder="blur"
  blurDataURL={BLUR_DATA_URL}
  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
/>
```

The `BLUR_DATA_URL` constant is defined in `src/lib/utils/index.ts` for consistency across all components.

**Benefits:** Shows low-quality placeholder while image loads, improving perceived performance.

### 6.2 Image Error Handling with Logo Fallback - IMPLEMENTED

**Status:** ✓ Completed (PR #537)

**File:** `src/components/shop/WCProductCard.tsx`

**Implementation:**
```typescript
const [imageError, setImageError] = useState(false);

{mainImage && !imageError ? (
  <Image
    src={mainImage.src}
    alt={mainImage.alt || product.name}
    fill
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
```

**Benefits:** When product images fail to load (403/504 errors), displays the ASL logo as a graceful fallback instead of broken images.

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
| 6 | Image Optimization (Blur Placeholders) | MEDIUM | Performance | **COMPLETED** (PR #536) |
| 6.2 | Image Error Handling (Logo Fallback) | MEDIUM | Performance | **COMPLETED** (PR #537) |
| 7 | Increase ISR Revalidation | MEDIUM | Performance | Not Implemented |
| 8 | Bundle Analysis | MEDIUM | Performance | Not Implemented |
| 9 | Prefetching | MEDIUM | Performance | Not Implemented |
| 10 | API Compression | LOW | Performance | Verify |
| 11 | Third-Party Scripts | LOW | Performance | N/A |
| 12 | Backend Optimizations | MEDIUM | Backend | Verify |
| 13 | Cloudflare Cache Rules | HIGH | CDN/Caching | Documented |
| 14 | SEO Title Duplication Fix | HIGH | SEO | **COMPLETED** (PR #536) |
| 15 | Flag Icon Warning Fix | LOW | UI | **COMPLETED** (PR #536) |

---

# QUICK WINS (Do First)

1. **Enable all disabled caches** (Items 1-3) - Immediate performance boost
2. **Add React.memo to WCProductCard** - High impact, low effort
3. **Add priority to hero/product images** - Improves LCP score
4. **Increase ISR revalidation times** - Reduces backend load

---

# PART 4: COMPLETED FIXES & TESTING RESULTS

## Recent Fixes (January 2026)

### PR #536 - Minor Issues Fix
- **SEO Title Duplication**: Fixed duplicate site name in page titles (was "Dark Wood | Aromatic Scents Lab | Aromatic Scents Lab", now "Dark Wood | Aromatic Scents Lab")
  - File: `src/lib/utils/seo.ts` - Changed `generateMetadata` to not append site name since layout template already does
- **Flag Icon Warning**: Fixed Next.js Image warning for flag icons in currency switcher
  - File: `src/components/common/CurrencySwitcher.tsx` - Added explicit style dimensions
- **Blur Placeholders**: Added blur loading placeholders to all product images
  - Files: `ProductDetail.tsx`, `WCProductCard.tsx` - Using shared `BLUR_DATA_URL` constant

### PR #537 - Image Error Handling
- **Logo Fallback**: When product images fail to load (403/504 errors), displays ASL logo as graceful fallback
  - File: `src/components/shop/WCProductCard.tsx` - Added `imageError` state and `onError` handler

## Testing Results (January 2026)

Comprehensive testing completed for all 7 criteria in both English and Arabic:

| Criteria | Status | Notes |
|----------|--------|-------|
| 1. Functional | PASS | Products load, cart works, checkout form works |
| 2. Data Correctness | PASS | Prices, VAT (5%), totals calculated correctly |
| 3. UI/UX | PASS | Mobile responsive, RTL for Arabic, forms validated |
| 4. Performance | PASS | Pages load < 3s, images optimized with blur placeholders |
| 5. Security | PASS | CSRF tokens, secure cookies, no exposed data |
| 6. Payment | PARTIAL | Forms load correctly, full flow needs real payment testing |
| 7. SEO | PASS | Correct robots, canonical URLs, structured data (Product, Offer, BreadcrumbList) |

## Known Backend Issues (Require Server-Side Fixes)

These issues are NOT frontend bugs and require WordPress/WooCommerce backend configuration:

1. **403 Image Errors**: Staging server blocks requests from production domain
   - Fix: Configure CORS/hotlinking on WordPress to allow `aromaticscentslab.com`
   
2. **500 Cart API Errors**: CoCart API connectivity issues
   - Fix: Check CoCart plugin configuration and server logs
   
3. **React Hydration Error #418**: Pre-existing issue, likely browser extension related
   - Note: Does not affect functionality, cosmetic console error only

# NOTES

- All "Dev Mode" items have comments like "DEV MODE: Cache disabled for faster development"
- Test thoroughly after enabling caches to ensure data freshness meets requirements
- Use Lighthouse and Web Vitals to measure improvements
- Consider implementing cache invalidation webhooks from WordPress for real-time updates

---

# PART 3: CLOUDFLARE CACHING CONFIGURATION

This section documents the recommended Cloudflare Cache Rules for the SSR Next.js app with cart/checkout and multi-currency support.

## Overview

For SSR Next.js with Cloudflare:
- **Do NOT cache HTML globally** - This breaks cart, checkout, and auth flows
- **Aggressively cache static assets** - `/_next/static/*` can be cached for months
- **Let Next.js ISR handle SSR page caching** - Uses built-in `revalidate` values
- **Bypass cache for dynamic routes** - Cart, checkout, account, API routes

## Cloudflare Cache Rules

Create these rules in Cloudflare Dashboard → Rules → Cache Rules. **Order matters** - Rule 1 should have highest priority.

### Rule 1: BYPASS - Dynamic Cart/Checkout/Auth (Highest Priority)

**Expression:**
```
(http.host eq "aromaticscentslab.com" and (
  http.request.uri.path contains "/cart" or
  http.request.uri.path contains "/checkout" or
  http.request.uri.path contains "/account" or
  http.request.uri.path contains "/login" or
  http.request.uri.path contains "/register" or
  http.request.uri.path contains "/wishlist" or
  http.request.uri.path contains "/order-confirmation" or
  http.request.uri.path contains "/forgot-password" or
  http.request.uri.path contains "/reset-password" or
  starts_with(http.request.uri.path, "/api/")
))
```

**Action:** Cache → Bypass cache

**Why:** These routes use React contexts (CartContext, AuthContext) and must always return fresh data. Caching would break user sessions, cart state, and payment flows.

---

### Rule 2: CACHE - Static Assets (1 month)

**Expression:**
```
(http.host eq "aromaticscentslab.com" and (
  starts_with(http.request.uri.path, "/_next/static/") or
  starts_with(http.request.uri.path, "/static/") or
  starts_with(http.request.uri.path, "/images/") or
  ends_with(http.request.uri.path, ".css") or
  ends_with(http.request.uri.path, ".js") or
  ends_with(http.request.uri.path, ".jpg") or
  ends_with(http.request.uri.path, ".jpeg") or
  ends_with(http.request.uri.path, ".png") or
  ends_with(http.request.uri.path, ".webp") or
  ends_with(http.request.uri.path, ".svg") or
  ends_with(http.request.uri.path, ".ico") or
  ends_with(http.request.uri.path, ".woff") or
  ends_with(http.request.uri.path, ".woff2")
))
```

**Action:** Cache → Cache everything  
**Edge TTL:** 1 month (2592000 seconds)

**Why:** Next.js static assets are content-hashed (e.g., `app-abc123.js`). When you deploy new code, the hash changes, so users automatically get new files. Safe to cache aggressively.

---

### Rule 3: DEFAULT/HTML - Let ISR Control Freshness

**No additional rule needed.** Keep Cloudflare's default cache level (Standard).

Next.js ISR (`revalidate`) controls page regeneration:
- Home page: `revalidate = 60` (1 minute)
- Product pages: `revalidate = 300` (5 minutes)
- Categories: `revalidate = 600` (10 minutes)

Cloudflare accelerates static assets and leaves HTML behavior to Next.js.

---

## Dynamic Updates & Cache Invalidation

### How Updates Work

| Content Type | Cache Behavior | Update Delay |
|--------------|----------------|--------------|
| Cart, Checkout, Account | Never cached (bypass) | Instant |
| Product listings | ISR (5 min revalidate) | Up to 5 minutes |
| Static pages (About, FAQ) | ISR (varies) | Up to 15 minutes |
| Static assets (JS, CSS) | Cached 1 month | Instant (hash changes) |

### On-Demand Revalidation

The app has `/api/revalidate` endpoint for instant cache purge. Can be triggered from WooCommerce webhooks when products are updated.

### Cloudflare Cache Purge

For immediate updates, use Cloudflare API to purge specific URLs:
```bash
curl -X POST "https://api.cloudflare.com/client/v4/zones/{zone_id}/purge_cache" \
  -H "Authorization: Bearer {api_token}" \
  -H "Content-Type: application/json" \
  --data '{"files":["https://aromaticscentslab.com/en/product/example"]}'
```

---

## Next.js Cache Headers (Already Configured)

### Static Assets
Next.js automatically emits: `Cache-Control: public, max-age=31536000, immutable`

### ISR HTML Pages
Controlled by `revalidate` values. Do NOT override with long-lived `max-age`.

### Dynamic Routes (Cart, Checkout, API)
Should send `Cache-Control: no-store, no-cache, must-revalidate` to match Cloudflare bypass rule.

---

## Verification Checklist

After configuring Cloudflare rules:

- [ ] Visit cart page → Should NOT be cached (check `CF-Cache-Status: BYPASS`)
- [ ] Visit checkout page → Should NOT be cached
- [ ] Visit product page → Should use ISR (check `CF-Cache-Status: DYNAMIC` or `HIT`)
- [ ] Check `/_next/static/*` files → Should be cached (`CF-Cache-Status: HIT`)
- [ ] Test login/logout → Session should work correctly
- [ ] Test add to cart → Cart should update immediately
- [ ] Test checkout flow → Payment should process correctly

---

## Troubleshooting

### Page not updating after content change
1. Check ISR `revalidate` value for that page
2. Wait for revalidation window to pass
3. Use `/api/revalidate` for instant purge
4. Check Cloudflare cache status headers

### Cart/checkout showing stale data
1. Verify Rule 1 (bypass) is active and has highest priority
2. Check that the URL pattern matches the rule expression
3. Verify `CF-Cache-Status: BYPASS` in response headers

### Static assets not updating after deploy
1. Next.js uses content hashing - new deploys create new file names
2. Old cached files won't be served (different URL)
3. If issues persist, purge Cloudflare cache for `/_next/static/*`
