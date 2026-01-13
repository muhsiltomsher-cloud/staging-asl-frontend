# Aromatic Scents Lab - Headless E-commerce Frontend

A modern, bilingual (English/Arabic) headless e-commerce frontend built with Next.js 15, Tailwind CSS, and WordPress/WooCommerce via GraphQL.

## Features

- **Next.js 15 App Router** - Server-side rendering for SEO and performance
- **Bilingual Support** - English and Arabic (RTL) with seamless language switching
- **Multi-Currency** - Support for BHD, KWD, OMR, QAR, SAR, USD with persistent selection
- **WordPress/WooCommerce Backend** - Headless CMS via WPGraphQL
- **Tailwind CSS** - Utility-first styling with RTL support
- **TypeScript** - Full type safety throughout the codebase
- **SEO Optimized** - Metadata, hreflang, structured data (JSON-LD), sitemaps

## Project Structure

```
src/
├── app/
│   └── [locale]/           # Locale-based routing (en/ar)
│       ├── (pages)/        # Static pages (about, contact, faq)
│       ├── (shop)/         # Shop pages (shop, product, category, cart, checkout)
│       ├── layout.tsx      # Root layout with providers
│       └── page.tsx        # Home page
├── components/
│   ├── common/             # Reusable UI components
│   ├── layout/             # Header, Footer
│   ├── seo/                # SEO components (JsonLd, Breadcrumbs)
│   └── shop/               # E-commerce components
├── config/                 # Site configuration
├── contexts/               # React contexts (Currency, Cart)
├── i18n/                   # Internationalization dictionaries
├── lib/
│   ├── graphql/            # GraphQL client and queries
│   └── utils/              # Utility functions
├── types/                  # TypeScript type definitions
└── middleware.ts           # Locale detection middleware
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- WordPress with WooCommerce, WPGraphQL, and WPML (for backend)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/muhsiltomsher-cloud/aromatic-scents-lab.git
cd aromatic-scents-lab
```

2. Install dependencies:
```bash
npm install
```

3. Copy the environment file and configure:
```bash
cp .env.example .env.local
```

4. Update `.env.local` with your WordPress GraphQL endpoint:
```
NEXT_PUBLIC_WORDPRESS_GRAPHQL_URL=https://your-wordpress-site.com/graphql
NEXT_PUBLIC_SITE_URL=https://your-frontend-url.com
```

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the site.

## WordPress Backend Setup

### Required Plugins

- WPGraphQL
- WPGraphQL WooCommerce
- WPML (for multilingual support)
- WooCommerce Multilingual & Multicurrency (WCML)
- Yoast SEO or Rank Math (with WPGraphQL integration)

### GraphQL Endpoint

Ensure your WordPress GraphQL endpoint is accessible at `/graphql` and configured to:
- Return translated content based on language context
- Support currency switching via cookies/headers
- Expose product, category, page, and menu data

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Supported Currencies

| Market | Code | Symbol |
|--------|------|--------|
| Bahrain | BHD | BD |
| Kuwait | KWD | KD |
| Oman | OMR | OMR |
| Qatar | QAR | QR |
| Saudi Arabia | SAR | SAR |
| United States | USD | $ |

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the repository in Vercel
3. Configure environment variables
4. Deploy

### Other Platforms

The project can be deployed to any platform that supports Next.js:
- Netlify
- AWS Amplify
- Self-hosted with Node.js

## Caching Strategy

This app uses a multi-layer caching strategy optimized for SSR with Cloudflare CDN.

### Next.js ISR (Incremental Static Regeneration)

Pages use `revalidate` for time-based cache invalidation:
- Home page: 60 seconds
- Product pages: 300 seconds (5 minutes)
- Categories: 600 seconds (10 minutes)

### Cloudflare Cache Rules

When using Cloudflare as CDN, configure these cache rules:

| Route Pattern | Cache Behavior | Reason |
|---------------|----------------|--------|
| `/cart`, `/checkout`, `/account/*`, `/api/*` | **Bypass** | User-specific, session-dependent |
| `/_next/static/*`, images, fonts | **Cache 1 month** | Content-hashed, safe to cache |
| All other HTML | **Default (ISR)** | Let Next.js control freshness |

**Important:** Never enable "Cache Everything" for HTML pages - this breaks cart, checkout, and authentication flows.

See `TODO-LIVE.md` for detailed Cloudflare rule expressions and verification checklist.

## License

This project is proprietary software for Aromatic Scents Lab.

<!-- Test PR access verification -->
