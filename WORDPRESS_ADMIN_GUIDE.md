# WordPress Admin Guide for ASL Frontend

This guide explains how to configure the home page sections, logo, and menu from the WordPress admin panel.

## Quick Start - Install the ASL Plugin

The easiest way to set up all settings is to install the ASL Frontend Settings plugin:

### Installation Steps

1. Download the file `wordpress/asl-frontend-settings.php` from this repository
2. Upload it to your WordPress site using one of these methods:

**Method A: MU-Plugin (Recommended)**
- Upload to: `wp-content/mu-plugins/asl-frontend-settings.php`
- Create the `mu-plugins` folder if it doesn't exist
- The plugin activates automatically

**Method B: Regular Plugin**
- Upload to: `wp-content/plugins/asl-frontend-settings.php`
- Go to **Plugins** in WordPress admin
- Activate "ASL Frontend Settings"

### What the Plugin Does

- Adds **Appearance > Customize** menu item (hidden in block themes like Twenty Twenty-Five)
- Creates **ASL Frontend Settings** panel in the Customizer with all home page sections
- Exposes settings via REST API at `/wp-json/asl/v1/customizer`
- Registers Primary and Footer menu locations
- Adds CORS headers for frontend access
- Supports bilingual content (English and Arabic)

## Configuring Settings

After installing the plugin:

1. Go to **Appearance > Customize** in WordPress admin
2. Click on **ASL Frontend Settings** panel
3. Configure each section:

### Available Sections

| Section | Settings |
|---------|----------|
| **Header & Logo** | Sticky header toggle, sticky logo, dark mode logo |
| **Promotional Top Bar** | Enable/disable, text (EN/AR), link, colors, dismissible option |
| **SEO Settings** | Meta title (EN/AR), meta description (EN/AR), OG image, robots meta |
| **Mobile Bottom Bar** | Enable/disable, 5 configurable items with icons, labels (EN/AR), URLs |
| **Hero Slider** | Enable/disable, autoplay, delay, loop, up to 5 slides with desktop/mobile images |
| **New Products** | Enable/disable, title (EN/AR), subtitle (EN/AR), count, slider/grid toggle, responsive columns |
| **Bestsellers** | Enable/disable, title (EN/AR), subtitle (EN/AR), count, slider/grid toggle, responsive columns |
| **Shop by Category** | Enable/disable, title (EN/AR), subtitle (EN/AR), count, responsive columns |
| **Featured Products** | Enable/disable, title (EN/AR), subtitle (EN/AR), count, autoplay, responsive columns |
| **Collections** | Enable/disable, title (EN/AR), subtitle (EN/AR), up to 6 items with Arabic support |
| **Banners** | Enable/disable, up to 4 banners with titles (EN/AR), subtitles (EN/AR) |

4. Click **Publish** to save changes

## New Features in Version 2.0

### Header & Logo Settings

Configure the header appearance:

| Setting | Description |
|---------|-------------|
| Enable Sticky Header | Header stays fixed at top when scrolling |
| Sticky Logo | Different logo to show when header is sticky/scrolled |
| Dark Mode Logo | Logo for dark mode (if implemented) |

### Promotional Top Bar

Configure the announcement bar at the top of the page:

| Setting | Description |
|---------|-------------|
| Enable Promotional Top Bar | Show/hide the top bar |
| Promotional Text (English) | Main text content in English |
| Promotional Text (Arabic) | Main text content in Arabic |
| Link URL | Optional link when clicking the bar |
| Background Color | Background color of the bar |
| Text Color | Text color of the bar |
| Allow users to dismiss | Show close button to hide the bar |

### SEO Settings

Configure SEO meta tags for the home page:

| Setting | Description |
|---------|-------------|
| Meta Title (English) | SEO title for English pages |
| Meta Title (Arabic) | SEO title for Arabic pages |
| Meta Description (English) | SEO description for English pages (150-160 chars recommended) |
| Meta Description (Arabic) | SEO description for Arabic pages |
| Social Share Image (OG Image) | Image for social media sharing (1200x630px recommended) |
| Robots Meta | Search engine indexing settings |

### Mobile Bottom Bar

Configure the mobile navigation bar (5 items):

| Setting | Description |
|---------|-------------|
| Enable Mobile Bottom Bar | Show/hide the mobile bottom navigation |
| Item X - Enable | Enable/disable individual items |
| Item X - Icon | Choose icon: home, shop, categories, wishlist, account, cart, search, menu |
| Item X - Label (English) | Label text in English |
| Item X - Label (Arabic) | Label text in Arabic |
| Item X - URL | Link URL for the item |

### Slider/Grid Toggle (New Products & Bestsellers)

Both New Products and Bestsellers sections now support:

| Setting | Description |
|---------|-------------|
| Display Mode | Choose between Slider or Grid layout |
| Enable Slider Autoplay | Auto-scroll when in slider mode |
| Desktop - Columns/Slides | Number of items per row on desktop (2-6) |
| Tablet - Columns/Slides | Number of items per row on tablet (2-4) |
| Mobile - Columns/Slides | Number of items per row on mobile (1-3) |

