# ASL Website - Complete Technical Overview

Aromatic Scents Lab (ASL) is a modern, bilingual e-commerce platform for premium fragrances and aromatic products. This document provides a comprehensive overview of all features and technologies used in both the frontend and backend.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Frontend Technologies](#frontend-technologies)
3. [Backend Technologies](#backend-technologies)
4. [Features](#features)
5. [Architecture](#architecture)
6. [API Integration](#api-integration)
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

### API Endpoints

| API | Base URL | Purpose |
|-----|----------|---------|
| **WooCommerce Store API** | `/wp-json/wc/store/v1/` | Products, categories |
| **WooCommerce REST API** | `/wp-json/wc/v3/` | Orders, customers |
| **CoCart API** | `/wp-json/cocart/v2/` | Cart operations |
| **ASL Custom API** | `/wp-json/asl/v1/` | Site settings, home page |
| **WordPress REST API** | `/wp-json/wp/v2/` | Pages, media |

---

## Features

### E-commerce Features

| Feature | Description |
|---------|-------------|
| **Product Catalog** | Browse products by category, search, filter |
| **Product Variants** | Size, color, and other variations |
| **Shopping Cart** | Add, update, remove items with real-time totals |
| **Wishlist** | Save products for later (requires login) |
| **Checkout** | Multi-step checkout with address validation |
| **Order Management** | View order history, track orders |
| **Coupons** | Apply discount codes at checkout |
| **Free Shipping** | Threshold-based free shipping (500 AED) |
| **Free Gift** | Promotional free gift with qualifying orders |

### User Features

| Feature | Description |
|---------|-------------|
| **User Registration** | Create account with email |
| **User Login** | JWT-based authentication |
| **Password Reset** | Email-based password recovery |
| **Profile Management** | Update personal information |
| **Address Book** | Save billing and shipping addresses |
| **Order History** | View past orders and invoices |

### Multi-Currency Support

| Currency | Code | Symbol | Region |
|----------|------|--------|--------|
| UAE Dirham | AED | د.إ | United Arab Emirates |
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
├── Server Components (RSC)
│   ├── Page layouts
│   ├── Data fetching
│   └── SEO metadata
├── Client Components
│   ├── Interactive UI
│   ├── Form handling
│   └── State management
└── API Routes
    ├── Cart proxy
    ├── Wishlist proxy
    └── Order creation
```

### Data Flow

```
User Browser
    ↓
Next.js Frontend (Vercel)
    ↓
Next.js API Routes (Server-side)
    ↓
WordPress/WooCommerce Backend
    ↓
MySQL Database
```

### Caching Strategy

| Layer | Technology | TTL |
|-------|------------|-----|
| **CDN** | Cloudflare | Varies by route |
| **ISR** | Next.js | 60s - 600s |
| **Client** | SWR | 5 minutes |
| **Browser** | localStorage | Session |

---

## API Integration

### Authentication Flow

1. User submits login credentials
2. Frontend calls CoCart login API
3. Backend validates and returns JWT tokens
4. Frontend stores tokens in cookies
5. Subsequent requests include JWT in headers

### Cart Flow

1. Guest users get anonymous cart (cart_key in cookie)
2. Authenticated users get user-linked cart
3. Cart syncs on login (guest cart merges with user cart)
4. Real-time totals calculated server-side

### Checkout Flow

1. User fills shipping/billing information
2. Frontend validates form data
3. Order created via WooCommerce REST API
4. Payment gateway processes payment
5. Order confirmation displayed
6. Email notifications sent

---

## Payment Gateways

### MyFatoorah (Credit/Debit Cards)

| Feature | Details |
|---------|---------|
| **Type** | Payment gateway |
| **Cards** | Visa, Mastercard, AMEX |
| **Flow** | Redirect to payment page |
| **Webhook** | Order status updates |

### Tabby (Buy Now Pay Later)

| Feature | Details |
|---------|---------|
| **Type** | BNPL |
| **Installments** | 4 interest-free payments |
| **Flow** | Redirect to Tabby checkout |

### Tamara (Buy Now Pay Later)

| Feature | Details |
|---------|---------|
| **Type** | BNPL |
| **Installments** | 3-4 interest-free payments |
| **Flow** | Redirect to Tamara checkout |

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
| **CSRF Protection** | Token-based form protection |
| **XSS Prevention** | React's built-in escaping |
| **Secure Cookies** | HttpOnly, Secure, SameSite |
| **Content Security Policy** | Restricted resource loading |

### Backend Security

| Measure | Implementation |
|---------|----------------|
| **JWT Authentication** | Stateless API auth |
| **Rate Limiting** | API request throttling |
| **Input Validation** | Server-side validation |
| **SQL Injection Prevention** | Parameterized queries |
| **CORS Configuration** | Restricted origins |

### Data Protection

| Measure | Implementation |
|---------|----------------|
| **No Card Storage** | Payment data handled by gateways |
| **Password Hashing** | WordPress password hashing |
| **Session Management** | JWT with expiration |
| **Audit Logging** | Order and user activity logs |

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
```

#### Backend (wp-config.php)

```php
define('JWT_AUTH_SECRET_KEY', 'your-secret-key');
define('COCART_JWT_SECRET', 'your-cocart-secret');
```

---

## Testing Status (January 2026)

| Criteria | Status | Notes |
|----------|--------|-------|
| Functional | PASS | Products, cart, checkout work correctly |
| Data Correctness | PASS | Prices, VAT, totals calculated correctly |
| UI/UX | PASS | Mobile responsive, RTL support |
| Performance | PASS | Pages load < 3s |
| Security | PASS | CSRF, secure cookies, no exposed data |
| Payment | PARTIAL | Forms work, full flow needs real testing |
| SEO | PASS | Structured data, canonical URLs |

---

## Recent Updates

### PR #536 (January 2026)
- Fixed SEO title duplication
- Fixed flag icon warning in currency switcher
- Added blur placeholders to product images

### PR #537 (January 2026)
- Added image error handling with ASL logo fallback

### PR #538 (January 2026)
- Updated documentation (README, TODO-LIVE, WORDPRESS_ADMIN_GUIDE)

---

## Support & Documentation

| Document | Description |
|----------|-------------|
| **README.md** | Quick start guide |
| **TODO-LIVE.md** | Production checklist |
| **WORDPRESS_ADMIN_GUIDE.md** | Backend configuration guide |
| **ASL-WEBSITE.md** | This document - complete overview |

For technical support or custom development, contact the development team.
