<?php
/**
 * ASL Influencer Tracking - Influencer/Referral Tracking Functionality
 * 
 * Handles admin page, REST API endpoints for visit tracking and stats,
 * and influencer management for the ASL Influencer Tracking feature.
 * 
 * @package ASL_Frontend_Settings
 * @since 5.10.0
 */

if (!defined('ABSPATH')) exit;

/**
 * Initialize ASL Influencer Tracking
 */
function asl_influencer_tracking_init() {
    add_action('admin_menu', 'asl_influencer_register_menu', 99);
    add_action('admin_enqueue_scripts', 'asl_influencer_enqueue_scripts');
    add_action('rest_api_init', 'asl_influencer_register_rest_routes');
}

/**
 * Register admin menu
 */
function asl_influencer_register_menu() {
    add_submenu_page(
        'woocommerce',
        'Influencer Tracking',
        'Influencer Tracking',
        'manage_woocommerce',
        'asl-influencer-tracking',
        'asl_influencer_render_admin_page'
    );
}

/**
 * Enqueue admin scripts
 */
function asl_influencer_enqueue_scripts($hook) {
    if ($hook !== 'woocommerce_page_asl-influencer-tracking') return;
    wp_enqueue_script('jquery');
    wp_enqueue_style('woocommerce_admin_styles');
}

/**
 * Render Influencer Tracking admin page
 */
function asl_influencer_render_admin_page() {
    if (!current_user_can('manage_woocommerce')) {
        wp_die('You do not have sufficient permissions to access this page.');
    }

    if (isset($_POST['asl_influencer_save']) && check_admin_referer('asl_influencer_nonce')) {
        asl_influencer_save_settings();
        echo '<div class="notice notice-success is-dismissible"><p>Influencer settings saved successfully!</p></div>';
    }

    if (isset($_GET['action']) && $_GET['action'] === 'delete' && isset($_GET['influencer_id'])) {
        if (check_admin_referer('asl_delete_influencer_' . $_GET['influencer_id'])) {
            asl_influencer_delete(sanitize_text_field($_GET['influencer_id']));
            echo '<div class="notice notice-success is-dismissible"><p>Influencer deleted successfully!</p></div>';
        }
    }

    $tab = isset($_GET['tab']) ? sanitize_text_field($_GET['tab']) : 'influencers';
    $influencers = get_option('asl_influencers', array());

    ?>
    <div class="wrap">
        <h1>Influencer Tracking</h1>
        <p>Manage influencer referral codes and track visits, orders, and revenue from each influencer campaign.</p>

        <nav class="nav-tab-wrapper">
            <a href="?page=asl-influencer-tracking&tab=influencers" class="nav-tab <?php echo $tab === 'influencers' ? 'nav-tab-active' : ''; ?>">Influencers</a>
            <a href="?page=asl-influencer-tracking&tab=stats" class="nav-tab <?php echo $tab === 'stats' ? 'nav-tab-active' : ''; ?>">Stats & Reports</a>
        </nav>

        <div class="tab-content" style="background:#fff;padding:20px;border:1px solid #ccd0d4;border-top:none;">
        <?php
        if ($tab === 'stats') {
            asl_influencer_render_stats_tab();
        } else {
            asl_influencer_render_influencers_tab($influencers);
        }
        ?>
        </div>
    </div>
    <?php
}

/**
 * Render Influencers management tab
 */
