# ASL Staging Frontend - Making Frontend Changes

## Outcome
Implement UI changes, fix styling issues, or add new frontend features to the ASL staging e-commerce site.

## Project Architecture

### Directory Structure
```
src/
  app/
    [locale]/              # Locale-based routing (en/ar)
      (pages)/             # Static pages (about, contact, faq)
      (shop)/              # Shop pages (shop, product, category, cart, checkout)
      account/             # Account pages (profile, orders, addresses)
      login/               # Login page
      register/            # Registration page
      forgot-password/     # Password recovery
      reset-password/      # Password reset
      order-confirmation/  # Order confirmation
      wishlist/            # Wishlist page
      layout.tsx           # Root layout with all providers
      page.tsx             # Home page
    api/                   # 46 Next.js API routes (server-side proxy)
  components/
    account/               # Account-related components
    auth/                  # Authentication components
    bundle-manager/        # Product bundle builder
    cart/                  # Cart components (MiniCartDrawer, etc.)
    checkout/              # Checkout flow components
    common/                # Reusable UI (buttons, modals, banners, etc.)
    layout/                # Header, Footer, MobileBottomBar
    payment/               # Payment gateway components
    sections/              # Home page sections (Hero, Bestsellers, etc.)
    seo/                   # SEO components (JsonLd, Breadcrumbs)
    shop/                  # Product cards, galleries, filters
    tracking/              # Analytics tracking scripts
  config/
    site.ts                # Site config (URLs, locales, currencies, feature flags)
    menu.ts                # Navigation menu config
  contexts/
    AuthContext.tsx         # JWT authentication state
    CartContext.tsx         # Shopping cart state (CoCart API)
    CurrencyContext.tsx     # Multi-currency state
    FreeGiftContext.tsx     # Free gift promotion state
    InfluencerContext.tsx   # Influencer tracking state
    NotificationContext.tsx # Toast notifications
    WishlistContext.tsx     # Wishlist state
  hooks/                   # Custom React hooks (cart SWR, wishlist SWR, etc.)
  i18n/
    dictionaries/          # en.json, ar.json translation files
  lib/
    api/                   # Backend API clients (woocommerce, wordpress, cocart, etc.)
    security/              # Auth middleware, CSRF, rate limiting
    utils/                 # Utility functions (SEO, phone, backendFetch, etc.)
  types/                   # TypeScript type definitions (woocommerce, wordpress, bundle, wcpa)
```

### Key Technologies
- **Next.js 16** with App Router (Server Components + Client Components)
- **React 19** with Server Components (RSC)
- **Tailwind CSS 4** with PostCSS plugin (`@tailwindcss/postcss`)
- **SWR** for client-side data fetching with caching
- **Swiper** for carousels and sliders
- **MUI (Material UI)** for Drawer components
- **Lucide React** for icons
- **next-intl** for internationalization

### Provider Hierarchy (from `[locale]/layout.tsx`)
```
AuthProvider > CurrencyProvider > NotificationProvider > InfluencerProvider >
  CartProvider > FreeGiftProvider > WishlistProvider > [page content]
```

## Procedure

### 1. Understand the Change
- Identify which component(s) need modification
- Check if the change affects both locales (en/ar)
- Determine if new translations are needed in `src/i18n/dictionaries/`

### 2. Locate Relevant Files
- Pages: `src/app/[locale]/(shop)/` or `src/app/[locale]/(pages)/`
- Components: `src/components/` organized by feature area
- Styles: Tailwind CSS utility classes inline, global styles in `src/app/globals.css`
- Types: `src/types/` for TypeScript interfaces

### 3. Implement Changes
- Follow existing code conventions and patterns
- Use Tailwind CSS for styling (no separate CSS files)
- Support RTL: use `rtl:` prefix for Arabic-specific styles or logical properties (`ms-`, `me-`, `ps-`, `pe-`)
- For new text, add translations to both `en.json` and `ar.json`
- Use the `dictionary` prop pattern for passing translations to components

### 4. Test Both Locales
- Verify changes at `/en/` and `/ar/`
- Check RTL layout in Arabic
- Verify responsive design on mobile viewports

### 5. Run Lint
```bash
npm run lint
```

## Specifications
- **Styling**: Tailwind CSS utility classes only. Use `className` prop. Support RTL with `rtl:` variant or logical CSS properties
- **Icons**: Use `lucide-react` for all icons. Check existing usage before adding new icon packages
- **Images**: Use Next.js `<Image>` component with blur placeholders. Images from WordPress use `/cms-media/` proxy or direct `staging.aromaticscentslab.com` URLs
- **State**: Use React Context API for global state. Check `src/contexts/` before creating new state management
- **Data Fetching**: Server Components fetch data directly. Client Components use SWR hooks from `src/hooks/`
- **Feature Flags**: Check `src/config/site.ts` for `featureFlags` before implementing conditional features

## Advice
- The site uses a warm color scheme with `#92400e` (amber-800) as the primary accent color
- Background color is `#f7f6f2` (warm off-white)
- Mobile bottom bar is present - test that new content doesn't overlap with it
- The `AddToCartAnimation` provider wraps the main content for cart animation effects
- `WhatsAppFloatingButton` is positioned fixed - be aware of z-index conflicts
- Check `src/components/common/` for reusable components before creating new ones (buttons, modals, drawers, etc.)
- Use `cookies-next` for persistent client-side state (not localStorage directly)

## Forbidden Actions
- Do not install new UI libraries without checking if existing ones cover the use case
- Do not use inline `style` attributes - use Tailwind CSS classes
- Do not hardcode text strings - always use the i18n dictionary system
- Do not create new CSS files - use Tailwind utility classes or `globals.css`
