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

### ASL Frontend Settings Plugin Endpoints

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

---

## Complete API Reference

This section documents all APIs used by the ASL Frontend application, including WordPress/WooCommerce backend APIs and Next.js API routes.

### Authentication APIs

The authentication system uses CoCart JWT for cart operations and WordPress JWT for wishlist operations.

#### Login
- **Endpoint:** `POST /wp-json/cocart/v2/login`
- **Description:** Authenticates user and returns JWT tokens for cart and wishlist operations
- **Request Body:**
  ```json
  {
    "username": "string",
    "password": "string"
  }
  ```
- **Response:**
  ```json
  {
    "jwt_token": "string",
    "jwt_refresh_token": "string",
    "user_id": "number",
    "email": "string",
    "user_nicename": "string",
    "display_name": "string"
  }
  ```
- **Additional:** Also fetches WordPress JWT token from `/wp-json/jwt-auth/v1/token` for YITH wishlist operations

#### Register
- **Endpoint:** `POST /api/customer` (Next.js API route)
- **Description:** Creates a new customer account
- **Request Body:**
  ```json
  {
    "username": "string",
    "email": "string",
    "password": "string",
    "first_name": "string"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "id": "number"
    }
  }
  ```

#### Validate Token
- **Endpoint:** `POST /wp-json/cocart/jwt/validate-token`
- **Description:** Validates if the current JWT token is still valid
- **Headers:** `Authorization: Bearer {token}`
- **Response:** HTTP 200 if valid, error otherwise

#### Refresh Token
- **Endpoint:** `POST /wp-json/cocart/jwt/refresh-token`
- **Description:** Refreshes an expired JWT token
- **Request Body:**
  ```json
  {
    "refresh_token": "string"
  }
  ```
- **Response:**
  ```json
  {
    "jwt_token": "string"
  }
  ```

#### Forgot Password
- **Endpoint:** `POST /api/auth/forgot-password` (Next.js API route)
- **Description:** Sends password reset email to user
- **Request Body:**
  ```json
  {
    "email": "string"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "message": "Password reset email sent"
  }
  ```

### Cart APIs (CoCart)

All cart operations use the CoCart plugin API through Next.js API routes for server-side processing.

#### Get Cart
- **Endpoint:** `GET /api/cart` (Next.js API route)
- **Description:** Retrieves the current cart contents
- **Headers:** `Authorization: Bearer {token}` (optional, for authenticated users)
- **Response:**
  ```json
  {
    "success": true,
    "cart": {
      "cart_hash": "string",
      "cart_key": "string",
      "items": [
        {
          "item_key": "string",
          "id": "number",
          "name": "string",
          "price": "string",
          "quantity": { "value": "number" },
          "totals": { "subtotal": "string", "total": "string" },
          "featured_image": "string"
        }
      ],
      "item_count": "number",
      "totals": {
        "subtotal": "string",
        "total": "string",
        "discount_total": "string"
      },
      "coupons": []
    }
  }
  ```

#### Add to Cart
- **Endpoint:** `POST /api/cart?action=add` (Next.js API route)
- **Description:** Adds a product to the cart
- **Request Body:**
  ```json
  {
    "id": "string",
    "quantity": "string",
    "variation_id": "string (optional)",
    "variation": { "attribute_name": "value" }
  }
  ```
- **Response:** Returns updated cart object

#### Update Cart Item
- **Endpoint:** `POST /api/cart?action=update&item_key={item_key}` (Next.js API route)
- **Description:** Updates quantity of a cart item
- **Request Body:**
  ```json
  {
    "quantity": "string"
  }
  ```
- **Response:** Returns updated cart object

#### Remove Cart Item
- **Endpoint:** `POST /api/cart?action=remove&item_key={item_key}` (Next.js API route)
- **Description:** Removes an item from the cart
- **Response:** Returns updated cart object

#### Clear Cart
- **Endpoint:** `POST /api/cart?action=clear` (Next.js API route)
- **Description:** Removes all items from the cart
- **Response:** Returns empty cart object

#### Apply Coupon
- **Endpoint:** `POST /api/cart?action=apply-coupon` (Next.js API route)
- **Description:** Applies a discount coupon to the cart
- **Request Body:**
  ```json
  {
    "code": "string"
  }
  ```
- **Response:** Returns updated cart object with coupon applied

#### Remove Coupon
- **Endpoint:** `POST /api/cart?action=remove-coupon` (Next.js API route)
- **Description:** Removes a coupon from the cart
- **Request Body:**
  ```json
  {
    "code": "string"
  }
  ```
- **Response:** Returns updated cart object

### Wishlist APIs (YITH Wishlist)

