# ASL Website - Complete Technical Overview

Aromatic Scents Lab (ASL) is a modern, bilingual e-commerce platform for premium fragrances and aromatic products. This document provides a comprehensive overview of all features and technologies used in both the frontend and backend.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Frontend Technologies](#frontend-technologies)
3. [Backend Technologies](#backend-technologies)
4. [Features](#features)
5. [Architecture](#architecture)
6. [Next.js API Routes](#nextjs-api-routes)
7. [Payment Gateways](#payment-gateways)
8. [SEO & Performance](#seo--performance)
9. [Security](#security)
10. [Deployment](#deployment)

---

## Project Overview

| Aspect | Details |
|--------|---------|
| **Project Name** | Aromatic Scents Lab (ASL) |
| **Type** | Headless E-commerce Platform |
| **Languages** | English, Arabic (RTL) |
| **Currencies** | AED, BHD, KWD, OMR, QAR, SAR, USD |
| **Frontend URL** | https://aromaticscentslab.com |
| **Backend URL** | https://staging.aromaticscentslab.com |

---

## Frontend Technologies

### Core Framework

| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 15.x (App Router) | React framework with SSR/ISR |
| **React** | 19.x | UI component library |
| **TypeScript** | 5.x | Type-safe JavaScript |
| **Tailwind CSS** | 3.x | Utility-first CSS framework |

### UI Libraries & Components

| Library | Purpose |
|---------|---------|
| **Lucide React** | Icon library |
| **Swiper** | Product carousels and sliders |
| **MUI (Material UI)** | Drawer components |
| **React Hook Form** | Form handling and validation |
| **Zod** | Schema validation |

### State Management & Data Fetching

| Technology | Purpose |
|------------|---------|
| **React Context API** | Global state (Cart, Auth, Currency, Wishlist) |
| **SWR** | Data fetching with caching |
| **Cookies (js-cookie)** | Persistent state storage |

### Image & Media

| Feature | Implementation |
|---------|----------------|
| **Next.js Image** | Optimized image loading |
| **Blur Placeholders** | Loading state with blur effect |
| **Lazy Loading** | Deferred image loading |
| **Error Fallback** | ASL logo fallback for failed images |
| **WebP/AVIF** | Modern image formats |

### Internationalization

| Feature | Implementation |
|---------|----------------|
| **Locale Routing** | `/en/*` and `/ar/*` paths |
| **RTL Support** | Automatic RTL layout for Arabic |
| **Dictionary System** | JSON-based translations |
| **WPML Integration** | Backend content translation |

---

## Backend Technologies

### Core Platform

| Technology | Version | Purpose |
|------------|---------|---------|
| **WordPress** | 6.x | Content Management System |
| **WooCommerce** | 8.x | E-commerce engine |
| **PHP** | 8.x | Server-side language |
| **MySQL** | 8.x | Database |

### WordPress Plugins

| Plugin | Purpose |
|--------|---------|
| **WooCommerce** | E-commerce functionality |
| **WPML** | Multilingual content management |
| **WooCommerce Multilingual & Multicurrency (WCML)** | Multi-currency support |
| **CoCart** | Headless cart API |
| **TI WooCommerce Wishlist** | Wishlist functionality |
| **JWT Authentication** | API authentication |
| **ASL Frontend Settings** | Custom Customizer settings |

### Payment Gateway Plugins

| Plugin | Purpose |
|--------|---------|
| **MyFatoorah** | Credit/Debit card payments |
| **Tabby** | Buy Now Pay Later |
| **Tamara** | Buy Now Pay Later |
| **WooCommerce COD** | Cash on Delivery |

### WordPress API Endpoints

| API | Base URL | Purpose |
|-----|----------|---------|
| **WooCommerce Store API** | `/wp-json/wc/store/v1/` | Products, categories |
| **WooCommerce REST API** | `/wp-json/wc/v3/` | Orders, customers |
| **CoCart API** | `/wp-json/cocart/v2/` | Cart operations |
| **ASL Custom API** | `/wp-json/asl/v1/` | Site settings, home page |
| **WordPress REST API** | `/wp-json/wp/v2/` | Pages, media |
| **ASL Free Gifts API** | `/wp-json/asl-free-gifts/v1/` | Free gift rules |

---

## Features

### E-commerce Features

| Feature | Description |
|---------|-------------|
| **Product Catalog** | Browse products by category, search, filter |
| **Product Variants** | Size, color, and other variations |
| **Product Bundles** | Build-your-own-set functionality with configurable bundle rules |
| **Shopping Cart** | Add, update, remove items with real-time totals |
| **Wishlist** | Save products for later (requires login) |
| **Checkout** | Multi-step checkout with address validation |
| **Order Management** | View order history, track orders, cancel orders |
| **Coupons** | Apply discount codes at checkout |
| **Free Shipping** | Threshold-based free shipping (500 AED) |
| **Free Gift** | Promotional free gift with qualifying orders |
| **Shipping Zones** | Weight-based shipping rates per country/zone |

### User Features

| Feature | Description |
|---------|-------------|
| **User Registration** | Create account with email |
| **User Login** | JWT-based authentication |
| **Google Sign-In** | OAuth-based Google social login |
| **Password Reset** | Email-based password recovery with multi-method fallback |
| **Profile Management** | Update personal information |
| **Address Book** | Save billing and shipping addresses |
| **Order History** | View past orders and invoices |
| **Order Cancellation** | Cancel pending/processing/on-hold orders |

### Multi-Currency Support

| Currency | Code | Symbol | Region |
|----------|------|--------|--------|
| UAE Dirham | AED | AED | United Arab Emirates |
| Bahraini Dinar | BHD | BD | Bahrain |
| Kuwaiti Dinar | KWD | KD | Kuwait |
| Omani Rial | OMR | OMR | Oman |
| Qatari Riyal | QAR | QR | Qatar |
| Saudi Riyal | SAR | SAR | Saudi Arabia |
| US Dollar | USD | $ | International |

### Bilingual Support

| Language | Code | Direction | Features |
|----------|------|-----------|----------|
| English | en | LTR | Default language |
| Arabic | ar | RTL | Full RTL layout, translated content |

### Home Page Sections (Configurable via WordPress)

| Section | Description |
|---------|-------------|
| **Hero Slider** | Full-width promotional banners |
| **New Products** | Latest product arrivals |
| **Bestsellers** | Top-selling products |
| **Shop by Category** | Category grid with images |
| **Featured Products** | Curated product slider |
| **Collections** | Themed product collections |
| **Promotional Banners** | Marketing banners |

### Navigation & UI

| Feature | Description |
|---------|-------------|
| **Mega Menu** | Desktop category navigation |
| **Mobile Bottom Bar** | Quick access navigation on mobile |
| **Categories Drawer** | Mobile category browsing |
| **Search** | Product search with suggestions |
| **Cart Drawer** | Slide-out cart preview |
| **Account Drawer** | Quick account access |

---

## Architecture

### Frontend Architecture

```
Next.js 15 App Router
+-- Server Components (RSC)
|   +-- Page layouts
|   +-- Data fetching
|   +-- SEO metadata
+-- Client Components
|   +-- Interactive UI
|   +-- Form handling
|   +-- State management
+-- API Routes (41 endpoints)
    +-- Authentication (7 routes)
    +-- Cart proxy (1 route)
    +-- Wishlist proxy (1 route)
    +-- Customer management (2 routes)
    +-- Orders management (3 routes)
    +-- Products (1 route)
    +-- Bundles (2 routes)
    +-- Currencies (1 route)
    +-- Coupons (1 route)
    +-- Shipping (2 routes)
    +-- Payment gateways (1 route)
    +-- MyFatoorah payments (7 routes)
    +-- Tabby payments (2 routes)
    +-- Tamara payments (2 routes)
    +-- Contact & Newsletter (2 routes)
    +-- Free gifts (1 route)
    +-- Revalidation (1 route)
    +-- CSRF (1 route)
    +-- Health check (1 route)
    +-- Debug (1 route)
```

### Data Flow

```
User Browser
    |
Next.js Frontend (Vercel)
    |
Next.js API Routes (Server-side proxy)
    |
WordPress/WooCommerce Backend
    |
MySQL Database
```

### Caching Strategy

| Layer | Technology | TTL |
|-------|------------|-----|
| **CDN** | Cloudflare | Varies by route |
| **ISR** | Next.js | 60s - 600s |
| **API Route Cache** | Next.js | 60s - 300s |
| **Client** | SWR | 5 minutes |
| **Browser** | localStorage | Session |

---

## Next.js API Routes

All Next.js API routes act as a server-side proxy layer between the frontend and the WordPress/WooCommerce backend. This provides security (credentials are never exposed to the client), CORS handling, data transformation, and caching.

### Authentication Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/auth/login` | POST | User login with username/password (rate-limited) |
| `/api/auth/verify` | POST | Validate JWT token |
| `/api/auth/renew` | POST | Refresh expired JWT token |
| `/api/auth/google` | POST | Google OAuth sign-in (creates or links account) |
| `/api/auth/google-client-id` | GET | Retrieve Google OAuth client ID |
| `/api/auth/forgot-password` | POST | Send password reset email (rate-limited, multi-method fallback) |
| `/api/auth/reset-password` | POST | Reset password using email link key |

### E-commerce Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/cart` | GET | Get cart contents |
| `/api/cart` | POST | Cart operations (add, update, remove, clear, apply/remove coupon) |
| `/api/wishlist` | GET | Get user wishlist with enriched product details |
| `/api/wishlist` | POST | Wishlist operations (add, remove, sync) |
| `/api/products` | GET | Paginated product listings with filtering and caching |
| `/api/bundles` | GET/POST/PUT/DELETE | Bundle configuration CRUD |
| `/api/bundle-slugs` | GET | Get enabled bundle product slugs |
| `/api/coupons` | GET | Available non-expired coupons (cached 5 min) |
| `/api/currencies` | GET | Currency list with exchange rates (cached 60s) |
| `/api/free-gifts` | GET | Free gift promotion rules (cached 5 min) |

### Customer & Order Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/customer` | GET/POST/PUT | Customer profile CRUD |
| `/api/customer/check-email` | GET | Check if email is registered |
| `/api/orders` | GET/POST | Get customer orders / Create order |
| `/api/orders/cancel` | POST | Cancel pending/processing/on-hold orders |
| `/api/orders/notes` | GET | Get order notes |

### Shipping Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/shipping` | GET | Calculate shipping rates by country/weight/subtotal |
| `/api/shipping` | POST | Select a specific shipping rate |
| `/api/shipping-countries` | GET | List available shipping countries from WooCommerce zones |

### Payment Gateway Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/payment-gateways` | GET | List enabled payment gateways |

### MyFatoorah Payment Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/myfatoorah/create-session` | POST | Create embedded payment session |
| `/api/myfatoorah/initiate-payment` | POST | Initiate redirect-based payment |
| `/api/myfatoorah/verify-payment` | GET | Verify payment status by payment ID |
| `/api/myfatoorah/get-payment` | GET | Get detailed payment information |
| `/api/myfatoorah/get-session` | GET | Get payment session details |
| `/api/myfatoorah/get-customer` | GET | Get customer details and saved cards |
| `/api/myfatoorah/refund` | POST/GET | Create refund / Get refund status |
| `/api/myfatoorah/sync-orders` | POST/GET | Sync order status with MyFatoorah / Get order details |

### Tabby Payment Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/tabby/create-session` | POST | Create Tabby BNPL checkout session |
| `/api/tabby/verify-payment` | GET | Verify Tabby payment status |

### Tamara Payment Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/tamara/create-checkout` | POST | Create Tamara BNPL checkout |
| `/api/tamara/verify-payment` | GET | Verify Tamara order/payment status |

### Utility Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/csrf` | GET | Generate CSRF token and set cookie |
| `/api/contact` | POST | Submit contact form |
| `/api/newsletter` | POST | Subscribe to newsletter |
| `/api/health` | GET/HEAD | Health check endpoint |
| `/api/revalidate` | GET/POST | On-demand ISR cache invalidation |
| `/api/debug-backend` | GET | Backend connectivity diagnostics |

---

## Payment Gateways

### MyFatoorah (Credit/Debit Cards)

| Feature | Details |
|---------|---------|
| **Type** | Payment gateway |
| **Cards** | Visa, Mastercard, AMEX |
| **Modes** | Embedded session, redirect-based payment |
| **Flow** | Create session/initiate > Customer pays > Verify payment |
| **Features** | Saved cards, refunds, order sync, multi-country API endpoints |
| **Countries** | UAE, SA, QA, EG, KW, BH, JO, OM |
| **Test Mode** | Configurable via `MYFATOORAH_TEST_MODE` env var |

### Tabby (Buy Now Pay Later)

| Feature | Details |
|---------|---------|
| **Type** | BNPL |
| **Installments** | 4 interest-free payments |
| **Flow** | Create session > Redirect to Tabby > Verify payment |
| **Statuses** | CREATED, AUTHORIZED, CLOSED, REJECTED, EXPIRED |
| **API** | Tabby v2 Checkout API |

### Tamara (Buy Now Pay Later)

| Feature | Details |
|---------|---------|
| **Type** | BNPL |
| **Installments** | 3-4 interest-free payments |
| **Flow** | Create checkout > Redirect to Tamara > Verify payment |
| **Statuses** | new, approved, authorised, captured, declined, canceled, expired, refunded |
| **Test Mode** | Configurable via `TAMARA_TEST_MODE` env var |

### Cash on Delivery (COD)

| Feature | Details |
|---------|---------|
| **Type** | Offline payment |
| **Flow** | Order placed, pay on delivery |

---

## SEO & Performance

### SEO Features

| Feature | Implementation |
|---------|----------------|
| **Meta Tags** | Dynamic title, description per page |
| **Open Graph** | Social sharing metadata |
| **Canonical URLs** | Prevent duplicate content |
| **Hreflang Tags** | Language/region targeting |
| **Structured Data** | Product, Offer, BreadcrumbList, Organization schemas |
| **Sitemap** | Auto-generated XML sitemap |
| **Robots.txt** | Search engine directives |

### Performance Optimizations

| Optimization | Implementation |
|--------------|----------------|
| **Server-Side Rendering** | Initial page load |
| **Incremental Static Regeneration** | Cached pages with revalidation |
| **Image Optimization** | Next.js Image with WebP/AVIF |
| **Blur Placeholders** | Perceived performance improvement |
| **Code Splitting** | Automatic route-based splitting |
| **Lazy Loading** | Deferred component loading |
| **CDN Caching** | Cloudflare edge caching |

### Core Web Vitals Targets

| Metric | Target | Description |
|--------|--------|-------------|
| **LCP** | < 2.5s | Largest Contentful Paint |
| **FID** | < 100ms | First Input Delay |
| **CLS** | < 0.1 | Cumulative Layout Shift |

---

## Security

### Frontend Security

| Measure | Implementation |
|---------|----------------|
| **HTTPS** | All traffic encrypted |
| **CSRF Protection** | Token-based form protection via `/api/csrf` |
| **XSS Prevention** | React's built-in escaping |
| **Secure Cookies** | HttpOnly, Secure, SameSite |
| **Content Security Policy** | Restricted resource loading |
| **Rate Limiting** | Login, forgot-password, and API endpoints throttled |

### Backend Security

| Measure | Implementation |
|---------|----------------|
| **JWT Authentication** | Stateless API auth with token renewal |
| **Rate Limiting** | API request throttling |
| **Input Validation** | Server-side validation on all API routes |
| **SQL Injection Prevention** | Parameterized queries |
| **CORS Configuration** | Restricted origins |
| **API Key Protection** | Payment gateway keys stored server-side only |

### Data Protection

| Measure | Implementation |
|---------|----------------|
| **No Card Storage** | Payment data handled by gateways |
| **Password Hashing** | WordPress password hashing |
| **Session Management** | JWT with expiration and refresh |
| **Audit Logging** | Order and user activity logs |
| **Email Privacy** | Customer check-email endpoint does not expose details |

---

## Deployment

### Frontend Deployment (Vercel)

| Aspect | Details |
|--------|---------|
| **Platform** | Vercel |
| **Build** | `npm run build` |
| **Preview** | Automatic PR previews |
| **Production** | Auto-deploy on main branch |
| **Environment** | Environment variables in Vercel dashboard |

### Backend Deployment (WordPress)

| Aspect | Details |
|--------|---------|
| **Hosting** | Managed WordPress hosting |
| **Database** | MySQL with daily backups |
| **Media** | WordPress media library |
| **SSL** | Let's Encrypt / Cloudflare |

### Environment Variables

#### Frontend (.env.local)

```
NEXT_PUBLIC_SITE_URL=https://aromaticscentslab.com
NEXT_PUBLIC_WC_API_URL=https://staging.aromaticscentslab.com
WC_CONSUMER_KEY=ck_xxxxx
WC_CONSUMER_SECRET=cs_xxxxx
NEXT_PUBLIC_GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
MYFATOORAH_API_KEY=xxxxx
MYFATOORAH_COUNTRY=AE
MYFATOORAH_TEST_MODE=false
TABBY_SECRET_KEY=xxxxx
TABBY_MERCHANT_CODE=xxxxx
TAMARA_API_TOKEN=xxxxx
TAMARA_TEST_MODE=false
REVALIDATE_SECRET_TOKEN=xxxxx
SOCIAL_LOGIN_SECRET=xxxxx
```

#### Backend (wp-config.php)

```php
define('JWT_AUTH_SECRET_KEY', 'your-secret-key');
define('COCART_JWT_SECRET', 'your-cocart-secret');
```

---

## Support & Documentation

| Document | Description |
|----------|-------------|
| **README.md** | Quick start guide |
| **TODO-LIVE.md** | Production checklist |
| **WORDPRESS_ADMIN_GUIDE.md** | Backend configuration guide and complete API reference |
| **ASL-WEBSITE.md** | This document - complete technical overview |

For technical support or custom development, contact the development team.
