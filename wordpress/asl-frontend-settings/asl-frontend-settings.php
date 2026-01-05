<?php
/**
 * Plugin Name: ASL Frontend Settings
 * Plugin URI: https://aromaticscentslab.com
 * Description: Admin dashboard and REST API endpoints for ASL Frontend. Manage home page sections, header, SEO, and mobile settings from WordPress admin.
 * Version: 3.0.0
 * Author: Aromatic Scents Lab
 * License: GPL v2 or later
 * 
 * INSTALLATION:
 * 1. Upload this folder to: wp-content/plugins/asl-frontend-settings/
 * 2. Activate from Plugins menu
 * 
 * IMPORTANT: If you previously had asl-frontend-settings.php in mu-plugins,
 * please DELETE that file after activating this plugin to avoid conflicts.
 * 
 * FEATURES:
 * - Admin Dashboard with tabbed interface
 * - Header & Logo settings
 * - Promotional Top Bar settings
 * - SEO settings (meta title, description, OG image)
 * - Home page sections with hide on mobile option
 * - Arabic translation fields for all text content
 * - Mobile Bottom Bar configuration
 * - REST API endpoints for frontend consumption
 */

if (!defined('ABSPATH')) {
    exit;
}

// Guard against double-loading (if mu-plugin version exists)
if (defined('ASL_FRONTEND_SETTINGS_LOADED')) {
    add_action('admin_notices', function() {
        ?>
        <div class="notice notice-error">
            <p><strong>ASL Frontend Settings:</strong> Duplicate plugin detected! Please remove the old version from <code>wp-content/mu-plugins/asl-frontend-settings.php</code> to avoid conflicts.</p>
        </div>
        <?php
    });
    return;
}
define('ASL_FRONTEND_SETTINGS_LOADED', true);

define('ASL_SETTINGS_VERSION', '3.0.0');

// ============================================================================
// SECTION 1: ADMIN MENU AND PAGES
// ============================================================================
add_action('admin_menu', 'asl_add_admin_menu');
function asl_add_admin_menu() {
    add_menu_page(
        __('ASL Settings', 'asl'),
        __('ASL Settings', 'asl'),
        'manage_options',
        'asl-settings',
        'asl_render_admin_page',
        'dashicons-admin-customizer',
        30
    );
    
    add_submenu_page(
        'asl-settings',
        __('Home Page', 'asl'),
        __('Home Page', 'asl'),
        'manage_options',
        'asl-settings',
        'asl_render_admin_page'
    );
    
    add_submenu_page(
        'asl-settings',
        __('Header & Topbar', 'asl'),
        __('Header & Topbar', 'asl'),
        'manage_options',
        'asl-settings-header',
        'asl_render_header_page'
    );
    
    add_submenu_page(
        'asl-settings',
        __('SEO Settings', 'asl'),
        __('SEO Settings', 'asl'),
        'manage_options',
        'asl-settings-seo',
        'asl_render_seo_page'
    );
    
    add_submenu_page(
        'asl-settings',
        __('Mobile Settings', 'asl'),
        __('Mobile Settings', 'asl'),
        'manage_options',
        'asl-settings-mobile',
        'asl_render_mobile_page'
    );
}

// ============================================================================
// SECTION 2: ADMIN PAGE RENDERING
// ============================================================================
function asl_render_admin_page() {
    if (!current_user_can('manage_options')) {
        return;
    }
    
    // Handle form submission
    if (isset($_POST['asl_save_home_settings']) && check_admin_referer('asl_home_settings_nonce')) {
        asl_save_home_settings();
        echo '<div class="notice notice-success is-dismissible"><p>' . __('Settings saved successfully!', 'asl') . '</p></div>';
    }
    
    $active_tab = isset($_GET['tab']) ? sanitize_text_field($_GET['tab']) : 'hero';
    ?>
    <div class="wrap">
        <h1><?php echo esc_html(get_admin_page_title()); ?></h1>
        
        <nav class="nav-tab-wrapper">
            <a href="?page=asl-settings&tab=hero" class="nav-tab <?php echo $active_tab === 'hero' ? 'nav-tab-active' : ''; ?>"><?php _e('Hero Slider', 'asl'); ?></a>
            <a href="?page=asl-settings&tab=new-products" class="nav-tab <?php echo $active_tab === 'new-products' ? 'nav-tab-active' : ''; ?>"><?php _e('New Products', 'asl'); ?></a>
            <a href="?page=asl-settings&tab=bestseller" class="nav-tab <?php echo $active_tab === 'bestseller' ? 'nav-tab-active' : ''; ?>"><?php _e('Bestsellers', 'asl'); ?></a>
            <a href="?page=asl-settings&tab=categories" class="nav-tab <?php echo $active_tab === 'categories' ? 'nav-tab-active' : ''; ?>"><?php _e('Categories', 'asl'); ?></a>
            <a href="?page=asl-settings&tab=featured" class="nav-tab <?php echo $active_tab === 'featured' ? 'nav-tab-active' : ''; ?>"><?php _e('Featured', 'asl'); ?></a>
            <a href="?page=asl-settings&tab=collections" class="nav-tab <?php echo $active_tab === 'collections' ? 'nav-tab-active' : ''; ?>"><?php _e('Collections', 'asl'); ?></a>
            <a href="?page=asl-settings&tab=banners" class="nav-tab <?php echo $active_tab === 'banners' ? 'nav-tab-active' : ''; ?>"><?php _e('Banners', 'asl'); ?></a>
        </nav>
        
        <form method="post" action="">
            <?php wp_nonce_field('asl_home_settings_nonce'); ?>
            <input type="hidden" name="asl_active_tab" value="<?php echo esc_attr($active_tab); ?>">
            
            <div class="tab-content" style="background: #fff; padding: 20px; border: 1px solid #ccd0d4; border-top: none;">
                <?php
                switch ($active_tab) {
                    case 'hero':
                        asl_render_hero_tab();
                        break;
                    case 'new-products':
                        asl_render_new_products_tab();
                        break;
                    case 'bestseller':
                        asl_render_bestseller_tab();
                        break;
                    case 'categories':
                        asl_render_categories_tab();
                        break;
                    case 'featured':
                        asl_render_featured_tab();
                        break;
                    case 'collections':
                        asl_render_collections_tab();
                        break;
                    case 'banners':
                        asl_render_banners_tab();
                        break;
                }
                ?>
            </div>
            
            <?php submit_button(__('Save Settings', 'asl'), 'primary', 'asl_save_home_settings'); ?>
        </form>
    </div>
    <?php
}

// ============================================================================
// SECTION 3: TAB RENDERING FUNCTIONS
// ============================================================================
function asl_render_hero_tab() {
    ?>
    <h2><?php _e('Hero Slider Settings', 'asl'); ?></h2>
    <table class="form-table">
        <tr>
            <th scope="row"><?php _e('Enable Hero Slider', 'asl'); ?></th>
            <td>
                <label>
                    <input type="checkbox" name="asl_hero_enabled" value="1" <?php checked(get_theme_mod('asl_hero_enabled', true)); ?>>
                    <?php _e('Show hero slider on home page', 'asl'); ?>
                </label>
            </td>
        </tr>
        <tr>
            <th scope="row"><?php _e('Hide on Mobile', 'asl'); ?></th>
            <td>
                <label>
                    <input type="checkbox" name="asl_hero_hide_mobile" value="1" <?php checked(get_theme_mod('asl_hero_hide_mobile', false)); ?>>
                    <?php _e('Hide this section on mobile devices', 'asl'); ?>
                </label>
            </td>
        </tr>
        <tr>
            <th scope="row"><?php _e('Autoplay', 'asl'); ?></th>
            <td>
                <label>
                    <input type="checkbox" name="asl_hero_autoplay" value="1" <?php checked(get_theme_mod('asl_hero_autoplay', true)); ?>>
                    <?php _e('Enable autoplay', 'asl'); ?>
                </label>
            </td>
        </tr>
        <tr>
            <th scope="row"><?php _e('Autoplay Delay (ms)', 'asl'); ?></th>
            <td>
                <input type="number" name="asl_hero_autoplay_delay" value="<?php echo esc_attr(get_theme_mod('asl_hero_autoplay_delay', 5000)); ?>" min="1000" max="10000" step="500" class="small-text">
            </td>
        </tr>
        <tr>
            <th scope="row"><?php _e('Loop', 'asl'); ?></th>
            <td>
                <label>
                    <input type="checkbox" name="asl_hero_loop" value="1" <?php checked(get_theme_mod('asl_hero_loop', true)); ?>>
                    <?php _e('Enable infinite loop', 'asl'); ?>
                </label>
            </td>
        </tr>
    </table>
    
    <h3><?php _e('Slides', 'asl'); ?></h3>
    <?php for ($i = 1; $i <= 5; $i++): ?>
    <div style="background: #f9f9f9; padding: 15px; margin-bottom: 15px; border: 1px solid #ddd;">
        <h4><?php printf(__('Slide %d', 'asl'), $i); ?></h4>
        <table class="form-table">
            <tr>
                <th scope="row"><?php _e('Desktop Image URL', 'asl'); ?></th>
                <td>
                    <input type="url" name="asl_hero_slide_<?php echo $i; ?>_image" value="<?php echo esc_url(get_theme_mod("asl_hero_slide_{$i}_image", '')); ?>" class="large-text">
                    <p class="description"><?php _e('Enter the full URL of the image or use the Media Library', 'asl'); ?></p>
                </td>
            </tr>
            <tr>
                <th scope="row"><?php _e('Mobile Image URL', 'asl'); ?></th>
                <td>
                    <input type="url" name="asl_hero_slide_<?php echo $i; ?>_mobile" value="<?php echo esc_url(get_theme_mod("asl_hero_slide_{$i}_mobile", '')); ?>" class="large-text">
                </td>
            </tr>
            <tr>
                <th scope="row"><?php _e('Link URL', 'asl'); ?></th>
                <td>
                    <input type="url" name="asl_hero_slide_<?php echo $i; ?>_link" value="<?php echo esc_url(get_theme_mod("asl_hero_slide_{$i}_link", '')); ?>" class="large-text">
                </td>
            </tr>
        </table>
    </div>
    <?php endfor; ?>
    <?php
}

