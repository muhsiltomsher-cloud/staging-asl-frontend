# ASL Staging Frontend - Project Setup & Development

## Outcome
Set up and run the Aromatic Scents Lab staging frontend locally for development.

## Project Overview
- **Stack**: Next.js 16 (App Router), React 19, TypeScript 5, Tailwind CSS 4
- **Backend**: WordPress/WooCommerce (headless) at `https://staging.aromaticscentslab.com`
- **Locales**: English (`/en/`) and Arabic (`/ar/`, RTL)
- **Currencies**: AED (default), BHD, KWD, OMR, QAR, SAR, USD
- **Deployment**: Netlify (see `netlify.toml`)
- **Custom Server**: `server.js` (Node.js HTTP server wrapping Next.js)

## Procedure

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env.local
```
Fill in required values in `.env.local`:
- `NEXT_PUBLIC_SITE_URL` - Frontend URL (staging: `https://app.aromaticscentslab.com`)
- `NEXT_PUBLIC_WC_API_URL` - WordPress backend URL (`https://staging.aromaticscentslab.com`)
- `NEXT_PUBLIC_WORDPRESS_GRAPHQL_URL` - GraphQL endpoint (`https://staging.aromaticscentslab.com/graphql`)
- `WC_CONSUMER_KEY` - WooCommerce REST API consumer key (secret: `_Consumer_key`)
- `WC_CONSUMER_SECRET` - WooCommerce REST API consumer secret (secret: `Consumer_secret`)
- `MYFATOORAH_API_KEY` - MyFatoorah payment gateway API key
- `TABBY_SECRET_KEY` / `TABBY_MERCHANT_CODE` - Tabby BNPL credentials
- `TAMARA_API_TOKEN` / `NEXT_PUBLIC_TAMARA_PUBLIC_KEY` - Tamara BNPL credentials
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID` - Google OAuth client ID

### 3. Run Development Server
```bash
npm run dev
```
Open http://localhost:3000 - auto-redirects to `/en/` or `/ar/` based on browser locale.

### 4. Build for Production
```bash
npm run build
npm run start
```

### 5. Run Lint
```bash
npm run lint
```
ESLint config is at `eslint.config.mjs` using `eslint-config-next` with Core Web Vitals and TypeScript rules.

## Specifications
- Node.js 18+ required
- The `server.js` file uses CommonJS and is excluded from ESLint
- The `postbuild` script generates a `.htaccess` file for Passenger (Hostinger deployment)
- Images are served from `staging.aromaticscentslab.com` and `aromaticscentslab.com` (configured in `next.config.ts`)
- Static pages use ISR with revalidation times: Home 60s, Products 300s, Categories 600s

## Advice
- Always test both `/en/` and `/ar/` locales - Arabic uses RTL layout
- The staging backend is at `https://staging.aromaticscentslab.com`, production is at `https://aromaticscentslab.com`
- API keys and secrets should NEVER be committed to the repo - use `.env.local`
- Check `ASL-WEBSITE.md` for complete API route documentation
- Check `WORDPRESS_ADMIN_GUIDE.md` for WordPress backend configuration
- Check `TODO-LIVE.md` for production checklist and testing results