### Arabic Translation Fields

All text fields now have Arabic versions. The frontend automatically displays the correct language based on the user's locale. Arabic fields use the `_ar` suffix pattern:

- `asl_new_products_title` (English)
- `asl_new_products_title_ar` (Arabic)

## Site Identity Settings

Configure logo and favicon in **Appearance > Customize > Site Identity**:

| Setting | Description |
|---------|-------------|
| Site Title | Your website name (displayed in header if no logo) |
| Tagline | Short description of your site |
| Logo | Upload your site logo (recommended: PNG with transparent background, max width 200px) |
| Site Icon | Upload favicon (recommended: 512x512px PNG) |

## Alternative: Manual Setup (Without Plugin)

If you prefer to add the code manually, you can add the following to your theme's `functions.php` or create a custom plugin. See the complete code in `wordpress/asl-frontend-settings.php`.

## ACF Field Groups

### Site Settings Field Group

Create a field group for site settings with the following fields:

#### Logo Settings
| Field Label | Field Name | Field Type | Instructions |
|-------------|------------|------------|--------------|
| Site Logo | `site_logo` | Image | Upload your site logo (recommended: PNG with transparent background, max width 200px) |
| Logo Alt Text | `logo_alt` | Text | Alternative text for the logo |

Location Rule: Options Page is equal to Site Settings

### Home Page Field Group

Create a field group for home page settings with the following fields:

#### Hero Slider Section

| Field Label | Field Name | Field Type | Instructions |
|-------------|------------|------------|--------------|
| Enable Hero Slider | `hero_enabled` | True/False | Enable or disable the hero slider |
| Hero Slides | `hero_slides` | Repeater | Add slides to the hero slider |

**Hero Slides Repeater Sub-fields:**
| Field Label | Field Name | Field Type | Instructions |
|-------------|------------|------------|--------------|
| Desktop Image | `image` | Image | Upload hero image for desktop (recommended: 1920x800px) |
| Mobile Image | `mobile_image` | Image | Upload hero image for mobile (recommended: 768x600px) |
| Link URL | `link_url` | URL | Optional link when clicking the slide |
| Link Target | `link_target` | Select | Choose `_self` (same tab) or `_blank` (new tab) |

**Hero Slider Settings:**
| Field Label | Field Name | Field Type | Instructions |
|-------------|------------|------------|--------------|
| Autoplay | `hero_autoplay` | True/False | Enable automatic slide transition |
| Autoplay Delay | `hero_autoplay_delay` | Number | Delay between slides in milliseconds (default: 5000) |
| Loop | `hero_loop` | True/False | Enable infinite loop |

#### New Products Section

| Field Label | Field Name | Field Type | Instructions |
|-------------|------------|------------|--------------|
| Enable New Products | `new_products_enabled` | True/False | Show/hide the new products section |
| Section Title | `new_products_title` | Text | Title for the section (leave empty for default) |
| Section Subtitle | `new_products_subtitle` | Text | Subtitle for the section |
| Number of Products | `new_products_count` | Number | Number of products to display (default: 8) |
| Show View All Link | `new_products_show_view_all` | True/False | Show "View All" link |
| View All URL | `new_products_view_all_url` | URL | Custom URL for View All link |

#### Bestseller Products Section

| Field Label | Field Name | Field Type | Instructions |
|-------------|------------|------------|--------------|
| Enable Bestsellers | `bestseller_enabled` | True/False | Show/hide the bestseller section |
| Section Title | `bestseller_title` | Text | Title for the section |
| Section Subtitle | `bestseller_subtitle` | Text | Subtitle for the section |
| Number of Products | `bestseller_count` | Number | Number of products to display (default: 8) |
| Show View All Link | `bestseller_show_view_all` | True/False | Show "View All" link |
| View All URL | `bestseller_view_all_url` | URL | Custom URL for View All link |

#### Shop by Category Section

| Field Label | Field Name | Field Type | Instructions |
|-------------|------------|------------|--------------|
| Enable Categories | `categories_enabled` | True/False | Show/hide the categories section |
| Section Title | `categories_title` | Text | Title for the section |
| Section Subtitle | `categories_subtitle` | Text | Subtitle for the section |
| Number of Categories | `categories_count` | Number | Number of categories to display (default: 6) |
| Show View All Link | `categories_show_view_all` | True/False | Show "View All" link |

#### Featured Products Slider Section

| Field Label | Field Name | Field Type | Instructions |
|-------------|------------|------------|--------------|
| Enable Featured Slider | `featured_enabled` | True/False | Show/hide the featured products slider |
| Section Title | `featured_title` | Text | Title for the section |
| Section Subtitle | `featured_subtitle` | Text | Subtitle for the section |
| Number of Products | `featured_count` | Number | Number of products in slider (default: 12) |
| Autoplay | `featured_autoplay` | True/False | Enable automatic slide transition |
| Show View All Link | `featured_show_view_all` | True/False | Show "View All" link |

#### Collections Section