function asl_render_new_products_tab() {
    ?>
    <h2><?php _e('New Products Section', 'asl'); ?></h2>
    <table class="form-table">
        <tr>
            <th scope="row"><?php _e('Enable Section', 'asl'); ?></th>
            <td>
                <label>
                    <input type="checkbox" name="asl_new_products_enabled" value="1" <?php checked(get_theme_mod('asl_new_products_enabled', true)); ?>>
                    <?php _e('Show new products section', 'asl'); ?>
                </label>
            </td>
        </tr>
        <tr>
            <th scope="row"><?php _e('Hide on Mobile', 'asl'); ?></th>
            <td>
                <label>
                    <input type="checkbox" name="asl_new_products_hide_mobile" value="1" <?php checked(get_theme_mod('asl_new_products_hide_mobile', false)); ?>>
                    <?php _e('Hide this section on mobile devices', 'asl'); ?>
                </label>
            </td>
        </tr>
        <tr>
            <th scope="row"><?php _e('Title (English)', 'asl'); ?></th>
            <td>
                <input type="text" name="asl_new_products_title" value="<?php echo esc_attr(get_theme_mod('asl_new_products_title', 'New Arrivals')); ?>" class="regular-text">
            </td>
        </tr>
        <tr>
            <th scope="row"><?php _e('Title (Arabic)', 'asl'); ?></th>
            <td>
                <input type="text" name="asl_new_products_title_ar" value="<?php echo esc_attr(get_theme_mod('asl_new_products_title_ar', '')); ?>" class="regular-text" dir="rtl">
            </td>
        </tr>
        <tr>
            <th scope="row"><?php _e('Subtitle (English)', 'asl'); ?></th>
            <td>
                <input type="text" name="asl_new_products_subtitle" value="<?php echo esc_attr(get_theme_mod('asl_new_products_subtitle', 'Discover our latest products')); ?>" class="regular-text">
            </td>
        </tr>
        <tr>
            <th scope="row"><?php _e('Subtitle (Arabic)', 'asl'); ?></th>
            <td>
                <input type="text" name="asl_new_products_subtitle_ar" value="<?php echo esc_attr(get_theme_mod('asl_new_products_subtitle_ar', '')); ?>" class="regular-text" dir="rtl">
            </td>
        </tr>
        <tr>
            <th scope="row"><?php _e('Number of Products', 'asl'); ?></th>
            <td>
                <input type="number" name="asl_new_products_count" value="<?php echo esc_attr(get_theme_mod('asl_new_products_count', 8)); ?>" min="4" max="24" class="small-text">
            </td>
        </tr>
        <tr>
            <th scope="row"><?php _e('Display Mode', 'asl'); ?></th>
            <td>
                <select name="asl_new_products_display">
                    <option value="slider" <?php selected(get_theme_mod('asl_new_products_display', 'slider'), 'slider'); ?>><?php _e('Slider', 'asl'); ?></option>
                    <option value="grid" <?php selected(get_theme_mod('asl_new_products_display', 'slider'), 'grid'); ?>><?php _e('Grid', 'asl'); ?></option>
                </select>
            </td>
        </tr>
        <tr>
            <th scope="row"><?php _e('Autoplay (Slider)', 'asl'); ?></th>
            <td>
                <label>
                    <input type="checkbox" name="asl_new_products_autoplay" value="1" <?php checked(get_theme_mod('asl_new_products_autoplay', true)); ?>>
                    <?php _e('Enable autoplay for slider', 'asl'); ?>
                </label>
            </td>
        </tr>
    </table>
    
    <h3><?php _e('Responsive Columns', 'asl'); ?></h3>
    <table class="form-table">
        <tr>
            <th scope="row"><?php _e('Desktop Columns', 'asl'); ?></th>
            <td>
                <input type="number" name="asl_new_products_cols_desktop" value="<?php echo esc_attr(get_theme_mod('asl_new_products_cols_desktop', 4)); ?>" min="2" max="6" class="small-text">
            </td>
        </tr>
        <tr>
            <th scope="row"><?php _e('Tablet Columns', 'asl'); ?></th>
            <td>
                <input type="number" name="asl_new_products_cols_tablet" value="<?php echo esc_attr(get_theme_mod('asl_new_products_cols_tablet', 3)); ?>" min="2" max="4" class="small-text">
            </td>
        </tr>
        <tr>
            <th scope="row"><?php _e('Mobile Columns', 'asl'); ?></th>
            <td>
                <input type="number" name="asl_new_products_cols_mobile" value="<?php echo esc_attr(get_theme_mod('asl_new_products_cols_mobile', 2)); ?>" min="1" max="3" class="small-text">
            </td>
        </tr>
    </table>
    <?php
}

function asl_render_bestseller_tab() {
    ?>
    <h2><?php _e('Bestseller Products Section', 'asl'); ?></h2>
    <table class="form-table">
        <tr>
            <th scope="row"><?php _e('Enable Section', 'asl'); ?></th>
            <td>
                <label>
                    <input type="checkbox" name="asl_bestseller_enabled" value="1" <?php checked(get_theme_mod('asl_bestseller_enabled', true)); ?>>
                    <?php _e('Show bestseller section', 'asl'); ?>
                </label>
            </td>
        </tr>
        <tr>
            <th scope="row"><?php _e('Hide on Mobile', 'asl'); ?></th>
            <td>
                <label>
                    <input type="checkbox" name="asl_bestseller_hide_mobile" value="1" <?php checked(get_theme_mod('asl_bestseller_hide_mobile', false)); ?>>
                    <?php _e('Hide this section on mobile devices', 'asl'); ?>
                </label>
            </td>
        </tr>
        <tr>
            <th scope="row"><?php _e('Title (English)', 'asl'); ?></th>
            <td>
                <input type="text" name="asl_bestseller_title" value="<?php echo esc_attr(get_theme_mod('asl_bestseller_title', 'Bestsellers')); ?>" class="regular-text">
            </td>
        </tr>
        <tr>
            <th scope="row"><?php _e('Title (Arabic)', 'asl'); ?></th>
            <td>
                <input type="text" name="asl_bestseller_title_ar" value="<?php echo esc_attr(get_theme_mod('asl_bestseller_title_ar', '')); ?>" class="regular-text" dir="rtl">
            </td>
        </tr>
        <tr>
            <th scope="row"><?php _e('Subtitle (English)', 'asl'); ?></th>
            <td>
                <input type="text" name="asl_bestseller_subtitle" value="<?php echo esc_attr(get_theme_mod('asl_bestseller_subtitle', 'Our most popular products')); ?>" class="regular-text">
            </td>
        </tr>
        <tr>
            <th scope="row"><?php _e('Subtitle (Arabic)', 'asl'); ?></th>
            <td>
                <input type="text" name="asl_bestseller_subtitle_ar" value="<?php echo esc_attr(get_theme_mod('asl_bestseller_subtitle_ar', '')); ?>" class="regular-text" dir="rtl">
            </td>
        </tr>
        <tr>
            <th scope="row"><?php _e('Number of Products', 'asl'); ?></th>
            <td>
                <input type="number" name="asl_bestseller_count" value="<?php echo esc_attr(get_theme_mod('asl_bestseller_count', 8)); ?>" min="4" max="24" class="small-text">
            </td>
        </tr>
        <tr>
            <th scope="row"><?php _e('Display Mode', 'asl'); ?></th>
            <td>
                <select name="asl_bestseller_display">
                    <option value="slider" <?php selected(get_theme_mod('asl_bestseller_display', 'grid'), 'slider'); ?>><?php _e('Slider', 'asl'); ?></option>
                    <option value="grid" <?php selected(get_theme_mod('asl_bestseller_display', 'grid'), 'grid'); ?>><?php _e('Grid', 'asl'); ?></option>
                </select>
            </td>
        </tr>
    </table>
    
    <h3><?php _e('Responsive Columns', 'asl'); ?></h3>
    <table class="form-table">
        <tr>
            <th scope="row"><?php _e('Desktop Columns', 'asl'); ?></th>
            <td>
                <input type="number" name="asl_bestseller_cols_desktop" value="<?php echo esc_attr(get_theme_mod('asl_bestseller_cols_desktop', 4)); ?>" min="2" max="6" class="small-text">
            </td>
        </tr>
        <tr>
            <th scope="row"><?php _e('Tablet Columns', 'asl'); ?></th>
            <td>
                <input type="number" name="asl_bestseller_cols_tablet" value="<?php echo esc_attr(get_theme_mod('asl_bestseller_cols_tablet', 3)); ?>" min="2" max="4" class="small-text">
            </td>
        </tr>
        <tr>
            <th scope="row"><?php _e('Mobile Columns', 'asl'); ?></th>
            <td>
                <input type="number" name="asl_bestseller_cols_mobile" value="<?php echo esc_attr(get_theme_mod('asl_bestseller_cols_mobile', 2)); ?>" min="1" max="3" class="small-text">
            </td>
        </tr>
    </table>
    <?php
}

