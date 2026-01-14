<?php
/**
 * ASL Free Gift - Free Gift Rules Functionality
 * 
 * Handles admin page, REST API endpoints, and product hiding
 * for the ASL Free Gift feature.
 * 
 * @package ASL_Frontend_Settings
 * @since 5.9.0
 */

if (!defined('ABSPATH')) exit;

/**
 * Initialize ASL Free Gift
 */
function asl_free_gift_init() {
    // Admin menu
    add_action('admin_menu', 'asl_free_gift_register_menu', 99);
    
    // Admin scripts
    add_action('admin_enqueue_scripts', 'asl_free_gift_enqueue_scripts');
    
    // REST API endpoints
    add_action('rest_api_init', 'asl_free_gift_register_rest_routes');
    
    // Hide free gift products from shop
    add_action('woocommerce_product_query', 'asl_free_gift_hide_from_shop');
    add_filter('woocommerce_rest_product_object_query', 'asl_free_gift_hide_from_rest_api', 10, 2);
    add_filter('woocommerce_product_search_results', 'asl_free_gift_hide_from_search');
}

/**
 * Register admin menu
 */
function asl_free_gift_register_menu() {
    add_submenu_page(
        'woocommerce',
        'Free Gifts',
        'Free Gifts',
        'manage_woocommerce',
        'asl-free-gifts',
        'asl_free_gifts_render_admin_page'
    );
}

/**
 * Enqueue admin scripts
 */
function asl_free_gift_enqueue_scripts($hook) {
    if ($hook !== 'woocommerce_page_asl-free-gifts') return;
    wp_enqueue_script('jquery');
    wp_enqueue_style('woocommerce_admin_styles');
}

/**
 * Render Free Gifts admin page
 */
