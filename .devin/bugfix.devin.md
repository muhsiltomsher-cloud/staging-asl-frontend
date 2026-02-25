# ASL Staging Frontend - Bug Investigation & Fixing

## Outcome
Investigate and fix bugs in the ASL staging e-commerce frontend.

## Procedure

### 1. Reproduce the Bug
- Identify the affected page/feature
- Test in both locales (`/en/` and `/ar/`)
- Test on both desktop and mobile viewports
- Check browser console for JavaScript errors
- Check the Next.js server logs for API errors

### 2. Identify the Root Cause
- **UI/Styling issues**: Check component in `src/components/`, look at Tailwind classes
- **Data issues**: Check API route in `src/app/api/`, verify backend response
- **State issues**: Check relevant context in `src/contexts/`
- **Routing issues**: Check page in `src/app/[locale]/`, verify middleware behavior
- **Build issues**: Check `next.config.ts`, `tsconfig.json`, `package.json`

### 3. Common Bug Patterns

#### WooCommerce API Issues
- Backend at `staging.aromaticscentslab.com` may have different data than production
- WPML locale parameter (`?lang=en`) must be passed for localized content
- Product IDs differ between locales in WPML - always use slug-based lookups with locale
- CoCart cart operations require the cart key from cookies

#### Image Loading Issues
- Images must come from allowed domains in `next.config.ts` (`remotePatterns`)
- Use `/cms-media/` rewrite for WordPress uploads
- Fallback to ASL logo on image load errors

#### Authentication Issues
- JWT tokens expire - check `/api/auth/renew` for token refresh
- Google OAuth requires correct `NEXT_PUBLIC_GOOGLE_CLIENT_ID`
- Rate limiting on login/forgot-password endpoints

#### Currency/Price Display
- Base currency is AED - all prices from Store API are in AED
- Currency conversion happens client-side via `CurrencyContext`
- Exchange rates come from `/api/currencies` endpoint

#### Mobile-specific Issues
- Mobile bottom bar may overlap content
- Keyboard may push content on iOS
- Pull-to-refresh behavior via `usePullToRefresh` hook
- Haptic feedback via `useHapticFeedback` hook

### 4. Fix and Verify
- Make the minimal change needed to fix the bug
- Test the fix in both locales
- Test the fix on mobile and desktop
- Run lint: `npm run lint`
- Verify no regressions in related features

### 5. Common File Locations for Debugging

| Feature Area | Key Files |
|-------------|-----------|
| **Cart** | `src/contexts/CartContext.tsx`, `src/app/api/cart/route.ts`, `src/lib/api/cocart.ts` |
| **Auth** | `src/contexts/AuthContext.tsx`, `src/app/api/auth/`, `src/lib/api/auth.ts` |
| **Products** | `src/lib/api/woocommerce.ts`, `src/app/api/products/route.ts` |
| **Checkout** | `src/app/[locale]/(shop)/checkout/`, `src/components/checkout/` |
| **Payments** | `src/app/api/myfatoorah/`, `src/app/api/tabby/`, `src/app/api/tamara/` |
| **Wishlist** | `src/contexts/WishlistContext.tsx`, `src/app/api/wishlist/route.ts` |
| **Currency** | `src/contexts/CurrencyContext.tsx`, `src/app/api/currencies/route.ts` |
| **SEO** | `src/components/seo/`, `src/lib/utils/seo.ts`, `src/app/robots.ts`, `src/app/sitemap.ts` |
| **i18n** | `src/i18n/dictionaries/`, `src/config/site.ts` |
| **Layout** | `src/components/layout/`, `src/app/[locale]/layout.tsx` |
| **Config** | `src/config/site.ts`, `next.config.ts`, `.env.example` |

## Advice
- Check the API health endpoint at `/api/health` to verify backend connectivity
- Use `/api/debug-backend` to diagnose backend connection issues
- The staging backend may be slower than production - increase timeouts if needed
- Check `staticPageGenerationTimeout: 120` in `next.config.ts` for build timeout issues
- Review recent git history for changes that may have introduced the bug
- The `instrumentation.ts` file in `src/` may affect server-side behavior

## Forbidden Actions
- Do not modify test data on the staging WordPress backend without user approval
- Do not modify `next.config.ts` security headers without understanding their purpose
- Do not disable rate limiting or CSRF protection to "fix" authentication issues