function asl_render_categories_tab() {
    ?>
    <h2><?php _e('Shop by Category Section', 'asl'); ?></h2>
    <table class="form-table">
        <tr>
            <th scope="row"><?php _e('Enable Section', 'asl'); ?></th>
            <td>
                <label>
                    <input type="checkbox" name="asl_categories_enabled" value="1" <?php checked(get_theme_mod('asl_categories_enabled', true)); ?>>
                    <?php _e('Show categories section', 'asl'); ?>
                </label>
            </td>
        </tr>
        <tr>
            <th scope="row"><?php _e('Hide on Mobile', 'asl'); ?></th>
            <td>
                <label>
                    <input type="checkbox" name="asl_categories_hide_mobile" value="1" <?php checked(get_theme_mod('asl_categories_hide_mobile', false)); ?>>
                    <?php _e('Hide this section on mobile devices', 'asl'); ?>
                </label>
            </td>
        </tr>
        <tr>
            <th scope="row"><?php _e('Title (English)', 'asl'); ?></th>
            <td>
                <input type="text" name="asl_categories_title" value="<?php echo esc_attr(get_theme_mod('asl_categories_title', 'Shop by Category')); ?>" class="regular-text">
            </td>
        </tr>
        <tr>
            <th scope="row"><?php _e('Title (Arabic)', 'asl'); ?></th>
            <td>
                <input type="text" name="asl_categories_title_ar" value="<?php echo esc_attr(get_theme_mod('asl_categories_title_ar', '')); ?>" class="regular-text" dir="rtl">
            </td>
        </tr>
        <tr>
            <th scope="row"><?php _e('Subtitle (English)', 'asl'); ?></th>
            <td>
                <input type="text" name="asl_categories_subtitle" value="<?php echo esc_attr(get_theme_mod('asl_categories_subtitle', 'Browse our collections')); ?>" class="regular-text">
            </td>
        </tr>
        <tr>
            <th scope="row"><?php _e('Subtitle (Arabic)', 'asl'); ?></th>
            <td>
                <input type="text" name="asl_categories_subtitle_ar" value="<?php echo esc_attr(get_theme_mod('asl_categories_subtitle_ar', '')); ?>" class="regular-text" dir="rtl">
            </td>
        </tr>
        <tr>
            <th scope="row"><?php _e('Number of Categories', 'asl'); ?></th>
            <td>
                <input type="number" name="asl_categories_count" value="<?php echo esc_attr(get_theme_mod('asl_categories_count', 6)); ?>" min="3" max="12" class="small-text">
            </td>
        </tr>
    </table>
    
    <h3><?php _e('Responsive Columns', 'asl'); ?></h3>
    <table class="form-table">
        <tr>
            <th scope="row"><?php _e('Desktop Columns', 'asl'); ?></th>
            <td>
                <input type="number" name="asl_categories_cols_desktop" value="<?php echo esc_attr(get_theme_mod('asl_categories_cols_desktop', 6)); ?>" min="3" max="8" class="small-text">
            </td>
        </tr>
        <tr>
            <th scope="row"><?php _e('Tablet Columns', 'asl'); ?></th>
            <td>
                <input type="number" name="asl_categories_cols_tablet" value="<?php echo esc_attr(get_theme_mod('asl_categories_cols_tablet', 4)); ?>" min="2" max="6" class="small-text">
            </td>
        </tr>
        <tr>
            <th scope="row"><?php _e('Mobile Columns', 'asl'); ?></th>
            <td>
                <input type="number" name="asl_categories_cols_mobile" value="<?php echo esc_attr(get_theme_mod('asl_categories_cols_mobile', 3)); ?>" min="2" max="4" class="small-text">
            </td>
        </tr>
    </table>
    <?php
}

function asl_render_featured_tab() {
    ?>
    <h2><?php _e('Featured Products Section', 'asl'); ?></h2>
    <table class="form-table">
        <tr>
            <th scope="row"><?php _e('Enable Section', 'asl'); ?></th>
            <td>
                <label>
                    <input type="checkbox" name="asl_featured_enabled" value="1" <?php checked(get_theme_mod('asl_featured_enabled', true)); ?>>
                    <?php _e('Show featured products section', 'asl'); ?>
                </label>
            </td>
        </tr>
        <tr>
            <th scope="row"><?php _e('Hide on Mobile', 'asl'); ?></th>
            <td>
                <label>
                    <input type="checkbox" name="asl_featured_hide_mobile" value="1" <?php checked(get_theme_mod('asl_featured_hide_mobile', false)); ?>>
                    <?php _e('Hide this section on mobile devices', 'asl'); ?>
                </label>
            </td>
        </tr>
        <tr>
            <th scope="row"><?php _e('Title (English)', 'asl'); ?></th>
            <td>
                <input type="text" name="asl_featured_title" value="<?php echo esc_attr(get_theme_mod('asl_featured_title', 'Featured Products')); ?>" class="regular-text">
            </td>
        </tr>
        <tr>
            <th scope="row"><?php _e('Title (Arabic)', 'asl'); ?></th>
            <td>
                <input type="text" name="asl_featured_title_ar" value="<?php echo esc_attr(get_theme_mod('asl_featured_title_ar', '')); ?>" class="regular-text" dir="rtl">
            </td>
        </tr>
        <tr>
            <th scope="row"><?php _e('Subtitle (English)', 'asl'); ?></th>
            <td>
                <input type="text" name="asl_featured_subtitle" value="<?php echo esc_attr(get_theme_mod('asl_featured_subtitle', 'Handpicked for you')); ?>" class="regular-text">
            </td>
        </tr>
        <tr>
            <th scope="row"><?php _e('Subtitle (Arabic)', 'asl'); ?></th>
            <td>
                <input type="text" name="asl_featured_subtitle_ar" value="<?php echo esc_attr(get_theme_mod('asl_featured_subtitle_ar', '')); ?>" class="regular-text" dir="rtl">
            </td>
        </tr>
        <tr>
            <th scope="row"><?php _e('Number of Products', 'asl'); ?></th>
            <td>
                <input type="number" name="asl_featured_count" value="<?php echo esc_attr(get_theme_mod('asl_featured_count', 12)); ?>" min="4" max="24" class="small-text">
            </td>
        </tr>
        <tr>
            <th scope="row"><?php _e('Autoplay', 'asl'); ?></th>
            <td>
                <label>
                    <input type="checkbox" name="asl_featured_autoplay" value="1" <?php checked(get_theme_mod('asl_featured_autoplay', true)); ?>>
                    <?php _e('Enable autoplay', 'asl'); ?>
                </label>
            </td>
        </tr>
    </table>
    
    <h3><?php _e('Responsive Columns', 'asl'); ?></h3>
    <table class="form-table">
        <tr>
            <th scope="row"><?php _e('Desktop Columns', 'asl'); ?></th>
            <td>
                <input type="number" name="asl_featured_cols_desktop" value="<?php echo esc_attr(get_theme_mod('asl_featured_cols_desktop', 4)); ?>" min="2" max="6" class="small-text">
            </td>
        </tr>
        <tr>
            <th scope="row"><?php _e('Tablet Columns', 'asl'); ?></th>
            <td>
                <input type="number" name="asl_featured_cols_tablet" value="<?php echo esc_attr(get_theme_mod('asl_featured_cols_tablet', 3)); ?>" min="2" max="4" class="small-text">
            </td>
        </tr>
        <tr>
            <th scope="row"><?php _e('Mobile Columns', 'asl'); ?></th>
            <td>
                <input type="number" name="asl_featured_cols_mobile" value="<?php echo esc_attr(get_theme_mod('asl_featured_cols_mobile', 2)); ?>" min="1" max="3" class="small-text">
            </td>
        </tr>
    </table>
    <?php
}