Wishlist operations use the YITH Wishlist plugin through Next.js API routes.

#### Get Wishlist
- **Endpoint:** `GET /api/wishlist` (Next.js API route)
- **Description:** Retrieves the user's wishlist
- **Headers:** `Authorization: Bearer {token}`
- **Response:**
  ```json
  {
    "success": true,
    "wishlist": {
      "id": "number",
      "user_id": "number",
      "name": "string",
      "token": "string",
      "items": [
        {
          "id": "number",
          "product_id": "number",
          "product_name": "string",
          "product_price": "string",
          "product_image": "string",
          "product_url": "string",
          "is_in_stock": "boolean",
          "dateadded_formatted": "string"
        }
      ],
      "items_count": "number"
    },
    "items": []
  }
  ```

#### Add to Wishlist
- **Endpoint:** `POST /api/wishlist?action=add` (Next.js API route)
- **Description:** Adds a product to the wishlist
- **Headers:** `Authorization: Bearer {token}`
- **Request Body:**
  ```json
  {
    "product_id": "number",
    "variation_id": "number (optional)"
  }
  ```
- **Response:** Returns updated wishlist object
- **Error Codes:** `product_already_in_wishlist` if item already exists

#### Remove from Wishlist
- **Endpoint:** `POST /api/wishlist?action=remove` (Next.js API route)
- **Description:** Removes a product from the wishlist
- **Headers:** `Authorization: Bearer {token}`
- **Request Body:**
  ```json
  {
    "product_id": "number",
    "item_id": "number (optional)"
  }
  ```
- **Response:** Returns updated wishlist object

#### Sync Wishlist
- **Endpoint:** `POST /api/wishlist?action=sync` (Next.js API route)
- **Description:** Syncs guest wishlist items to authenticated user's wishlist
- **Headers:** `Authorization: Bearer {token}`
- **Request Body:**
  ```json
  {
    "items": [
      { "product_id": "number", "variation_id": "number (optional)" }
    ]
  }
  ```
- **Response:** Returns merged wishlist object

### Customer APIs

Customer management uses WooCommerce REST API through Next.js API routes.

#### Get Customer
- **Endpoint:** `GET /api/customer?customerId={id}` (Next.js API route)
- **Description:** Retrieves customer profile information
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "id": "number",
      "email": "string",
      "first_name": "string",
      "last_name": "string",
      "username": "string",
      "billing": {
        "first_name": "string",
        "last_name": "string",
        "company": "string",
        "address_1": "string",
        "address_2": "string",
        "city": "string",
        "state": "string",
        "postcode": "string",
        "country": "string",
        "email": "string",
        "phone": "string"
      },
      "shipping": { "...same as billing..." }
    }
  }
  ```

#### Update Customer
- **Endpoint:** `PUT /api/customer?customerId={id}` (Next.js API route)
- **Description:** Updates customer profile information
- **Request Body:** Partial customer object with fields to update
- **Response:** Returns updated customer object

#### Update Customer Address
- **Endpoint:** `PUT /api/customer?customerId={id}` (Next.js API route)
- **Description:** Updates billing or shipping address
- **Request Body:**
  ```json
  {
    "billing": { "...address fields..." }
  }
  ```
  or
  ```json
  {
    "shipping": { "...address fields..." }
  }
  ```
- **Response:** Returns updated customer object

### Orders APIs

Order management uses WooCommerce REST API through Next.js API routes.

#### Get Customer Orders
- **Endpoint:** `GET /api/orders?customerId={id}&page={page}&per_page={count}&status={status}` (Next.js API route)
- **Description:** Retrieves orders for a customer
- **Query Parameters:**
  - `customerId` (required): Customer ID
  - `page` (optional): Page number for pagination
  - `per_page` (optional): Number of orders per page
  - `status` (optional): Filter by order status (pending, processing, completed, etc.)
- **Response:**
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "number",
        "status": "string",
        "total": "string",
        "currency": "string",
        "date_created": "string",
        "line_items": [
          {
            "id": "number",
            "name": "string",
            "quantity": "number",
            "total": "string",
            "image": { "src": "string" }
          }
        ],
        "billing": { "...address..." },
        "shipping": { "...address..." }
      }
    ]
  }
  ```

#### Get Single Order
- **Endpoint:** `GET /api/orders?orderId={id}` (Next.js API route)
- **Description:** Retrieves details of a specific order
- **Response:** Returns single order object

### Products APIs (WooCommerce Store API)

Product data is fetched directly from WooCommerce Store API.