function asl_free_gifts_render_admin_page() {
    if (!current_user_can('manage_woocommerce')) {
        wp_die('You do not have sufficient permissions to access this page.');
    }

    // Handle form submission
    if (isset($_POST['asl_free_gifts_save']) && check_admin_referer('asl_free_gifts_nonce')) {
        asl_free_gifts_save_rules();
        echo '<div class="notice notice-success is-dismissible"><p>Free gift rules saved successfully!</p></div>';
    }

    // Handle delete action
    if (isset($_GET['action']) && $_GET['action'] === 'delete' && isset($_GET['rule_id'])) {
        if (check_admin_referer('asl_delete_free_gift_' . $_GET['rule_id'])) {
            asl_free_gifts_delete_rule(sanitize_text_field($_GET['rule_id']));
            echo '<div class="notice notice-success is-dismissible"><p>Rule deleted successfully!</p></div>';
        }
    }

    $rules = get_option('asl_free_gifts_rules', array());
    $products = asl_free_gifts_get_products_list();
    $currencies = array('AED', 'SAR', 'KWD', 'BHD', 'OMR', 'QAR', 'USD');
    
    ?>
    <div class="wrap">
        <h1>Free Gift Rules</h1>
        <p>Configure automatic free gifts based on cart value thresholds. When a customer's cart reaches the minimum value, the free gift product will be automatically added to their cart.</p>
        
        <form method="post" id="asl-free-gifts-form">
            <?php wp_nonce_field('asl_free_gifts_nonce'); ?>
            
            <h2>Global Settings</h2>
            <table class="form-table">
                <tr>
                    <th scope="row">Hide Free Gift Products from Shop</th>
                    <td>
                        <label>
                            <input type="checkbox" name="asl_free_gifts_hide_from_shop" value="1" <?php checked(get_option('asl_free_gifts_hide_from_shop', true)); ?>>
                            Hide products marked as free gifts from shop listing and search results
                        </label>
                    </td>
                </tr>
            </table>
            
            <h2>Free Gift Rules <button type="button" class="button" id="asl-add-free-gift-rule">+ Add New Rule</button></h2>
            
            <div id="asl-free-gifts-rules">
                <?php if (empty($rules)): ?>
                    <?php asl_free_gifts_render_rule_row(0, array(), $products, $currencies); ?>
                <?php else: ?>
                    <?php foreach ($rules as $index => $rule): ?>
                        <?php asl_free_gifts_render_rule_row($index, $rule, $products, $currencies); ?>
                    <?php endforeach; ?>
                <?php endif; ?>
            </div>
            
            <p class="submit">
                <input type="submit" name="asl_free_gifts_save" class="button button-primary" value="Save All Rules">
            </p>
        </form>
        
        <script>
        jQuery(document).ready(function($) {
            var ruleIndex = <?php echo max(0, count($rules) - 1); ?>;
            
            $('#asl-add-free-gift-rule').on('click', function() {
                ruleIndex++;
                var template = `
                <div class="asl-free-gift-rule" style="background:#fff;border:1px solid #ccd0d4;padding:20px;margin-bottom:20px;">
                    <h3>Rule #${ruleIndex + 1} <button type="button" class="button asl-remove-rule" style="float:right;color:#a00;">Remove Rule</button></h3>
                    <table class="form-table">
                        <tr>
                            <th>Enabled</th>
                            <td><label><input type="checkbox" name="asl_free_gifts_rules[${ruleIndex}][enabled]" value="1" checked> Active</label></td>
                        </tr>
                        <tr>
                            <th>Rule Name</th>
                            <td><input type="text" name="asl_free_gifts_rules[${ruleIndex}][name]" class="regular-text" placeholder="e.g., Free Gift for orders over 750 AED"></td>
                        </tr>
                        <tr>
                            <th>Minimum Cart Value</th>
                            <td><input type="number" name="asl_free_gifts_rules[${ruleIndex}][min_cart_value]" class="small-text" min="0" step="0.01" value="0"></td>
                        </tr>
                        <tr>
                            <th>Currency</th>
                            <td>
                                <select name="asl_free_gifts_rules[${ruleIndex}][currency]">
                                    <?php foreach ($currencies as $curr): ?>
                                    <option value="<?php echo esc_attr($curr); ?>"><?php echo esc_html($curr); ?></option>
                                    <?php endforeach; ?>
                                </select>
                            </td>
                        </tr>
                        <tr>
                            <th>Free Gift Product</th>
                            <td>
                                <select name="asl_free_gifts_rules[${ruleIndex}][product_id]" class="regular-text">
                                    <option value="">-- Select Product --</option>
                                    <?php foreach ($products as $product): ?>
                                    <option value="<?php echo esc_attr($product['id']); ?>"><?php echo esc_html($product['name']); ?> (ID: <?php echo esc_html($product['id']); ?>)</option>
                                    <?php endforeach; ?>
                                </select>
                            </td>
                        </tr>
                        <tr>
                            <th>Priority</th>
                            <td>
                                <input type="number" name="asl_free_gifts_rules[${ruleIndex}][priority]" class="small-text" min="1" value="10">
                                <p class="description">Lower number = higher priority. If multiple rules match, only the highest priority gift is added.</p>
                            </td>
                        </tr>
                        <tr>
                            <th>Message (EN)</th>
                            <td><input type="text" name="asl_free_gifts_rules[${ruleIndex}][message_en]" class="large-text" placeholder="Congratulations! You've earned a free gift!"></td>
                        </tr>
                        <tr>
                            <th>Message (AR)</th>
                            <td><input type="text" name="asl_free_gifts_rules[${ruleIndex}][message_ar]" class="large-text" dir="rtl" placeholder="تهانينا! لقد حصلت على هدية مجانية!"></td>
                        </tr>
                        <tr>
                            <th>Hide from Shop</th>
                            <td>
                                <label><input type="checkbox" name="asl_free_gifts_rules[${ruleIndex}][hide_from_shop]" value="1"> Hide this gift product from shop listing and search results</label>
                                <p class="description">When enabled, this product will not appear in shop listings or search results (applies to both EN and AR).</p>
                            </td>
                        </tr>
                    </table>
                </div>`;
                $('#asl-free-gifts-rules').append(template);
            });
            
            $(document).on('click', '.asl-remove-rule', function() {
                if (confirm('Are you sure you want to remove this rule?')) {
                    $(this).closest('.asl-free-gift-rule').remove();
                }
            });
        });
        </script>
    </div>
    <?php
}

/**
 * Render a single rule row
 */