function asl_render_collections_tab() {
    ?>
    <h2><?php _e('Collections Section', 'asl'); ?></h2>
    <table class="form-table">
        <tr>
            <th scope="row"><?php _e('Enable Section', 'asl'); ?></th>
            <td>
                <label>
                    <input type="checkbox" name="asl_collections_enabled" value="1" <?php checked(get_theme_mod('asl_collections_enabled', true)); ?>>
                    <?php _e('Show collections section', 'asl'); ?>
                </label>
            </td>
        </tr>
        <tr>
            <th scope="row"><?php _e('Hide on Mobile', 'asl'); ?></th>
            <td>
                <label>
                    <input type="checkbox" name="asl_collections_hide_mobile" value="1" <?php checked(get_theme_mod('asl_collections_hide_mobile', false)); ?>>
                    <?php _e('Hide this section on mobile devices', 'asl'); ?>
                </label>
            </td>
        </tr>
        <tr>
            <th scope="row"><?php _e('Title (English)', 'asl'); ?></th>
            <td>
                <input type="text" name="asl_collections_title" value="<?php echo esc_attr(get_theme_mod('asl_collections_title', 'Our Collections')); ?>" class="regular-text">
            </td>
        </tr>
        <tr>
            <th scope="row"><?php _e('Title (Arabic)', 'asl'); ?></th>
            <td>
                <input type="text" name="asl_collections_title_ar" value="<?php echo esc_attr(get_theme_mod('asl_collections_title_ar', '')); ?>" class="regular-text" dir="rtl">
            </td>
        </tr>
        <tr>
            <th scope="row"><?php _e('Subtitle (English)', 'asl'); ?></th>
            <td>
                <input type="text" name="asl_collections_subtitle" value="<?php echo esc_attr(get_theme_mod('asl_collections_subtitle', 'Explore our curated collections')); ?>" class="regular-text">
            </td>
        </tr>
        <tr>
            <th scope="row"><?php _e('Subtitle (Arabic)', 'asl'); ?></th>
            <td>
                <input type="text" name="asl_collections_subtitle_ar" value="<?php echo esc_attr(get_theme_mod('asl_collections_subtitle_ar', '')); ?>" class="regular-text" dir="rtl">
            </td>
        </tr>
    </table>
    
    <h3><?php _e('Collection Items', 'asl'); ?></h3>
    <?php for ($i = 1; $i <= 6; $i++): ?>
    <div style="background: #f9f9f9; padding: 15px; margin-bottom: 15px; border: 1px solid #ddd;">
        <h4><?php printf(__('Collection %d', 'asl'), $i); ?></h4>
        <table class="form-table">
            <tr>
                <th scope="row"><?php _e('Image URL', 'asl'); ?></th>
                <td>
                    <input type="url" name="asl_collection_<?php echo $i; ?>_image" value="<?php echo esc_url(get_theme_mod("asl_collection_{$i}_image", '')); ?>" class="large-text">
                </td>
            </tr>
            <tr>
                <th scope="row"><?php _e('Title (English)', 'asl'); ?></th>
                <td>
                    <input type="text" name="asl_collection_<?php echo $i; ?>_title" value="<?php echo esc_attr(get_theme_mod("asl_collection_{$i}_title", '')); ?>" class="regular-text">
                </td>
            </tr>
            <tr>
                <th scope="row"><?php _e('Title (Arabic)', 'asl'); ?></th>
                <td>
                    <input type="text" name="asl_collection_<?php echo $i; ?>_title_ar" value="<?php echo esc_attr(get_theme_mod("asl_collection_{$i}_title_ar", '')); ?>" class="regular-text" dir="rtl">
                </td>
            </tr>
            <tr>
                <th scope="row"><?php _e('Description (English)', 'asl'); ?></th>
                <td>
                    <textarea name="asl_collection_<?php echo $i; ?>_description" class="large-text" rows="2"><?php echo esc_textarea(get_theme_mod("asl_collection_{$i}_description", '')); ?></textarea>
                </td>
            </tr>
            <tr>
                <th scope="row"><?php _e('Description (Arabic)', 'asl'); ?></th>
                <td>
                    <textarea name="asl_collection_<?php echo $i; ?>_description_ar" class="large-text" rows="2" dir="rtl"><?php echo esc_textarea(get_theme_mod("asl_collection_{$i}_description_ar", '')); ?></textarea>
                </td>
            </tr>
            <tr>
                <th scope="row"><?php _e('Link URL', 'asl'); ?></th>
                <td>
                    <input type="url" name="asl_collection_<?php echo $i; ?>_link" value="<?php echo esc_url(get_theme_mod("asl_collection_{$i}_link", '')); ?>" class="large-text">
                </td>
            </tr>
        </table>
    </div>
    <?php endfor; ?>
    <?php
}

function asl_render_banners_tab() {
    ?>
    <h2><?php _e('Banners Section', 'asl'); ?></h2>
    <table class="form-table">
        <tr>
            <th scope="row"><?php _e('Enable Section', 'asl'); ?></th>
            <td>
                <label>
                    <input type="checkbox" name="asl_banners_enabled" value="1" <?php checked(get_theme_mod('asl_banners_enabled', true)); ?>>
                    <?php _e('Show banners section', 'asl'); ?>
                </label>
            </td>
        </tr>
        <tr>
            <th scope="row"><?php _e('Hide on Mobile', 'asl'); ?></th>
            <td>
                <label>
                    <input type="checkbox" name="asl_banners_hide_mobile" value="1" <?php checked(get_theme_mod('asl_banners_hide_mobile', false)); ?>>
                    <?php _e('Hide this section on mobile devices', 'asl'); ?>
                </label>
            </td>
        </tr>
    </table>
    
    <h3><?php _e('Banner Items', 'asl'); ?></h3>
    <?php for ($i = 1; $i <= 4; $i++): ?>
    <div style="background: #f9f9f9; padding: 15px; margin-bottom: 15px; border: 1px solid #ddd;">
        <h4><?php printf(__('Banner %d', 'asl'), $i); ?></h4>
        <table class="form-table">
            <tr>
                <th scope="row"><?php _e('Desktop Image URL', 'asl'); ?></th>
                <td>
                    <input type="url" name="asl_banner_<?php echo $i; ?>_image" value="<?php echo esc_url(get_theme_mod("asl_banner_{$i}_image", '')); ?>" class="large-text">
                </td>
            </tr>
            <tr>
                <th scope="row"><?php _e('Mobile Image URL', 'asl'); ?></th>
                <td>
                    <input type="url" name="asl_banner_<?php echo $i; ?>_mobile" value="<?php echo esc_url(get_theme_mod("asl_banner_{$i}_mobile", '')); ?>" class="large-text">
                </td>
            </tr>
            <tr>
                <th scope="row"><?php _e('Title (English)', 'asl'); ?></th>
                <td>
                    <input type="text" name="asl_banner_<?php echo $i; ?>_title" value="<?php echo esc_attr(get_theme_mod("asl_banner_{$i}_title", '')); ?>" class="regular-text">
                </td>
            </tr>
            <tr>
                <th scope="row"><?php _e('Title (Arabic)', 'asl'); ?></th>
                <td>
                    <input type="text" name="asl_banner_<?php echo $i; ?>_title_ar" value="<?php echo esc_attr(get_theme_mod("asl_banner_{$i}_title_ar", '')); ?>" class="regular-text" dir="rtl">
                </td>
            </tr>
            <tr>
                <th scope="row"><?php _e('Subtitle (English)', 'asl'); ?></th>
                <td>
                    <input type="text" name="asl_banner_<?php echo $i; ?>_subtitle" value="<?php echo esc_attr(get_theme_mod("asl_banner_{$i}_subtitle", '')); ?>" class="regular-text">
                </td>
            </tr>
            <tr>
                <th scope="row"><?php _e('Subtitle (Arabic)', 'asl'); ?></th>
                <td>
                    <input type="text" name="asl_banner_<?php echo $i; ?>_subtitle_ar" value="<?php echo esc_attr(get_theme_mod("asl_banner_{$i}_subtitle_ar", '')); ?>" class="regular-text" dir="rtl">
                </td>
            </tr>
            <tr>
                <th scope="row"><?php _e('Link URL', 'asl'); ?></th>
                <td>
                    <input type="url" name="asl_banner_<?php echo $i; ?>_link" value="<?php echo esc_url(get_theme_mod("asl_banner_{$i}_link", '')); ?>" class="large-text">
                </td>
            </tr>
        </table>
    </div>
    <?php endfor; ?>
    <?php
}

// ============================================================================
// SECTION 4: HEADER & TOPBAR PAGE
// ============================================================================
function asl_render_header_page() {
    if (!current_user_can('manage_options')) {
        return;
    }
    
    if (isset($_POST['asl_save_header_settings']) && check_admin_referer('asl_header_settings_nonce')) {
        asl_save_header_settings();
        echo '<div class="notice notice-success is-dismissible"><p>' . __('Settings saved successfully!', 'asl') . '</p></div>';
    }
    ?>
    <div class="wrap">
        <h1><?php _e('Header & Topbar Settings', 'asl'); ?></h1>
        
        <form method="post" action="">
            <?php wp_nonce_field('asl_header_settings_nonce'); ?>
            
            <div style="background: #fff; padding: 20px; border: 1px solid #ccd0d4;">
                <h2><?php _e('Header Settings', 'asl'); ?></h2>
                <table class="form-table">
                    <tr>
                        <th scope="row"><?php _e('Sticky Header', 'asl'); ?></th>
                        <td>
                            <label>
                                <input type="checkbox" name="asl_header_sticky" value="1" <?php checked(get_theme_mod('asl_header_sticky', true)); ?>>
                                <?php _e('Enable sticky header', 'asl'); ?>
                            </label>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row"><?php _e('Sticky Logo URL', 'asl'); ?></th>
                        <td>
                            <input type="url" name="asl_sticky_logo" value="<?php echo esc_url(get_theme_mod('asl_sticky_logo', '')); ?>" class="large-text">
                            <p class="description"><?php _e('Logo to show when header is sticky/scrolled', 'asl'); ?></p>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row"><?php _e('Dark Mode Logo URL', 'asl'); ?></th>
                        <td>
                            <input type="url" name="asl_logo_dark" value="<?php echo esc_url(get_theme_mod('asl_logo_dark', '')); ?>" class="large-text">
                        </td>
                    </tr>
                </table>
                
                <h2><?php _e('Promotional Top Bar', 'asl'); ?></h2>
                <table class="form-table">
                    <tr>
                        <th scope="row"><?php _e('Enable Top Bar', 'asl'); ?></th>
                        <td>
                            <label>
                                <input type="checkbox" name="asl_topbar_enabled" value="1" <?php checked(get_theme_mod('asl_topbar_enabled', true)); ?>>
                                <?php _e('Show promotional top bar', 'asl'); ?>
                            </label>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row"><?php _e('Text (English)', 'asl'); ?></th>
                        <td>
                            <input type="text" name="asl_topbar_text" value="<?php echo esc_attr(get_theme_mod('asl_topbar_text', 'Free shipping on orders over 200 SAR')); ?>" class="large-text">
                        </td>
                    </tr>
                    <tr>
                        <th scope="row"><?php _e('Text (Arabic)', 'asl'); ?></th>
                        <td>
                            <input type="text" name="asl_topbar_text_ar" value="<?php echo esc_attr(get_theme_mod('asl_topbar_text_ar', '')); ?>" class="large-text" dir="rtl">
                        </td>
                    </tr>
                    <tr>
                        <th scope="row"><?php _e('Link URL', 'asl'); ?></th>
                        <td>
                            <input type="url" name="asl_topbar_link" value="<?php echo esc_url(get_theme_mod('asl_topbar_link', '')); ?>" class="large-text">
                        </td>
                    </tr>
                    <tr>
                        <th scope="row"><?php _e('Background Color', 'asl'); ?></th>
                        <td>
                            <input type="text" name="asl_topbar_bg_color" value="<?php echo esc_attr(get_theme_mod('asl_topbar_bg_color', '#f3f4f6')); ?>" class="regular-text">
                        </td>
                    </tr>
                    <tr>
                        <th scope="row"><?php _e('Text Color', 'asl'); ?></th>
                        <td>
                            <input type="text" name="asl_topbar_text_color" value="<?php echo esc_attr(get_theme_mod('asl_topbar_text_color', '#4b5563')); ?>" class="regular-text">
                        </td>
                    </tr>
                    <tr>
                        <th scope="row"><?php _e('Dismissible', 'asl'); ?></th>
                        <td>
                            <label>
                                <input type="checkbox" name="asl_topbar_dismissible" value="1" <?php checked(get_theme_mod('asl_topbar_dismissible', false)); ?>>
                                <?php _e('Allow users to dismiss the top bar', 'asl'); ?>
                            </label>
                        </td>
                    </tr>
                </table>
            </div>
            
            <?php submit_button(__('Save Settings', 'asl'), 'primary', 'asl_save_header_settings'); ?>
        </form>
    </div>
    <?php
}

