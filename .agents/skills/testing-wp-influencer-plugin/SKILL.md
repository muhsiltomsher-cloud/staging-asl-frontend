---
name: testing-wp-influencer-plugin
description: Test the WordPress Influencer Tracking plugin end-to-end on staging. Use when verifying influencer CRUD, Link Generator, Activity Logs, Stats, or Visit Log features.
---

# Testing WordPress Influencer Tracking Plugin

## Overview
The Influencer Tracking plugin lives at `wordpress/asl-frontend-settings/includes/class-asl-influencer-tracking.php` and provides 5 tabs in WP Admin under WooCommerce > Influencer Tracking:
1. **Influencers** — CRUD for influencer profiles (name, code, platform, commission, active status)
2. **Stats & Reports** — KPI cards, influencer summary table, CSV export, date range filtering
3. **Visit Log** — Paginated visit history with IP, user agent, landing page
4. **Link Generator** — Generate tracking URLs with home page or custom URL/path landing pages
5. **Activity Logs** — Audit log of activate/deactivate/create/delete/update events with user attribution and filtering

## Devin Secrets Needed
- WP Admin credentials (username/password) for staging login
- SSH credentials (host, port, username, password) if deploying plugin code to staging server

## Staging Environment
- **WP Admin URL:** https://staging.aromaticscentslab.com/wp-admin
- **Plugin page:** `?page=ep-influencer-tracking` (note: slug is `ep-influencer-tracking`, NOT `asl-influencer-tracking`)
- **Menu slug:** `ep-influencer-tracking` — this is critical; the live WP server registers this slug

## Rate Limiting
The staging server has aggressive rate limiting (HTTP 429) after 2-3 rapid requests. Workarounds:
- **Browser testing:** Wait 30-45 seconds between page loads
- **Hybrid approach (recommended):** Use curl with session cookies for form submissions and content verification, browser only for key visual screenshots
- **curl login:** `curl -s -c cookies.txt -b cookies.txt 'https://staging.aromaticscentslab.com/wp-login.php' -d 'log=admin&pwd=PASSWORD&wp-submit=Log+In&redirect_to=%2Fwp-admin%2F&testcookie=1' -H 'Cookie: wordpress_test_cookie=WP%20Cookie%20check' -L -o /dev/null`
- **curl page load:** `curl -s -b cookies.txt 'https://staging.aromaticscentslab.com/wp-admin/admin.php?page=ep-influencer-tracking&tab=linkgen'`
- Always add `sleep 10` before curl requests to avoid triggering rate limits

## Key Test Flows

### Link Generator
1. Get nonce: `grep '_wpnonce" value="' page.html`
2. Generate home page link: POST with `gen_influencer=CODE&gen_type=home&asl_generate_link=1`
3. Generate custom URL link: POST with `gen_influencer=CODE&gen_type=custom&gen_custom_url=shop/oud&asl_generate_link=1`
4. Verify success: grep for `notice-success` and `Tracking link generated successfully!`
5. Verify URL: grep for `gen-result-url` value attribute
6. Verify history: parse `asl-gen-history-table` for influencer name, code, type, landing page, full URL

### Activity Logs (Deactivate/Reactivate)
1. Load influencers tab, get nonce and all influencer data
2. Submit save form with one influencer's `active` checkbox omitted (deactivation)
3. Load activity tab: grep for `asl-log-deactivated` to verify log entry
4. Submit save form again with `active=1` restored (reactivation)
5. Load activity tab: grep for `asl-log-activated`
6. Test filter: append `&filter_action=deactivated` to URL

### Influencer Save Form
The save form requires ALL influencer fields for ALL influencers:
- `asl_influencers[N][id]`, `[created_at]`, `[active]`, `[name]`, `[code]`, `[platform]`, `[email]`, `[commission_rate]`, `[fixed_amount]`, `[notes]`
- Omitting `[active]` for an influencer deactivates them
- The nonce field name is `_wpnonce`
- Submit button: `asl_influencer_save=Save All Influencers`

## Deployment
Code changes in git do NOT auto-deploy to staging. Manual upload required:
- SSH to staging server and upload the plugin PHP file
- Target path: `/home/u327034204/domains/staging.aromaticscentslab.com/public_html/wp-content/plugins/asl-frontend-settings/includes/class-asl-influencer-tracking.php`
- Verify deployment by checking tab count or specific HTML elements via curl

## Common Pitfalls
- The page renders TWO sets of content: the tab-specific content AND the old stats section below it. Check the FIRST occurrence of elements when verifying.
- jQuery `.data()` stores values in memory, not DOM attributes. Use browser console `jQuery('#el').data('key')` to read them, not grep on HTML.
- The `wpColorPicker is not a function` error in console is from an unrelated plugin (myfatoorah-woocommerce) and is harmless.
- When saving influencers via curl, platform values may not match exactly what was stored (select dropdowns). This can generate extra "Updated" activity log entries — this is expected behavior.

## No CI Configured
This repo has no CI checks. Rely on PHP syntax validation (`php -l file.php`) and visual testing.