function asl_influencer_render_influencers_tab($influencers) {
    $site_url = get_option('asl_frontend_url', home_url());
    ?>
    <form method="post" id="asl-influencer-form">
        <?php wp_nonce_field('asl_influencer_nonce'); ?>

        <h2>Influencers <button type="button" class="button" id="asl-add-influencer">+ Add Influencer</button></h2>
        <p class="description">Each influencer gets a unique referral code. Their tracking URL will be: <code><?php echo esc_html($site_url); ?>/?ref=CODE</code></p>

        <div id="asl-influencers-list">
            <?php if (empty($influencers)): ?>
                <?php asl_influencer_render_row(0, array()); ?>
            <?php else: ?>
                <?php foreach ($influencers as $index => $influencer): ?>
                    <?php asl_influencer_render_row($index, $influencer); ?>
                <?php endforeach; ?>
            <?php endif; ?>
        </div>

        <p class="submit">
            <input type="submit" name="asl_influencer_save" class="button button-primary" value="Save All Influencers">
        </p>
    </form>

    <script>
    jQuery(document).ready(function($) {
        var influencerIndex = <?php echo max(0, count($influencers) - 1); ?>;

        $('#asl-add-influencer').on('click', function() {
            influencerIndex++;
            var template = `
            <div class="asl-influencer-row" style="background:#f9f9f9;border:1px solid #ddd;padding:20px;margin-bottom:15px;">
                <h3>Influencer #${influencerIndex + 1} <button type="button" class="button asl-remove-influencer" style="float:right;color:#a00;">Remove</button></h3>
                <table class="form-table">
                    <tr>
                        <th>Status</th>
                        <td><label><input type="checkbox" name="asl_influencers[${influencerIndex}][active]" value="1" checked> Active</label></td>
                    </tr>
                    <tr>
                        <th>Name</th>
                        <td><input type="text" name="asl_influencers[${influencerIndex}][name]" class="regular-text" placeholder="e.g., Ahmed"></td>
                    </tr>
                    <tr>
                        <th>Referral Code</th>
                        <td>
                            <input type="text" name="asl_influencers[${influencerIndex}][code]" class="regular-text" placeholder="e.g., ahmed" pattern="[a-z0-9_-]+" title="Lowercase letters, numbers, hyphens and underscores only">
                            <p class="description">Lowercase, no spaces. This will be used in the URL: ?ref=code</p>
                        </td>
                    </tr>
                    <tr>
                        <th>Platform</th>
                        <td>
                            <select name="asl_influencers[${influencerIndex}][platform]">
                                <option value="instagram">Instagram</option>
                                <option value="tiktok">TikTok</option>
                                <option value="youtube">YouTube</option>
                                <option value="snapchat">Snapchat</option>
                                <option value="facebook">Facebook</option>
                                <option value="twitter">Twitter/X</option>
                                <option value="other">Other</option>
                            </select>
                        </td>
                    </tr>
                    <tr>
                        <th>Notes</th>
                        <td><textarea name="asl_influencers[${influencerIndex}][notes]" class="large-text" rows="2" placeholder="Optional notes about this influencer"></textarea></td>
                    </tr>
                </table>
            </div>`;
            $('#asl-influencers-list').append(template);
        });

        $(document).on('click', '.asl-remove-influencer', function() {
            if (confirm('Are you sure you want to remove this influencer?')) {
                $(this).closest('.asl-influencer-row').remove();
            }
        });
    });
    </script>
    <?php
}

/**
 * Render a single influencer row
 */
function asl_influencer_render_row($index, $influencer) {
    $active = isset($influencer['active']) ? $influencer['active'] : true;
    $name = isset($influencer['name']) ? $influencer['name'] : '';
    $code = isset($influencer['code']) ? $influencer['code'] : '';
    $platform = isset($influencer['platform']) ? $influencer['platform'] : 'instagram';
    $notes = isset($influencer['notes']) ? $influencer['notes'] : '';
    $platforms = array('instagram' => 'Instagram', 'tiktok' => 'TikTok', 'youtube' => 'YouTube', 'snapchat' => 'Snapchat', 'facebook' => 'Facebook', 'twitter' => 'Twitter/X', 'other' => 'Other');
    ?>
    <div class="asl-influencer-row" style="background:#f9f9f9;border:1px solid #ddd;padding:20px;margin-bottom:15px;">
        <h3>Influencer #<?php echo $index + 1; ?> <button type="button" class="button asl-remove-influencer" style="float:right;color:#a00;">Remove</button></h3>
        <table class="form-table">
            <tr>
                <th>Status</th>
                <td><label><input type="checkbox" name="asl_influencers[<?php echo $index; ?>][active]" value="1" <?php checked($active); ?>> Active</label></td>
            </tr>
            <tr>
                <th>Name</th>
                <td><input type="text" name="asl_influencers[<?php echo $index; ?>][name]" value="<?php echo esc_attr($name); ?>" class="regular-text" placeholder="e.g., Ahmed"></td>
            </tr>
            <tr>
                <th>Referral Code</th>
                <td>
                    <input type="text" name="asl_influencers[<?php echo $index; ?>][code]" value="<?php echo esc_attr($code); ?>" class="regular-text" placeholder="e.g., ahmed" pattern="[a-z0-9_-]+" title="Lowercase letters, numbers, hyphens and underscores only">
                    <p class="description">Lowercase, no spaces. This will be used in the URL: ?ref=<?php echo esc_html($code ?: 'code'); ?></p>
                </td>
            </tr>
            <tr>
                <th>Platform</th>
                <td>
                    <select name="asl_influencers[<?php echo $index; ?>][platform]">
                        <?php foreach ($platforms as $value => $label): ?>
                        <option value="<?php echo esc_attr($value); ?>" <?php selected($platform, $value); ?>><?php echo esc_html($label); ?></option>
                        <?php endforeach; ?>
                    </select>
                </td>
            </tr>
            <tr>
                <th>Notes</th>
                <td><textarea name="asl_influencers[<?php echo $index; ?>][notes]" class="large-text" rows="2" placeholder="Optional notes about this influencer"><?php echo esc_textarea($notes); ?></textarea></td>
            </tr>
        </table>
    </div>
    <?php
}

