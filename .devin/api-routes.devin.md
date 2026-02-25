# ASL Staging Frontend - Working with API Routes

## Outcome
Create, modify, or debug Next.js API routes that proxy requests to the WordPress/WooCommerce backend.

## Architecture Overview
All API routes live in `src/app/api/` and act as a server-side proxy layer between the frontend and the WordPress/WooCommerce backend. This provides:
- **Security**: WooCommerce credentials (`WC_CONSUMER_KEY`, `WC_CONSUMER_SECRET`) are never exposed to the client
- **CORS handling**: No cross-origin issues since API calls go to the same domain
- **Data transformation**: Responses are transformed/filtered before reaching the client
- **Caching**: API routes include their own cache headers

## Backend APIs Used

| API | Base URL | Auth | Purpose |
|-----|----------|------|---------|
| WC Store API | `/wp-json/wc/store/v1/` | None (public) | Products, categories, cart |
| WC REST API | `/wp-json/wc/v3/` | Consumer Key/Secret | Orders, customers, settings |
| CoCart API | `/wp-json/cocart/v2/` | Cart key (cookie) | Cart operations |
| ASL Custom API | `/wp-json/asl/v1/` | None (public) | Site settings, home page config |
| ASL Free Gifts | `/wp-json/asl-free-gifts/v1/` | None (public) | Free gift rules |
| WordPress REST | `/wp-json/wp/v2/` | None (public) | Pages, media |
| GraphQL | `/graphql` | None (public) | WordPress content queries |

## API Route Categories

### Authentication (`/api/auth/`)
- `login` - POST: JWT login with rate limiting
- `verify` - POST: Validate JWT token
- `renew` - POST: Refresh expired JWT
- `google` - POST: Google OAuth sign-in
- `google-client-id` - GET: Google OAuth client ID
- `forgot-password` - POST: Password reset email (rate-limited, multi-method fallback)
- `reset-password` - POST: Reset password with email link key

### E-commerce
- `/api/cart` - GET/POST: Cart operations via CoCart proxy
- `/api/wishlist` - GET/POST: Wishlist with enriched product details
- `/api/products` - GET: Paginated products with filtering and caching
- `/api/bundles` - GET/POST/PUT/DELETE: Bundle configuration CRUD
- `/api/bundle-slugs` - GET: Enabled bundle product slugs
- `/api/coupons` - GET: Available coupons (cached 5 min)
- `/api/currencies` - GET: Currency list with exchange rates (cached 60s)
- `/api/free-gifts` - GET: Free gift promotion rules (cached 5 min)
- `/api/attributes` - GET: Product attributes
- `/api/brands` - GET: Product brands
- `/api/tags` - GET: Product tags

### Customer & Orders
- `/api/customer` - GET/POST/PUT: Customer profile CRUD
- `/api/customer/check-email` - GET: Check if email is registered
- `/api/orders` - GET/POST: Orders list / create order
- `/api/orders/cancel` - POST: Cancel pending/processing/on-hold orders
- `/api/orders/notes` - GET: Order notes

### Shipping
- `/api/shipping` - GET/POST: Calculate/select shipping rates
- `/api/shipping-countries` - GET: Available shipping countries

### Payments
- `/api/payment-gateways` - GET: Enabled payment gateways
- `/api/myfatoorah/*` - 7 endpoints for MyFatoorah card payments
- `/api/tabby/*` - 2 endpoints for Tabby BNPL
- `/api/tamara/*` - 2 endpoints for Tamara BNPL

### Influencer Tracking
- `/api/influencer/track-visit` - POST: Track influencer referral visits
- `/api/influencer/stats` - GET: Get influencer statistics

### Utility
- `/api/csrf` - GET: Generate CSRF token
- `/api/contact` - POST: Contact form submission
- `/api/newsletter` - POST: Newsletter subscription
- `/api/health` - GET/HEAD: Health check
- `/api/revalidate` - GET/POST: On-demand ISR cache invalidation
- `/api/debug-backend` - GET: Backend connectivity diagnostics

## Procedure

### 1. Create/Modify an API Route
API routes use the Next.js App Router convention:
```
src/app/api/{route-name}/route.ts
```

Each route exports HTTP method handlers: `GET`, `POST`, `PUT`, `DELETE`.

### 2. Backend Communication Pattern
Use the utilities in `src/lib/`:
- `src/lib/utils/backendFetch.ts` - Utility for fetching from the WordPress backend
- `src/lib/api/woocommerce.ts` - WooCommerce Store API client
- `src/lib/api/wordpress.ts` - WordPress REST API client
- `src/lib/api/cocart.ts` - CoCart API client for cart operations
- `src/lib/api/customer.ts` - Customer API operations
- `src/lib/api/wishlist.ts` - Wishlist operations
- `src/lib/api/auth.ts` - Authentication operations
- `src/lib/api/wcpa.ts` - WooCommerce Product Addons

### 3. Security
- Use `src/lib/security/auth-middleware.ts` for JWT token validation on protected routes
- Use `src/lib/security/csrf.ts` for CSRF token validation on form submissions
- Use `src/lib/security/rate-limiter.ts` for rate limiting on sensitive endpoints
- Never expose `WC_CONSUMER_KEY` or `WC_CONSUMER_SECRET` in responses

### 4. Caching Headers
Set appropriate cache headers in responses:
```typescript
return NextResponse.json(data, {
  headers: {
    'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
  },
});
```

### 5. WPML Locale Support
Always pass the `lang` parameter to backend requests for localized content:
```typescript
const url = `${apiUrl}/wp-json/wc/store/v1/products?lang=${locale}`;
```

### 6. Currency Support
Pass the `currency` parameter for multi-currency pricing:
```typescript
const url = `${apiUrl}/wp-json/wc/store/v1/products?currency=${currency}`;
```

## Specifications
- WooCommerce Store API base: `${NEXT_PUBLIC_WC_API_URL}/wp-json/wc/store/v1/`
- WooCommerce REST API base: `${NEXT_PUBLIC_WC_API_URL}/wp-json/wc/v3/`
- WC REST API auth: Basic Auth with `WC_CONSUMER_KEY:WC_CONSUMER_SECRET`
- CoCart API base: `${NEXT_PUBLIC_WC_API_URL}/wp-json/cocart/v2/`
- Default API currency is AED (base currency)
- Test products (name/slug starting with "test") are automatically filtered out
- Products with negative prices are filtered out
- Hidden/non-purchasable products are filtered out

## Advice
- Always handle errors gracefully and return appropriate HTTP status codes
- Use `console.error` for server-side logging in API routes
- Test API routes directly via browser/curl before testing in the UI
- The WordPress backend at `staging.aromaticscentslab.com` may have different data than production
- Check `src/types/woocommerce.ts` for WooCommerce response type definitions
- Check `src/types/wordpress.ts` for WordPress response type definitions
- WPML uses different product IDs for each language - fetch by slug with locale, not by ID

## Forbidden Actions
- Never expose backend credentials in API responses
- Never return raw WordPress/WooCommerce error messages to the client (they may contain sensitive info)
- Never skip rate limiting on authentication endpoints
- Never bypass CSRF validation on form submission endpoints