// ============================================================================
// SECTION 5: SEO PAGE
// ============================================================================
function asl_render_seo_page() {
    if (!current_user_can('manage_options')) {
        return;
    }
    
    if (isset($_POST['asl_save_seo_settings']) && check_admin_referer('asl_seo_settings_nonce')) {
        asl_save_seo_settings();
        echo '<div class="notice notice-success is-dismissible"><p>' . __('Settings saved successfully!', 'asl') . '</p></div>';
    }
    ?>
    <div class="wrap">
        <h1><?php _e('SEO Settings', 'asl'); ?></h1>
        
        <form method="post" action="">
            <?php wp_nonce_field('asl_seo_settings_nonce'); ?>
            
            <div style="background: #fff; padding: 20px; border: 1px solid #ccd0d4;">
                <table class="form-table">
                    <tr>
                        <th scope="row"><?php _e('Meta Title (English)', 'asl'); ?></th>
                        <td>
                            <input type="text" name="asl_seo_title" value="<?php echo esc_attr(get_theme_mod('asl_seo_title', '')); ?>" class="large-text">
                            <p class="description"><?php _e('Leave empty to use site title', 'asl'); ?></p>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row"><?php _e('Meta Title (Arabic)', 'asl'); ?></th>
                        <td>
                            <input type="text" name="asl_seo_title_ar" value="<?php echo esc_attr(get_theme_mod('asl_seo_title_ar', '')); ?>" class="large-text" dir="rtl">
                        </td>
                    </tr>
                    <tr>
                        <th scope="row"><?php _e('Meta Description (English)', 'asl'); ?></th>
                        <td>
                            <textarea name="asl_seo_description" class="large-text" rows="3"><?php echo esc_textarea(get_theme_mod('asl_seo_description', '')); ?></textarea>
                            <p class="description"><?php _e('Recommended: 150-160 characters', 'asl'); ?></p>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row"><?php _e('Meta Description (Arabic)', 'asl'); ?></th>
                        <td>
                            <textarea name="asl_seo_description_ar" class="large-text" rows="3" dir="rtl"><?php echo esc_textarea(get_theme_mod('asl_seo_description_ar', '')); ?></textarea>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row"><?php _e('Social Share Image (OG Image)', 'asl'); ?></th>
                        <td>
                            <input type="url" name="asl_seo_og_image" value="<?php echo esc_url(get_theme_mod('asl_seo_og_image', '')); ?>" class="large-text">
                            <p class="description"><?php _e('Recommended: 1200x630px', 'asl'); ?></p>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row"><?php _e('Robots Meta', 'asl'); ?></th>
                        <td>
                            <select name="asl_seo_robots">
                                <option value="index,follow" <?php selected(get_theme_mod('asl_seo_robots', 'index,follow'), 'index,follow'); ?>><?php _e('Index, Follow', 'asl'); ?></option>
                                <option value="noindex,follow" <?php selected(get_theme_mod('asl_seo_robots', 'index,follow'), 'noindex,follow'); ?>><?php _e('No Index, Follow', 'asl'); ?></option>
                                <option value="index,nofollow" <?php selected(get_theme_mod('asl_seo_robots', 'index,follow'), 'index,nofollow'); ?>><?php _e('Index, No Follow', 'asl'); ?></option>
                                <option value="noindex,nofollow" <?php selected(get_theme_mod('asl_seo_robots', 'index,follow'), 'noindex,nofollow'); ?>><?php _e('No Index, No Follow', 'asl'); ?></option>
                            </select>
                        </td>
                    </tr>
                </table>
            </div>
            
            <?php submit_button(__('Save Settings', 'asl'), 'primary', 'asl_save_seo_settings'); ?>
        </form>
    </div>
    <?php
}

// ============================================================================
// SECTION 6: MOBILE SETTINGS PAGE
// ============================================================================
function asl_render_mobile_page() {
    if (!current_user_can('manage_options')) {
        return;
    }
    
    if (isset($_POST['asl_save_mobile_settings']) && check_admin_referer('asl_mobile_settings_nonce')) {
        asl_save_mobile_settings();
        echo '<div class="notice notice-success is-dismissible"><p>' . __('Settings saved successfully!', 'asl') . '</p></div>';
    }
    
    $icon_choices = array(
        'home'       => __('Home', 'asl'),
        'shop'       => __('Shop / Store', 'asl'),
        'categories' => __('Categories / Grid', 'asl'),
        'wishlist'   => __('Wishlist / Heart', 'asl'),
        'account'    => __('Account / User', 'asl'),
        'cart'       => __('Cart / Bag', 'asl'),
        'search'     => __('Search', 'asl'),
        'menu'       => __('Menu / Hamburger', 'asl'),
    );
    ?>
    <div class="wrap">
        <h1><?php _e('Mobile Settings', 'asl'); ?></h1>
        
        <form method="post" action="">
            <?php wp_nonce_field('asl_mobile_settings_nonce'); ?>
            
            <div style="background: #fff; padding: 20px; border: 1px solid #ccd0d4;">
                <h2><?php _e('Mobile Bottom Bar', 'asl'); ?></h2>
                <table class="form-table">
                    <tr>
                        <th scope="row"><?php _e('Enable Mobile Bar', 'asl'); ?></th>
                        <td>
                            <label>
                                <input type="checkbox" name="asl_mobile_bar_enabled" value="1" <?php checked(get_theme_mod('asl_mobile_bar_enabled', true)); ?>>
                                <?php _e('Show mobile bottom navigation bar', 'asl'); ?>
                            </label>
                        </td>
                    </tr>
                </table>
                
                <h3><?php _e('Navigation Items (5 max)', 'asl'); ?></h3>
                <?php for ($i = 1; $i <= 5; $i++): ?>
                <div style="background: #f9f9f9; padding: 15px; margin-bottom: 15px; border: 1px solid #ddd;">
                    <h4><?php printf(__('Item %d', 'asl'), $i); ?></h4>
                    <table class="form-table">
                        <tr>
                            <th scope="row"><?php _e('Enable', 'asl'); ?></th>
                            <td>
                                <label>
                                    <input type="checkbox" name="asl_mobile_bar_<?php echo $i; ?>_enabled" value="1" <?php checked(get_theme_mod("asl_mobile_bar_{$i}_enabled", true)); ?>>
                                    <?php _e('Show this item', 'asl'); ?>
                                </label>
                            </td>
                        </tr>
                        <tr>
                            <th scope="row"><?php _e('Icon', 'asl'); ?></th>
                            <td>
                                <select name="asl_mobile_bar_<?php echo $i; ?>_icon">
                                    <?php foreach ($icon_choices as $value => $label): ?>
                                    <option value="<?php echo esc_attr($value); ?>" <?php selected(get_theme_mod("asl_mobile_bar_{$i}_icon", ''), $value); ?>><?php echo esc_html($label); ?></option>
                                    <?php endforeach; ?>
                                </select>
                            </td>
                        </tr>
                        <tr>
                            <th scope="row"><?php _e('Label (English)', 'asl'); ?></th>
                            <td>
                                <input type="text" name="asl_mobile_bar_<?php echo $i; ?>_label" value="<?php echo esc_attr(get_theme_mod("asl_mobile_bar_{$i}_label", '')); ?>" class="regular-text">
                            </td>
                        </tr>
                        <tr>
                            <th scope="row"><?php _e('Label (Arabic)', 'asl'); ?></th>
                            <td>
                                <input type="text" name="asl_mobile_bar_<?php echo $i; ?>_label_ar" value="<?php echo esc_attr(get_theme_mod("asl_mobile_bar_{$i}_label_ar", '')); ?>" class="regular-text" dir="rtl">
                            </td>
                        </tr>
                        <tr>
                            <th scope="row"><?php _e('URL', 'asl'); ?></th>
                            <td>
                                <input type="text" name="asl_mobile_bar_<?php echo $i; ?>_url" value="<?php echo esc_attr(get_theme_mod("asl_mobile_bar_{$i}_url", '')); ?>" class="regular-text">
                            </td>
                        </tr>
                    </table>
                </div>
                <?php endfor; ?>
            </div>
            
            <?php submit_button(__('Save Settings', 'asl'), 'primary', 'asl_save_mobile_settings'); ?>
        </form>
    </div>
    <?php
}

