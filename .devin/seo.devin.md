# ASL Staging - SEO & Search Engine Indexing Management

## Outcome
Manage search engine indexing for staging sites. Staging sites must NOT be indexed by Google or other search engines. This playbook covers frontend (Next.js), backend (WordPress), and Google Search Console removal procedures.

## Current State
- **Frontend (Next.js)**: All pages return `noindex, nofollow` meta tags. Crawlers blocked via robots.txt. Sitemap returns empty. `X-Robots-Tag` header added to all responses.
- **Backend (WordPress `staging.aromaticscentslab.com`)**: "Discourage search engines" enabled in Settings > Reading. Yoast SEO XML sitemaps disabled. WordPress outputs `<meta name='robots' content='noindex, nofollow' />` on all pages.
- **Google Search Console**: Staging domain verified via HTML meta tag (Yoast SEO Site Connections). URL removal request submitted for `staging.aromaticscentslab.com/`.

## SEO-Related Files (Frontend)

| File | Purpose |
|---|---|
| `src/app/robots.ts` | Controls robots.txt - currently blocks all crawlers with `Disallow: /` |
| `src/app/sitemap.ts` | Generates XML sitemap - currently returns empty array |
| `src/lib/utils/seo.ts` | SEO metadata generator - always returns `index: false, follow: false` |
| `src/app/layout.tsx` | Root layout - includes `robots: { index: false, follow: false }` in metadata |
| `src/app/[locale]/layout.tsx` | Locale layout - forces `noindex, nofollow` on all locale pages |
| `next.config.ts` | Adds `X-Robots-Tag: noindex, nofollow, noarchive, nosnippet` header to all responses |
| `src/components/seo/` | SEO components (JsonLd, Breadcrumbs) - structured data still present for frontend rendering |

## Procedure

### Disable Indexing (Frontend - Next.js)
1. In `src/app/robots.ts`: Set `disallow: "/"` for all user agents
2. In `src/app/sitemap.ts`: Return empty array `[]`
3. In `src/lib/utils/seo.ts`: Set `robots: { index: false, follow: false }` in the metadata return
4. In `src/app/layout.tsx`: Add `robots: { index: false, follow: false, googleBot: { index: false, follow: false } }` to metadata
5. In `src/app/[locale]/layout.tsx`: Same robots metadata as above
6. In `next.config.ts`: Add `X-Robots-Tag` header with value `noindex, nofollow, noarchive, nosnippet` to all responses
7. Delete any Google verification HTML files from `/public/`
8. Run `npm run lint` to verify no errors

### Disable Indexing (Backend - WordPress)
1. Log into WordPress admin at `https://staging.aromaticscentslab.com/wp-admin/`
   - Credentials: username `admin`, password stored in secrets (do not hardcode)
2. Go to **Settings > Reading**
3. Check **"Discourage search engines from indexing this site"**
4. Save changes
5. Go to **Yoast SEO > Settings > General > Site features**
6. Disable **XML sitemaps** to prevent sitemap generation
7. Verify: `curl -s https://staging.aromaticscentslab.com/ | grep -i 'robots'` should return `<meta name='robots' content='noindex, nofollow' />`
8. Verify: `curl -s https://staging.aromaticscentslab.com/sitemap_index.xml` should return 404

### Immediate Removal from Google (Google Search Console)
If staging URLs are already indexed by Google and need immediate removal (24-48 hours instead of weeks):

1. **Add Google verification meta tag to WordPress**:
   - Go to **Yoast SEO > Settings > General > Site connections**
   - In the **Google** field, paste the verification code from Google Search Console
   - The code is the `content` attribute value from the meta tag Google provides (e.g., `f_mMaADw5xQDw862fP3PjCa-2conJWM6uY0H_goWpE8`)
   - Click **Save changes**
   - Verify: `curl -s https://staging.aromaticscentslab.com/ | grep 'google-site-verification'` should show the meta tag

2. **Add staging domain to Google Search Console**:
   - Go to https://search.google.com/search-console
   - Click **"+ Add property"**
   - Choose **"URL prefix"** and enter `https://staging.aromaticscentslab.com/`
   - For verification method, choose **"HTML tag"** - Google will detect the meta tag added via Yoast
   - Click **Verify**

3. **Submit URL removal request**:
   - Once verified, go to **Removals** in the left sidebar
   - Click **"New Request"**
   - Enter `staging.aromaticscentslab.com/`
   - Select **"Remove all URLs with this prefix"**
   - Submit - removal takes effect within **24-48 hours**

4. **For frontend on a different domain** (e.g., `app.aromaticscentslab.com`):
   - The frontend noindex/nofollow tags will cause Google to de-index within 1-2 weeks automatically
   - For immediate removal, repeat steps 1-3 for the frontend domain
   - Add the Google verification meta tag to `src/app/layout.tsx` instead of WordPress

### Enable Indexing (for production launch)
1. In `src/app/robots.ts`: Change `disallow` to `"/wp-admin/"` or specific paths only
2. In `src/app/sitemap.ts`: Restore sitemap generation logic
3. In `src/lib/utils/seo.ts`: Set `index: true, follow: true` (respect `noIndex` parameter)
4. In `src/app/layout.tsx` and `src/app/[locale]/layout.tsx`: Remove forced `noindex` robots metadata
5. In `next.config.ts`: Remove `X-Robots-Tag` header
6. In WordPress: Uncheck "Discourage search engines" in Settings > Reading
7. In WordPress: Re-enable Yoast XML sitemaps
8. Add Google verification file back to `/public/` if needed
9. Submit site to Google Search Console for indexing

## Specifications
- Staging sites must NEVER be indexed by search engines
- Production sites should be indexed (when ready for launch)
- The `noIndex` parameter in `seo.ts` is kept for API compatibility but is currently always overridden to `true`
- WordPress backend and Next.js frontend may be on different domains - both need separate noindex configuration
- Google Search Console verification codes are account-specific - use the code from the Google account that owns the Search Console property

## Advice
- Always verify changes with `curl` after making WordPress admin changes - caching can delay visibility
- Yoast SEO can override WordPress default robots.txt - always check both Yoast settings and WordPress Reading settings
- The `X-Robots-Tag` HTTP header provides an additional layer of protection beyond meta tags
- Google Search Console removal is temporary (6 months) - the noindex meta tags provide permanent de-indexing
- If Yoast SEO conflicts with WordPress noindex setting, disable Yoast XML sitemaps and verify robots.txt output

## Forbidden Actions
- Do not enable indexing on staging sites without explicit approval
- Do not commit Google verification codes or Search Console credentials to the repo
- Do not remove noindex/nofollow from staging without replacing it with authentication or IP restriction
- Do not modify production site SEO settings from this playbook - this is for staging only
