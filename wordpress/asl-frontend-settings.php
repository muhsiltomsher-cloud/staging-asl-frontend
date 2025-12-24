<?php
/**
 * Plugin Name: ASL Frontend Settings
 * Plugin URI: https://aromaticscentslab.com
 * Description: Adds Customizer settings and REST API endpoints for ASL Frontend. Works with block themes like Twenty Twenty-Five.
 * Version: 1.0.0
 * Author: Aromatic Scents Lab
 * License: GPL v2 or later
 * 
 * INSTALLATION:
 * 1. Upload this file to: wp-content/mu-plugins/asl-frontend-settings.php
 *    (Create the mu-plugins folder if it doesn't exist)
 * OR
 * 2. Upload to: wp-content/plugins/asl-frontend-settings.php
 *    Then activate from Plugins menu
 */

if (!defined('ABSPATH')) {
    exit;
}

/**
 * ============================================================================
 * SECTION 1: ADD CUSTOMIZE MENU ITEM FOR BLOCK THEMES
 * ============================================================================
 * Block themes (like Twenty Twenty-Five) hide the Customize menu item.
 * This adds it back so you can access Appearance > Customize.
 */
add_action('admin_menu', 'asl_add_customize_menu');
function asl_add_customize_menu() {
    // Add Customize link under Appearance menu
    add_theme_page(
        __('Customize', 'asl'),
        __('Customize', 'asl'),
        'edit_theme_options',
        'customize.php'
    );
}

/**
 * ============================================================================
 * SECTION 2: REGISTER CUSTOMIZER SETTINGS
 * ============================================================================
 * All ASL Frontend settings are added to Appearance > Customize
 */