// ============================================================================
// SECTION 7: SAVE FUNCTIONS
// ============================================================================
function asl_save_home_settings() {
    // Hero settings
    set_theme_mod('asl_hero_enabled', isset($_POST['asl_hero_enabled']));
    set_theme_mod('asl_hero_hide_mobile', isset($_POST['asl_hero_hide_mobile']));
    set_theme_mod('asl_hero_autoplay', isset($_POST['asl_hero_autoplay']));
    set_theme_mod('asl_hero_autoplay_delay', absint($_POST['asl_hero_autoplay_delay'] ?? 5000));
    set_theme_mod('asl_hero_loop', isset($_POST['asl_hero_loop']));
    
    for ($i = 1; $i <= 5; $i++) {
        set_theme_mod("asl_hero_slide_{$i}_image", esc_url_raw($_POST["asl_hero_slide_{$i}_image"] ?? ''));
        set_theme_mod("asl_hero_slide_{$i}_mobile", esc_url_raw($_POST["asl_hero_slide_{$i}_mobile"] ?? ''));
        set_theme_mod("asl_hero_slide_{$i}_link", esc_url_raw($_POST["asl_hero_slide_{$i}_link"] ?? ''));
    }
    
    // New Products settings
    set_theme_mod('asl_new_products_enabled', isset($_POST['asl_new_products_enabled']));
    set_theme_mod('asl_new_products_hide_mobile', isset($_POST['asl_new_products_hide_mobile']));
    set_theme_mod('asl_new_products_title', sanitize_text_field($_POST['asl_new_products_title'] ?? ''));
    set_theme_mod('asl_new_products_title_ar', sanitize_text_field($_POST['asl_new_products_title_ar'] ?? ''));
    set_theme_mod('asl_new_products_subtitle', sanitize_text_field($_POST['asl_new_products_subtitle'] ?? ''));
    set_theme_mod('asl_new_products_subtitle_ar', sanitize_text_field($_POST['asl_new_products_subtitle_ar'] ?? ''));
    set_theme_mod('asl_new_products_count', absint($_POST['asl_new_products_count'] ?? 8));
    set_theme_mod('asl_new_products_display', sanitize_text_field($_POST['asl_new_products_display'] ?? 'slider'));
    set_theme_mod('asl_new_products_autoplay', isset($_POST['asl_new_products_autoplay']));
    set_theme_mod('asl_new_products_cols_desktop', absint($_POST['asl_new_products_cols_desktop'] ?? 4));
    set_theme_mod('asl_new_products_cols_tablet', absint($_POST['asl_new_products_cols_tablet'] ?? 3));
    set_theme_mod('asl_new_products_cols_mobile', absint($_POST['asl_new_products_cols_mobile'] ?? 2));
    
    // Bestseller settings
    set_theme_mod('asl_bestseller_enabled', isset($_POST['asl_bestseller_enabled']));
    set_theme_mod('asl_bestseller_hide_mobile', isset($_POST['asl_bestseller_hide_mobile']));
    set_theme_mod('asl_bestseller_title', sanitize_text_field($_POST['asl_bestseller_title'] ?? ''));
    set_theme_mod('asl_bestseller_title_ar', sanitize_text_field($_POST['asl_bestseller_title_ar'] ?? ''));
    set_theme_mod('asl_bestseller_subtitle', sanitize_text_field($_POST['asl_bestseller_subtitle'] ?? ''));
    set_theme_mod('asl_bestseller_subtitle_ar', sanitize_text_field($_POST['asl_bestseller_subtitle_ar'] ?? ''));
    set_theme_mod('asl_bestseller_count', absint($_POST['asl_bestseller_count'] ?? 8));
    set_theme_mod('asl_bestseller_display', sanitize_text_field($_POST['asl_bestseller_display'] ?? 'grid'));
    set_theme_mod('asl_bestseller_cols_desktop', absint($_POST['asl_bestseller_cols_desktop'] ?? 4));
    set_theme_mod('asl_bestseller_cols_tablet', absint($_POST['asl_bestseller_cols_tablet'] ?? 3));
    set_theme_mod('asl_bestseller_cols_mobile', absint($_POST['asl_bestseller_cols_mobile'] ?? 2));
    
    // Categories settings
    set_theme_mod('asl_categories_enabled', isset($_POST['asl_categories_enabled']));
    set_theme_mod('asl_categories_hide_mobile', isset($_POST['asl_categories_hide_mobile']));
    set_theme_mod('asl_categories_title', sanitize_text_field($_POST['asl_categories_title'] ?? ''));
    set_theme_mod('asl_categories_title_ar', sanitize_text_field($_POST['asl_categories_title_ar'] ?? ''));
    set_theme_mod('asl_categories_subtitle', sanitize_text_field($_POST['asl_categories_subtitle'] ?? ''));
    set_theme_mod('asl_categories_subtitle_ar', sanitize_text_field($_POST['asl_categories_subtitle_ar'] ?? ''));
    set_theme_mod('asl_categories_count', absint($_POST['asl_categories_count'] ?? 6));
    set_theme_mod('asl_categories_cols_desktop', absint($_POST['asl_categories_cols_desktop'] ?? 6));
    set_theme_mod('asl_categories_cols_tablet', absint($_POST['asl_categories_cols_tablet'] ?? 4));
    set_theme_mod('asl_categories_cols_mobile', absint($_POST['asl_categories_cols_mobile'] ?? 3));
    
    // Featured settings
    set_theme_mod('asl_featured_enabled', isset($_POST['asl_featured_enabled']));
    set_theme_mod('asl_featured_hide_mobile', isset($_POST['asl_featured_hide_mobile']));
    set_theme_mod('asl_featured_title', sanitize_text_field($_POST['asl_featured_title'] ?? ''));
    set_theme_mod('asl_featured_title_ar', sanitize_text_field($_POST['asl_featured_title_ar'] ?? ''));
    set_theme_mod('asl_featured_subtitle', sanitize_text_field($_POST['asl_featured_subtitle'] ?? ''));
    set_theme_mod('asl_featured_subtitle_ar', sanitize_text_field($_POST['asl_featured_subtitle_ar'] ?? ''));
    set_theme_mod('asl_featured_count', absint($_POST['asl_featured_count'] ?? 12));
    set_theme_mod('asl_featured_autoplay', isset($_POST['asl_featured_autoplay']));
    set_theme_mod('asl_featured_cols_desktop', absint($_POST['asl_featured_cols_desktop'] ?? 4));
    set_theme_mod('asl_featured_cols_tablet', absint($_POST['asl_featured_cols_tablet'] ?? 3));
    set_theme_mod('asl_featured_cols_mobile', absint($_POST['asl_featured_cols_mobile'] ?? 2));
    
    // Collections settings
    set_theme_mod('asl_collections_enabled', isset($_POST['asl_collections_enabled']));
    set_theme_mod('asl_collections_hide_mobile', isset($_POST['asl_collections_hide_mobile']));
    set_theme_mod('asl_collections_title', sanitize_text_field($_POST['asl_collections_title'] ?? ''));
    set_theme_mod('asl_collections_title_ar', sanitize_text_field($_POST['asl_collections_title_ar'] ?? ''));
    set_theme_mod('asl_collections_subtitle', sanitize_text_field($_POST['asl_collections_subtitle'] ?? ''));
    set_theme_mod('asl_collections_subtitle_ar', sanitize_text_field($_POST['asl_collections_subtitle_ar'] ?? ''));
    
    for ($i = 1; $i <= 6; $i++) {
        set_theme_mod("asl_collection_{$i}_image", esc_url_raw($_POST["asl_collection_{$i}_image"] ?? ''));
        set_theme_mod("asl_collection_{$i}_title", sanitize_text_field($_POST["asl_collection_{$i}_title"] ?? ''));
        set_theme_mod("asl_collection_{$i}_title_ar", sanitize_text_field($_POST["asl_collection_{$i}_title_ar"] ?? ''));
        set_theme_mod("asl_collection_{$i}_description", sanitize_textarea_field($_POST["asl_collection_{$i}_description"] ?? ''));
        set_theme_mod("asl_collection_{$i}_description_ar", sanitize_textarea_field($_POST["asl_collection_{$i}_description_ar"] ?? ''));
        set_theme_mod("asl_collection_{$i}_link", esc_url_raw($_POST["asl_collection_{$i}_link"] ?? ''));
    }
    
    // Banners settings
    set_theme_mod('asl_banners_enabled', isset($_POST['asl_banners_enabled']));
    set_theme_mod('asl_banners_hide_mobile', isset($_POST['asl_banners_hide_mobile']));
    
    for ($i = 1; $i <= 4; $i++) {
        set_theme_mod("asl_banner_{$i}_image", esc_url_raw($_POST["asl_banner_{$i}_image"] ?? ''));
        set_theme_mod("asl_banner_{$i}_mobile", esc_url_raw($_POST["asl_banner_{$i}_mobile"] ?? ''));
        set_theme_mod("asl_banner_{$i}_title", sanitize_text_field($_POST["asl_banner_{$i}_title"] ?? ''));
        set_theme_mod("asl_banner_{$i}_title_ar", sanitize_text_field($_POST["asl_banner_{$i}_title_ar"] ?? ''));
        set_theme_mod("asl_banner_{$i}_subtitle", sanitize_text_field($_POST["asl_banner_{$i}_subtitle"] ?? ''));
        set_theme_mod("asl_banner_{$i}_subtitle_ar", sanitize_text_field($_POST["asl_banner_{$i}_subtitle_ar"] ?? ''));
        set_theme_mod("asl_banner_{$i}_link", esc_url_raw($_POST["asl_banner_{$i}_link"] ?? ''));
    }
}