function asl_free_gifts_render_rule_row($index, $rule, $products, $currencies) {
    $enabled = isset($rule['enabled']) ? $rule['enabled'] : true;
    $name = isset($rule['name']) ? $rule['name'] : '';
    $min_cart_value = isset($rule['min_cart_value']) ? $rule['min_cart_value'] : 0;
    $currency = isset($rule['currency']) ? $rule['currency'] : 'AED';
    $product_id = isset($rule['product_id']) ? $rule['product_id'] : '';
    $priority = isset($rule['priority']) ? $rule['priority'] : 10;
    $message_en = isset($rule['message_en']) ? $rule['message_en'] : '';
    $message_ar = isset($rule['message_ar']) ? $rule['message_ar'] : '';
    $hide_from_shop = isset($rule['hide_from_shop']) ? $rule['hide_from_shop'] : false;
    ?>
    <div class="asl-free-gift-rule" style="background:#fff;border:1px solid #ccd0d4;padding:20px;margin-bottom:20px;">
        <h3>Rule #<?php echo $index + 1; ?> <button type="button" class="button asl-remove-rule" style="float:right;color:#a00;">Remove Rule</button></h3>
        <table class="form-table">
            <tr>
                <th>Enabled</th>
                <td><label><input type="checkbox" name="asl_free_gifts_rules[<?php echo $index; ?>][enabled]" value="1" <?php checked($enabled); ?>> Active</label></td>
            </tr>
            <tr>
                <th>Rule Name</th>
                <td><input type="text" name="asl_free_gifts_rules[<?php echo $index; ?>][name]" value="<?php echo esc_attr($name); ?>" class="regular-text" placeholder="e.g., Free Gift for orders over 750 AED"></td>
            </tr>
            <tr>
                <th>Minimum Cart Value</th>
                <td><input type="number" name="asl_free_gifts_rules[<?php echo $index; ?>][min_cart_value]" value="<?php echo esc_attr($min_cart_value); ?>" class="small-text" min="0" step="0.01"></td>
            </tr>
            <tr>
                <th>Currency</th>
                <td>
                    <select name="asl_free_gifts_rules[<?php echo $index; ?>][currency]">
                        <?php foreach ($currencies as $curr): ?>
                        <option value="<?php echo esc_attr($curr); ?>" <?php selected($currency, $curr); ?>><?php echo esc_html($curr); ?></option>
                        <?php endforeach; ?>
                    </select>
                </td>
            </tr>
            <tr>
                <th>Free Gift Product</th>
                <td>
                    <select name="asl_free_gifts_rules[<?php echo $index; ?>][product_id]" class="regular-text">
                        <option value="">-- Select Product --</option>
                        <?php foreach ($products as $product): ?>
                        <option value="<?php echo esc_attr($product['id']); ?>" <?php selected($product_id, $product['id']); ?>><?php echo esc_html($product['name']); ?> (ID: <?php echo esc_html($product['id']); ?>)</option>
                        <?php endforeach; ?>
                    </select>
                </td>
            </tr>
            <tr>
                <th>Priority</th>
                <td>
                    <input type="number" name="asl_free_gifts_rules[<?php echo $index; ?>][priority]" value="<?php echo esc_attr($priority); ?>" class="small-text" min="1">
                    <p class="description">Lower number = higher priority. If multiple rules match, only the highest priority gift is added.</p>
                </td>
            </tr>
            <tr>
                <th>Message (EN)</th>
                <td><input type="text" name="asl_free_gifts_rules[<?php echo $index; ?>][message_en]" value="<?php echo esc_attr($message_en); ?>" class="large-text" placeholder="Congratulations! You've earned a free gift!"></td>
            </tr>
            <tr>
                <th>Message (AR)</th>
                <td><input type="text" name="asl_free_gifts_rules[<?php echo $index; ?>][message_ar]" value="<?php echo esc_attr($message_ar); ?>" class="large-text" dir="rtl" placeholder="تهانينا! لقد حصلت على هدية مجانية!"></td>
            </tr>
            <tr>
                <th>Hide from Shop</th>
                <td>
                    <label><input type="checkbox" name="asl_free_gifts_rules[<?php echo $index; ?>][hide_from_shop]" value="1" <?php checked($hide_from_shop); ?>> Hide this gift product from shop listing and search results</label>
                    <p class="description">When enabled, this product will not appear in shop listings or search results (applies to both EN and AR).</p>
                </td>
            </tr>
        </table>
    </div>
    <?php
}

/**
 * Save free gift rules
 */
function asl_free_gifts_save_rules() {
    $hide_from_shop = isset($_POST['asl_free_gifts_hide_from_shop']) ? true : false;
    update_option('asl_free_gifts_hide_from_shop', $hide_from_shop);
    
    $rules = array();
    if (isset($_POST['asl_free_gifts_rules']) && is_array($_POST['asl_free_gifts_rules'])) {
        foreach ($_POST['asl_free_gifts_rules'] as $rule) {
            if (empty($rule['product_id'])) continue; // Skip rules without a product
            
            $rules[] = array(
                'id' => isset($rule['id']) ? sanitize_text_field($rule['id']) : wp_generate_uuid4(),
                'enabled' => isset($rule['enabled']) ? true : false,
                'name' => sanitize_text_field($rule['name'] ?? ''),
                'min_cart_value' => floatval($rule['min_cart_value'] ?? 0),
                'currency' => sanitize_text_field($rule['currency'] ?? 'AED'),
                'product_id' => intval($rule['product_id']),
                'priority' => intval($rule['priority'] ?? 10),
                'message_en' => sanitize_text_field($rule['message_en'] ?? ''),
                'message_ar' => sanitize_text_field($rule['message_ar'] ?? ''),
                'hide_from_shop' => isset($rule['hide_from_shop']) ? true : false,
            );
        }
    }
    
    // Sort by priority
    usort($rules, function($a, $b) {
        return $a['priority'] - $b['priority'];
    });
    
    update_option('asl_free_gifts_rules', $rules);
}

