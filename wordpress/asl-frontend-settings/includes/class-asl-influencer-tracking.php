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

    $site_url = get_option('asl_frontend_url', home_url());
    $wc_currency = get_woocommerce_currency();
    $currency_symbol = get_woocommerce_currency_symbol($wc_currency);

    $grand_total_visits = 0;
    $grand_total_orders = 0;
    $grand_total_revenue = 0;
    $grand_total_gifts = 0;

    $influencer_stats = array();
    foreach ($influencers as $influencer) {
        $code = $influencer['code'];
        $visit_list = isset($visits[$code]) ? $visits[$code] : array();
        $visit_count = count($visit_list);

        $orders = asl_influencer_get_orders_by_ref($code);
        $total_revenue = 0;
        $order_count = count($orders);
        $cities = array();
        $countries = array();
        $free_gift_count = 0;
        $order_details = array();

        foreach ($orders as $order) {
            $order_total = floatval($order->get_total());
            $total_revenue += $order_total;

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

            $has_gift = false;
            $item_count = 0;
            foreach ($order->get_items() as $item) {
                $item_count += $item->get_quantity();
                $product = $item->get_product();
                if ($product && floatval($product->get_price()) == 0) {
                    $has_gift = true;
                    $free_gift_count++;
                }
            }

            $landing = '';
            $visit_date_val = '';
            foreach ($order->get_meta_data() as $meta) {
                if ($meta->key === '_influencer_landing_page') $landing = $meta->value;
                if ($meta->key === '_influencer_visit_date') $visit_date_val = $meta->value;
            }

            $order_details[] = array(
                'id' => $order->get_id(),
                'date' => $order->get_date_created() ? $order->get_date_created()->date('Y-m-d H:i') : '',
                'status' => $order->get_status(),
                'total' => $order_total,
                'items' => $item_count,
                'city' => $city,
                'country' => $country,
                'has_gift' => $has_gift,
                'customer' => $order->get_billing_first_name() . ' ' . $order->get_billing_last_name(),
                'email' => $order->get_billing_email(),
                'phone' => $order->get_billing_phone(),
                'payment' => $order->get_payment_method_title(),
                'landing_page' => $landing,
                'visit_date' => $visit_date_val,
            );
        }

        arsort($cities);
        arsort($countries);

        $conversion_rate = $visit_count > 0 ? round(($order_count / $visit_count) * 100, 1) : 0;
        $avg_order_value = $order_count > 0 ? round($total_revenue / $order_count, 2) : 0;

        $grand_total_visits += $visit_count;
        $grand_total_orders += $order_count;
        $grand_total_revenue += $total_revenue;
        $grand_total_gifts += $free_gift_count;

        $influencer_stats[] = array(
            'name' => $influencer['name'],
            'code' => $code,
            'platform' => $influencer['platform'],
            'active' => !empty($influencer['active']),
            'visits' => $visit_count,
            'orders' => $order_count,
            'revenue' => $total_revenue,
            'free_gifts' => $free_gift_count,
            'conversion_rate' => $conversion_rate,
            'avg_order_value' => $avg_order_value,
            'top_cities' => array_slice($cities, 0, 5, true),
            'top_countries' => array_slice($countries, 0, 5, true),
            'order_details' => $order_details,
            'tracking_url' => $site_url . '/?ref=' . $code,
        );
    }

    ?>
    <h2>Performance Overview</h2>

    <div style="display:flex;gap:15px;margin:15px 0 25px 0;flex-wrap:wrap;">
        <div style="background:#f0f6fc;border:1px solid #c3d9ed;border-radius:6px;padding:20px 25px;flex:1;min-width:160px;text-align:center;">
            <div style="font-size:28px;font-weight:700;color:#1d2327;"><?php echo number_format($grand_total_visits); ?></div>
            <div style="font-size:13px;color:#50575e;margin-top:4px;">Total Visits</div>
        </div>
        <div style="background:#f0faf0;border:1px solid #b8dab8;border-radius:6px;padding:20px 25px;flex:1;min-width:160px;text-align:center;">
            <div style="font-size:28px;font-weight:700;color:#1d2327;"><?php echo number_format($grand_total_orders); ?></div>
            <div style="font-size:13px;color:#50575e;margin-top:4px;">Total Orders</div>
        </div>
        <div style="background:#fef8ee;border:1px solid #e6c88a;border-radius:6px;padding:20px 25px;flex:1;min-width:160px;text-align:center;">
            <div style="font-size:28px;font-weight:700;color:#1d2327;"><?php echo esc_html($currency_symbol); ?> <?php echo number_format($grand_total_revenue, 2); ?></div>
            <div style="font-size:13px;color:#50575e;margin-top:4px;">Total Revenue</div>
        </div>
        <div style="background:#fef0f5;border:1px solid #e6a8c0;border-radius:6px;padding:20px 25px;flex:1;min-width:160px;text-align:center;">
            <div style="font-size:28px;font-weight:700;color:#1d2327;"><?php echo number_format($grand_total_gifts); ?></div>
            <div style="font-size:13px;color:#50575e;margin-top:4px;">Free Gifts Triggered</div>
        </div>
        <div style="background:#f5f0fe;border:1px solid #c5b3e6;border-radius:6px;padding:20px 25px;flex:1;min-width:160px;text-align:center;">
            <div style="font-size:28px;font-weight:700;color:#1d2327;"><?php echo $grand_total_visits > 0 ? round(($grand_total_orders / $grand_total_visits) * 100, 1) : 0; ?>%</div>
            <div style="font-size:13px;color:#50575e;margin-top:4px;">Conversion Rate</div>
        </div>
    </div>

    <h3>Influencer Summary</h3>
    <table class="wp-list-table widefat fixed striped" style="margin-top:10px;">
        <thead>
            <tr>
                <th style="width:12%;">Influencer</th>
                <th style="width:8%;">Code</th>
                <th style="width:8%;">Platform</th>
                <th style="width:6%;">Status</th>
                <th style="width:7%;">Visits</th>
                <th style="width:7%;">Orders</th>
                <th style="width:10%;">Revenue</th>
                <th style="width:8%;">Avg Order</th>
                <th style="width:6%;">Conv %</th>
                <th style="width:5%;">Gifts</th>
                <th style="width:10%;">Top Cities</th>
                <th style="width:13%;">Tracking URL</th>
            </tr>
        </thead>
        <tbody>
            <?php foreach ($influencer_stats as $stat): ?>
            <tr>
                <td><strong><?php echo esc_html($stat['name']); ?></strong></td>
                <td><code><?php echo esc_html($stat['code']); ?></code></td>
                <td><?php echo esc_html(ucfirst($stat['platform'])); ?></td>
                <td><?php echo $stat['active'] ? '<span style="color:green;">Active</span>' : '<span style="color:#999;">Inactive</span>'; ?></td>
                <td><?php echo number_format($stat['visits']); ?></td>
                <td><?php echo number_format($stat['orders']); ?></td>
                <td><?php echo esc_html($currency_symbol); ?> <?php echo number_format($stat['revenue'], 2); ?></td>
                <td><?php echo esc_html($currency_symbol); ?> <?php echo number_format($stat['avg_order_value'], 2); ?></td>
                <td><?php echo $stat['conversion_rate']; ?>%</td>
                <td><?php echo number_format($stat['free_gifts']); ?></td>
                <td>
                    <?php
                    if (!empty($stat['top_cities'])) {
                        $city_parts = array();
                        foreach ($stat['top_cities'] as $city_name => $city_count) {
                            $city_parts[] = esc_html($city_name) . ' (' . $city_count . ')';
                        }
                        echo implode(', ', $city_parts);
                    } else {
                        echo '<span style="color:#999;">&mdash;</span>';
                    }
                    ?>
                </td>
                <td><input type="text" value="<?php echo esc_attr($stat['tracking_url']); ?>" class="regular-text" readonly onclick="this.select();" style="cursor:pointer;font-size:11px;width:100%;"></td>
            </tr>
            <?php endforeach; ?>
        </tbody>
    </table>

    <?php foreach ($influencer_stats as $stat): ?>
        <?php if (!empty($stat['order_details'])): ?>
        <h3 style="margin-top:30px;padding-top:15px;border-top:1px solid #ddd;">
            <?php echo esc_html($stat['name']); ?> &mdash; Order Details
            <span style="font-weight:normal;font-size:13px;color:#666;">(<?php echo count($stat['order_details']); ?> orders, <?php echo esc_html($currency_symbol); ?> <?php echo number_format($stat['revenue'], 2); ?> total)</span>
        </h3>
        <table class="wp-list-table widefat fixed striped" style="margin-top:8px;">
            <thead>
                <tr>
                    <th style="width:7%;">Order #</th>
                    <th style="width:11%;">Date</th>
                    <th style="width:7%;">Status</th>
                    <th style="width:13%;">Customer</th>
                    <th style="width:10%;">Email</th>
                    <th style="width:9%;">Phone</th>
                    <th style="width:8%;">Amount</th>
                    <th style="width:5%;">Items</th>
                    <th style="width:7%;">City</th>
                    <th style="width:6%;">Country</th>
                    <th style="width:8%;">Payment</th>
                    <th style="width:4%;">Gift</th>
                    <th style="width:10%;">Landing Page</th>
                </tr>
            </thead>
            <tbody>
                <?php foreach ($stat['order_details'] as $od): ?>
                <tr>
                    <td><a href="<?php echo esc_url(admin_url('post.php?post=' . $od['id'] . '&action=edit')); ?>">#<?php echo intval($od['id']); ?></a></td>
                    <td><?php echo esc_html($od['date']); ?></td>
                    <td>
                        <?php
                        $status_colors = array('completed' => '#7ad03a', 'processing' => '#73a724', 'on-hold' => '#999', 'pending' => '#f0ad4e', 'cancelled' => '#a00', 'refunded' => '#999', 'failed' => '#a00');
                        $s_color = isset($status_colors[$od['status']]) ? $status_colors[$od['status']] : '#666';
                        ?>
                        <span style="color:<?php echo $s_color; ?>;"><?php echo esc_html(ucfirst($od['status'])); ?></span>
                    </td>
                    <td><?php echo esc_html($od['customer']); ?></td>
                    <td style="font-size:11px;"><?php echo esc_html($od['email']); ?></td>
                    <td style="font-size:11px;"><?php echo esc_html($od['phone']); ?></td>
                    <td><strong><?php echo esc_html($currency_symbol); ?> <?php echo number_format($od['total'], 2); ?></strong></td>
                    <td><?php echo intval($od['items']); ?></td>
                    <td><?php echo esc_html($od['city']); ?></td>
                    <td><?php echo esc_html($od['country']); ?></td>
                    <td><?php echo esc_html($od['payment']); ?></td>
                    <td><?php echo $od['has_gift'] ? '<span style="color:green;">Yes</span>' : '<span style="color:#ccc;">No</span>'; ?></td>
                    <td style="font-size:11px;"><?php echo esc_html($od['landing_page'] ?: '—'); ?></td>
                </tr>
                <?php endforeach; ?>
            </tbody>
        </table>
        <?php endif; ?>
    <?php endforeach; ?>
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
            $code = substr($code, 0, 50);
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

    $code = strtolower(substr($code, 0, 50));
    if (!preg_match('/^[a-z0-9_-]+$/', $code)) {
        return new WP_Error('invalid_code', 'Invalid referral code format.', array('status' => 400));
    }
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