/**
 * Render Stats tab
 */
function asl_influencer_render_stats_tab() {
    $influencers = get_option('asl_influencers', array());
    $visits = get_option('asl_influencer_visits', array());

    if (empty($influencers)) {
        echo '<p>No influencers configured yet. Add influencers in the Influencers tab first.</p>';
        return;
    }

    ?>
    <h2>Influencer Performance</h2>
    <p class="description">Order data is fetched from WooCommerce orders with <code>_influencer_ref</code> meta data. Visit counts are tracked from the frontend.</p>

    <table class="wp-list-table widefat fixed striped" style="margin-top:15px;">
        <thead>
            <tr>
                <th>Influencer</th>
                <th>Code</th>
                <th>Platform</th>
                <th>Status</th>
                <th>Total Visits</th>
                <th>Tracking URL</th>
            </tr>
        </thead>
        <tbody>
            <?php foreach ($influencers as $influencer):
                $code = $influencer['code'];
                $visit_count = isset($visits[$code]) ? count($visits[$code]) : 0;
                $site_url = get_option('asl_frontend_url', home_url());
                $tracking_url = $site_url . '/?ref=' . $code;
            ?>
            <tr>
                <td><strong><?php echo esc_html($influencer['name']); ?></strong></td>
                <td><code><?php echo esc_html($code); ?></code></td>
                <td><?php echo esc_html(ucfirst($influencer['platform'])); ?></td>
                <td><?php echo !empty($influencer['active']) ? '<span style="color:green;">Active</span>' : '<span style="color:#999;">Inactive</span>'; ?></td>
                <td><?php echo intval($visit_count); ?></td>
                <td><input type="text" value="<?php echo esc_attr($tracking_url); ?>" class="regular-text" readonly onclick="this.select();" style="cursor:pointer;"></td>
            </tr>
            <?php endforeach; ?>
        </tbody>
    </table>

    <p style="margin-top:15px;"><em>For detailed order/revenue reports per influencer, use the Stats API endpoint or check individual orders in WooCommerce &rarr; Orders (look for the <code>_influencer_ref</code> meta field).</em></p>
    <?php
}

/**
 * Save influencer settings
 */
function asl_influencer_save_settings() {
    $influencers = array();

    if (isset($_POST['asl_influencers']) && is_array($_POST['asl_influencers'])) {
        foreach ($_POST['asl_influencers'] as $influencer) {
            $code = sanitize_text_field($influencer['code'] ?? '');
            if (empty($code)) continue;

            $code = strtolower(preg_replace('/[^a-z0-9_-]/', '', $code));
            if (empty($code)) continue;

            $influencers[] = array(
                'id' => isset($influencer['id']) ? sanitize_text_field($influencer['id']) : wp_generate_uuid4(),
                'active' => isset($influencer['active']) ? true : false,
                'name' => sanitize_text_field($influencer['name'] ?? ''),
                'code' => $code,
                'platform' => sanitize_text_field($influencer['platform'] ?? 'instagram'),
                'notes' => sanitize_textarea_field($influencer['notes'] ?? ''),
                'created_at' => isset($influencer['created_at']) ? $influencer['created_at'] : current_time('mysql'),
            );
        }
    }

    update_option('asl_influencers', $influencers);
}

/**
 * Delete a single influencer
 */
function asl_influencer_delete($influencer_id) {
    $influencers = get_option('asl_influencers', array());
    $influencers = array_filter($influencers, function($inf) use ($influencer_id) {
        return $inf['id'] !== $influencer_id;
    });
    update_option('asl_influencers', array_values($influencers));
}

/**
 * Register REST API routes
 */
function asl_influencer_register_rest_routes() {
    register_rest_route('asl-influencer/v1', '/influencers', array(
        'methods' => 'GET',
        'callback' => 'asl_influencer_api_get_influencers',
        'permission_callback' => '__return_true',
    ));

    register_rest_route('asl-influencer/v1', '/track-visit', array(
        'methods' => 'POST',
        'callback' => 'asl_influencer_api_track_visit',
        'permission_callback' => '__return_true',
    ));

    register_rest_route('asl-influencer/v1', '/stats', array(
        'methods' => 'GET',
        'callback' => 'asl_influencer_api_get_stats',
        'permission_callback' => function() {
            return current_user_can('manage_woocommerce');
        },
    ));
}

/**
 * API: Get active influencers (public)
 */
function asl_influencer_api_get_influencers() {
    $influencers = get_option('asl_influencers', array());

    $active = array_filter($influencers, function($inf) {
        return !empty($inf['active']);
    });

    $result = array_map(function($inf) {
        return array(
            'code' => $inf['code'],
            'name' => $inf['name'],
            'platform' => $inf['platform'],
        );
    }, $active);

    return rest_ensure_response(array(
        'success' => true,
        'influencers' => array_values($result),
    ));
}

