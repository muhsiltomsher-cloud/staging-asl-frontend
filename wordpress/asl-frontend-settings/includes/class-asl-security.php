<?php
/**
 * ASL Security Hardening Module
 * 
 * Hardens the WordPress backend against common attacks:
 * - Blocks XML-RPC (brute force / DDoS vector)
 * - Disables REST API user enumeration
 * - Removes WordPress version fingerprinting
 * - Adds noindex/nofollow to WP frontend (headless CMS should not be indexed)
 * - Disables file editing from admin
 * - Blocks author enumeration via ?author= queries
 * - Adds security headers to WP responses
 * 
 * @package ASL_Frontend_Settings
 * @since 5.10.0
 */

if (!defined('ABSPATH')) exit;

class ASL_Security {

    public function __construct() {
        $this->disable_xmlrpc();
        $this->hide_wp_version();
        $this->block_user_enumeration();
        $this->noindex_wp_frontend();
        $this->disable_file_editing();
        $this->add_security_headers();
        $this->protect_login();
        $this->disable_unnecessary_features();
    }

    /**
     * Disable XML-RPC entirely (major attack vector for brute force and DDoS)
     */
    private function disable_xmlrpc() {
        add_filter('xmlrpc_enabled', '__return_false');

        add_filter('wp_headers', function($headers) {
            unset($headers['X-Pingback']);
            return $headers;
        });

        add_filter('xmlrpc_methods', function() {
            return array();
        });

        add_action('init', function() {
            if (isset($_SERVER['REQUEST_URI']) && strpos($_SERVER['REQUEST_URI'], 'xmlrpc.php') !== false) {
                http_response_code(403);
                exit('Access denied.');
            }
        }, 1);
    }

    /**
     * Remove WordPress version from HTML, RSS, scripts, and styles
     */
    private function hide_wp_version() {
        remove_action('wp_head', 'wp_generator');

        add_filter('the_generator', '__return_empty_string');

        add_filter('style_loader_src', array($this, 'remove_version_query'), 10, 2);
        add_filter('script_loader_src', array($this, 'remove_version_query'), 10, 2);
    }

    public function remove_version_query($src, $handle) {
        if ($src && strpos($src, 'ver=' . get_bloginfo('version')) !== false) {
            $src = remove_query_arg('ver', $src);
        }
        return $src;
    }

    /**
     * Block user enumeration via REST API and ?author= queries
     */
    private function block_user_enumeration() {
        add_filter('rest_endpoints', function($endpoints) {
            if (isset($endpoints['/wp/v2/users'])) {
                unset($endpoints['/wp/v2/users']);
            }
            if (isset($endpoints['/wp/v2/users/(?P<id>[\d]+)'])) {
                unset($endpoints['/wp/v2/users/(?P<id>[\d]+)']);
            }
            return $endpoints;
        });

        add_action('template_redirect', function() {
            if (isset($_GET['author']) && !is_admin()) {
                wp_redirect(home_url(), 301);
                exit;
            }
        });

        add_filter('redirect_canonical', function($redirect_url, $requested_url) {
            if (preg_match('/\?author=(\d+)/i', $requested_url)) {
                return home_url();
            }
            return $redirect_url;
        }, 10, 2);
    }

    /**
     * Add noindex/nofollow to WP frontend since it is used as headless CMS only.
     * The Next.js frontend handles all public-facing SEO.
     */
    private function noindex_wp_frontend() {
        add_action('wp_head', function() {
            if (!is_admin()) {
                echo '<meta name="robots" content="noindex, nofollow, noarchive, nosnippet">' . "\n";
            }
        }, 1);

        add_filter('wp_robots', function($robots) {
            if (!is_admin()) {
                $robots['noindex'] = true;
                $robots['nofollow'] = true;
                $robots['noarchive'] = true;
                $robots['nosnippet'] = true;
            }
            return $robots;
        });

        add_action('send_headers', function() {
            if (!is_admin() && !wp_doing_ajax()) {
                header('X-Robots-Tag: noindex, nofollow, noarchive', true);
            }
        });

        add_filter('wp_sitemaps_enabled', '__return_false');
    }

    /**
     * Disable file editing from WordPress admin panel
     */
    private function disable_file_editing() {
        if (!defined('DISALLOW_FILE_EDIT')) {
            define('DISALLOW_FILE_EDIT', true);
        }
    }

    /**
     * Add security headers to WordPress responses
     */
    private function add_security_headers() {
        add_action('send_headers', function() {
            if (!headers_sent()) {
                header('X-Frame-Options: SAMEORIGIN');
                header('X-Content-Type-Options: nosniff');
                header('X-XSS-Protection: 1; mode=block');
                header('Referrer-Policy: strict-origin-when-cross-origin');
                header('Permissions-Policy: camera=(), microphone=(), geolocation=()');

                if (is_ssl()) {
                    header('Strict-Transport-Security: max-age=63072000; includeSubDomains; preload');
                }
            }
        });
    }

    /**
     * Add login page security (obfuscate errors, noindex login page)
     */
    private function protect_login() {
        add_filter('login_errors', function() {
            return 'Invalid credentials. Please try again.';
        });

        add_action('login_head', function() {
            echo '<meta name="robots" content="noindex, nofollow">' . "\n";
        });
    }

    /**
     * Disable unnecessary WordPress features that expand attack surface
     */
    private function disable_unnecessary_features() {
        remove_action('wp_head', 'rsd_link');
        remove_action('wp_head', 'wlwmanifest_link');
        remove_action('wp_head', 'wp_shortlink_wp_head');
        remove_action('wp_head', 'rest_output_link_wp_head');
        remove_action('wp_head', 'wp_oembed_add_discovery_links');
        remove_action('wp_head', 'wp_oembed_add_host_js');
        remove_action('wp_head', 'feed_links', 2);
        remove_action('wp_head', 'feed_links_extra', 3);

        add_filter('emoji_svg_url', '__return_false');
        remove_action('wp_head', 'print_emoji_detection_script', 7);
        remove_action('wp_print_styles', 'print_emoji_styles');
        remove_action('admin_print_scripts', 'print_emoji_detection_script');
        remove_action('admin_print_styles', 'print_emoji_styles');
    }
}

new ASL_Security();