function asl_save_header_settings() {
    set_theme_mod('asl_header_sticky', isset($_POST['asl_header_sticky']));
    set_theme_mod('asl_sticky_logo', esc_url_raw($_POST['asl_sticky_logo'] ?? ''));
    set_theme_mod('asl_logo_dark', esc_url_raw($_POST['asl_logo_dark'] ?? ''));
    
    set_theme_mod('asl_topbar_enabled', isset($_POST['asl_topbar_enabled']));
    set_theme_mod('asl_topbar_text', sanitize_text_field($_POST['asl_topbar_text'] ?? ''));
    set_theme_mod('asl_topbar_text_ar', sanitize_text_field($_POST['asl_topbar_text_ar'] ?? ''));
    set_theme_mod('asl_topbar_link', esc_url_raw($_POST['asl_topbar_link'] ?? ''));
    set_theme_mod('asl_topbar_bg_color', sanitize_hex_color($_POST['asl_topbar_bg_color'] ?? '#f3f4f6'));
    set_theme_mod('asl_topbar_text_color', sanitize_hex_color($_POST['asl_topbar_text_color'] ?? '#4b5563'));
    set_theme_mod('asl_topbar_dismissible', isset($_POST['asl_topbar_dismissible']));
}

function asl_save_seo_settings() {
    set_theme_mod('asl_seo_title', sanitize_text_field($_POST['asl_seo_title'] ?? ''));
    set_theme_mod('asl_seo_title_ar', sanitize_text_field($_POST['asl_seo_title_ar'] ?? ''));
    set_theme_mod('asl_seo_description', sanitize_textarea_field($_POST['asl_seo_description'] ?? ''));
    set_theme_mod('asl_seo_description_ar', sanitize_textarea_field($_POST['asl_seo_description_ar'] ?? ''));
    set_theme_mod('asl_seo_og_image', esc_url_raw($_POST['asl_seo_og_image'] ?? ''));
    set_theme_mod('asl_seo_robots', sanitize_text_field($_POST['asl_seo_robots'] ?? 'index,follow'));
}

function asl_save_mobile_settings() {
    set_theme_mod('asl_mobile_bar_enabled', isset($_POST['asl_mobile_bar_enabled']));
    
    for ($i = 1; $i <= 5; $i++) {
        set_theme_mod("asl_mobile_bar_{$i}_enabled", isset($_POST["asl_mobile_bar_{$i}_enabled"]));
        set_theme_mod("asl_mobile_bar_{$i}_icon", sanitize_text_field($_POST["asl_mobile_bar_{$i}_icon"] ?? ''));
        set_theme_mod("asl_mobile_bar_{$i}_label", sanitize_text_field($_POST["asl_mobile_bar_{$i}_label"] ?? ''));
        set_theme_mod("asl_mobile_bar_{$i}_label_ar", sanitize_text_field($_POST["asl_mobile_bar_{$i}_label_ar"] ?? ''));
        set_theme_mod("asl_mobile_bar_{$i}_url", sanitize_text_field($_POST["asl_mobile_bar_{$i}_url"] ?? ''));
    }
}

// ============================================================================
// SECTION 8: REST API ENDPOINTS
// ============================================================================
add_action('rest_api_init', 'asl_register_rest_routes');
function asl_register_rest_routes() {
    register_rest_route('asl/v1', '/customizer', array(
        'methods'             => 'GET',
        'callback'            => 'asl_get_customizer_settings',
        'permission_callback' => '__return_true',
    ));

    register_rest_route('asl/v1', '/home-settings', array(
        'methods'             => 'GET',
        'callback'            => 'asl_get_home_settings',
        'permission_callback' => '__return_true',
    ));

    register_rest_route('asl/v1', '/site-settings', array(
        'methods'             => 'GET',
        'callback'            => 'asl_get_site_settings',
        'permission_callback' => '__return_true',
    ));

    register_rest_route('asl/v1', '/header-settings', array(
        'methods'             => 'GET',
        'callback'            => 'asl_get_header_settings',
        'permission_callback' => '__return_true',
    ));

    register_rest_route('asl/v1', '/seo-settings', array(
        'methods'             => 'GET',
        'callback'            => 'asl_get_seo_settings',
        'permission_callback' => '__return_true',
    ));

    register_rest_route('asl/v1', '/mobile-bar', array(
        'methods'             => 'GET',
        'callback'            => 'asl_get_mobile_bar_settings',
        'permission_callback' => '__return_true',
    ));

    register_rest_route('asl/v1', '/topbar', array(
        'methods'             => 'GET',
        'callback'            => 'asl_get_topbar_settings',
        'permission_callback' => '__return_true',
    ));

    register_rest_route('asl/v1', '/menu/(?P<location>[a-zA-Z0-9_-]+)', array(
        'methods'             => 'GET',
        'callback'            => 'asl_get_menu',
        'permission_callback' => '__return_true',
    ));
}

function asl_get_customizer_settings() {
    return array(
        'site'        => asl_get_site_settings(),
        'header'      => asl_get_header_settings(),
        'topBar'      => asl_get_topbar_settings(),
        'seo'         => asl_get_seo_settings(),
        'mobileBar'   => asl_get_mobile_bar_settings(),
        'hero'        => asl_get_hero_settings(),
        'newProducts' => asl_get_new_products_settings(),
        'bestseller'  => asl_get_bestseller_settings(),
        'categories'  => asl_get_categories_settings(),
        'featured'    => asl_get_featured_settings(),
        'collections' => asl_get_collections_settings(),
        'banners'     => asl_get_banners_settings(),
    );
}

function asl_get_home_settings() {
    return array(
        'hero'        => asl_get_hero_settings(),
        'newProducts' => asl_get_new_products_settings(),
        'bestseller'  => asl_get_bestseller_settings(),
        'categories'  => asl_get_categories_settings(),
        'featured'    => asl_get_featured_settings(),
        'collections' => asl_get_collections_settings(),
        'banners'     => asl_get_banners_settings(),
    );
}

function asl_get_site_settings() {
    $custom_logo_id = get_theme_mod('custom_logo');
    $logo_url = $custom_logo_id ? wp_get_attachment_image_url($custom_logo_id, 'full') : '';
    $site_icon_id = get_option('site_icon');
    $favicon_url = $site_icon_id ? wp_get_attachment_image_url($site_icon_id, 'full') : '';

    return array(
        'name'        => get_bloginfo('name'),
        'description' => get_bloginfo('description'),
        'url'         => get_bloginfo('url'),
        'logo'        => array('id' => $custom_logo_id, 'url' => $logo_url),
        'favicon'     => array('id' => $site_icon_id, 'url' => $favicon_url),
    );
}

function asl_get_header_settings() {
    $custom_logo_id = get_theme_mod('custom_logo');
    $logo_url = $custom_logo_id ? wp_get_attachment_image_url($custom_logo_id, 'full') : '';

    return array(
        'sticky'      => get_theme_mod('asl_header_sticky', true),
        'logo'        => $logo_url,
        'stickyLogo'  => get_theme_mod('asl_sticky_logo', ''),
        'logoDark'    => get_theme_mod('asl_logo_dark', ''),
    );
}

function asl_get_topbar_settings() {
    return array(
        'enabled'     => get_theme_mod('asl_topbar_enabled', true),
        'text'        => get_theme_mod('asl_topbar_text', 'Free shipping on orders over 200 SAR'),
        'textAr'      => get_theme_mod('asl_topbar_text_ar', ''),
        'link'        => get_theme_mod('asl_topbar_link', ''),
        'bgColor'     => get_theme_mod('asl_topbar_bg_color', '#f3f4f6'),
        'textColor'   => get_theme_mod('asl_topbar_text_color', '#4b5563'),
        'dismissible' => get_theme_mod('asl_topbar_dismissible', false),
    );
}

function asl_get_seo_settings() {
    return array(
        'title'         => get_theme_mod('asl_seo_title', ''),
        'titleAr'       => get_theme_mod('asl_seo_title_ar', ''),
        'description'   => get_theme_mod('asl_seo_description', ''),
        'descriptionAr' => get_theme_mod('asl_seo_description_ar', ''),
        'ogImage'       => get_theme_mod('asl_seo_og_image', ''),
        'robots'        => get_theme_mod('asl_seo_robots', 'index,follow'),
    );
}

function asl_get_mobile_bar_settings() {
    $items = array();
    for ($i = 1; $i <= 5; $i++) {
        $enabled = get_theme_mod("asl_mobile_bar_{$i}_enabled", true);
        if ($enabled) {
            $items[] = array(
                'icon'    => get_theme_mod("asl_mobile_bar_{$i}_icon", ''),
                'label'   => get_theme_mod("asl_mobile_bar_{$i}_label", ''),
                'labelAr' => get_theme_mod("asl_mobile_bar_{$i}_label_ar", ''),
                'url'     => get_theme_mod("asl_mobile_bar_{$i}_url", ''),
            );
        }
    }
    return array(
        'enabled' => get_theme_mod('asl_mobile_bar_enabled', true),
        'items'   => $items,
    );
}

function asl_get_hero_settings() {
    $slides = array();
    for ($i = 1; $i <= 5; $i++) {
        $image = get_theme_mod("asl_hero_slide_{$i}_image", '');
        if (!empty($image)) {
            $slides[] = array(
                'image'       => $image,
                'mobileImage' => get_theme_mod("asl_hero_slide_{$i}_mobile", $image),
                'link'        => get_theme_mod("asl_hero_slide_{$i}_link", ''),
            );
        }
    }
    return array(
        'enabled'       => get_theme_mod('asl_hero_enabled', true),
        'hideOnMobile'  => get_theme_mod('asl_hero_hide_mobile', false),
        'autoplay'      => get_theme_mod('asl_hero_autoplay', true),
        'autoplayDelay' => get_theme_mod('asl_hero_autoplay_delay', 5000),
        'loop'          => get_theme_mod('asl_hero_loop', true),
        'slides'        => $slides,
    );
}

