<?php
/**
 * Plugin Name: ASL Frontend Settings
 * Plugin URI: https://aromaticscentslab.com
 * Description: Adds Customizer settings and REST API endpoints for ASL Frontend. Works with block themes like Twenty Twenty-Five. Includes bilingual support (English/Arabic).
 * Version: 2.0.0
 * Author: Aromatic Scents Lab
 * License: GPL v2 or later
 * 
 * INSTALLATION:
 * 1. Upload this file to: wp-content/mu-plugins/asl-frontend-settings.php
 *    (Create the mu-plugins folder if it doesn't exist)
 * OR
 * 2. Upload to: wp-content/plugins/asl-frontend-settings.php
 *    Then activate from Plugins menu
 * 
 * FEATURES:
 * - Header & Logo settings (sticky logo, dark mode logo)
 * - Promotional Top Bar settings
 * - SEO settings (meta title, description, OG image)
 * - Home page sections with slider/grid toggle and responsive settings
 * - Arabic translation fields for all text content
 * - Mobile Bottom Bar configuration
 * - REST API endpoints for frontend consumption
 */

if (!defined('ABSPATH')) {
    exit;
}

// ============================================================================
// SECTION 1: ADD CUSTOMIZE MENU ITEM FOR BLOCK THEMES
// ============================================================================
add_action('admin_menu', 'asl_add_customize_menu');
function asl_add_customize_menu() {
    add_theme_page(
        __('Customize', 'asl'),
        __('Customize', 'asl'),
        'edit_theme_options',
        'customize.php'
    );
}

