# Testing ASL Frontend

## Overview
This skill covers end-to-end testing of the Aromatic Scents Lab (ASL) frontend, a Next.js e-commerce application with WooCommerce backend.

## Devin Secrets Needed
- Jira credentials for accessing the SCRUM board (stored as JIRA_EMAIL / JIRA_PASSWORD or provided inline)
- No frontend-specific secrets needed for local testing

## Local Dev Setup
1. The repo is at `~/repos/staging-asl-frontend`
2. Ensure `.env.local` exists with WordPress GraphQL URL and WooCommerce API credentials
3. Start dev server: `cd ~/repos/staging-asl-frontend && npm run dev`
4. Access at `http://localhost:3000/en` (English) or `http://localhost:3000/ar` (Arabic)
5. Live staging URL: `https://app.aromaticscentslab.com/en`

## Key Test Flows

### Homepage
- Hero banner loads without gap below header (no `border-b` on sticky header)
- Hero slider pagination dots centered at bottom
- Featured Products and Bestsellers carousels have consistent arrow styles
- MegaMenu (hover "Shop All") shows deduplicated featured products

### Shop Page (`/en/shop`)
- Product cards use `WCProductCard.tsx` (NOT `ProductCard.tsx` which is used on homepage sections)
- Mobile: Add to Cart buttons should be always visible (opacity-100)
- Desktop: Add to Cart buttons appear on hover only (md:opacity-0 md:group-hover:opacity-100)

### Product Detail Page
- Description accordion shows full `product.description`, falls back to `short_description`
- Quantity selector uses default cursor (not text caret)
- No duplicate attributes displayed

### Cart
- Cart badge in header shows total quantity sum (not distinct item count)
- Uses `cartItems.reduce((total, item) => total + (item.quantity?.value || 1), 0)`

### Registration (`/en/register`)
- Password field shows inline strength checklist when typing
- 5 requirements: 8+ chars, uppercase, lowercase, number, special char
- Green checkmarks (✓) for passing, gray circles (○) for failing

### Language Switcher
- Globe button in header should show `cursor: default` not `cursor: pointer`
- Uses `!cursor-default` (Tailwind !important) to override global `button { cursor: pointer }` in globals.css

### Search
- "View all results" button uses `bg-gray-900` (dark gray) color

## Mobile Viewport Testing
- Use `set_mobile` browser action to enable mobile mode (~410px width)
- Key breakpoint: `md:` = 768px (Tailwind default)
- Always test responsive classes like `opacity-100 md:opacity-0` by checking both mobile and desktop
- Use JS console to verify computed styles: `getComputedStyle(element).propertyName`

## Common Pitfalls

### Multiple Product Card Components
The codebase has TWO product card components:
- `ProductCard.tsx` — used on homepage sections (New Products, Featured, Bestsellers)
- `WCProductCard.tsx` — used on `/shop` page and category pages
When fixing product card issues, check BOTH components.

### CSS Specificity Issues
`globals.css` has a global rule setting `cursor: pointer` on all `button` elements. Tailwind utility classes may not override this without `!important` modifier (prefix with `!` in Tailwind v4, e.g., `!cursor-default`).

### Build Cache
If rendered CSS doesn't match source code changes, try:
1. Stop dev server
2. Delete `.next` folder: `rm -rf .next`
3. Restart: `npm run dev`

### Hero Slider Dots
With only 1 slide in the backend, pagination dots may not render. The CSS fix (flexbox centering) is verifiable via code inspection even if dots aren't visible.

## Lint
Run before committing: `npx eslint .` (or specific files)

## No CI Configured
This repo has no CI checks. Rely on local lint + visual testing.