function asl_get_new_products_settings() {
    return array(
        'enabled'      => get_theme_mod('asl_new_products_enabled', true),
        'hideOnMobile' => get_theme_mod('asl_new_products_hide_mobile', false),
        'title'        => get_theme_mod('asl_new_products_title', 'New Arrivals'),
        'titleAr'      => get_theme_mod('asl_new_products_title_ar', ''),
        'subtitle'     => get_theme_mod('asl_new_products_subtitle', 'Discover our latest products'),
        'subtitleAr'   => get_theme_mod('asl_new_products_subtitle_ar', ''),
        'count'        => get_theme_mod('asl_new_products_count', 8),
        'display'      => get_theme_mod('asl_new_products_display', 'slider'),
        'autoplay'     => get_theme_mod('asl_new_products_autoplay', true),
        'responsive'   => array(
            'desktop' => get_theme_mod('asl_new_products_cols_desktop', 4),
            'tablet'  => get_theme_mod('asl_new_products_cols_tablet', 3),
            'mobile'  => get_theme_mod('asl_new_products_cols_mobile', 2),
        ),
    );
}

function asl_get_bestseller_settings() {
    return array(
        'enabled'      => get_theme_mod('asl_bestseller_enabled', true),
        'hideOnMobile' => get_theme_mod('asl_bestseller_hide_mobile', false),
        'title'        => get_theme_mod('asl_bestseller_title', 'Bestsellers'),
        'titleAr'      => get_theme_mod('asl_bestseller_title_ar', ''),
        'subtitle'     => get_theme_mod('asl_bestseller_subtitle', 'Our most popular products'),
        'subtitleAr'   => get_theme_mod('asl_bestseller_subtitle_ar', ''),
        'count'        => get_theme_mod('asl_bestseller_count', 8),
        'display'      => get_theme_mod('asl_bestseller_display', 'grid'),
        'responsive'   => array(
            'desktop' => get_theme_mod('asl_bestseller_cols_desktop', 4),
            'tablet'  => get_theme_mod('asl_bestseller_cols_tablet', 3),
            'mobile'  => get_theme_mod('asl_bestseller_cols_mobile', 2),
        ),
    );
}

function asl_get_categories_settings() {
    return array(
        'enabled'      => get_theme_mod('asl_categories_enabled', true),
        'hideOnMobile' => get_theme_mod('asl_categories_hide_mobile', false),
        'title'        => get_theme_mod('asl_categories_title', 'Shop by Category'),
        'titleAr'      => get_theme_mod('asl_categories_title_ar', ''),
        'subtitle'     => get_theme_mod('asl_categories_subtitle', 'Browse our collections'),
        'subtitleAr'   => get_theme_mod('asl_categories_subtitle_ar', ''),
        'count'        => get_theme_mod('asl_categories_count', 6),
        'responsive'   => array(
            'desktop' => get_theme_mod('asl_categories_cols_desktop', 6),
            'tablet'  => get_theme_mod('asl_categories_cols_tablet', 4),
            'mobile'  => get_theme_mod('asl_categories_cols_mobile', 3),
        ),
    );
}

function asl_get_featured_settings() {
    return array(
        'enabled'      => get_theme_mod('asl_featured_enabled', true),
        'hideOnMobile' => get_theme_mod('asl_featured_hide_mobile', false),
        'title'        => get_theme_mod('asl_featured_title', 'Featured Products'),
        'titleAr'      => get_theme_mod('asl_featured_title_ar', ''),
        'subtitle'     => get_theme_mod('asl_featured_subtitle', 'Handpicked for you'),
        'subtitleAr'   => get_theme_mod('asl_featured_subtitle_ar', ''),
        'count'        => get_theme_mod('asl_featured_count', 12),
        'autoplay'     => get_theme_mod('asl_featured_autoplay', true),
        'responsive'   => array(
            'desktop' => get_theme_mod('asl_featured_cols_desktop', 4),
            'tablet'  => get_theme_mod('asl_featured_cols_tablet', 3),
            'mobile'  => get_theme_mod('asl_featured_cols_mobile', 2),
        ),
    );
}

function asl_get_collections_settings() {
    $items = array();
    for ($i = 1; $i <= 6; $i++) {
        $image = get_theme_mod("asl_collection_{$i}_image", '');
        $title = get_theme_mod("asl_collection_{$i}_title", '');
        if (!empty($image) || !empty($title)) {
            $items[] = array(
                'image'         => $image,
                'title'         => $title,
                'titleAr'       => get_theme_mod("asl_collection_{$i}_title_ar", ''),
                'description'   => get_theme_mod("asl_collection_{$i}_description", ''),
                'descriptionAr' => get_theme_mod("asl_collection_{$i}_description_ar", ''),
                'link'          => get_theme_mod("asl_collection_{$i}_link", ''),
            );
        }
    }
    return array(
        'enabled'      => get_theme_mod('asl_collections_enabled', true),
        'hideOnMobile' => get_theme_mod('asl_collections_hide_mobile', false),
        'title'        => get_theme_mod('asl_collections_title', 'Our Collections'),
        'titleAr'      => get_theme_mod('asl_collections_title_ar', ''),
        'subtitle'     => get_theme_mod('asl_collections_subtitle', 'Explore our curated collections'),
        'subtitleAr'   => get_theme_mod('asl_collections_subtitle_ar', ''),
        'items'        => $items,
    );
}

function asl_get_banners_settings() {
    $items = array();
    for ($i = 1; $i <= 4; $i++) {
        $image = get_theme_mod("asl_banner_{$i}_image", '');
        if (!empty($image)) {
            $items[] = array(
                'image'       => $image,
                'mobileImage' => get_theme_mod("asl_banner_{$i}_mobile", $image),
                'title'       => get_theme_mod("asl_banner_{$i}_title", ''),
                'titleAr'     => get_theme_mod("asl_banner_{$i}_title_ar", ''),
                'subtitle'    => get_theme_mod("asl_banner_{$i}_subtitle", ''),
                'subtitleAr'  => get_theme_mod("asl_banner_{$i}_subtitle_ar", ''),
                'link'        => get_theme_mod("asl_banner_{$i}_link", ''),
            );
        }
    }
    return array(
        'enabled'      => get_theme_mod('asl_banners_enabled', true),
        'hideOnMobile' => get_theme_mod('asl_banners_hide_mobile', false),
        'items'        => $items,
    );
}

function asl_get_menu($request) {
    $location = $request['location'];
    $locations = get_nav_menu_locations();
    
    if (!isset($locations[$location])) {
        $menu = wp_get_nav_menu_object($location);
        if (!$menu) {
            return new WP_Error('no_menu', 'Menu not found', array('status' => 404));
        }
        $menu_id = $menu->term_id;
    } else {
        $menu_id = $locations[$location];
    }

    $menu_items = wp_get_nav_menu_items($menu_id);
    if (!$menu_items) {
        return array('items' => array());
    }

    $items = array();
    foreach ($menu_items as $item) {
        $items[] = array(
            'id'       => $item->ID,
            'title'    => $item->title,
            'url'      => $item->url,
            'target'   => $item->target,
            'parent'   => $item->menu_item_parent,
            'classes'  => implode(' ', $item->classes),
            'order'    => $item->menu_order,
        );
    }

    return array(
        'id'    => $menu_id,
        'name'  => wp_get_nav_menu_object($menu_id)->name,
        'items' => $items,
    );
}

// ============================================================================
// SECTION 9: REGISTER MENU LOCATIONS
// ============================================================================
add_action('after_setup_theme', 'asl_register_menus');
function asl_register_menus() {
    register_nav_menus(array(
        'primary' => __('Primary Menu', 'asl'),
        'footer'  => __('Footer Menu', 'asl'),
    ));
}

// ============================================================================
// SECTION 10: ADD THEME SUPPORT
// ============================================================================
add_action('after_setup_theme', 'asl_theme_support');
function asl_theme_support() {
    add_theme_support('custom-logo', array(
        'height'      => 100,
        'width'       => 400,
        'flex-height' => true,
        'flex-width'  => true,
    ));
}

// ============================================================================
// SECTION 11: CORS HEADERS FOR REST API
// ============================================================================
add_action('rest_api_init', 'asl_add_cors_headers');
function asl_add_cors_headers() {
    remove_filter('rest_pre_serve_request', 'rest_send_cors_headers');
    add_filter('rest_pre_serve_request', function($value) {
        $origin = get_http_origin();
        $allowed_origins = array(
            'https://aromaticscentslab.com',
            'https://asl-frontend-seven.vercel.app',
            'http://localhost:3000',
            'http://localhost:3001',
        );
        
        if (in_array($origin, $allowed_origins)) {
            header('Access-Control-Allow-Origin: ' . esc_url_raw($origin));
        } else {
            header('Access-Control-Allow-Origin: *');
        }
        
        header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
        header('Access-Control-Allow-Credentials: true');
        header('Access-Control-Allow-Headers: Authorization, Content-Type');
        
        return $value;
    });
}

// ============================================================================
// SECTION 12: ADMIN STYLES
// ============================================================================
add_action('admin_head', 'asl_admin_styles');
function asl_admin_styles() {
    $screen = get_current_screen();
    if (strpos($screen->id, 'asl-settings') === false) {
        return;
    }
    ?>
    <style>
        .nav-tab-wrapper { margin-bottom: 0; }
        .tab-content { margin-top: 0; }
        .form-table th { width: 200px; }
        .form-table td input.large-text { width: 100%; max-width: 600px; }
    </style>
    <?php
}