/**
 * Delete a single rule
 */
function asl_free_gifts_delete_rule($rule_id) {
    $rules = get_option('asl_free_gifts_rules', array());
    $rules = array_filter($rules, function($rule) use ($rule_id) {
        return $rule['id'] !== $rule_id;
    });
    update_option('asl_free_gifts_rules', array_values($rules));
}

/**
 * Get list of products for dropdown
 */
function asl_free_gifts_get_products_list() {
    $products = array();
    
    $args = array(
        'post_type' => 'product',
        'posts_per_page' => -1,
        'post_status' => 'publish',
        'orderby' => 'title',
        'order' => 'ASC',
    );
    
    $query = new WP_Query($args);
    
    if ($query->have_posts()) {
        while ($query->have_posts()) {
            $query->the_post();
            $products[] = array(
                'id' => get_the_ID(),
                'name' => get_the_title(),
            );
        }
        wp_reset_postdata();
    }
    
    return $products;
}

/**
 * Register REST API routes
 */
function asl_free_gift_register_rest_routes() {
    register_rest_route('asl-free-gifts/v1', '/rules', array(
        'methods' => 'GET',
        'callback' => 'asl_free_gifts_api_get_rules',
        'permission_callback' => '__return_true',
    ));
    
    register_rest_route('asl-free-gifts/v1', '/settings', array(
        'methods' => 'GET',
        'callback' => 'asl_free_gifts_api_get_settings',
        'permission_callback' => '__return_true',
    ));
}

/**
 * API: Get free gift rules
 */
function asl_free_gifts_api_get_rules($request) {
    $rules = get_option('asl_free_gifts_rules', array());
    $currency = $request->get_param('currency');
    
    // Filter only enabled rules
    $active_rules = array_filter($rules, function($rule) {
        return !empty($rule['enabled']);
    });
    
    // Filter by currency if specified
    if ($currency) {
        $active_rules = array_filter($active_rules, function($rule) use ($currency) {
            return $rule['currency'] === $currency;
        });
    }
    
    // Enrich with product data
    $enriched_rules = array();
    foreach ($active_rules as $rule) {
        $product = wc_get_product($rule['product_id']);
        if ($product) {
            $rule['product'] = array(
                'id' => $product->get_id(),
                'name' => $product->get_name(),
                'slug' => $product->get_slug(),
                'price' => $product->get_price(),
                'image' => wp_get_attachment_url($product->get_image_id()),
            );
        }
        $enriched_rules[] = $rule;
    }
    
    return array(
        'success' => true,
        'rules' => array_values($enriched_rules),
    );
}

/**
 * API: Get free gift settings
 */
function asl_free_gifts_api_get_settings() {
    return array(
        'success' => true,
        'hide_from_shop' => get_option('asl_free_gifts_hide_from_shop', true),
    );
}

/**
 * Get array of free gift product IDs (for hiding from shop)
 * Only returns products where hide_from_shop is enabled for that rule
 */
function asl_free_gifts_get_product_ids() {
    $rules = get_option('asl_free_gifts_rules', array());
    $product_ids = array();
    
    foreach ($rules as $rule) {
        // Only include products where hide_from_shop is enabled for this rule
        if (!empty($rule['product_id']) && !empty($rule['hide_from_shop'])) {
            $product_ids[] = intval($rule['product_id']);
        }
    }
    
    return array_unique($product_ids);
}

/**
 * Hide free gift products from shop (based on per-rule hide_from_shop setting)
 */
function asl_free_gift_hide_from_shop($query) {
    if (is_admin()) return;
    
    $free_gift_ids = asl_free_gifts_get_product_ids();
    if (empty($free_gift_ids)) return;
    
    $query->set('post__not_in', array_merge(
        $query->get('post__not_in') ?: array(),
        $free_gift_ids
    ));
}

/**
 * Hide from WooCommerce Store API (for headless/Next.js frontend)
 */
function asl_free_gift_hide_from_rest_api($args, $request) {
    $free_gift_ids = asl_free_gifts_get_product_ids();
    if (empty($free_gift_ids)) return $args;
    
    $existing_exclude = isset($args['post__not_in']) ? $args['post__not_in'] : array();
    $args['post__not_in'] = array_merge($existing_exclude, $free_gift_ids);
    
    return $args;
}

/**
 * Hide from search results
 */
function asl_free_gift_hide_from_search($product_ids) {
    $free_gift_ids = asl_free_gifts_get_product_ids();
    if (empty($free_gift_ids)) return $product_ids;
    
    return array_diff($product_ids, $free_gift_ids);
}

// Initialize ASL Free Gift
asl_free_gift_init();