// ============================================================================
// SECTION 2: REGISTER CUSTOMIZER SETTINGS
// ============================================================================
add_action('customize_register', 'asl_customize_register');
function asl_customize_register($wp_customize) {
    
    // PANEL: ASL Frontend Settings
    $wp_customize->add_panel('asl_settings', array(
        'title'       => __('ASL Frontend Settings', 'asl'),
        'description' => __('Configure site settings for ASL Frontend. All text fields have Arabic versions.', 'asl'),
        'priority'    => 25,
    ));

    // ========================================================================
    // SECTION: Header & Logo
    // ========================================================================
    $wp_customize->add_section('asl_header', array(
        'title'       => __('Header & Logo', 'asl'),
        'description' => __('Configure header appearance and logo settings.', 'asl'),
        'panel'       => 'asl_settings',
        'priority'    => 5,
    ));

    $wp_customize->add_setting('asl_header_sticky', array(
        'default'           => true,
        'sanitize_callback' => 'asl_sanitize_checkbox',
    ));
    $wp_customize->add_control('asl_header_sticky', array(
        'label'       => __('Enable Sticky Header', 'asl'),
        'description' => __('Header stays fixed at top when scrolling.', 'asl'),
        'section'     => 'asl_header',
        'type'        => 'checkbox',
    ));

    $wp_customize->add_setting('asl_sticky_logo', array(
        'default'           => '',
        'sanitize_callback' => 'esc_url_raw',
    ));
    $wp_customize->add_control(new WP_Customize_Image_Control($wp_customize, 'asl_sticky_logo', array(
        'label'       => __('Sticky Logo', 'asl'),
        'description' => __('Logo to show when header is sticky/scrolled.', 'asl'),
        'section'     => 'asl_header',
    )));

    $wp_customize->add_setting('asl_logo_dark', array(
        'default'           => '',
        'sanitize_callback' => 'esc_url_raw',
    ));
    $wp_customize->add_control(new WP_Customize_Image_Control($wp_customize, 'asl_logo_dark', array(
        'label'       => __('Dark Mode Logo', 'asl'),
        'section'     => 'asl_header',
    )));

    // ========================================================================
    // SECTION: Promotional Top Bar
    // ========================================================================
    $wp_customize->add_section('asl_topbar', array(
        'title'       => __('Promotional Top Bar', 'asl'),
        'description' => __('Configure the promotional announcement bar.', 'asl'),
        'panel'       => 'asl_settings',
        'priority'    => 6,
    ));

    $wp_customize->add_setting('asl_topbar_enabled', array(
        'default'           => true,
        'sanitize_callback' => 'asl_sanitize_checkbox',
    ));
    $wp_customize->add_control('asl_topbar_enabled', array(
        'label'   => __('Enable Promotional Top Bar', 'asl'),
        'section' => 'asl_topbar',
        'type'    => 'checkbox',
    ));

    $wp_customize->add_setting('asl_topbar_text', array(
        'default'           => 'Free shipping on orders over 200 SAR',
        'sanitize_callback' => 'sanitize_text_field',
    ));
    $wp_customize->add_control('asl_topbar_text', array(
        'label'   => __('Promotional Text (English)', 'asl'),
        'section' => 'asl_topbar',
        'type'    => 'text',
    ));

    $wp_customize->add_setting('asl_topbar_text_ar', array(
        'default'           => '',
        'sanitize_callback' => 'sanitize_text_field',
    ));
    $wp_customize->add_control('asl_topbar_text_ar', array(
        'label'   => __('Promotional Text (Arabic)', 'asl'),
        'section' => 'asl_topbar',
        'type'    => 'text',
    ));

    $wp_customize->add_setting('asl_topbar_link', array(
        'default'           => '',
        'sanitize_callback' => 'esc_url_raw',
    ));
    $wp_customize->add_control('asl_topbar_link', array(
        'label'   => __('Link URL (optional)', 'asl'),
        'section' => 'asl_topbar',
        'type'    => 'url',
    ));

    $wp_customize->add_setting('asl_topbar_bg_color', array(
        'default'           => '#f3f4f6',
        'sanitize_callback' => 'sanitize_hex_color',
    ));
    $wp_customize->add_control(new WP_Customize_Color_Control($wp_customize, 'asl_topbar_bg_color', array(
        'label'   => __('Background Color', 'asl'),
        'section' => 'asl_topbar',
    )));

    $wp_customize->add_setting('asl_topbar_text_color', array(
        'default'           => '#4b5563',
        'sanitize_callback' => 'sanitize_hex_color',
    ));
    $wp_customize->add_control(new WP_Customize_Color_Control($wp_customize, 'asl_topbar_text_color', array(
        'label'   => __('Text Color', 'asl'),
        'section' => 'asl_topbar',
    )));

    $wp_customize->add_setting('asl_topbar_dismissible', array(
        'default'           => false,
        'sanitize_callback' => 'asl_sanitize_checkbox',
    ));
    $wp_customize->add_control('asl_topbar_dismissible', array(
        'label'   => __('Allow users to dismiss', 'asl'),
        'section' => 'asl_topbar',
        'type'    => 'checkbox',
    ));

    // ========================================================================
    // SECTION: SEO Settings
    // ========================================================================
    $wp_customize->add_section('asl_seo', array(
        'title'       => __('SEO Settings', 'asl'),
        'description' => __('Configure SEO meta tags for the home page.', 'asl'),
        'panel'       => 'asl_settings',
        'priority'    => 7,
    ));

    $wp_customize->add_setting('asl_seo_title', array(
        'default'           => '',
        'sanitize_callback' => 'sanitize_text_field',
    ));
    $wp_customize->add_control('asl_seo_title', array(
        'label'       => __('Meta Title (English)', 'asl'),
        'description' => __('Leave empty to use site title.', 'asl'),
        'section'     => 'asl_seo',
        'type'        => 'text',
    ));

    $wp_customize->add_setting('asl_seo_title_ar', array(
        'default'           => '',
        'sanitize_callback' => 'sanitize_text_field',
    ));
    $wp_customize->add_control('asl_seo_title_ar', array(
        'label'   => __('Meta Title (Arabic)', 'asl'),
        'section' => 'asl_seo',
        'type'    => 'text',
    ));

    $wp_customize->add_setting('asl_seo_description', array(
        'default'           => '',
        'sanitize_callback' => 'sanitize_textarea_field',
    ));
    $wp_customize->add_control('asl_seo_description', array(
        'label'       => __('Meta Description (English)', 'asl'),
        'description' => __('Recommended: 150-160 characters.', 'asl'),
        'section'     => 'asl_seo',
        'type'        => 'textarea',
    ));

    $wp_customize->add_setting('asl_seo_description_ar', array(
        'default'           => '',
        'sanitize_callback' => 'sanitize_textarea_field',
    ));
    $wp_customize->add_control('asl_seo_description_ar', array(
        'label'   => __('Meta Description (Arabic)', 'asl'),
        'section' => 'asl_seo',
        'type'    => 'textarea',
    ));

    $wp_customize->add_setting('asl_seo_og_image', array(
        'default'           => '',
        'sanitize_callback' => 'esc_url_raw',
    ));
    $wp_customize->add_control(new WP_Customize_Image_Control($wp_customize, 'asl_seo_og_image', array(
        'label'       => __('Social Share Image (OG Image)', 'asl'),
        'description' => __('Recommended: 1200x630px', 'asl'),
        'section'     => 'asl_seo',
    )));

    $wp_customize->add_setting('asl_seo_robots', array(
        'default'           => 'index,follow',
        'sanitize_callback' => 'sanitize_text_field',
    ));
    $wp_customize->add_control('asl_seo_robots', array(
        'label'   => __('Robots Meta', 'asl'),
        'section' => 'asl_seo',
        'type'    => 'select',
        'choices' => array(
            'index,follow'     => __('Index, Follow', 'asl'),
            'noindex,follow'   => __('No Index, Follow', 'asl'),
            'index,nofollow'   => __('Index, No Follow', 'asl'),
            'noindex,nofollow' => __('No Index, No Follow', 'asl'),
        ),
    ));

    // ========================================================================
    // SECTION: Mobile Bottom Bar
    // ========================================================================
    $wp_customize->add_section('asl_mobile_bar', array(
        'title'       => __('Mobile Bottom Bar', 'asl'),
        'description' => __('Configure the mobile bottom navigation bar (5 items).', 'asl'),
        'panel'       => 'asl_settings',
        'priority'    => 8,
    ));

    $wp_customize->add_setting('asl_mobile_bar_enabled', array(
        'default'           => true,
        'sanitize_callback' => 'asl_sanitize_checkbox',
    ));
    $wp_customize->add_control('asl_mobile_bar_enabled', array(
        'label'   => __('Enable Mobile Bottom Bar', 'asl'),
        'section' => 'asl_mobile_bar',
        'type'    => 'checkbox',
    ));

    $mobile_bar_defaults = array(
        1 => array('icon' => 'home', 'label' => 'Home', 'url' => '/'),
        2 => array('icon' => 'shop', 'label' => 'Shop', 'url' => '/shop'),
        3 => array('icon' => 'categories', 'label' => 'Categories', 'url' => '/categories'),
        4 => array('icon' => 'wishlist', 'label' => 'Wishlist', 'url' => '/wishlist'),
        5 => array('icon' => 'account', 'label' => 'Account', 'url' => '/account'),
    );

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

    for ($i = 1; $i <= 5; $i++) {
        $defaults = $mobile_bar_defaults[$i];

        $wp_customize->add_setting("asl_mobile_bar_{$i}_enabled", array(
            'default'           => true,
            'sanitize_callback' => 'asl_sanitize_checkbox',
        ));
        $wp_customize->add_control("asl_mobile_bar_{$i}_enabled", array(
            'label'   => sprintf(__('Item %d - Enable', 'asl'), $i),
            'section' => 'asl_mobile_bar',
            'type'    => 'checkbox',
        ));

        $wp_customize->add_setting("asl_mobile_bar_{$i}_icon", array(
            'default'           => $defaults['icon'],
            'sanitize_callback' => 'sanitize_text_field',
        ));
        $wp_customize->add_control("asl_mobile_bar_{$i}_icon", array(
            'label'   => sprintf(__('Item %d - Icon', 'asl'), $i),
            'section' => 'asl_mobile_bar',
            'type'    => 'select',
            'choices' => $icon_choices,
        ));

        $wp_customize->add_setting("asl_mobile_bar_{$i}_label", array(
            'default'           => $defaults['label'],
            'sanitize_callback' => 'sanitize_text_field',
        ));
        $wp_customize->add_control("asl_mobile_bar_{$i}_label", array(
            'label'   => sprintf(__('Item %d - Label (English)', 'asl'), $i),
            'section' => 'asl_mobile_bar',
            'type'    => 'text',
        ));

        $wp_customize->add_setting("asl_mobile_bar_{$i}_label_ar", array(
            'default'           => '',
            'sanitize_callback' => 'sanitize_text_field',
        ));
        $wp_customize->add_control("asl_mobile_bar_{$i}_label_ar", array(
            'label'   => sprintf(__('Item %d - Label (Arabic)', 'asl'), $i),
            'section' => 'asl_mobile_bar',
            'type'    => 'text',
        ));

        $wp_customize->add_setting("asl_mobile_bar_{$i}_url", array(
            'default'           => $defaults['url'],
            'sanitize_callback' => 'sanitize_text_field',
        ));
        $wp_customize->add_control("asl_mobile_bar_{$i}_url", array(
            'label'   => sprintf(__('Item %d - URL', 'asl'), $i),
            'section' => 'asl_mobile_bar',
            'type'    => 'text',
        ));
    }

    // ========================================================================
    // SECTION: Hero Slider
    // ========================================================================
    $wp_customize->add_section('asl_hero_slider', array(
        'title'    => __('Home - Hero Slider', 'asl'),
        'panel'    => 'asl_settings',
        'priority' => 10,
    ));

    $wp_customize->add_setting('asl_hero_enabled', array(
        'default'           => true,
        'sanitize_callback' => 'asl_sanitize_checkbox',
    ));
    $wp_customize->add_control('asl_hero_enabled', array(
        'label'   => __('Enable Hero Slider', 'asl'),
        'section' => 'asl_hero_slider',
        'type'    => 'checkbox',
    ));

    $wp_customize->add_setting('asl_hero_autoplay', array(
        'default'           => true,
        'sanitize_callback' => 'asl_sanitize_checkbox',
    ));
    $wp_customize->add_control('asl_hero_autoplay', array(
        'label'   => __('Enable Autoplay', 'asl'),
        'section' => 'asl_hero_slider',
        'type'    => 'checkbox',
    ));

    $wp_customize->add_setting('asl_hero_autoplay_delay', array(
        'default'           => 5000,
        'sanitize_callback' => 'absint',
    ));
    $wp_customize->add_control('asl_hero_autoplay_delay', array(
        'label'       => __('Autoplay Delay (ms)', 'asl'),
        'section'     => 'asl_hero_slider',
        'type'        => 'number',
        'input_attrs' => array('min' => 1000, 'max' => 10000, 'step' => 500),
    ));

    $wp_customize->add_setting('asl_hero_loop', array(
        'default'           => true,
        'sanitize_callback' => 'asl_sanitize_checkbox',
    ));
    $wp_customize->add_control('asl_hero_loop', array(
        'label'   => __('Enable Loop', 'asl'),
        'section' => 'asl_hero_slider',
        'type'    => 'checkbox',
    ));

    for ($i = 1; $i <= 5; $i++) {
        $wp_customize->add_setting("asl_hero_slide_{$i}_image", array(
            'default'           => '',
            'sanitize_callback' => 'esc_url_raw',
        ));
        $wp_customize->add_control(new WP_Customize_Image_Control($wp_customize, "asl_hero_slide_{$i}_image", array(
            'label'   => sprintf(__('Slide %d - Desktop Image', 'asl'), $i),
            'section' => 'asl_hero_slider',
        )));

        $wp_customize->add_setting("asl_hero_slide_{$i}_mobile", array(
            'default'           => '',
            'sanitize_callback' => 'esc_url_raw',
        ));
        $wp_customize->add_control(new WP_Customize_Image_Control($wp_customize, "asl_hero_slide_{$i}_mobile", array(
            'label'   => sprintf(__('Slide %d - Mobile Image', 'asl'), $i),
            'section' => 'asl_hero_slider',
        )));

        $wp_customize->add_setting("asl_hero_slide_{$i}_link", array(
            'default'           => '',
            'sanitize_callback' => 'esc_url_raw',
        ));
        $wp_customize->add_control("asl_hero_slide_{$i}_link", array(
            'label'   => sprintf(__('Slide %d - Link URL', 'asl'), $i),
            'section' => 'asl_hero_slider',
            'type'    => 'url',
        ));
    }

    // ========================================================================
    // SECTION: New Products
    // ========================================================================
    $wp_customize->add_section('asl_new_products', array(
        'title'       => __('Home - New Products', 'asl'),
        'description' => __('Configure the New Products section with slider/grid options.', 'asl'),
        'panel'       => 'asl_settings',
        'priority'    => 20,
    ));

    $wp_customize->add_setting('asl_new_products_enabled', array(
        'default'           => true,
        'sanitize_callback' => 'asl_sanitize_checkbox',
    ));
    $wp_customize->add_control('asl_new_products_enabled', array(
        'label'   => __('Enable New Products Section', 'asl'),
        'section' => 'asl_new_products',
        'type'    => 'checkbox',
    ));

    $wp_customize->add_setting('asl_new_products_title', array(
        'default'           => 'New Arrivals',
        'sanitize_callback' => 'sanitize_text_field',
    ));
    $wp_customize->add_control('asl_new_products_title', array(
        'label'   => __('Section Title (English)', 'asl'),
        'section' => 'asl_new_products',
        'type'    => 'text',
    ));

    $wp_customize->add_setting('asl_new_products_title_ar', array(
        'default'           => '',
        'sanitize_callback' => 'sanitize_text_field',
    ));
    $wp_customize->add_control('asl_new_products_title_ar', array(
        'label'   => __('Section Title (Arabic)', 'asl'),
        'section' => 'asl_new_products',
        'type'    => 'text',
    ));

    $wp_customize->add_setting('asl_new_products_subtitle', array(
        'default'           => 'Discover our latest products',
        'sanitize_callback' => 'sanitize_text_field',
    ));
    $wp_customize->add_control('asl_new_products_subtitle', array(
        'label'   => __('Section Subtitle (English)', 'asl'),
        'section' => 'asl_new_products',
        'type'    => 'text',
    ));

    $wp_customize->add_setting('asl_new_products_subtitle_ar', array(
        'default'           => '',
        'sanitize_callback' => 'sanitize_text_field',
    ));
    $wp_customize->add_control('asl_new_products_subtitle_ar', array(
        'label'   => __('Section Subtitle (Arabic)', 'asl'),
        'section' => 'asl_new_products',
        'type'    => 'text',
    ));

    $wp_customize->add_setting('asl_new_products_count', array(
        'default'           => 8,
        'sanitize_callback' => 'absint',
    ));
    $wp_customize->add_control('asl_new_products_count', array(
        'label'       => __('Number of Products', 'asl'),
        'section'     => 'asl_new_products',
        'type'        => 'number',
        'input_attrs' => array('min' => 4, 'max' => 24, 'step' => 1),
    ));

    $wp_customize->add_setting('asl_new_products_display', array(
        'default'           => 'slider',
        'sanitize_callback' => 'sanitize_text_field',
    ));
    $wp_customize->add_control('asl_new_products_display', array(
        'label'   => __('Display Mode', 'asl'),
        'section' => 'asl_new_products',
        'type'    => 'select',
        'choices' => array(
            'slider' => __('Slider', 'asl'),
            'grid'   => __('Grid', 'asl'),
        ),
    ));

    $wp_customize->add_setting('asl_new_products_autoplay', array(
        'default'           => true,
        'sanitize_callback' => 'asl_sanitize_checkbox',
    ));
    $wp_customize->add_control('asl_new_products_autoplay', array(
        'label'       => __('Enable Slider Autoplay', 'asl'),
        'description' => __('Only applies when Display Mode is Slider.', 'asl'),
        'section'     => 'asl_new_products',
        'type'        => 'checkbox',
    ));

    $wp_customize->add_setting('asl_new_products_cols_desktop', array(
        'default'           => 4,
        'sanitize_callback' => 'absint',
    ));
    $wp_customize->add_control('asl_new_products_cols_desktop', array(
        'label'       => __('Desktop - Columns/Slides per View', 'asl'),
        'section'     => 'asl_new_products',
        'type'        => 'number',
        'input_attrs' => array('min' => 2, 'max' => 6, 'step' => 1),
    ));

    $wp_customize->add_setting('asl_new_products_cols_tablet', array(
        'default'           => 3,
        'sanitize_callback' => 'absint',
    ));
    $wp_customize->add_control('asl_new_products_cols_tablet', array(
        'label'       => __('Tablet - Columns/Slides per View', 'asl'),
        'section'     => 'asl_new_products',
        'type'        => 'number',
        'input_attrs' => array('min' => 2, 'max' => 4, 'step' => 1),
    ));

    $wp_customize->add_setting('asl_new_products_cols_mobile', array(
        'default'           => 2,
        'sanitize_callback' => 'absint',
    ));
    $wp_customize->add_control('asl_new_products_cols_mobile', array(
        'label'       => __('Mobile - Columns/Slides per View', 'asl'),
        'section'     => 'asl_new_products',
        'type'        => 'number',
        'input_attrs' => array('min' => 1, 'max' => 3, 'step' => 1),
    ));

    // ========================================================================
    // SECTION: Bestseller Products
    // ========================================================================
    $wp_customize->add_section('asl_bestseller', array(
        'title'       => __('Home - Bestseller Products', 'asl'),
        'panel'       => 'asl_settings',
        'priority'    => 30,
    ));

    $wp_customize->add_setting('asl_bestseller_enabled', array(
        'default'           => true,
        'sanitize_callback' => 'asl_sanitize_checkbox',
    ));
    $wp_customize->add_control('asl_bestseller_enabled', array(
        'label'   => __('Enable Bestseller Section', 'asl'),
        'section' => 'asl_bestseller',
        'type'    => 'checkbox',
    ));

    $wp_customize->add_setting('asl_bestseller_title', array(
        'default'           => 'Bestsellers',
        'sanitize_callback' => 'sanitize_text_field',
    ));
    $wp_customize->add_control('asl_bestseller_title', array(
        'label'   => __('Section Title (English)', 'asl'),
        'section' => 'asl_bestseller',
        'type'    => 'text',
    ));

    $wp_customize->add_setting('asl_bestseller_title_ar', array(
        'default'           => '',
        'sanitize_callback' => 'sanitize_text_field',
    ));
    $wp_customize->add_control('asl_bestseller_title_ar', array(
        'label'   => __('Section Title (Arabic)', 'asl'),
        'section' => 'asl_bestseller',
        'type'    => 'text',
    ));

    $wp_customize->add_setting('asl_bestseller_subtitle', array(
        'default'           => 'Our most popular products',
        'sanitize_callback' => 'sanitize_text_field',
    ));
    $wp_customize->add_control('asl_bestseller_subtitle', array(
        'label'   => __('Section Subtitle (English)', 'asl'),
        'section' => 'asl_bestseller',
        'type'    => 'text',
    ));

    $wp_customize->add_setting('asl_bestseller_subtitle_ar', array(
        'default'           => '',
        'sanitize_callback' => 'sanitize_text_field',
    ));
    $wp_customize->add_control('asl_bestseller_subtitle_ar', array(
        'label'   => __('Section Subtitle (Arabic)', 'asl'),
        'section' => 'asl_bestseller',
        'type'    => 'text',
    ));

    $wp_customize->add_setting('asl_bestseller_count', array(
        'default'           => 8,
        'sanitize_callback' => 'absint',
    ));
    $wp_customize->add_control('asl_bestseller_count', array(
        'label'       => __('Number of Products', 'asl'),
        'section'     => 'asl_bestseller',
        'type'        => 'number',
        'input_attrs' => array('min' => 4, 'max' => 24, 'step' => 1),
    ));

    $wp_customize->add_setting('asl_bestseller_display', array(
        'default'           => 'grid',
        'sanitize_callback' => 'sanitize_text_field',
    ));
    $wp_customize->add_control('asl_bestseller_display', array(
        'label'   => __('Display Mode', 'asl'),
        'section' => 'asl_bestseller',
        'type'    => 'select',
        'choices' => array(
            'slider' => __('Slider', 'asl'),
            'grid'   => __('Grid', 'asl'),
        ),
    ));

    $wp_customize->add_setting('asl_bestseller_cols_desktop', array(
        'default'           => 4,
        'sanitize_callback' => 'absint',
    ));
    $wp_customize->add_control('asl_bestseller_cols_desktop', array(
        'label'       => __('Desktop - Columns/Slides per View', 'asl'),
        'section'     => 'asl_bestseller',
        'type'        => 'number',
        'input_attrs' => array('min' => 2, 'max' => 6, 'step' => 1),
    ));

    $wp_customize->add_setting('asl_bestseller_cols_tablet', array(
        'default'           => 3,
        'sanitize_callback' => 'absint',
    ));
    $wp_customize->add_control('asl_bestseller_cols_tablet', array(
        'label'       => __('Tablet - Columns/Slides per View', 'asl'),
        'section'     => 'asl_bestseller',
        'type'        => 'number',
        'input_attrs' => array('min' => 2, 'max' => 4, 'step' => 1),
    ));

    $wp_customize->add_setting('asl_bestseller_cols_mobile', array(
        'default'           => 2,
        'sanitize_callback' => 'absint',
    ));
    $wp_customize->add_control('asl_bestseller_cols_mobile', array(
        'label'       => __('Mobile - Columns/Slides per View', 'asl'),
        'section'     => 'asl_bestseller',
        'type'        => 'number',
        'input_attrs' => array('min' => 1, 'max' => 3, 'step' => 1),
    ));

    // ========================================================================
    // SECTION: Shop by Category
    // ========================================================================
    $wp_customize->add_section('asl_categories', array(
        'title'       => __('Home - Shop by Category', 'asl'),
        'panel'       => 'asl_settings',
        'priority'    => 40,
    ));

    $wp_customize->add_setting('asl_categories_enabled', array(
        'default'           => true,
        'sanitize_callback' => 'asl_sanitize_checkbox',
    ));
    $wp_customize->add_control('asl_categories_enabled', array(
        'label'   => __('Enable Categories Section', 'asl'),
        'section' => 'asl_categories',
        'type'    => 'checkbox',
    ));

    $wp_customize->add_setting('asl_categories_title', array(
        'default'           => 'Shop by Category',
        'sanitize_callback' => 'sanitize_text_field',
    ));
    $wp_customize->add_control('asl_categories_title', array(
        'label'   => __('Section Title (English)', 'asl'),
        'section' => 'asl_categories',
        'type'    => 'text',
    ));

    $wp_customize->add_setting('asl_categories_title_ar', array(
        'default'           => '',
        'sanitize_callback' => 'sanitize_text_field',
    ));
    $wp_customize->add_control('asl_categories_title_ar', array(
        'label'   => __('Section Title (Arabic)', 'asl'),
        'section' => 'asl_categories',
        'type'    => 'text',
    ));

    $wp_customize->add_setting('asl_categories_subtitle', array(
        'default'           => 'Browse our collections',
        'sanitize_callback' => 'sanitize_text_field',
    ));
    $wp_customize->add_control('asl_categories_subtitle', array(
        'label'   => __('Section Subtitle (English)', 'asl'),
        'section' => 'asl_categories',
        'type'    => 'text',
    ));

    $wp_customize->add_setting('asl_categories_subtitle_ar', array(
        'default'           => '',
        'sanitize_callback' => 'sanitize_text_field',
    ));
    $wp_customize->add_control('asl_categories_subtitle_ar', array(
        'label'   => __('Section Subtitle (Arabic)', 'asl'),
        'section' => 'asl_categories',
        'type'    => 'text',
    ));

    $wp_customize->add_setting('asl_categories_count', array(
        'default'           => 6,
        'sanitize_callback' => 'absint',
    ));
    $wp_customize->add_control('asl_categories_count', array(
        'label'       => __('Number of Categories', 'asl'),
        'section'     => 'asl_categories',
        'type'        => 'number',
        'input_attrs' => array('min' => 3, 'max' => 12, 'step' => 1),
    ));

    $wp_customize->add_setting('asl_categories_cols_desktop', array(
        'default'           => 6,
        'sanitize_callback' => 'absint',
    ));
    $wp_customize->add_control('asl_categories_cols_desktop', array(
        'label'       => __('Desktop - Columns', 'asl'),
        'section'     => 'asl_categories',
        'type'        => 'number',
        'input_attrs' => array('min' => 3, 'max' => 8, 'step' => 1),
    ));

    $wp_customize->add_setting('asl_categories_cols_tablet', array(
        'default'           => 4,
        'sanitize_callback' => 'absint',
    ));
    $wp_customize->add_control('asl_categories_cols_tablet', array(
        'label'       => __('Tablet - Columns', 'asl'),
        'section'     => 'asl_categories',
        'type'        => 'number',
        'input_attrs' => array('min' => 2, 'max' => 6, 'step' => 1),
    ));

    $wp_customize->add_setting('asl_categories_cols_mobile', array(
        'default'           => 3,
        'sanitize_callback' => 'absint',
    ));
    $wp_customize->add_control('asl_categories_cols_mobile', array(
        'label'       => __('Mobile - Columns', 'asl'),
        'section'     => 'asl_categories',
        'type'        => 'number',
        'input_attrs' => array('min' => 2, 'max' => 4, 'step' => 1),
    ));

    // ========================================================================
    // SECTION: Featured Products
    // ========================================================================
    $wp_customize->add_section('asl_featured', array(
        'title'       => __('Home - Featured Products', 'asl'),
        'panel'       => 'asl_settings',
        'priority'    => 50,
    ));

    $wp_customize->add_setting('asl_featured_enabled', array(
        'default'           => true,
        'sanitize_callback' => 'asl_sanitize_checkbox',
    ));
    $wp_customize->add_control('asl_featured_enabled', array(
        'label'   => __('Enable Featured Products Section', 'asl'),
        'section' => 'asl_featured',
        'type'    => 'checkbox',
    ));

    $wp_customize->add_setting('asl_featured_title', array(
        'default'           => 'Featured Products',
        'sanitize_callback' => 'sanitize_text_field',
    ));
    $wp_customize->add_control('asl_featured_title', array(
        'label'   => __('Section Title (English)', 'asl'),
        'section' => 'asl_featured',
        'type'    => 'text',
    ));

    $wp_customize->add_setting('asl_featured_title_ar', array(
        'default'           => '',
        'sanitize_callback' => 'sanitize_text_field',
    ));
    $wp_customize->add_control('asl_featured_title_ar', array(
        'label'   => __('Section Title (Arabic)', 'asl'),
        'section' => 'asl_featured',
        'type'    => 'text',
    ));

    $wp_customize->add_setting('asl_featured_subtitle', array(
        'default'           => 'Handpicked for you',
        'sanitize_callback' => 'sanitize_text_field',
    ));
    $wp_customize->add_control('asl_featured_subtitle', array(
        'label'   => __('Section Subtitle (English)', 'asl'),
        'section' => 'asl_featured',
        'type'    => 'text',
    ));

    $wp_customize->add_setting('asl_featured_subtitle_ar', array(
        'default'           => '',
        'sanitize_callback' => 'sanitize_text_field',
    ));
    $wp_customize->add_control('asl_featured_subtitle_ar', array(
        'label'   => __('Section Subtitle (Arabic)', 'asl'),
        'section' => 'asl_featured',
        'type'    => 'text',
    ));

    $wp_customize->add_setting('asl_featured_count', array(
        'default'           => 12,
        'sanitize_callback' => 'absint',
    ));
    $wp_customize->add_control('asl_featured_count', array(
        'label'       => __('Number of Products', 'asl'),
        'section'     => 'asl_featured',
        'type'        => 'number',
        'input_attrs' => array('min' => 4, 'max' => 24, 'step' => 1),
    ));

    $wp_customize->add_setting('asl_featured_autoplay', array(
        'default'           => true,
        'sanitize_callback' => 'asl_sanitize_checkbox',
    ));
    $wp_customize->add_control('asl_featured_autoplay', array(
        'label'   => __('Enable Autoplay', 'asl'),
        'section' => 'asl_featured',
        'type'    => 'checkbox',
    ));

    $wp_customize->add_setting('asl_featured_cols_desktop', array(
        'default'           => 4,
        'sanitize_callback' => 'absint',
    ));
    $wp_customize->add_control('asl_featured_cols_desktop', array(
        'label'       => __('Desktop - Slides per View', 'asl'),
        'section'     => 'asl_featured',
        'type'        => 'number',
        'input_attrs' => array('min' => 2, 'max' => 6, 'step' => 1),
    ));

    $wp_customize->add_setting('asl_featured_cols_tablet', array(
        'default'           => 3,
        'sanitize_callback' => 'absint',
    ));
    $wp_customize->add_control('asl_featured_cols_tablet', array(
        'label'       => __('Tablet - Slides per View', 'asl'),
        'section'     => 'asl_featured',
        'type'        => 'number',
        'input_attrs' => array('min' => 2, 'max' => 4, 'step' => 1),
    ));

    $wp_customize->add_setting('asl_featured_cols_mobile', array(
        'default'           => 2,
        'sanitize_callback' => 'absint',
    ));
    $wp_customize->add_control('asl_featured_cols_mobile', array(
        'label'       => __('Mobile - Slides per View', 'asl'),
        'section'     => 'asl_featured',
        'type'        => 'number',
        'input_attrs' => array('min' => 1, 'max' => 3, 'step' => 1),
    ));

    // ========================================================================
    // SECTION: Collections
    // ========================================================================
    $wp_customize->add_section('asl_collections', array(
        'title'       => __('Home - Collections', 'asl'),
        'description' => __('Configure the Collections section (6 items max).', 'asl'),
        'panel'       => 'asl_settings',
        'priority'    => 60,
    ));

    $wp_customize->add_setting('asl_collections_enabled', array(
        'default'           => true,
        'sanitize_callback' => 'asl_sanitize_checkbox',
    ));
    $wp_customize->add_control('asl_collections_enabled', array(
        'label'   => __('Enable Collections Section', 'asl'),
        'section' => 'asl_collections',
        'type'    => 'checkbox',
    ));

    $wp_customize->add_setting('asl_collections_title', array(
        'default'           => 'Our Collections',
        'sanitize_callback' => 'sanitize_text_field',
    ));
    $wp_customize->add_control('asl_collections_title', array(
        'label'   => __('Section Title (English)', 'asl'),
        'section' => 'asl_collections',
        'type'    => 'text',
    ));

    $wp_customize->add_setting('asl_collections_title_ar', array(
        'default'           => '',
        'sanitize_callback' => 'sanitize_text_field',
    ));
    $wp_customize->add_control('asl_collections_title_ar', array(
        'label'   => __('Section Title (Arabic)', 'asl'),
        'section' => 'asl_collections',
        'type'    => 'text',
    ));

    $wp_customize->add_setting('asl_collections_subtitle', array(
        'default'           => 'Explore our curated collections',
        'sanitize_callback' => 'sanitize_text_field',
    ));
    $wp_customize->add_control('asl_collections_subtitle', array(
        'label'   => __('Section Subtitle (English)', 'asl'),
        'section' => 'asl_collections',
        'type'    => 'text',
    ));

    $wp_customize->add_setting('asl_collections_subtitle_ar', array(
        'default'           => '',
        'sanitize_callback' => 'sanitize_text_field',
    ));
    $wp_customize->add_control('asl_collections_subtitle_ar', array(
        'label'   => __('Section Subtitle (Arabic)', 'asl'),
        'section' => 'asl_collections',
        'type'    => 'text',
    ));

    for ($i = 1; $i <= 6; $i++) {
        $wp_customize->add_setting("asl_collection_{$i}_image", array(
            'default'           => '',
            'sanitize_callback' => 'esc_url_raw',
        ));
        $wp_customize->add_control(new WP_Customize_Image_Control($wp_customize, "asl_collection_{$i}_image", array(
            'label'   => sprintf(__('Collection %d - Image', 'asl'), $i),
            'section' => 'asl_collections',
        )));

        $wp_customize->add_setting("asl_collection_{$i}_title", array(
            'default'           => '',
            'sanitize_callback' => 'sanitize_text_field',
        ));
        $wp_customize->add_control("asl_collection_{$i}_title", array(
            'label'   => sprintf(__('Collection %d - Title (English)', 'asl'), $i),
            'section' => 'asl_collections',
            'type'    => 'text',
        ));

        $wp_customize->add_setting("asl_collection_{$i}_title_ar", array(
            'default'           => '',
            'sanitize_callback' => 'sanitize_text_field',
        ));
        $wp_customize->add_control("asl_collection_{$i}_title_ar", array(
            'label'   => sprintf(__('Collection %d - Title (Arabic)', 'asl'), $i),
            'section' => 'asl_collections',
            'type'    => 'text',
        ));

        $wp_customize->add_setting("asl_collection_{$i}_description", array(
            'default'           => '',
            'sanitize_callback' => 'sanitize_textarea_field',
        ));
        $wp_customize->add_control("asl_collection_{$i}_description", array(
            'label'   => sprintf(__('Collection %d - Description (English)', 'asl'), $i),
            'section' => 'asl_collections',
            'type'    => 'textarea',
        ));

        $wp_customize->add_setting("asl_collection_{$i}_description_ar", array(
            'default'           => '',
            'sanitize_callback' => 'sanitize_textarea_field',
        ));
        $wp_customize->add_control("asl_collection_{$i}_description_ar", array(
            'label'   => sprintf(__('Collection %d - Description (Arabic)', 'asl'), $i),
            'section' => 'asl_collections',
            'type'    => 'textarea',
        ));

        $wp_customize->add_setting("asl_collection_{$i}_link", array(
            'default'           => '',
            'sanitize_callback' => 'esc_url_raw',
        ));
        $wp_customize->add_control("asl_collection_{$i}_link", array(
            'label'   => sprintf(__('Collection %d - Link URL', 'asl'), $i),
            'section' => 'asl_collections',
            'type'    => 'url',
        ));
    }

    // ========================================================================
    // SECTION: Banners
    // ========================================================================
    $wp_customize->add_section('asl_banners', array(
        'title'       => __('Home - Banners', 'asl'),
        'description' => __('Configure promotional banners (4 items max).', 'asl'),
        'panel'       => 'asl_settings',
        'priority'    => 70,
    ));

    $wp_customize->add_setting('asl_banners_enabled', array(
        'default'           => true,
        'sanitize_callback' => 'asl_sanitize_checkbox',
    ));
    $wp_customize->add_control('asl_banners_enabled', array(
        'label'   => __('Enable Banners Section', 'asl'),
        'section' => 'asl_banners',
        'type'    => 'checkbox',
    ));

    for ($i = 1; $i <= 4; $i++) {
        $wp_customize->add_setting("asl_banner_{$i}_image", array(
            'default'           => '',
            'sanitize_callback' => 'esc_url_raw',
        ));
        $wp_customize->add_control(new WP_Customize_Image_Control($wp_customize, "asl_banner_{$i}_image", array(
            'label'   => sprintf(__('Banner %d - Desktop Image', 'asl'), $i),
            'section' => 'asl_banners',
        )));

        $wp_customize->add_setting("asl_banner_{$i}_mobile", array(
            'default'           => '',
            'sanitize_callback' => 'esc_url_raw',
        ));
        $wp_customize->add_control(new WP_Customize_Image_Control($wp_customize, "asl_banner_{$i}_mobile", array(
            'label'   => sprintf(__('Banner %d - Mobile Image', 'asl'), $i),
            'section' => 'asl_banners',
        )));

        $wp_customize->add_setting("asl_banner_{$i}_title", array(
            'default'           => '',
            'sanitize_callback' => 'sanitize_text_field',
        ));
        $wp_customize->add_control("asl_banner_{$i}_title", array(
            'label'   => sprintf(__('Banner %d - Title (English)', 'asl'), $i),
            'section' => 'asl_banners',
            'type'    => 'text',
        ));

        $wp_customize->add_setting("asl_banner_{$i}_title_ar", array(
            'default'           => '',
            'sanitize_callback' => 'sanitize_text_field',
        ));
        $wp_customize->add_control("asl_banner_{$i}_title_ar", array(
            'label'   => sprintf(__('Banner %d - Title (Arabic)', 'asl'), $i),
            'section' => 'asl_banners',
            'type'    => 'text',
        ));

        $wp_customize->add_setting("asl_banner_{$i}_subtitle", array(
            'default'           => '',
            'sanitize_callback' => 'sanitize_text_field',
        ));
        $wp_customize->add_control("asl_banner_{$i}_subtitle", array(
            'label'   => sprintf(__('Banner %d - Subtitle (English)', 'asl'), $i),
            'section' => 'asl_banners',
            'type'    => 'text',
        ));

        $wp_customize->add_setting("asl_banner_{$i}_subtitle_ar", array(
            'default'           => '',
            'sanitize_callback' => 'sanitize_text_field',
        ));
        $wp_customize->add_control("asl_banner_{$i}_subtitle_ar", array(
            'label'   => sprintf(__('Banner %d - Subtitle (Arabic)', 'asl'), $i),
            'section' => 'asl_banners',
            'type'    => 'text',
        ));

        $wp_customize->add_setting("asl_banner_{$i}_link", array(
            'default'           => '',
            'sanitize_callback' => 'esc_url_raw',
        ));
        $wp_customize->add_control("asl_banner_{$i}_link", array(
            'label'   => sprintf(__('Banner %d - Link URL', 'asl'), $i),
            'section' => 'asl_banners',
            'type'    => 'url',
        ));
    }
}