/**
 * API: Track a visit (public)
 */
function asl_influencer_api_track_visit($request) {
    $code = sanitize_text_field($request->get_param('code'));
    $landing_page = sanitize_text_field($request->get_param('landing_page'));

    if (empty($code)) {
        return new WP_Error('missing_code', 'Referral code is required.', array('status' => 400));
    }

    $code = strtolower($code);
    $visits = get_option('asl_influencer_visits', array());

    if (!isset($visits[$code])) {
        $visits[$code] = array();
    }

    $visits[$code][] = array(
        'timestamp' => current_time('mysql'),
        'landing_page' => $landing_page,
        'ip' => asl_influencer_get_client_ip(),
        'user_agent' => isset($_SERVER['HTTP_USER_AGENT']) ? sanitize_text_field($_SERVER['HTTP_USER_AGENT']) : '',
    );

    update_option('asl_influencer_visits', $visits);

    return rest_ensure_response(array(
        'success' => true,
    ));
}

/**
 * API: Get stats (admin only)
 */
function asl_influencer_api_get_stats($request) {
    $influencers = get_option('asl_influencers', array());
    $visits = get_option('asl_influencer_visits', array());
    $date_from = $request->get_param('date_from');
    $date_to = $request->get_param('date_to');

    $stats = array();

    foreach ($influencers as $influencer) {
        $code = $influencer['code'];
        $visit_list = isset($visits[$code]) ? $visits[$code] : array();
        $visit_count = count($visit_list);

        $orders = asl_influencer_get_orders_by_ref($code, $date_from, $date_to);

        $total_revenue = 0;
        $order_count = count($orders);
        $cities = array();
        $countries = array();
        $free_gift_count = 0;

        foreach ($orders as $order) {
            $total_revenue += floatval($order->get_total());

            $shipping_city = $order->get_shipping_city();
            $shipping_country = $order->get_shipping_country();
            $billing_city = $order->get_billing_city();
            $billing_country = $order->get_billing_country();

            $city = !empty($shipping_city) ? $shipping_city : $billing_city;
            $country = !empty($shipping_country) ? $shipping_country : $billing_country;

            if (!empty($city)) {
                $cities[$city] = isset($cities[$city]) ? $cities[$city] + 1 : 1;
            }
            if (!empty($country)) {
                $countries[$country] = isset($countries[$country]) ? $countries[$country] + 1 : 1;
            }

            foreach ($order->get_items() as $item) {
                $product = $item->get_product();
                if ($product && floatval($product->get_price()) == 0) {
                    $free_gift_count++;
                }
            }
        }

        arsort($cities);
        arsort($countries);

        $stats[] = array(
            'name' => $influencer['name'],
            'code' => $code,
            'platform' => $influencer['platform'],
            'active' => !empty($influencer['active']),
            'visits' => $visit_count,
            'orders' => $order_count,
            'revenue' => round($total_revenue, 2),
            'free_gifts' => $free_gift_count,
            'top_cities' => array_slice($cities, 0, 5, true),
            'top_countries' => array_slice($countries, 0, 5, true),
        );
    }

    return rest_ensure_response(array(
        'success' => true,
        'stats' => $stats,
    ));
}

/**
 * Get orders by influencer referral code
 */
function asl_influencer_get_orders_by_ref($code, $date_from = null, $date_to = null) {
    $args = array(
        'limit' => -1,
        'status' => array('wc-completed', 'wc-processing', 'wc-on-hold'),
        'meta_key' => '_influencer_ref',
        'meta_value' => $code,
    );

    if ($date_from) {
        $args['date_created'] = '>=' . $date_from;
    }
    if ($date_to) {
        if (isset($args['date_created'])) {
            $args['date_created'] .= '...' . $date_to;
        } else {
            $args['date_created'] = '<=' . $date_to;
        }
    }

    return wc_get_orders($args);
}

/**
 * Get client IP address
 */
function asl_influencer_get_client_ip() {
    $headers = array('HTTP_CF_CONNECTING_IP', 'HTTP_X_FORWARDED_FOR', 'HTTP_X_REAL_IP', 'REMOTE_ADDR');
    foreach ($headers as $header) {
        if (!empty($_SERVER[$header])) {
            $ip = $_SERVER[$header];
            if (strpos($ip, ',') !== false) {
                $ip = trim(explode(',', $ip)[0]);
            }
            if (filter_var($ip, FILTER_VALIDATE_IP)) {
                return $ip;
            }
        }
    }
    return '0.0.0.0';
}

asl_influencer_tracking_init();