| Field Label | Field Name | Field Type | Instructions |
|-------------|------------|------------|--------------|
| Enable Collections | `collections_enabled` | True/False | Show/hide the collections section |
| Section Title | `collections_title` | Text | Title for the section |
| Section Subtitle | `collections_subtitle` | Text | Subtitle for the section |
| Collections | `collections_items` | Repeater | Add collection items |

**Collections Repeater Sub-fields:**
| Field Label | Field Name | Field Type | Instructions |
|-------------|------------|------------|--------------|
| Collection Image | `image` | Image | Upload collection image (recommended: 600x400px) |
| Collection Title | `title` | Text | Title of the collection |
| Collection Description | `description` | Textarea | Short description |
| Link URL | `link_url` | URL | Link to the collection page |

#### Banners Section

| Field Label | Field Name | Field Type | Instructions |
|-------------|------------|------------|--------------|
| Enable Banners | `banners_enabled` | True/False | Show/hide the banners section |
| Banners | `banners_items` | Repeater | Add promotional banners |

**Banners Repeater Sub-fields:**
| Field Label | Field Name | Field Type | Instructions |
|-------------|------------|------------|--------------|
| Desktop Image | `image` | Image | Upload banner image for desktop (recommended: 1200x400px) |
| Mobile Image | `mobile_image` | Image | Upload banner image for mobile (recommended: 768x400px) |
| Banner Title | `title` | Text | Optional title overlay |
| Banner Subtitle | `subtitle` | Text | Optional subtitle overlay |
| Link URL | `link_url` | URL | Link when clicking the banner |
| Link Target | `link_target` | Select | Choose `_self` or `_blank` |

Location Rule: Options Page is equal to Home Page Settings

## Menu Configuration

### Creating Navigation Menus

1. Go to **Appearance > Menus** in WordPress admin
2. Create a new menu called `Primary Menu`
3. Add your desired pages, categories, or custom links
4. Under **Menu Settings**, check the location `Primary` or `Header`
5. Save the menu

### Menu Locations

The frontend supports these menu locations:

- **Primary Menu**: Main navigation in the header
- **Footer Menu**: Links in the footer area

### Exposing Menus via REST API

Install and activate the **WP REST API Menus** plugin to expose menus via the REST API. The frontend will fetch menus from:

```
/wp-json/menus/v1/menus/primary
/wp-json/menus/v1/menus/footer
```

## API Endpoints

The ASL Frontend Settings plugin exposes these REST API endpoints:

| Endpoint | Description |
|----------|-------------|
| `/wp-json/asl/v1/customizer` | All Customizer settings (complete data) |
| `/wp-json/asl/v1/home-settings` | Home page sections only |
| `/wp-json/asl/v1/site-settings` | Site identity (name, logo, favicon) |
| `/wp-json/asl/v1/header-settings` | Header configuration (sticky, logos) |
| `/wp-json/asl/v1/seo-settings` | SEO meta tags |
| `/wp-json/asl/v1/topbar` | Promotional top bar settings |
| `/wp-json/asl/v1/mobile-bar` | Mobile bottom bar configuration |
| `/wp-json/asl/v1/menu/{location}` | Navigation menu by location (primary, footer) |

**Additional WordPress endpoints:**

| Endpoint | Description |
|----------|-------------|
| `/wp-json` | WordPress root endpoint - site name, description |
| `/wp-json/wp/v2/media/{id}` | Media endpoint - fetches image URLs by ID |

**Note:** The frontend tries multiple endpoints and uses the first available data source. This provides flexibility for different WordPress configurations.

## Multilingual Support (WPML/Polylang)

If using WPML or Polylang for multilingual support:

1. Translate all ACF option fields for each language
2. The frontend automatically passes the `lang` parameter to API requests
3. Ensure menu items are translated for each language

## Image Recommendations

| Section | Desktop Size | Mobile Size | Format |
|---------|-------------|-------------|--------|
| Hero Slider | 1920x800px | 768x600px | JPG/WebP |
| Category Images | 600x400px | - | JPG/WebP |
| Collection Images | 600x400px | - | JPG/WebP |
| Banners | 1200x400px | 768x400px | JPG/WebP |
| Logo | Max 200px width | - | PNG (transparent) |

## Troubleshooting

### Sections Not Appearing

1. Verify the section is enabled in ACF options
2. Check that ACF to REST API plugin is active
3. Verify the API endpoint returns data: `https://your-domain.com/wp-json/acf/v3/options/home-page-settings`

### Images Not Loading

1. Ensure images are uploaded to the WordPress media library
2. Check that image URLs are accessible (no CORS issues)
3. Verify image field returns full URL in REST API response

### Menu Not Updating

1. Clear any caching plugins
2. Verify WP REST API Menus plugin is active
3. Check menu is assigned to the correct location

## Cache Invalidation

The frontend caches WordPress API responses for 60 seconds. To see immediate changes:

1. Wait 60 seconds after making changes
2. Or trigger a revalidation by visiting the site with `?revalidate=true` (if implemented)

## Support

For technical support or custom development, contact the development team.