function asl_sanitize_checkbox($checked) {
    return ((isset($checked) && true == $checked) ? true : false);
}

// ============================================================================
// SECTION 3: REST API ENDPOINTS
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
        'autoplay'      => get_theme_mod('asl_hero_autoplay', true),
        'autoplayDelay' => get_theme_mod('asl_hero_autoplay_delay', 5000),
        'loop'          => get_theme_mod('asl_hero_loop', true),
        'slides'        => $slides,
    );
}

function asl_get_new_products_settings() {
    return array(
        'enabled'     => get_theme_mod('asl_new_products_enabled', true),
        'title'       => get_theme_mod('asl_new_products_title', 'New Arrivals'),
        'titleAr'     => get_theme_mod('asl_new_products_title_ar', ''),
        'subtitle'    => get_theme_mod('asl_new_products_subtitle', 'Discover our latest products'),
        'subtitleAr'  => get_theme_mod('asl_new_products_subtitle_ar', ''),
        'count'       => get_theme_mod('asl_new_products_count', 8),
        'display'     => get_theme_mod('asl_new_products_display', 'slider'),
        'autoplay'    => get_theme_mod('asl_new_products_autoplay', true),
        'responsive'  => array(
            'desktop' => get_theme_mod('asl_new_products_cols_desktop', 4),
            'tablet'  => get_theme_mod('asl_new_products_cols_tablet', 3),
            'mobile'  => get_theme_mod('asl_new_products_cols_mobile', 2),
        ),
    );
}