#### Get Products
- **Endpoint:** `GET /wp-json/wc/store/v1/products`
- **Description:** Retrieves product listings
- **Query Parameters:**
  - `page`: Page number
  - `per_page`: Products per page
  - `category`: Category ID
  - `search`: Search term
  - `orderby`: Sort field (date, price, popularity)
  - `order`: Sort direction (asc, desc)
  - `lang`: Locale (en, ar)
- **Response:** Array of product objects

#### Get Product by Slug
- **Endpoint:** `GET /wp-json/wc/store/v1/products?slug={slug}`
- **Description:** Retrieves a single product by its URL slug
- **Response:** Array with single product object

#### Get Product by ID
- **Endpoint:** `GET /wp-json/wc/store/v1/products/{id}`
- **Description:** Retrieves a single product by ID
- **Response:** Product object

#### Get Categories
- **Endpoint:** `GET /wp-json/wc/store/v1/products/categories`
- **Description:** Retrieves all product categories
- **Response:** Array of category objects

### WordPress Settings APIs

These endpoints provide site configuration and content settings.

#### Get Site Settings
- **Endpoint:** `GET /wp-json/asl/v1/site-settings`
- **Description:** Retrieves site identity settings
- **Response:**
  ```json
  {
    "name": "string",
    "description": "string",
    "url": "string",
    "logo": { "id": "number", "url": "string" },
    "favicon": { "id": "number", "url": "string" }
  }
  ```

#### Get Home Page Settings
- **Endpoint:** `GET /wp-json/asl/v1/home-settings`
- **Description:** Retrieves all home page section configurations
- **Response:**
  ```json
  {
    "hero": {
      "enabled": "boolean",
      "autoplay": "boolean",
      "autoplayDelay": "number",
      "loop": "boolean",
      "slides": [
        { "image": "string", "mobileImage": "string", "link": "string" }
      ]
    },
    "newProducts": {
      "enabled": "boolean",
      "title": "string",
      "titleAr": "string",
      "subtitle": "string",
      "subtitleAr": "string",
      "count": "number"
    },
    "bestseller": { "...same as newProducts..." },
    "categories": { "...same as newProducts..." },
    "featured": { "...same as newProducts..." },
    "collections": {
      "enabled": "boolean",
      "title": "string",
      "titleAr": "string",
      "items": [
        { "image": "string", "title": "string", "titleAr": "string", "link": "string" }
      ]
    },
    "banners": {
      "enabled": "boolean",
      "items": [
        { "image": "string", "mobileImage": "string", "title": "string", "link": "string" }
      ]
    }
  }
  ```

#### Get Header Settings
- **Endpoint:** `GET /wp-json/asl/v1/header-settings`
- **Description:** Retrieves header configuration
- **Response:**
  ```json
  {
    "sticky": "boolean",
    "logo": "string",
    "stickyLogo": "string",
    "logoDark": "string"
  }
  ```

#### Get Topbar Settings
- **Endpoint:** `GET /wp-json/asl/v1/topbar`
- **Description:** Retrieves promotional top bar configuration
- **Response:**
  ```json
  {
    "enabled": "boolean",
    "text": "string",
    "textAr": "string",
    "link": "string",
    "bgColor": "string",
    "textColor": "string",
    "dismissible": "boolean"
  }
  ```

#### Get Mobile Bar Settings
- **Endpoint:** `GET /wp-json/asl/v1/mobile-bar`
- **Description:** Retrieves mobile bottom navigation configuration
- **Response:**
  ```json
  {
    "enabled": "boolean",
    "items": [
      {
        "icon": "string",
        "label": "string",
        "labelAr": "string",
        "url": "string"
      }
    ]
  }
  ```

#### Get Menu
- **Endpoint:** `GET /wp-json/menus/v1/locations/{location}`
- **Description:** Retrieves navigation menu by location
- **Locations:** `primary`, `footer`
- **Response:** Menu object with items array

### Coupons API

#### Validate Coupon
- **Endpoint:** `GET /api/coupons?code={code}` (Next.js API route)
- **Description:** Validates a coupon code
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "code": "string",
      "discount_type": "string",
      "amount": "string"
    }
  }
  ```

### Error Response Format

All API endpoints return errors in a consistent format:

```json
{
  "success": false,
  "error": {
    "code": "string",
    "message": "string",
    "data": {
      "status": "number"
    }
  }
}
```

Common error codes:
- `network_error`: Network connectivity issue
- `login_failed`: Invalid credentials
- `registration_failed`: Registration error
- `cart_error`: Cart operation failed
- `wishlist_error`: Wishlist operation failed
- `product_already_in_wishlist`: Item already in wishlist
- `customer_error`: Customer operation failed
- `orders_error`: Orders fetch failed

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