add_action('customize_register', 'asl_customize_register');
function asl_customize_register($wp_customize) {
    
    // ========================================================================
    // PANEL: ASL Frontend Settings
    // ========================================================================
    $wp_customize->add_panel('asl_settings', array(
        'title'       => __('ASL Frontend Settings', 'asl'),
        'description' => __('Configure home page sections and site settings for ASL Frontend.', 'asl'),
        'priority'    => 25,
    ));

    // ========================================================================
    // SECTION: Hero Slider
    // ========================================================================
    $wp_customize->add_section('asl_hero_slider', array(
        'title'    => __('Hero Slider', 'asl'),
        'panel'    => 'asl_settings',
        'priority' => 10,
    ));

    // Hero Slider - Enable
    $wp_customize->add_setting('asl_hero_enabled', array(
        'default'           => true,
        'sanitize_callback' => 'asl_sanitize_checkbox',
        'transport'         => 'refresh',
    ));
    $wp_customize->add_control('asl_hero_enabled', array(
        'label'   => __('Enable Hero Slider', 'asl'),
        'section' => 'asl_hero_slider',
        'type'    => 'checkbox',
    ));

    // Hero Slider - Autoplay
    $wp_customize->add_setting('asl_hero_autoplay', array(
        'default'           => true,
        'sanitize_callback' => 'asl_sanitize_checkbox',
    ));
    $wp_customize->add_control('asl_hero_autoplay', array(
        'label'   => __('Enable Autoplay', 'asl'),
        'section' => 'asl_hero_slider',
        'type'    => 'checkbox',
    ));

    // Hero Slider - Autoplay Delay
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

    // Hero Slider - Loop
    $wp_customize->add_setting('asl_hero_loop', array(
        'default'           => true,
        'sanitize_callback' => 'asl_sanitize_checkbox',
    ));
    $wp_customize->add_control('asl_hero_loop', array(
        'label'   => __('Enable Loop', 'asl'),
        'section' => 'asl_hero_slider',
        'type'    => 'checkbox',
    ));

    // Hero Slides (5 slots)
    for ($i = 1; $i <= 5; $i++) {
        // Desktop Image
        $wp_customize->add_setting("asl_hero_slide_{$i}_image", array(
            'default'           => '',
            'sanitize_callback' => 'esc_url_raw',
        ));
        $wp_customize->add_control(new WP_Customize_Image_Control($wp_customize, "asl_hero_slide_{$i}_image", array(
            'label'   => sprintf(__('Slide %d - Desktop Image', 'asl'), $i),
            'section' => 'asl_hero_slider',
        )));

        // Mobile Image
        $wp_customize->add_setting("asl_hero_slide_{$i}_mobile", array(
            'default'           => '',
            'sanitize_callback' => 'esc_url_raw',
        ));
        $wp_customize->add_control(new WP_Customize_Image_Control($wp_customize, "asl_hero_slide_{$i}_mobile", array(
            'label'   => sprintf(__('Slide %d - Mobile Image', 'asl'), $i),
            'section' => 'asl_hero_slider',
        )));

        // Link URL
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
        'title'    => __('New Products Section', 'asl'),
        'panel'    => 'asl_settings',
        'priority' => 20,
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
        'label'   => __('Section Title', 'asl'),
        'section' => 'asl_new_products',
        'type'    => 'text',
    ));

    $wp_customize->add_setting('asl_new_products_subtitle', array(
        'default'           => 'Discover our latest products',
        'sanitize_callback' => 'sanitize_text_field',
    ));
    $wp_customize->add_control('asl_new_products_subtitle', array(
        'label'   => __('Section Subtitle', 'asl'),
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
        'input_attrs' => array('min' => 4, 'max' => 20, 'step' => 1),
    ));

    // ========================================================================
    // SECTION: Bestseller Products
    // ========================================================================
    $wp_customize->add_section('asl_bestseller', array(
        'title'    => __('Bestseller Products Section', 'asl'),
        'panel'    => 'asl_settings',
        'priority' => 30,
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
        'label'   => __('Section Title', 'asl'),
        'section' => 'asl_bestseller',
        'type'    => 'text',
    ));

    $wp_customize->add_setting('asl_bestseller_subtitle', array(
        'default'           => 'Our most popular products',
        'sanitize_callback' => 'sanitize_text_field',
    ));
    $wp_customize->add_control('asl_bestseller_subtitle', array(
        'label'   => __('Section Subtitle', 'asl'),
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
        'input_attrs' => array('min' => 4, 'max' => 20, 'step' => 1),
    ));

    // ========================================================================
    // SECTION: Shop by Category
    // ========================================================================
    $wp_customize->add_section('asl_categories', array(
        'title'    => __('Shop by Category Section', 'asl'),
        'panel'    => 'asl_settings',
        'priority' => 40,
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
        'label'   => __('Section Title', 'asl'),
        'section' => 'asl_categories',
        'type'    => 'text',
    ));

    $wp_customize->add_setting('asl_categories_subtitle', array(
        'default'           => 'Browse our collections',
        'sanitize_callback' => 'sanitize_text_field',
    ));
    $wp_customize->add_control('asl_categories_subtitle', array(
        'label'   => __('Section Subtitle', 'asl'),
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

    // ========================================================================
    // SECTION: Featured Products Slider
    // ========================================================================
    $wp_customize->add_section('asl_featured', array(
        'title'    => __('Featured Products Slider', 'asl'),
        'panel'    => 'asl_settings',
        'priority' => 50,
    ));

    $wp_customize->add_setting('asl_featured_enabled', array(
        'default'           => true,
        'sanitize_callback' => 'asl_sanitize_checkbox',
    ));
    $wp_customize->add_control('asl_featured_enabled', array(
        'label'   => __('Enable Featured Products Slider', 'asl'),
        'section' => 'asl_featured',
        'type'    => 'checkbox',
    ));

    $wp_customize->add_setting('asl_featured_title', array(
        'default'           => 'Featured Products',
        'sanitize_callback' => 'sanitize_text_field',
    ));
    $wp_customize->add_control('asl_featured_title', array(
        'label'   => __('Section Title', 'asl'),
        'section' => 'asl_featured',
        'type'    => 'text',
    ));

    $wp_customize->add_setting('asl_featured_subtitle', array(
        'default'           => 'Handpicked for you',
        'sanitize_callback' => 'sanitize_text_field',
    ));
    $wp_customize->add_control('asl_featured_subtitle', array(
        'label'   => __('Section Subtitle', 'asl'),
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

    // ========================================================================
    // SECTION: Collections
    // ========================================================================
    $wp_customize->add_section('asl_collections', array(
        'title'    => __('Collections Section', 'asl'),
        'panel'    => 'asl_settings',
        'priority' => 60,
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
        'label'   => __('Section Title', 'asl'),
        'section' => 'asl_collections',
        'type'    => 'text',
    ));

    $wp_customize->add_setting('asl_collections_subtitle', array(
        'default'           => 'Explore our curated collections',
        'sanitize_callback' => 'sanitize_text_field',
    ));
    $wp_customize->add_control('asl_collections_subtitle', array(
        'label'   => __('Section Subtitle', 'asl'),
        'section' => 'asl_collections',
        'type'    => 'text',
    ));

    // Collections Items (6 slots)
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
            'label'   => sprintf(__('Collection %d - Title', 'asl'), $i),
            'section' => 'asl_collections',
            'type'    => 'text',
        ));

        $wp_customize->add_setting("asl_collection_{$i}_description", array(
            'default'           => '',
            'sanitize_callback' => 'sanitize_textarea_field',
        ));
        $wp_customize->add_control("asl_collection_{$i}_description", array(
            'label'   => sprintf(__('Collection %d - Description', 'asl'), $i),
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
        'title'    => __('Banners Section', 'asl'),
        'panel'    => 'asl_settings',
        'priority' => 70,
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

    // Banner Items (4 slots)
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
            'label'   => sprintf(__('Banner %d - Title', 'asl'), $i),
            'section' => 'asl_banners',
            'type'    => 'text',
        ));

        $wp_customize->add_setting("asl_banner_{$i}_subtitle", array(
            'default'           => '',
            'sanitize_callback' => 'sanitize_text_field',
        ));
        $wp_customize->add_control("asl_banner_{$i}_subtitle", array(
            'label'   => sprintf(__('Banner %d - Subtitle', 'asl'), $i),
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

/**
 * Sanitize checkbox values
 */
function asl_sanitize_checkbox($checked) {
    return ((isset($checked) && true == $checked) ? true : false);
}

/**
 * ============================================================================
 * SECTION 3: REST API ENDPOINTS
 * ============================================================================
 * Exposes all Customizer settings via REST API for the frontend
 */
add_action('rest_api_init', 'asl_register_rest_routes');
function asl_register_rest_routes() {
    // Main customizer settings endpoint
    register_rest_route('asl/v1', '/customizer', array(
        'methods'             => 'GET',
        'callback'            => 'asl_get_customizer_settings',
        'permission_callback' => '__return_true',
    ));

    // Home page settings endpoint
    register_rest_route('asl/v1', '/home-settings', array(
        'methods'             => 'GET',
        'callback'            => 'asl_get_home_settings',
        'permission_callback' => '__return_true',
    ));

    // Site settings endpoint
    register_rest_route('asl/v1', '/site-settings', array(
        'methods'             => 'GET',
        'callback'            => 'asl_get_site_settings',
        'permission_callback' => '__return_true',
    ));

    // Menu endpoint
    register_rest_route('asl/v1', '/menu/(?P<location>[a-zA-Z0-9_-]+)', array(
        'methods'             => 'GET',
        'callback'            => 'asl_get_menu',
        'permission_callback' => '__return_true',
    ));
}

/**
 * Get all customizer settings
 */
function asl_get_customizer_settings() {
    return array(
        'site'        => asl_get_site_settings(),
        'hero'        => asl_get_hero_settings(),
        'newProducts' => asl_get_new_products_settings(),
        'bestseller'  => asl_get_bestseller_settings(),
        'categories'  => asl_get_categories_settings(),
        'featured'    => asl_get_featured_settings(),
        'collections' => asl_get_collections_settings(),
        'banners'     => asl_get_banners_settings(),
    );
}

/**
 * Get home page settings (all sections)
 */
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

/**
 * Get site settings
 */
function asl_get_site_settings() {
    $custom_logo_id = get_theme_mod('custom_logo');
    $logo_url = $custom_logo_id ? wp_get_attachment_image_url($custom_logo_id, 'full') : '';
    
    $site_icon_id = get_option('site_icon');
    $favicon_url = $site_icon_id ? wp_get_attachment_image_url($site_icon_id, 'full') : '';

    return array(
        'name'        => get_bloginfo('name'),
        'description' => get_bloginfo('description'),
        'url'         => get_bloginfo('url'),
        'logo'        => array(
            'id'  => $custom_logo_id,
            'url' => $logo_url,
        ),
        'favicon'     => array(
            'id'  => $site_icon_id,
            'url' => $favicon_url,
        ),
    );
}

/**
 * Get hero slider settings
 */
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

/**
 * Get new products section settings
 */
function asl_get_new_products_settings() {
    return array(
        'enabled'  => get_theme_mod('asl_new_products_enabled', true),
        'title'    => get_theme_mod('asl_new_products_title', 'New Arrivals'),
        'subtitle' => get_theme_mod('asl_new_products_subtitle', 'Discover our latest products'),
        'count'    => get_theme_mod('asl_new_products_count', 8),
    );
}

/**
 * Get bestseller section settings
 */
function asl_get_bestseller_settings() {
    return array(
        'enabled'  => get_theme_mod('asl_bestseller_enabled', true),
        'title'    => get_theme_mod('asl_bestseller_title', 'Bestsellers'),
        'subtitle' => get_theme_mod('asl_bestseller_subtitle', 'Our most popular products'),
        'count'    => get_theme_mod('asl_bestseller_count', 8),
    );
}

/**
 * Get categories section settings
 */
function asl_get_categories_settings() {
    return array(
        'enabled'  => get_theme_mod('asl_categories_enabled', true),
        'title'    => get_theme_mod('asl_categories_title', 'Shop by Category'),
        'subtitle' => get_theme_mod('asl_categories_subtitle', 'Browse our collections'),
        'count'    => get_theme_mod('asl_categories_count', 6),
    );
}

/**
 * Get featured products section settings
 */
function asl_get_featured_settings() {
    return array(
        'enabled'  => get_theme_mod('asl_featured_enabled', true),
        'title'    => get_theme_mod('asl_featured_title', 'Featured Products'),
        'subtitle' => get_theme_mod('asl_featured_subtitle', 'Handpicked for you'),
        'count'    => get_theme_mod('asl_featured_count', 12),
        'autoplay' => get_theme_mod('asl_featured_autoplay', true),
    );
}

/**
 * Get collections section settings
 */
function asl_get_collections_settings() {
    $items = array();
    
    for ($i = 1; $i <= 6; $i++) {
        $image = get_theme_mod("asl_collection_{$i}_image", '');
        $title = get_theme_mod("asl_collection_{$i}_title", '');
        
        if (!empty($image) || !empty($title)) {
            $items[] = array(
                'image'       => $image,
                'title'       => $title,
                'description' => get_theme_mod("asl_collection_{$i}_description", ''),
                'link'        => get_theme_mod("asl_collection_{$i}_link", ''),
            );
        }
    }

    return array(
        'enabled'  => get_theme_mod('asl_collections_enabled', true),
        'title'    => get_theme_mod('asl_collections_title', 'Our Collections'),
        'subtitle' => get_theme_mod('asl_collections_subtitle', 'Explore our curated collections'),
        'items'    => $items,
    );
}

/**
 * Get banners section settings
 */
function asl_get_banners_settings() {
    $items = array();
    
    for ($i = 1; $i <= 4; $i++) {
        $image = get_theme_mod("asl_banner_{$i}_image", '');
        
        if (!empty($image)) {
            $items[] = array(
                'image'       => $image,
                'mobileImage' => get_theme_mod("asl_banner_{$i}_mobile", $image),
                'title'       => get_theme_mod("asl_banner_{$i}_title", ''),
                'subtitle'    => get_theme_mod("asl_banner_{$i}_subtitle", ''),
                'link'        => get_theme_mod("asl_banner_{$i}_link", ''),
            );
        }
    }

    return array(
        'enabled' => get_theme_mod('asl_banners_enabled', true),
        'items'   => $items,
    );
}

/**
 * Get menu by location
 */
function asl_get_menu($request) {
    $location = $request['location'];
    $locations = get_nav_menu_locations();
    
    if (!isset($locations[$location])) {
        // Try to find menu by slug
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

/**
 * ============================================================================
 * SECTION 4: REGISTER MENU LOCATIONS
 * ============================================================================
 */
add_action('after_setup_theme', 'asl_register_menus');
function asl_register_menus() {
    register_nav_menus(array(
        'primary' => __('Primary Menu', 'asl'),
        'footer'  => __('Footer Menu', 'asl'),
    ));
}

/**
 * ============================================================================
 * SECTION 5: ADD THEME SUPPORT
 * ============================================================================
 */
add_action('after_setup_theme', 'asl_theme_support');
function asl_theme_support() {
    // Enable custom logo support
    add_theme_support('custom-logo', array(
        'height'      => 100,
        'width'       => 400,
        'flex-height' => true,
        'flex-width'  => true,
    ));
}

/**
 * ============================================================================
 * SECTION 6: CORS HEADERS FOR REST API
 * ============================================================================
 * Allows the frontend to access the REST API from a different domain
 */
add_action('rest_api_init', 'asl_add_cors_headers');
function asl_add_cors_headers() {
    remove_filter('rest_pre_serve_request', 'rest_send_cors_headers');
    add_filter('rest_pre_serve_request', function($value) {
        $origin = get_http_origin();
        
        // Allow requests from the frontend domain
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

/**
 * ============================================================================
 * SECTION 7: ADMIN NOTICE
 * ============================================================================
 * Shows a helpful notice in the admin area
 */
add_action('admin_notices', 'asl_admin_notice');
function asl_admin_notice() {
    $screen = get_current_screen();
    
    // Only show on themes page
    if ($screen->id !== 'themes') {
        return;
    }
    
    ?>
    <div class="notice notice-info is-dismissible">
        <p>
            <strong>ASL Frontend Settings:</strong> 
            Configure your home page sections in 
            <a href="<?php echo admin_url('customize.php'); ?>">Appearance &gt; Customize</a> 
            &gt; ASL Frontend Settings
        </p>
    </div>
    <?php
}