function asl_get_bestseller_settings() {
    return array(
        'enabled'     => get_theme_mod('asl_bestseller_enabled', true),
        'title'       => get_theme_mod('asl_bestseller_title', 'Bestsellers'),
        'titleAr'     => get_theme_mod('asl_bestseller_title_ar', ''),
        'subtitle'    => get_theme_mod('asl_bestseller_subtitle', 'Our most popular products'),
        'subtitleAr'  => get_theme_mod('asl_bestseller_subtitle_ar', ''),
        'count'       => get_theme_mod('asl_bestseller_count', 8),
        'display'     => get_theme_mod('asl_bestseller_display', 'grid'),
        'responsive'  => array(
            'desktop' => get_theme_mod('asl_bestseller_cols_desktop', 4),
            'tablet'  => get_theme_mod('asl_bestseller_cols_tablet', 3),
            'mobile'  => get_theme_mod('asl_bestseller_cols_mobile', 2),
        ),
    );
}

function asl_get_categories_settings() {
    return array(
        'enabled'     => get_theme_mod('asl_categories_enabled', true),
        'title'       => get_theme_mod('asl_categories_title', 'Shop by Category'),
        'titleAr'     => get_theme_mod('asl_categories_title_ar', ''),
        'subtitle'    => get_theme_mod('asl_categories_subtitle', 'Browse our collections'),
        'subtitleAr'  => get_theme_mod('asl_categories_subtitle_ar', ''),
        'count'       => get_theme_mod('asl_categories_count', 6),
        'responsive'  => array(
            'desktop' => get_theme_mod('asl_categories_cols_desktop', 6),
            'tablet'  => get_theme_mod('asl_categories_cols_tablet', 4),
            'mobile'  => get_theme_mod('asl_categories_cols_mobile', 3),
        ),
    );
}

