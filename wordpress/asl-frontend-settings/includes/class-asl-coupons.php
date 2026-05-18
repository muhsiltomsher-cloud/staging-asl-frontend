<?php
/**
 * ASL Coupons REST API
 * 
 * Provides a public REST endpoint for the headless frontend to fetch
 * valid WooCommerce coupons without requiring WC REST API credentials.
 */

if (!defined('ABSPATH')) exit;

add_action('rest_api_init', function () {
    register_rest_route('asl/v1', '/coupons', array(
        'methods'  => 'GET',
        'callback' => 'asl_get_valid_coupons',
        'permission_callback' => '__return_true',
    ));
});

function asl_get_valid_coupons() {
    $args = array(
        'post_type'      => 'shop_coupon',
        'post_status'    => 'publish',
        'posts_per_page' => 100,
    );

    $coupons_query = new WP_Query($args);
    $now = current_time('timestamp');
    $valid_coupons = array();

    foreach ($coupons_query->posts as $coupon_post) {
        $coupon = new WC_Coupon($coupon_post->ID);

        $expiry = $coupon->get_date_expires();
        if ($expiry && $expiry->getTimestamp() < $now) {
            continue;
        }

        $usage_limit = $coupon->get_usage_limit();
        if ($usage_limit > 0 && $coupon->get_usage_count() >= $usage_limit) {
            continue;
        }

        $valid_coupons[] = array(
            'code'            => $coupon->get_code(),
            'description'     => $coupon->get_description(),
            'discount_type'   => $coupon->get_discount_type(),
            'amount'          => $coupon->get_amount(),
            'minimum_amount'  => $coupon->get_minimum_amount(),
            'maximum_amount'  => $coupon->get_maximum_amount(),
            'free_shipping'   => $coupon->get_free_shipping(),
        );
    }

    return new WP_REST_Response(array(
        'success' => true,
        'coupons' => $valid_coupons,
    ), 200);
}
