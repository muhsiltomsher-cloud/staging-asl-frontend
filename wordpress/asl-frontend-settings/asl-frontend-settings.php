<?php
/**
 * Plugin Name: ASL Frontend Settings
 * Plugin URI: https://aromaticscentslab.com
 * Description: Admin dashboard and REST API endpoints for ASL Frontend with Media Library upload, dynamic slides, layout options, ASL Bundles Creator, and Free Gift functionality.
 * Version: 5.9.0
 * Author: Aromatic Scents Lab
 * License: GPL v2 or later
 */

if (!defined('ABSPATH')) exit;

// Prevent duplicate loading
if (defined('ASL_FRONTEND_SETTINGS_LOADED')) {
    add_action('admin_notices', function() {
        echo '<div class="notice notice-error"><p><strong>ASL Frontend Settings:</strong> Duplicate plugin detected!</p></div>';
    });
    return;
}
define('ASL_FRONTEND_SETTINGS_LOADED', true);
define('ASL_SETTINGS_VERSION', '5.9.0');
define('ASL_SETTINGS_PATH', plugin_dir_path(__FILE__));

/**
 * Sanitize link URL (allows relative paths starting with /)
 */
function asl_sanitize_link($url) {
    if (empty($url)) return '';
    if (strpos($url, '/') === 0) {
        return sanitize_text_field($url);
    }
    return esc_url_raw($url);
}

/**
 * Enqueue admin scripts and media library
 */
add_action('admin_enqueue_scripts', function($hook) {
    if (strpos($hook, 'asl-settings') === false) return;
    wp_enqueue_media();
    wp_enqueue_script('asl-admin', plugins_url('admin.js', __FILE__), array('jquery'), ASL_SETTINGS_VERSION, true);
});

/**
 * Include separate module files
 * 
 * The plugin is organized into four main modules:
 * 1. ASL Settings - Core settings for homepage, header, SEO, mobile
 * 2. Bundle Builder - Product bundle creation and management
 * 3. Free Gift - Automatic free gift rules based on cart value
 * 4. Forms - Contact form and newsletter REST API endpoints
 */

// Include ASL Settings module (homepage, header, SEO, mobile settings)
require_once ASL_SETTINGS_PATH . 'includes/class-asl-settings.php';

// Include Bundle Builder module (REST API, metabox, CoCart integration)
require_once ASL_SETTINGS_PATH . 'includes/class-asl-bundle-builder.php';

// Include Free Gift module (admin page, REST API, product hiding)
require_once ASL_SETTINGS_PATH . 'includes/class-asl-free-gift.php';

// Include Forms module (contact form and newsletter REST API)
require_once ASL_SETTINGS_PATH . 'includes/class-asl-forms.php';

// Include Frontend URLs module (rewrite admin URLs to headless frontend)
require_once ASL_SETTINGS_PATH . 'includes/class-asl-frontend-urls.php';

// Include Email Templates module (custom WooCommerce email templates)
require_once ASL_SETTINGS_PATH . 'includes/class-asl-email-templates.php';

// Include Security module (XML-RPC blocking, user enumeration prevention, noindex WP frontend, login rate limiting)
require_once ASL_SETTINGS_PATH . 'includes/class-asl-security.php';