function asl_get_featured_settings() {
    return array(
        'enabled'     => get_theme_mod('asl_featured_enabled', true),
        'title'       => get_theme_mod('asl_featured_title', 'Featured Products'),
        'titleAr'     => get_theme_mod('asl_featured_title_ar', ''),
        'subtitle'    => get_theme_mod('asl_featured_subtitle', 'Handpicked for you'),
        'subtitleAr'  => get_theme_mod('asl_featured_subtitle_ar', ''),
        'count'       => get_theme_mod('asl_featured_count', 12),
        'autoplay'    => get_theme_mod('asl_featured_autoplay', true),
        'responsive'  => array(
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
        'enabled'     => get_theme_mod('asl_collections_enabled', true),
        'title'       => get_theme_mod('asl_collections_title', 'Our Collections'),
        'titleAr'     => get_theme_mod('asl_collections_title_ar', ''),
        'subtitle'    => get_theme_mod('asl_collections_subtitle', 'Explore our curated collections'),
        'subtitleAr'  => get_theme_mod('asl_collections_subtitle_ar', ''),
        'items'       => $items,
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
        'enabled' => get_theme_mod('asl_banners_enabled', true),
        'items'   => $items,
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
// SECTION 4: REGISTER MENU LOCATIONS
// ============================================================================
add_action('after_setup_theme', 'asl_register_menus');
function asl_register_menus() {
    register_nav_menus(array(
        'primary' => __('Primary Menu', 'asl'),
        'footer'  => __('Footer Menu', 'asl'),
    ));
}

// ============================================================================
// SECTION 5: ADD THEME SUPPORT
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
// SECTION 6: CORS HEADERS FOR REST API
// ============================================================================
add_action('rest_api_init', 'asl_add_cors_headers');
function asl_add_cors_headers() {
    remove_filter('rest_pre_serve_request', 'rest_send_cors_headers');
    add_filter('rest_pre_serve_request', function($value) {
        $origin = get_http_origin();
        $allowed_origins = array(
            'https://aromaticscentslab.com',
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
// SECTION 7: ADMIN NOTICE
// ============================================================================
add_action('admin_notices', 'asl_admin_notice');
function asl_admin_notice() {
    $screen = get_current_screen();
    if ($screen->id !== 'themes') {
        return;
    }
    ?>
    <div class="notice notice-info is-dismissible">
        <p>
            <strong>ASL Frontend Settings:</strong> 
            Configure your site in 
            <a href="<?php echo admin_url('customize.php'); ?>">Appearance &gt; Customize</a> 
            &gt; ASL Frontend Settings
        </p>
    </div>
    <?php
}
