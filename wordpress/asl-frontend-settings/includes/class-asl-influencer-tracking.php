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
    add_action('admin_init', 'asl_influencer_handle_csv_export');
    add_action('woocommerce_checkout_order_created', 'asl_influencer_save_ref_to_order', 10, 1);
    add_action('woocommerce_new_order', 'asl_influencer_save_ref_to_order_by_id', 10, 1);
}

/**
 * Save influencer referral code from cookie to order meta during checkout.
 * Fired by woocommerce_checkout_order_created (receives order object).
 */
function asl_influencer_save_ref_to_order($order) {
    if (!$order instanceof WC_Order) return;
    if ($order->get_meta('_influencer_ref')) return;

    $ref = '';
    if (!empty($_COOKIE['asl_ref'])) {
        $ref = sanitize_text_field($_COOKIE['asl_ref']);
    }
    if (!$ref) {
        $meta = $order->get_meta_data();
        foreach ($meta as $m) {
            if ($m->key === '_influencer_ref' && !empty($m->value)) {
                return;
            }
        }
    }
    if ($ref) {
        $ref = preg_replace('/[^a-z0-9_-]/', '', strtolower($ref));
        $ref = substr($ref, 0, 50);
        $influencers = get_option('asl_influencers', array());
        foreach ($influencers as $inf) {
            if (isset($inf['code']) && $inf['code'] === $ref) {
                $order->update_meta_data('_influencer_ref', $ref);
                $order->save();
                return;
            }
        }
    }
}

/**
 * Fallback: save influencer referral from cookie by order ID.
 * Fired by woocommerce_new_order (receives order ID).
 */
function asl_influencer_save_ref_to_order_by_id($order_id) {
    $order = wc_get_order($order_id);
    if ($order) {
        asl_influencer_save_ref_to_order($order);
    }
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
        'ep-influencer-tracking',
        'asl_influencer_render_admin_page'
    );
}

/**
 * Enqueue admin scripts and styles
 */
function asl_influencer_enqueue_scripts($hook) {
    if ($hook !== 'woocommerce_page_ep-influencer-tracking') return;
    wp_enqueue_script('jquery');
    wp_enqueue_style('woocommerce_admin_styles');
    wp_add_inline_style('woocommerce_admin_styles', asl_influencer_get_admin_css());
}

/**
 * Get admin CSS
 */
function asl_influencer_get_admin_css() {
    return '
    /* ── ASL Influencer Tracking Admin Styles ── */
    .asl-wrap { max-width: 1400px; }
    .asl-wrap h1 { font-size: 24px; font-weight: 600; color: #1d2327; margin-bottom: 4px; }
    .asl-wrap .asl-subtitle { color: #646970; font-size: 13px; margin: 0 0 20px; }

    /* Tabs */
    .asl-wrap .nav-tab-wrapper { border-bottom: 1px solid #c3c4c7; margin-bottom: 0; }
    .asl-wrap .nav-tab { border: 1px solid transparent; border-bottom: none; padding: 8px 16px; font-size: 13px; font-weight: 500; color: #50575e; background: transparent; margin-left: 0; margin-bottom: -1px; transition: all 0.15s; }
    .asl-wrap .nav-tab:hover { background: #f0f0f1; color: #1d2327; }
    .asl-wrap .nav-tab-active { background: #fff; border-color: #c3c4c7; color: #1d2327; font-weight: 600; }
    .asl-tab-content { background: #fff; border: 1px solid #c3c4c7; border-top: none; padding: 24px; }

    /* KPI Cards */
    .asl-kpi-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 12px; margin-bottom: 24px; }
    .asl-kpi-card { border-radius: 8px; padding: 16px 18px; text-align: center; border: 1px solid; transition: transform 0.15s, box-shadow 0.15s; }
    .asl-kpi-card:hover { transform: translateY(-1px); box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
    .asl-kpi-value { font-size: 24px; font-weight: 700; color: #1d2327; line-height: 1.2; }
    .asl-kpi-label { font-size: 11px; color: #646970; margin-top: 4px; text-transform: uppercase; letter-spacing: 0.5px; }
    .asl-kpi-blue { background: #f0f6fc; border-color: #c3d9ed; }
    .asl-kpi-green { background: #edf8ee; border-color: #b8dab8; }
    .asl-kpi-gold { background: #fef8ee; border-color: #e6c88a; }
    .asl-kpi-pink { background: #fef0f5; border-color: #e6a8c0; }
    .asl-kpi-purple { background: #f5f0fe; border-color: #c5b3e6; }
    .asl-kpi-red { background: #fff5f5; border-color: #e6a8a8; }

    /* Status Badges */
    .asl-badge { display: inline-block; padding: 2px 8px; border-radius: 10px; font-size: 11px; font-weight: 500; line-height: 1.5; }
    .asl-badge-active { background: #dff0d8; color: #3c763d; }
    .asl-badge-inactive { background: #f0f0f1; color: #787c82; }
    .asl-badge-completed { background: #dff0d8; color: #3c763d; }
    .asl-badge-processing { background: #e8f5e9; color: #2e7d32; }
    .asl-badge-on-hold { background: #fff3cd; color: #856404; }
    .asl-badge-pending { background: #fff3cd; color: #856404; }
    .asl-badge-cancelled { background: #fce4ec; color: #c62828; }
    .asl-badge-refunded { background: #f0f0f1; color: #787c82; }
    .asl-badge-failed { background: #fce4ec; color: #c62828; }

    /* Platform Badges */
    .asl-platform { display: inline-flex; align-items: center; gap: 4px; padding: 2px 8px; border-radius: 10px; font-size: 11px; font-weight: 500; }
    .asl-platform-instagram { background: #fce4ec; color: #c2185b; }
    .asl-platform-tiktok { background: #f3e5f5; color: #7b1fa2; }
    .asl-platform-youtube { background: #ffebee; color: #c62828; }
    .asl-platform-snapchat { background: #fffde7; color: #f9a825; }
    .asl-platform-facebook { background: #e3f2fd; color: #1565c0; }
    .asl-platform-twitter { background: #e0f2f1; color: #00695c; }
    .asl-platform-other { background: #f0f0f1; color: #646970; }

    /* Influencer Form Rows */
    .asl-influencer-row { background: #fafafa; border: 1px solid #dcdcde; border-radius: 6px; padding: 20px; margin-bottom: 12px; transition: border-color 0.15s; }
    .asl-influencer-row:hover { border-color: #b4b9be; }
    .asl-influencer-row h3 { margin: 0 0 12px; font-size: 14px; color: #1d2327; display: flex; justify-content: space-between; align-items: center; }
    .asl-influencer-row .form-table th { width: 140px; padding: 8px 10px 8px 0; font-size: 13px; color: #1d2327; }
    .asl-influencer-row .form-table td { padding: 8px 0; }
    .asl-influencer-row .form-table td .description { font-size: 12px; color: #787c82; margin-top: 4px; }

    /* Buttons */
    .asl-btn-remove { color: #b32d2e !important; border-color: #b32d2e !important; }
    .asl-btn-remove:hover { background: #b32d2e !important; color: #fff !important; }
    .asl-btn-copy { cursor: pointer; padding: 2px 8px; font-size: 11px; border: 1px solid #c3c4c7; border-radius: 3px; background: #f6f7f7; color: #2271b1; transition: all 0.15s; }
    .asl-btn-copy:hover { background: #2271b1; color: #fff; border-color: #2271b1; }
    .asl-btn-copy.copied { background: #00a32a; color: #fff; border-color: #00a32a; }

    /* Summary Table */
    .asl-summary-table { border-collapse: collapse; width: 100%; font-size: 13px; }
    .asl-summary-table th { background: #f6f7f7; padding: 10px 12px; text-align: left; font-weight: 600; color: #1d2327; border-bottom: 2px solid #c3c4c7; white-space: nowrap; }
    .asl-summary-table td { padding: 10px 12px; border-bottom: 1px solid #f0f0f1; vertical-align: middle; }
    .asl-summary-table tr:hover td { background: #f9f9f9; }
    .asl-summary-table .asl-positive { color: #00a32a; font-weight: 600; }
    .asl-summary-table .asl-negative { color: #d63638; font-weight: 600; }

    /* Accordion */
    .asl-accordion { margin-bottom: 2px; border: 1px solid #dcdcde; border-radius: 6px; overflow: hidden; }
    .asl-accordion-header { display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; background: #fafafa; cursor: pointer; user-select: none; transition: background 0.15s; }
    .asl-accordion-header:hover { background: #f0f0f1; }
    .asl-accordion-header.asl-open { background: #f0f6fc; }
    .asl-accordion-header .asl-arrow { display: inline-block; transition: transform 0.2s; font-size: 10px; color: #787c82; margin-right: 8px; }
    .asl-accordion-header.asl-open .asl-arrow { transform: rotate(90deg); }
    .asl-accordion-left { display: flex; align-items: center; gap: 10px; }
    .asl-accordion-right { display: flex; align-items: center; gap: 16px; font-size: 12px; color: #646970; }
    .asl-accordion-body { display: none; padding: 20px; border-top: 1px solid #dcdcde; background: #fff; }

    /* Detail Cards */
    .asl-detail-cards { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 20px; }
    .asl-detail-card { background: #f8f9fa; border: 1px solid #e2e4e7; border-radius: 6px; padding: 12px 16px; min-width: 110px; text-align: center; }
    .asl-detail-card-value { font-size: 18px; font-weight: 700; color: #1d2327; }
    .asl-detail-card-label { font-size: 11px; color: #646970; margin-top: 2px; }
    .asl-detail-card-sub { font-size: 10px; color: #a7aaad; margin-top: 2px; }

    /* Cost Cards */
    .asl-cost-card { border-radius: 6px; padding: 12px 16px; min-width: 130px; text-align: center; }
    .asl-cost-card-value { font-size: 18px; font-weight: 700; }
    .asl-cost-card-label { font-size: 11px; color: #646970; margin-top: 2px; }
    .asl-cost-card-sub { font-size: 10px; color: #a7aaad; margin-top: 2px; }

    /* Side-by-side Tables */
    .asl-side-tables { display: flex; gap: 20px; flex-wrap: wrap; margin-bottom: 20px; }
    .asl-side-tables > div { flex: 1; min-width: 200px; }
    .asl-side-tables h4 { margin: 0 0 8px; font-size: 13px; color: #1d2327; }
    .asl-side-tables table { width: 100%; }

    /* Date Filter */
    .asl-date-filter { display: flex; align-items: center; gap: 10px; margin-bottom: 20px; padding: 12px 16px; background: #f6f7f7; border: 1px solid #dcdcde; border-radius: 6px; flex-wrap: wrap; }
    .asl-date-filter label { font-size: 13px; color: #1d2327; font-weight: 500; }
    .asl-date-filter input[type="date"] { padding: 4px 8px; border: 1px solid #8c8f94; border-radius: 4px; font-size: 13px; }
    .asl-date-filter .button { margin-left: 4px; }

    /* Visit Log Table */
    .asl-visit-table { width: 100%; border-collapse: collapse; font-size: 12px; }
    .asl-visit-table th { background: #f6f7f7; padding: 8px 10px; text-align: left; font-weight: 600; color: #1d2327; border-bottom: 2px solid #c3c4c7; }
    .asl-visit-table td { padding: 8px 10px; border-bottom: 1px solid #f0f0f1; }
    .asl-visit-table tr:hover td { background: #fafafa; }

    /* Tracking URL Input */
    .asl-tracking-url { display: flex; align-items: center; gap: 6px; margin-bottom: 16px; }
    .asl-tracking-url input[type="text"] { font-size: 12px; padding: 4px 8px; width: 400px; max-width: 100%; background: #f6f7f7; border: 1px solid #dcdcde; cursor: pointer; }

    /* Export Bar */
    .asl-export-bar { display: flex; gap: 8px; align-items: center; margin-bottom: 16px; }

    /* Section Header */
    .asl-section-header { display: flex; justify-content: space-between; align-items: center; margin: 24px 0 12px; }
    .asl-section-header h3 { margin: 0; font-size: 15px; color: #1d2327; }
    .asl-section-header .asl-hint { font-weight: 400; font-size: 12px; color: #787c82; }

    /* Orders Table */
    .asl-orders-table { width: 100%; border-collapse: collapse; font-size: 12px; }
    .asl-orders-table th { background: #f6f7f7; padding: 8px 10px; text-align: left; font-weight: 600; border-bottom: 2px solid #c3c4c7; white-space: nowrap; }
    .asl-orders-table td { padding: 8px 10px; border-bottom: 1px solid #f0f0f1; }
    .asl-orders-table tr:hover td { background: #fafafa; }

    /* Search Box */
    .asl-search-box { margin-bottom: 16px; }
    .asl-search-box input { padding: 6px 12px; border: 1px solid #8c8f94; border-radius: 4px; width: 300px; max-width: 100%; font-size: 13px; }

    /* Link Generator */
    .asl-link-gen { background: #fff; border: 1px solid #dcdcde; border-radius: 8px; padding: 24px; margin-bottom: 20px; }
    .asl-link-gen h3 { margin: 0 0 16px; font-size: 15px; color: #1d2327; }
    .asl-link-gen .asl-gen-row { display: flex; gap: 12px; align-items: flex-end; flex-wrap: wrap; margin-bottom: 16px; }
    .asl-link-gen .asl-gen-field { display: flex; flex-direction: column; gap: 4px; }
    .asl-link-gen .asl-gen-field label { font-size: 12px; font-weight: 600; color: #1d2327; text-transform: uppercase; letter-spacing: 0.3px; }
    .asl-link-gen .asl-gen-field select, .asl-link-gen .asl-gen-field input[type="text"] { padding: 6px 10px; border: 1px solid #8c8f94; border-radius: 4px; font-size: 13px; min-width: 200px; }
    .asl-gen-result { background: #f0f6fc; border: 1px solid #c3d9ed; border-radius: 6px; padding: 16px; display: none; }
    .asl-gen-result.asl-visible { display: block; }
    .asl-gen-result label { font-size: 11px; font-weight: 600; color: #646970; text-transform: uppercase; letter-spacing: 0.3px; display: block; margin-bottom: 6px; }
    .asl-gen-url-wrap { display: flex; gap: 8px; align-items: center; }
    .asl-gen-url-wrap input[type="text"] { flex: 1; padding: 8px 12px; font-size: 13px; border: 1px solid #c3d9ed; border-radius: 4px; background: #fff; font-family: monospace; }
    .asl-gen-url-wrap .button { white-space: nowrap; }
    .asl-gen-history { margin-top: 20px; }
    .asl-gen-history h4 { margin: 0 0 8px; font-size: 13px; color: #1d2327; }
    .asl-gen-history-table { width: 100%; border-collapse: collapse; font-size: 12px; }
    .asl-gen-history-table th { background: #f6f7f7; padding: 8px 10px; text-align: left; font-weight: 600; border-bottom: 2px solid #c3c4c7; }
    .asl-gen-history-table td { padding: 8px 10px; border-bottom: 1px solid #f0f0f1; }
    .asl-gen-history-table tr:hover td { background: #fafafa; }

    /* Activity Logs */
    .asl-activity-table { width: 100%; border-collapse: collapse; font-size: 12px; }
    .asl-activity-table th { background: #f6f7f7; padding: 8px 10px; text-align: left; font-weight: 600; color: #1d2327; border-bottom: 2px solid #c3c4c7; white-space: nowrap; }
    .asl-activity-table td { padding: 8px 10px; border-bottom: 1px solid #f0f0f1; vertical-align: middle; }
    .asl-activity-table tr:hover td { background: #fafafa; }
    .asl-log-activated { color: #00a32a; font-weight: 600; }
    .asl-log-deactivated { color: #d63638; font-weight: 600; }
    .asl-log-created { color: #2271b1; font-weight: 600; }
    .asl-log-deleted { color: #b32d2e; font-weight: 600; }
    .asl-log-updated { color: #dba617; font-weight: 600; }

    /* Responsive */
    @media (max-width: 782px) {
        .asl-kpi-grid { grid-template-columns: repeat(2, 1fr); }
        .asl-accordion-right { display: none; }
        .asl-side-tables { flex-direction: column; }
        .asl-date-filter { flex-direction: column; align-items: stretch; }
        .asl-link-gen .asl-gen-row { flex-direction: column; }
        .asl-link-gen .asl-gen-field select, .asl-link-gen .asl-gen-field input[type="text"] { min-width: 100%; }
    }
    ';
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

    if (isset($_POST['asl_clear_visits']) && check_admin_referer('asl_clear_visits_nonce')) {
        $clear_code = sanitize_text_field($_POST['clear_code'] ?? '');
        if ($clear_code === '__all__') {
            update_option('asl_influencer_visits', array());
            echo '<div class="notice notice-success is-dismissible"><p>All visit data has been cleared.</p></div>';
        } elseif (!empty($clear_code)) {
            $visits = get_option('asl_influencer_visits', array());
            unset($visits[$clear_code]);
            update_option('asl_influencer_visits', $visits);
            echo '<div class="notice notice-success is-dismissible"><p>Visit data cleared for code: ' . esc_html($clear_code) . '</p></div>';
        }
    }

    $tab = isset($_GET['tab']) ? sanitize_text_field($_GET['tab']) : 'influencers';
    $influencers = get_option('asl_influencers', array());

    ?>
    <div class="wrap asl-wrap">
        <h1>Influencer Tracking</h1>
        <p class="asl-subtitle">Manage influencer referral codes and track visits, orders, and revenue from each influencer campaign.</p>

        <nav class="nav-tab-wrapper">
            <a href="?page=ep-influencer-tracking&tab=influencers" class="nav-tab <?php echo $tab === 'influencers' ? 'nav-tab-active' : ''; ?>">Influencers</a>
            <a href="?page=ep-influencer-tracking&tab=stats" class="nav-tab <?php echo $tab === 'stats' ? 'nav-tab-active' : ''; ?>">Stats &amp; Reports</a>
            <a href="?page=ep-influencer-tracking&tab=visits" class="nav-tab <?php echo $tab === 'visits' ? 'nav-tab-active' : ''; ?>">Visit Log</a>
            <a href="?page=ep-influencer-tracking&tab=linkgen" class="nav-tab <?php echo $tab === 'linkgen' ? 'nav-tab-active' : ''; ?>">Link Generator</a>
            <a href="?page=ep-influencer-tracking&tab=activity" class="nav-tab <?php echo $tab === 'activity' ? 'nav-tab-active' : ''; ?>">Activity Logs</a>
        </nav>

        <div class="asl-tab-content">
        <?php
        if ($tab === 'stats') {
            asl_influencer_render_stats_tab();
        } elseif ($tab === 'visits') {
            asl_influencer_render_visits_tab();
        } elseif ($tab === 'linkgen') {
            asl_influencer_render_linkgen_tab();
        } elseif ($tab === 'activity') {
            asl_influencer_render_activity_tab();
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

        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
            <h2 style="margin:0;">Manage Influencers <span style="font-size:12px;color:#787c82;font-weight:400;">(<?php echo count($influencers); ?> total)</span></h2>
            <button type="button" class="button button-primary" id="asl-add-influencer">+ Add Influencer</button>
        </div>
        <p class="description" style="margin-bottom:16px;">Each influencer gets a unique referral code. Their tracking URL will be: <code><?php echo esc_html($site_url); ?>/?ref=CODE</code></p>

        <div class="asl-search-box">
            <input type="text" id="asl-influencer-search" placeholder="Search influencers by name or code...">
        </div>

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
        var siteUrl = <?php echo wp_json_encode($site_url); ?>;
        var platforms = ['instagram', 'tiktok', 'youtube', 'snapchat', 'facebook', 'twitter', 'other'];
        var platformLabels = {instagram:'Instagram', tiktok:'TikTok', youtube:'YouTube', snapchat:'Snapchat', facebook:'Facebook', twitter:'Twitter/X', other:'Other'};

        $('#asl-add-influencer').on('click', function() {
            influencerIndex++;
            var idx = influencerIndex;
            var optionsHtml = platforms.map(function(p) {
                return '<option value="' + p + '">' + platformLabels[p] + '</option>';
            }).join('');

            var template = '<div class="asl-influencer-row" data-name="" data-code="">' +
                '<h3>Influencer #' + (idx + 1) + ' <button type="button" class="button asl-btn-remove asl-remove-influencer">Remove</button></h3>' +
                '<input type="hidden" name="asl_influencers[' + idx + '][id]" value="">' +
                '<input type="hidden" name="asl_influencers[' + idx + '][created_at]" value="">' +
                '<table class="form-table">' +
                '<tr><th>Status</th><td><label><input type="checkbox" name="asl_influencers[' + idx + '][active]" value="1" checked> Active</label></td></tr>' +
                '<tr><th>Name</th><td><input type="text" name="asl_influencers[' + idx + '][name]" class="regular-text" placeholder="e.g., Ahmed"></td></tr>' +
                '<tr><th>Referral Code</th><td>' +
                    '<input type="text" name="asl_influencers[' + idx + '][code]" class="regular-text asl-code-input" placeholder="e.g., ahmed" pattern="[a-z0-9_-]+" title="Lowercase letters, numbers, hyphens and underscores only">' +
                    '<p class="description">Lowercase, no spaces. URL: <code>' + siteUrl + '/?ref=<span class="asl-code-preview">code</span></code></p>' +
                '</td></tr>' +
                '<tr><th>Platform</th><td><select name="asl_influencers[' + idx + '][platform]">' + optionsHtml + '</select></td></tr>' +
                '<tr><th>Email</th><td><input type="email" name="asl_influencers[' + idx + '][email]" class="regular-text" placeholder="e.g., ahmed@example.com"><p class="description">Contact email for this influencer</p></td></tr>' +
                '<tr><th>Commission %</th><td>' +
                    '<input type="number" step="0.01" min="0" max="100" name="asl_influencers[' + idx + '][commission_rate]" class="small-text" placeholder="e.g., 10">' +
                    '<p class="description">Percentage of each sale paid to this influencer</p>' +
                '</td></tr>' +
                '<tr><th>Fixed Amount</th><td>' +
                    '<input type="number" step="0.01" min="0" name="asl_influencers[' + idx + '][fixed_amount]" class="regular-text" placeholder="e.g., 5000">' +
                    '<p class="description">One-time or monthly fixed payment to this influencer</p>' +
                '</td></tr>' +
                '<tr><th>Notes</th><td><textarea name="asl_influencers[' + idx + '][notes]" class="large-text" rows="2" placeholder="Optional notes about this influencer"></textarea></td></tr>' +
                '</table>' +
                '</div>';
            $('#asl-influencers-list').append(template);
            $('html, body').animate({scrollTop: $('#asl-influencers-list .asl-influencer-row:last').offset().top - 100}, 300);
        });

        $(document).on('click', '.asl-remove-influencer', function() {
            if (confirm('Are you sure you want to remove this influencer?')) {
                $(this).closest('.asl-influencer-row').slideUp(200, function() { $(this).remove(); });
            }
        });

        $(document).on('input', '.asl-code-input', function() {
            var val = $(this).val().toLowerCase().replace(/[^a-z0-9_-]/g, '');
            $(this).closest('td').find('.asl-code-preview').text(val || 'code');
        });

        $('#asl-influencer-search').on('input', function() {
            var q = $(this).val().toLowerCase();
            $('.asl-influencer-row').each(function() {
                var name = ($(this).data('name') || '').toLowerCase();
                var code = ($(this).data('code') || '').toLowerCase();
                $(this).toggle(name.indexOf(q) !== -1 || code.indexOf(q) !== -1 || q === '');
            });
        });
    });
    </script>
    <?php
}

/**
 * Render a single influencer row
 */
function asl_influencer_render_row($index, $influencer) {
    $id = isset($influencer['id']) ? $influencer['id'] : '';
    $active = isset($influencer['active']) ? $influencer['active'] : true;
    $name = isset($influencer['name']) ? $influencer['name'] : '';
    $code = isset($influencer['code']) ? $influencer['code'] : '';
    $platform = isset($influencer['platform']) ? $influencer['platform'] : 'instagram';
    $email = isset($influencer['email']) ? $influencer['email'] : '';
    $notes = isset($influencer['notes']) ? $influencer['notes'] : '';
    $commission_rate = isset($influencer['commission_rate']) ? $influencer['commission_rate'] : '';
    $fixed_amount = isset($influencer['fixed_amount']) ? $influencer['fixed_amount'] : '';
    $created_at = isset($influencer['created_at']) ? $influencer['created_at'] : '';
    $platforms = array('instagram' => 'Instagram', 'tiktok' => 'TikTok', 'youtube' => 'YouTube', 'snapchat' => 'Snapchat', 'facebook' => 'Facebook', 'twitter' => 'Twitter/X', 'other' => 'Other');
    $site_url = get_option('asl_frontend_url', home_url());
    ?>
    <div class="asl-influencer-row" data-name="<?php echo esc_attr($name); ?>" data-code="<?php echo esc_attr($code); ?>">
        <h3>
            Influencer #<?php echo $index + 1; ?>
            <?php if ($name): ?><span style="font-weight:400;color:#646970;font-size:12px;margin-left:8px;"><?php echo esc_html($name); ?></span><?php endif; ?>
            <button type="button" class="button asl-btn-remove asl-remove-influencer">Remove</button>
        </h3>
        <input type="hidden" name="asl_influencers[<?php echo $index; ?>][id]" value="<?php echo esc_attr($id); ?>">
        <input type="hidden" name="asl_influencers[<?php echo $index; ?>][created_at]" value="<?php echo esc_attr($created_at); ?>">
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
                    <input type="text" name="asl_influencers[<?php echo $index; ?>][code]" value="<?php echo esc_attr($code); ?>" class="regular-text asl-code-input" placeholder="e.g., ahmed" pattern="[a-z0-9_-]+" title="Lowercase letters, numbers, hyphens and underscores only">
                    <p class="description">Lowercase, no spaces. URL: <code><?php echo esc_html($site_url); ?>/?ref=<span class="asl-code-preview"><?php echo esc_html($code ?: 'code'); ?></span></code>
                    <?php if ($code): ?>
                    <button type="button" class="asl-btn-copy" data-url="<?php echo esc_attr($site_url . '/?ref=' . $code); ?>">Copy URL</button>
                    <?php endif; ?>
                    </p>
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
                <th>Email</th>
                <td>
                    <input type="email" name="asl_influencers[<?php echo $index; ?>][email]" value="<?php echo esc_attr($email); ?>" class="regular-text" placeholder="e.g., ahmed@example.com">
                    <p class="description">Contact email for this influencer</p>
                </td>
            </tr>
            <tr>
                <th>Commission %</th>
                <td>
                    <input type="number" step="0.01" min="0" max="100" name="asl_influencers[<?php echo $index; ?>][commission_rate]" value="<?php echo esc_attr($commission_rate); ?>" class="small-text" placeholder="e.g., 10">
                    <p class="description">Percentage of each sale paid to this influencer</p>
                </td>
            </tr>
            <tr>
                <th>Fixed Amount (<?php echo esc_html(function_exists('get_woocommerce_currency') ? get_woocommerce_currency() : 'AED'); ?>)</th>
                <td>
                    <input type="number" step="0.01" min="0" name="asl_influencers[<?php echo $index; ?>][fixed_amount]" value="<?php echo esc_attr($fixed_amount); ?>" class="regular-text" placeholder="e.g., 5000">
                    <p class="description">One-time or monthly fixed payment to this influencer</p>
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
        echo '<div style="text-align:center;padding:40px;color:#787c82;">';
        echo '<p style="font-size:16px;">No influencers configured yet.</p>';
        echo '<p>Add influencers in the <a href="?page=ep-influencer-tracking&tab=influencers">Influencers tab</a> first.</p>';
        echo '</div>';
        return;
    }

    $date_from = isset($_GET['date_from']) ? sanitize_text_field($_GET['date_from']) : '';
    $date_to = isset($_GET['date_to']) ? sanitize_text_field($_GET['date_to']) : '';

    $site_url = get_option('asl_frontend_url', home_url());
    $wc_currency = function_exists('get_woocommerce_currency') ? get_woocommerce_currency() : 'AED';
    $currency_symbol = function_exists('get_woocommerce_currency_symbol') ? get_woocommerce_currency_symbol($wc_currency) : 'AED';

    ?>
    <form method="get" class="asl-date-filter">
        <input type="hidden" name="page" value="ep-influencer-tracking">
        <input type="hidden" name="tab" value="stats">
        <label>From:</label>
        <input type="date" name="date_from" value="<?php echo esc_attr($date_from); ?>">
        <label>To:</label>
        <input type="date" name="date_to" value="<?php echo esc_attr($date_to); ?>">
        <button type="submit" class="button button-primary">Filter</button>
        <?php if ($date_from || $date_to): ?>
        <a href="?page=ep-influencer-tracking&tab=stats" class="button">Clear Filters</a>
        <?php endif; ?>
        <span style="margin-left:auto;">
            <a href="<?php echo esc_url(admin_url('admin.php?page=ep-influencer-tracking&action=export_csv&tab=stats' . ($date_from ? '&date_from=' . $date_from : '') . ($date_to ? '&date_to=' . $date_to : '') . '&_wpnonce=' . wp_create_nonce('asl_export_csv'))); ?>" class="button">Export CSV</a>
        </span>
    </form>
    <?php

    $grand_total_visits = 0;
    $grand_unique_visits = 0;
    $grand_total_orders = 0;
    $grand_total_revenue = 0;
    $grand_total_gifts = 0;
    $grand_total_cost = 0;

    $influencer_stats = array();
    foreach ($influencers as $influencer) {
        $code = $influencer['code'];
        $visit_list = isset($visits[$code]) ? $visits[$code] : array();

        if ($date_from || $date_to) {
            $visit_list = array_filter($visit_list, function($v) use ($date_from, $date_to) {
                $ts = strtotime($v['timestamp']);
                if ($date_from && $ts < strtotime($date_from)) return false;
                if ($date_to && $ts > strtotime($date_to . ' 23:59:59')) return false;
                return true;
            });
        }
        $visit_count = count($visit_list);

        // Count unique visits by distinct IP addresses
        $unique_ips = array();
        foreach ($visit_list as $v) {
            if (!empty($v['ip'])) {
                $unique_ips[$v['ip']] = true;
            }
        }
        $unique_visit_count = count($unique_ips);

        $commission_rate = isset($influencer['commission_rate']) ? floatval($influencer['commission_rate']) : 0;
        $fixed_amount = isset($influencer['fixed_amount']) ? floatval($influencer['fixed_amount']) : 0;

        $orders = asl_influencer_get_orders_by_ref($code, $date_from, $date_to);
        $total_revenue = 0;
        $order_count = count($orders);
        $cities = array();
        $countries = array();
        $free_gift_count = 0;
        $order_details = array();
        $products_sold = array();

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
                $product_name = $item->get_name();
                if ($product && floatval($product->get_price()) == 0) {
                    $has_gift = true;
                    $free_gift_count++;
                } else {
                    $products_sold[$product_name] = isset($products_sold[$product_name]) ? $products_sold[$product_name] + $item->get_quantity() : $item->get_quantity();
                }
            }

            $landing = '';
            $visit_date_val = '';
            foreach ($order->get_meta_data() as $meta) {
                if ($meta->key === '_influencer_landing_page') $landing = $meta->value;
                if ($meta->key === '_influencer_visit_date') $visit_date_val = $meta->value;
            }

            $order_commission = ($commission_rate / 100) * $order_total;

            $order_details[] = array(
                'id' => $order->get_id(),
                'date' => $order->get_date_created() ? $order->get_date_created()->date('Y-m-d H:i') : '',
                'status' => $order->get_status(),
                'total' => $order_total,
                'commission' => $order_commission,
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
        arsort($products_sold);

        $conversion_rate = $unique_visit_count > 0 ? round(($order_count / $unique_visit_count) * 100, 1) : 0;
        $avg_order_value = $order_count > 0 ? round($total_revenue / $order_count, 2) : 0;

        $total_commission = ($commission_rate / 100) * $total_revenue;
        $total_cost = $total_commission + $fixed_amount;
        $profit = $total_revenue - $total_cost;
        $roi = $total_cost > 0 ? round((($total_revenue - $total_cost) / $total_cost) * 100, 1) : ($total_revenue > 0 ? 999 : 0);

        $grand_total_visits += $visit_count;
        $grand_unique_visits += $unique_visit_count;
        $grand_total_orders += $order_count;
        $grand_total_revenue += $total_revenue;
        $grand_total_gifts += $free_gift_count;
        $grand_total_cost += $total_cost;

        $influencer_stats[] = array(
            'name' => $influencer['name'],
            'code' => $code,
            'platform' => $influencer['platform'],
            'active' => !empty($influencer['active']),
            'email' => isset($influencer['email']) ? $influencer['email'] : '',
            'visits' => $visit_count,
            'unique_visits' => $unique_visit_count,
            'orders' => $order_count,
            'revenue' => $total_revenue,
            'free_gifts' => $free_gift_count,
            'conversion_rate' => $conversion_rate,
            'avg_order_value' => $avg_order_value,
            'commission_rate' => $commission_rate,
            'fixed_amount' => $fixed_amount,
            'total_commission' => $total_commission,
            'total_cost' => $total_cost,
            'profit' => $profit,
            'roi' => $roi,
            'top_cities' => array_slice($cities, 0, 5, true),
            'top_countries' => array_slice($countries, 0, 5, true),
            'top_products' => array_slice($products_sold, 0, 5, true),
            'order_details' => $order_details,
            'tracking_url' => $site_url . '/?ref=' . $code,
        );
    }

    $grand_profit = $grand_total_revenue - $grand_total_cost;
    $grand_roi = $grand_total_cost > 0 ? round((($grand_total_revenue - $grand_total_cost) / $grand_total_cost) * 100, 1) : 0;

    ?>
    <h2 style="margin-top:0;margin-bottom:12px;">Performance Overview
    <?php if ($date_from || $date_to): ?>
        <span style="font-size:12px;color:#787c82;font-weight:400;">
            (<?php echo $date_from ? esc_html($date_from) : 'Start'; ?> &mdash; <?php echo $date_to ? esc_html($date_to) : 'Now'; ?>)
        </span>
    <?php endif; ?>
    </h2>

    <div class="asl-kpi-grid">
        <div class="asl-kpi-card asl-kpi-blue">
            <div class="asl-kpi-value"><?php echo number_format($grand_unique_visits); ?></div>
            <div class="asl-kpi-label">Unique Visits</div>
            <?php if ($grand_total_visits !== $grand_unique_visits): ?>
            <div style="font-size:10px;color:#787c82;margin-top:2px;"><?php echo number_format($grand_total_visits); ?> total</div>
            <?php endif; ?>
        </div>
        <div class="asl-kpi-card asl-kpi-green">
            <div class="asl-kpi-value"><?php echo number_format($grand_total_orders); ?></div>
            <div class="asl-kpi-label">Total Orders</div>
        </div>
        <div class="asl-kpi-card asl-kpi-gold">
            <div class="asl-kpi-value"><?php echo esc_html($currency_symbol); ?> <?php echo number_format($grand_total_revenue, 2); ?></div>
            <div class="asl-kpi-label">Total Revenue</div>
        </div>
        <div class="asl-kpi-card asl-kpi-pink">
            <div class="asl-kpi-value"><?php echo number_format($grand_total_gifts); ?></div>
            <div class="asl-kpi-label">Free Gifts</div>
        </div>
        <div class="asl-kpi-card asl-kpi-purple">
            <div class="asl-kpi-value"><?php echo $grand_unique_visits > 0 ? round(($grand_total_orders / $grand_unique_visits) * 100, 1) : 0; ?>%</div>
            <div class="asl-kpi-label">Conversion Rate</div>
        </div>
        <div class="asl-kpi-card asl-kpi-red">
            <div class="asl-kpi-value"><?php echo esc_html($currency_symbol); ?> <?php echo number_format($grand_total_cost, 2); ?></div>
            <div class="asl-kpi-label">Total Cost</div>
        </div>
        <div class="asl-kpi-card <?php echo $grand_profit >= 0 ? 'asl-kpi-green' : 'asl-kpi-red'; ?>">
            <div class="asl-kpi-value" style="color:<?php echo $grand_profit >= 0 ? '#00a32a' : '#d63638'; ?>;"><?php echo esc_html($currency_symbol); ?> <?php echo number_format($grand_profit, 2); ?></div>
            <div class="asl-kpi-label">Net Profit</div>
        </div>
        <div class="asl-kpi-card <?php echo $grand_roi >= 0 ? 'asl-kpi-green' : 'asl-kpi-red'; ?>">
            <div class="asl-kpi-value" style="color:<?php echo $grand_roi >= 0 ? '#00a32a' : '#d63638'; ?>;"><?php echo number_format($grand_roi, 1); ?>%</div>
            <div class="asl-kpi-label">Overall ROI</div>
        </div>
    </div>

    <div class="asl-section-header">
        <h3>Influencer Summary</h3>
    </div>
    <table class="asl-summary-table">
        <thead>
            <tr>
                <th>Influencer</th>
                <th>Code</th>
                <th>Platform</th>
                <th>Status</th>
                <th>Unique Visits</th>
                <th>Orders</th>
                <th>Revenue</th>
                <th>Avg Order</th>
                <th>Conv %</th>
                <th>Comm %</th>
                <th>Commission</th>
                <th>Fixed Cost</th>
                <th>Total Cost</th>
                <th>Profit</th>
                <th>ROI</th>
            </tr>
        </thead>
        <tbody>
            <?php foreach ($influencer_stats as $stat): ?>
            <tr>
                <td><strong><?php echo esc_html($stat['name']); ?></strong></td>
                <td><code style="font-size:11px;background:#f0f0f1;padding:2px 6px;border-radius:3px;"><?php echo esc_html($stat['code']); ?></code></td>
                <td><span class="asl-platform asl-platform-<?php echo esc_attr($stat['platform']); ?>"><?php echo esc_html(ucfirst($stat['platform'])); ?></span></td>
                <td><?php echo $stat['active'] ? '<span class="asl-badge asl-badge-active">Active</span>' : '<span class="asl-badge asl-badge-inactive">Inactive</span>'; ?></td>
                <td><?php echo number_format($stat['unique_visits']); ?><?php if ($stat['visits'] !== $stat['unique_visits']): ?> <span style="color:#787c82;font-size:11px;">(<?php echo number_format($stat['visits']); ?> total)</span><?php endif; ?></td>
                <td><?php echo number_format($stat['orders']); ?></td>
                <td><?php echo esc_html($currency_symbol); ?> <?php echo number_format($stat['revenue'], 2); ?></td>
                <td><?php echo esc_html($currency_symbol); ?> <?php echo number_format($stat['avg_order_value'], 2); ?></td>
                <td><?php echo $stat['conversion_rate']; ?>%</td>
                <td><?php echo $stat['commission_rate'] > 0 ? $stat['commission_rate'] . '%' : '&mdash;'; ?></td>
                <td><?php echo esc_html($currency_symbol); ?> <?php echo number_format($stat['total_commission'], 2); ?></td>
                <td><?php echo $stat['fixed_amount'] > 0 ? esc_html($currency_symbol) . ' ' . number_format($stat['fixed_amount'], 2) : '&mdash;'; ?></td>
                <td><strong><?php echo esc_html($currency_symbol); ?> <?php echo number_format($stat['total_cost'], 2); ?></strong></td>
                <td class="<?php echo $stat['profit'] >= 0 ? 'asl-positive' : 'asl-negative'; ?>"><?php echo esc_html($currency_symbol); ?> <?php echo number_format($stat['profit'], 2); ?></td>
                <td>
                    <?php if ($stat['total_cost'] > 0): ?>
                        <span class="<?php echo $stat['roi'] >= 0 ? 'asl-positive' : 'asl-negative'; ?>"><?php echo number_format($stat['roi'], 1); ?>%</span>
                    <?php else: ?>
                        <span style="color:#a7aaad;">&mdash;</span>
                    <?php endif; ?>
                </td>
            </tr>
            <?php endforeach; ?>
        </tbody>
    </table>

    <div class="asl-section-header" style="margin-top:30px;">
        <h3>Influencer Details</h3>
        <span class="asl-hint">Click an influencer to expand</span>
    </div>

    <?php foreach ($influencer_stats as $idx => $stat): ?>
    <div class="asl-accordion">
        <div class="asl-accordion-header" data-target="asl-detail-<?php echo $idx; ?>">
            <div class="asl-accordion-left">
                <span class="asl-arrow">&#9654;</span>
                <strong style="font-size:14px;color:#1d2327;"><?php echo esc_html($stat['name']); ?></strong>
                <span class="asl-platform asl-platform-<?php echo esc_attr($stat['platform']); ?>"><?php echo esc_html(ucfirst($stat['platform'])); ?></span>
                <code style="font-size:11px;background:#f0f0f1;padding:2px 6px;border-radius:3px;"><?php echo esc_html($stat['code']); ?></code>
                <?php echo $stat['active'] ? '<span class="asl-badge asl-badge-active">Active</span>' : '<span class="asl-badge asl-badge-inactive">Inactive</span>'; ?>
            </div>
            <div class="asl-accordion-right">
                <span><strong><?php echo number_format($stat['unique_visits']); ?></strong> visits</span>
                <span><strong><?php echo number_format($stat['orders']); ?></strong> orders</span>
                <span><strong><?php echo esc_html($currency_symbol); ?> <?php echo number_format($stat['revenue'], 2); ?></strong></span>
                <span class="<?php echo $stat['profit'] >= 0 ? 'asl-positive' : 'asl-negative'; ?>">
                    <?php echo $stat['profit'] >= 0 ? '+' : ''; ?><?php echo esc_html($currency_symbol); ?> <?php echo number_format($stat['profit'], 2); ?>
                </span>
                <?php if ($stat['total_cost'] > 0): ?>
                <span class="<?php echo $stat['roi'] >= 0 ? 'asl-positive' : 'asl-negative'; ?>"><?php echo number_format($stat['roi'], 1); ?>% ROI</span>
                <?php endif; ?>
            </div>
        </div>
        <div id="asl-detail-<?php echo $idx; ?>" class="asl-accordion-body">
            <div class="asl-tracking-url">
                <label style="font-size:12px;color:#646970;">Tracking URL:</label>
                <input type="text" value="<?php echo esc_attr($stat['tracking_url']); ?>" readonly onclick="this.select();">
                <button type="button" class="asl-btn-copy" data-url="<?php echo esc_attr($stat['tracking_url']); ?>">Copy</button>
            </div>

            <div class="asl-detail-cards">
                <div class="asl-detail-card">
                    <div class="asl-detail-card-value"><?php echo number_format($stat['unique_visits']); ?></div>
                    <div class="asl-detail-card-label">Unique Visits</div>
                    <?php if ($stat['visits'] !== $stat['unique_visits']): ?>
                    <div style="font-size:10px;color:#787c82;margin-top:2px;"><?php echo number_format($stat['visits']); ?> total</div>
                    <?php endif; ?>
                </div>
                <div class="asl-detail-card">
                    <div class="asl-detail-card-value"><?php echo number_format($stat['orders']); ?></div>
                    <div class="asl-detail-card-label">Orders</div>
                </div>
                <div class="asl-detail-card">
                    <div class="asl-detail-card-value"><?php echo esc_html($currency_symbol); ?> <?php echo number_format($stat['revenue'], 2); ?></div>
                    <div class="asl-detail-card-label">Revenue</div>
                </div>
                <div class="asl-detail-card">
                    <div class="asl-detail-card-value"><?php echo esc_html($currency_symbol); ?> <?php echo number_format($stat['avg_order_value'], 2); ?></div>
                    <div class="asl-detail-card-label">Avg Order</div>
                </div>
                <div class="asl-detail-card">
                    <div class="asl-detail-card-value"><?php echo $stat['conversion_rate']; ?>%</div>
                    <div class="asl-detail-card-label">Conversion</div>
                </div>
                <div class="asl-detail-card">
                    <div class="asl-detail-card-value"><?php echo number_format($stat['free_gifts']); ?></div>
                    <div class="asl-detail-card-label">Free Gifts</div>
                </div>
            </div>

            <div class="asl-detail-cards">
                <div class="asl-cost-card" style="background:#fff5f5;border:1px solid #e6a8a8;">
                    <div class="asl-cost-card-value" style="color:#d63638;"><?php echo esc_html($currency_symbol); ?> <?php echo number_format($stat['total_cost'], 2); ?></div>
                    <div class="asl-cost-card-label">Total Cost</div>
                    <div class="asl-cost-card-sub">
                        <?php
                        $cost_parts = array();
                        if ($stat['commission_rate'] > 0) $cost_parts[] = $stat['commission_rate'] . '% comm = ' . $currency_symbol . ' ' . number_format($stat['total_commission'], 2);
                        if ($stat['fixed_amount'] > 0) $cost_parts[] = 'Fixed = ' . $currency_symbol . ' ' . number_format($stat['fixed_amount'], 2);
                        echo !empty($cost_parts) ? esc_html(implode(' + ', $cost_parts)) : 'No cost set';
                        ?>
                    </div>
                </div>
                <div class="asl-cost-card" style="background:<?php echo $stat['profit'] >= 0 ? '#edf8ee' : '#fff5f5'; ?>;border:1px solid <?php echo $stat['profit'] >= 0 ? '#b8dab8' : '#e6a8a8'; ?>;">
                    <div class="asl-cost-card-value" style="color:<?php echo $stat['profit'] >= 0 ? '#00a32a' : '#d63638'; ?>;"><?php echo esc_html($currency_symbol); ?> <?php echo number_format($stat['profit'], 2); ?></div>
                    <div class="asl-cost-card-label">Net Profit</div>
                </div>
                <div class="asl-cost-card" style="background:<?php echo $stat['roi'] >= 0 ? '#edf8ee' : '#fff5f5'; ?>;border:1px solid <?php echo $stat['roi'] >= 0 ? '#b8dab8' : '#e6a8a8'; ?>;">
                    <div class="asl-cost-card-value" style="color:<?php echo $stat['roi'] >= 0 ? '#00a32a' : '#d63638'; ?>;">
                        <?php echo $stat['total_cost'] > 0 ? number_format($stat['roi'], 1) . '%' : '&mdash;'; ?>
                    </div>
                    <div class="asl-cost-card-label">ROI</div>
                </div>
            </div>

            <?php if (!empty($stat['top_cities']) || !empty($stat['top_products'])): ?>
            <div class="asl-side-tables">
                <?php if (!empty($stat['top_cities'])): ?>
                <div>
                    <h4>Top Cities</h4>
                    <table class="widefat" style="width:auto;">
                        <?php foreach ($stat['top_cities'] as $city_name => $city_count): ?>
                        <tr><td><?php echo esc_html($city_name); ?></td><td><strong><?php echo intval($city_count); ?></strong> orders</td></tr>
                        <?php endforeach; ?>
                    </table>
                </div>
                <?php endif; ?>
                <?php if (!empty($stat['top_countries'])): ?>
                <div>
                    <h4>Top Countries</h4>
                    <table class="widefat" style="width:auto;">
                        <?php foreach ($stat['top_countries'] as $country_name => $country_count): ?>
                        <tr><td><?php echo esc_html($country_name); ?></td><td><strong><?php echo intval($country_count); ?></strong> orders</td></tr>
                        <?php endforeach; ?>
                    </table>
                </div>
                <?php endif; ?>
                <?php if (!empty($stat['top_products'])): ?>
                <div>
                    <h4>Top Products</h4>
                    <table class="widefat" style="width:auto;">
                        <?php foreach ($stat['top_products'] as $prod_name => $prod_count): ?>
                        <tr><td><?php echo esc_html($prod_name); ?></td><td><strong><?php echo intval($prod_count); ?></strong> sold</td></tr>
                        <?php endforeach; ?>
                    </table>
                </div>
                <?php endif; ?>
            </div>
            <?php endif; ?>

            <?php if (!empty($stat['order_details'])): ?>
            <h4 style="margin:0 0 8px;font-size:13px;color:#1d2327;">
                Orders (<?php echo count($stat['order_details']); ?> total, <?php echo esc_html($currency_symbol); ?> <?php echo number_format($stat['revenue'], 2); ?> revenue)
            </h4>
            <div style="overflow-x:auto;">
            <table class="asl-orders-table">
                <thead>
                    <tr>
                        <th>Order #</th>
                        <th>Date</th>
                        <th>Status</th>
                        <th>Customer</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Amount</th>
                        <th>Commission</th>
                        <th>Items</th>
                        <th>City</th>
                        <th>Country</th>
                        <th>Payment</th>
                        <th>Gift</th>
                        <th>Landing Page</th>
                    </tr>
                </thead>
                <tbody>
                    <?php foreach ($stat['order_details'] as $od): ?>
                    <tr>
                        <td><a href="<?php echo esc_url(admin_url('post.php?post=' . $od['id'] . '&action=edit')); ?>">#<?php echo intval($od['id']); ?></a></td>
                        <td><?php echo esc_html($od['date']); ?></td>
                        <td><span class="asl-badge asl-badge-<?php echo esc_attr($od['status']); ?>"><?php echo esc_html(ucfirst($od['status'])); ?></span></td>
                        <td><?php echo esc_html($od['customer']); ?></td>
                        <td style="font-size:11px;"><?php echo esc_html($od['email']); ?></td>
                        <td style="font-size:11px;"><?php echo esc_html($od['phone']); ?></td>
                        <td><strong><?php echo esc_html($currency_symbol); ?> <?php echo number_format($od['total'], 2); ?></strong></td>
                        <td style="color:#d63638;"><?php echo esc_html($currency_symbol); ?> <?php echo number_format($od['commission'], 2); ?></td>
                        <td><?php echo intval($od['items']); ?></td>
                        <td><?php echo esc_html($od['city']); ?></td>
                        <td><?php echo esc_html($od['country']); ?></td>
                        <td><?php echo esc_html($od['payment']); ?></td>
                        <td><?php echo $od['has_gift'] ? '<span class="asl-badge asl-badge-active">Yes</span>' : '<span style="color:#c3c4c7;">No</span>'; ?></td>
                        <td style="font-size:11px;"><?php echo esc_html($od['landing_page'] ?: '—'); ?></td>
                    </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
            </div>
            <?php else: ?>
            <p style="color:#a7aaad;font-style:italic;">No orders yet for this influencer.</p>
            <?php endif; ?>
        </div>
    </div>
    <?php endforeach; ?>

    <script>
    jQuery(document).ready(function($) {
        $('.asl-accordion-header').on('click', function() {
            var target = $('#' + $(this).data('target'));
            var header = $(this);
            if (target.is(':visible')) {
                target.slideUp(200);
                header.removeClass('asl-open');
            } else {
                target.slideDown(200);
                header.addClass('asl-open');
            }
        });

        $(document).on('click', '.asl-btn-copy', function(e) {
            e.stopPropagation();
            var btn = $(this);
            var url = btn.data('url');
            if (navigator.clipboard) {
                navigator.clipboard.writeText(url).then(function() {
                    btn.text('Copied!').addClass('copied');
                    setTimeout(function() { btn.text('Copy').removeClass('copied'); }, 2000);
                });
            } else {
                var input = $('<input>').val(url).appendTo('body').select();
                document.execCommand('copy');
                input.remove();
                btn.text('Copied!').addClass('copied');
                setTimeout(function() { btn.text('Copy').removeClass('copied'); }, 2000);
            }
        });
    });
    </script>
    <?php
}

/**
 * Render Visit Log tab
 */
function asl_influencer_render_visits_tab() {
    $visits = get_option('asl_influencer_visits', array());
    $influencers = get_option('asl_influencers', array());
    $influencer_names = array();
    foreach ($influencers as $inf) {
        $influencer_names[$inf['code']] = $inf['name'];
    }

    $filter_code = isset($_GET['filter_code']) ? sanitize_text_field($_GET['filter_code']) : '';

    $all_visits = array();
    foreach ($visits as $code => $code_visits) {
        if ($filter_code && $filter_code !== $code) continue;
        foreach ($code_visits as $v) {
            $all_visits[] = array_merge($v, array('code' => $code));
        }
    }

    usort($all_visits, function($a, $b) {
        return strtotime($b['timestamp']) - strtotime($a['timestamp']);
    });

    $per_page = 50;
    $current_page = isset($_GET['vpage']) ? max(1, intval($_GET['vpage'])) : 1;
    $total = count($all_visits);
    $total_pages = max(1, ceil($total / $per_page));
    $paged_visits = array_slice($all_visits, ($current_page - 1) * $per_page, $per_page);

    ?>
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;flex-wrap:wrap;gap:10px;">
        <h2 style="margin:0;">Visit Log <span style="font-size:12px;color:#787c82;font-weight:400;">(<?php echo number_format($total); ?> total visits)</span></h2>
        <div style="display:flex;gap:8px;align-items:center;">
            <form method="get" style="display:flex;gap:6px;align-items:center;">
                <input type="hidden" name="page" value="ep-influencer-tracking">
                <input type="hidden" name="tab" value="visits">
                <select name="filter_code" style="padding:4px 8px;">
                    <option value="">All Influencers</option>
                    <?php foreach ($influencers as $inf): ?>
                    <option value="<?php echo esc_attr($inf['code']); ?>" <?php selected($filter_code, $inf['code']); ?>><?php echo esc_html($inf['name'] . ' (' . $inf['code'] . ')'); ?></option>
                    <?php endforeach; ?>
                </select>
                <button type="submit" class="button">Filter</button>
            </form>
        </div>
    </div>

    <?php if (!empty($influencers)): ?>
    <form method="post" style="margin-bottom:16px;">
        <?php wp_nonce_field('asl_clear_visits_nonce'); ?>
        <div style="display:flex;gap:6px;align-items:center;">
            <select name="clear_code" style="padding:4px 8px;">
                <option value="__all__">All Visits</option>
                <?php foreach ($influencers as $inf): ?>
                <option value="<?php echo esc_attr($inf['code']); ?>"><?php echo esc_html($inf['name'] . ' (' . $inf['code'] . ')'); ?></option>
                <?php endforeach; ?>
            </select>
            <button type="submit" name="asl_clear_visits" class="button" onclick="return confirm('Are you sure you want to clear this visit data? This cannot be undone.');">Clear Visits</button>
        </div>
    </form>
    <?php endif; ?>

    <?php if (empty($paged_visits)): ?>
        <p style="text-align:center;padding:40px;color:#787c82;">No visits recorded yet.</p>
    <?php else: ?>
    <table class="asl-visit-table">
        <thead>
            <tr>
                <th>#</th>
                <th>Influencer</th>
                <th>Code</th>
                <th>Timestamp</th>
                <th>Landing Page</th>
                <th>IP Address</th>
                <th>User Agent</th>
            </tr>
        </thead>
        <tbody>
            <?php
            $row_num = ($current_page - 1) * $per_page;
            foreach ($paged_visits as $v):
                $row_num++;
            ?>
            <tr>
                <td><?php echo $row_num; ?></td>
                <td><strong><?php echo esc_html(isset($influencer_names[$v['code']]) ? $influencer_names[$v['code']] : $v['code']); ?></strong></td>
                <td><code style="font-size:11px;"><?php echo esc_html($v['code']); ?></code></td>
                <td><?php echo esc_html($v['timestamp']); ?></td>
                <td style="max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;"><?php echo esc_html(isset($v['landing_page']) ? $v['landing_page'] : ''); ?></td>
                <td><?php echo esc_html(isset($v['ip']) ? $v['ip'] : ''); ?></td>
                <td style="max-width:300px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:11px;" title="<?php echo esc_attr(isset($v['user_agent']) ? $v['user_agent'] : ''); ?>"><?php echo esc_html(isset($v['user_agent']) ? $v['user_agent'] : ''); ?></td>
            </tr>
            <?php endforeach; ?>
        </tbody>
    </table>

    <?php if ($total_pages > 1): ?>
    <div style="margin-top:16px;display:flex;justify-content:center;gap:4px;">
        <?php for ($p = 1; $p <= $total_pages; $p++): ?>
            <?php if ($p === $current_page): ?>
                <span class="button button-primary" style="pointer-events:none;"><?php echo $p; ?></span>
            <?php else: ?>
                <a href="?page=ep-influencer-tracking&tab=visits<?php echo $filter_code ? '&filter_code=' . esc_attr($filter_code) : ''; ?>&vpage=<?php echo $p; ?>" class="button"><?php echo $p; ?></a>
            <?php endif; ?>
        <?php endfor; ?>
    </div>
    <?php endif; ?>
    <?php endif; ?>
    <?php
}

/**
 * Render Link Generator tab
 */
function asl_influencer_render_linkgen_tab() {
    $influencers = get_option('asl_influencers', array());
    $site_url = get_option('asl_frontend_url', home_url());
    $generated_links = get_option('asl_influencer_generated_links', array());

    if (empty($influencers)) {
        echo '<div style="text-align:center;padding:40px;color:#787c82;">';
        echo '<p style="font-size:16px;">No influencers configured yet.</p>';
        echo '<p>Add influencers in the <a href="?page=ep-influencer-tracking&tab=influencers">Influencers tab</a> first.</p>';
        echo '</div>';
        return;
    }

    if (isset($_POST['asl_generate_link']) && check_admin_referer('asl_linkgen_nonce')) {
        $gen_code = sanitize_text_field($_POST['gen_influencer'] ?? '');
        $gen_type = sanitize_text_field($_POST['gen_type'] ?? 'home');
        $gen_custom = sanitize_text_field($_POST['gen_custom_url'] ?? '');

        if (!empty($gen_code)) {
            $landing_url = $site_url;
            switch ($gen_type) {
                case 'custom':
                    if (!empty($gen_custom)) {
                        $gen_custom = ltrim($gen_custom, '/');
                        if (preg_match('#^https?://#i', $gen_custom) && filter_var($gen_custom, FILTER_VALIDATE_URL)) {
                            $landing_url = $gen_custom;
                        } else {
                            $landing_url = rtrim($site_url, '/') . '/' . $gen_custom;
                        }
                    }
                    break;
                default:
                    $landing_url = $site_url;
                    break;
            }

            $separator = (strpos($landing_url, '?') !== false) ? '&' : '?';
            $full_url = $landing_url . $separator . 'ref=' . $gen_code;

            $inf_name = '';
            foreach ($influencers as $inf) {
                if ($inf['code'] === $gen_code) {
                    $inf_name = $inf['name'];
                    break;
                }
            }

            $new_link = array(
                'timestamp' => current_time('mysql'),
                'influencer' => $inf_name,
                'code' => $gen_code,
                'type' => $gen_type,
                'landing_page' => $landing_url,
                'full_url' => $full_url,
            );

            array_unshift($generated_links, $new_link);
            $generated_links = array_slice($generated_links, 0, 100);
            update_option('asl_influencer_generated_links', $generated_links);

            echo '<div class="notice notice-success is-dismissible"><p>Tracking link generated successfully!</p></div>';
        }
    }

    $last_url = !empty($generated_links) ? $generated_links[0]['full_url'] : '';

    ?>
    <div class="asl-link-gen">
        <h3>Generate Tracking Link</h3>
        <p class="description" style="margin-bottom:16px;">Create custom tracking links for any landing page. The <code>?ref=CODE</code> parameter will be appended automatically.</p>

        <form method="post">
            <?php wp_nonce_field('asl_linkgen_nonce'); ?>

            <div class="asl-gen-row">
                <div class="asl-gen-field">
                    <label for="gen-influencer">Influencer</label>
                    <select name="gen_influencer" id="gen-influencer">
                        <option value="">— Select Influencer —</option>
                        <?php foreach ($influencers as $inf): ?>
                            <?php if (!empty($inf['active'])): ?>
                            <option value="<?php echo esc_attr($inf['code']); ?>"><?php echo esc_html($inf['name'] . ' (' . $inf['code'] . ')'); ?></option>
                            <?php endif; ?>
                        <?php endforeach; ?>
                        <optgroup label="Inactive">
                        <?php foreach ($influencers as $inf): ?>
                            <?php if (empty($inf['active'])): ?>
                            <option value="<?php echo esc_attr($inf['code']); ?>"><?php echo esc_html($inf['name'] . ' (' . $inf['code'] . ')'); ?></option>
                            <?php endif; ?>
                        <?php endforeach; ?>
                        </optgroup>
                    </select>
                </div>

                <div class="asl-gen-field">
                    <label for="gen-type">Landing Page Type</label>
                    <select name="gen_type" id="gen-type">
                        <option value="home">Home Page</option>
                        <option value="custom">Custom URL / Path</option>
                    </select>
                </div>

                <div class="asl-gen-field" id="gen-custom-wrap" style="display:none;">
                    <label for="gen-custom-url">URL or Path</label>
                    <input type="text" name="gen_custom_url" id="gen-custom-url" placeholder="e.g., shop/oud or https://example.com/product" style="min-width:350px;">
                </div>

                <div class="asl-gen-field">
                    <button type="submit" name="asl_generate_link" class="button button-primary" style="height:34px;">Generate Link</button>
                </div>
            </div>
        </form>

        <div class="asl-gen-result<?php echo $last_url ? ' asl-visible' : ''; ?>" id="gen-result">
            <label>Generated Tracking URL</label>
            <div class="asl-gen-url-wrap">
                <input type="text" id="gen-result-url" value="<?php echo esc_attr($last_url); ?>" readonly onclick="this.select();">
                <button type="button" class="button asl-btn-copy" data-url="<?php echo esc_attr($last_url); ?>" id="gen-copy-btn">Copy URL</button>
            </div>
        </div>
    </div>

    <?php if (!empty($generated_links)): ?>
    <div class="asl-gen-history">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
            <h4 style="margin:0;">Recently Generated Links <span style="font-size:12px;color:#787c82;font-weight:400;">(<?php echo count($generated_links); ?> links)</span></h4>
        </div>
        <table class="asl-gen-history-table">
            <thead>
                <tr>
                    <th>#</th>
                    <th>Date</th>
                    <th>Influencer</th>
                    <th>Code</th>
                    <th>Type</th>
                    <th>Landing Page</th>
                    <th>Full URL</th>
                    <th>Action</th>
                </tr>
            </thead>
            <tbody>
                <?php $n = 0; foreach ($generated_links as $gl): $n++; ?>
                <tr>
                    <td><?php echo $n; ?></td>
                    <td><?php echo esc_html($gl['timestamp']); ?></td>
                    <td><strong><?php echo esc_html($gl['influencer']); ?></strong></td>
                    <td><code style="font-size:11px;"><?php echo esc_html($gl['code']); ?></code></td>
                    <td><?php echo esc_html(ucfirst($gl['type'])); ?></td>
                    <td style="max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="<?php echo esc_attr($gl['landing_page']); ?>"><?php echo esc_html($gl['landing_page']); ?></td>
                    <td style="max-width:300px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-family:monospace;font-size:11px;" title="<?php echo esc_attr($gl['full_url']); ?>"><?php echo esc_html($gl['full_url']); ?></td>
                    <td><button type="button" class="asl-btn-copy" data-url="<?php echo esc_attr($gl['full_url']); ?>">Copy</button></td>
                </tr>
                <?php endforeach; ?>
            </tbody>
        </table>
    </div>
    <?php endif; ?>

    <script>
    jQuery(document).ready(function($) {
        var siteUrl = <?php echo wp_json_encode(rtrim($site_url, '/')); ?>;

        $('#gen-type').on('change', function() {
            if ($(this).val() === 'custom') {
                $('#gen-custom-wrap').show();
            } else {
                $('#gen-custom-wrap').hide();
                $('#gen-custom-url').val('');
            }
            updatePreview();
        });

        $('#gen-influencer, #gen-custom-url').on('input change', function() {
            updatePreview();
        });

        function updatePreview() {
            var code = $('#gen-influencer').val();
            if (!code) {
                $('#gen-result').removeClass('asl-visible');
                return;
            }
            var type = $('#gen-type').val();
            var landingUrl = siteUrl;
            if (type === 'custom') {
                var custom = $('#gen-custom-url').val().replace(/^\/+/, '');
                if (custom) {
                    var isFullUrl = false;
                    if (/^https?:\/\//.test(custom)) {
                        try { new URL(custom); isFullUrl = true; } catch(e) {}
                    }
                    if (isFullUrl) {
                        landingUrl = custom;
                    } else {
                        landingUrl = siteUrl + '/' + custom;
                    }
                }
            }
            var sep = landingUrl.indexOf('?') !== -1 ? '&' : '?';
            var fullUrl = landingUrl + sep + 'ref=' + code;
            $('#gen-result-url').val(fullUrl);
            $('#gen-copy-btn').data('url', fullUrl);
            $('#gen-result').addClass('asl-visible');
        }

        $(document).on('click', '.asl-btn-copy', function(e) {
            e.preventDefault();
            var btn = $(this);
            var url = btn.data('url');
            if (navigator.clipboard) {
                navigator.clipboard.writeText(url).then(function() {
                    btn.text('Copied!').addClass('copied');
                    setTimeout(function() { btn.text(btn.is('#gen-copy-btn') ? 'Copy URL' : 'Copy').removeClass('copied'); }, 2000);
                });
            } else {
                var input = $('<input>').val(url).appendTo('body').select();
                document.execCommand('copy');
                input.remove();
                btn.text('Copied!').addClass('copied');
                setTimeout(function() { btn.text(btn.is('#gen-copy-btn') ? 'Copy URL' : 'Copy').removeClass('copied'); }, 2000);
            }
        });
    });
    </script>
    <?php
}

/**
 * Render Activity Logs tab
 */
function asl_influencer_render_activity_tab() {
    $logs = get_option('asl_influencer_activity_logs', array());

    if (isset($_POST['asl_clear_activity_logs']) && check_admin_referer('asl_clear_activity_logs_nonce')) {
        update_option('asl_influencer_activity_logs', array());
        $logs = array();
        echo '<div class="notice notice-success is-dismissible"><p>Activity logs cleared.</p></div>';
    }

    $filter_action = isset($_GET['filter_action']) ? sanitize_text_field($_GET['filter_action']) : '';

    if ($filter_action) {
        $logs = array_filter($logs, function($log) use ($filter_action) {
            return $log['action'] === $filter_action;
        });
    }

    $per_page = 50;
    $current_page = isset($_GET['apage']) ? max(1, intval($_GET['apage'])) : 1;
    $total = count($logs);
    $total_pages = max(1, ceil($total / $per_page));
    $paged_logs = array_slice($logs, ($current_page - 1) * $per_page, $per_page);

    ?>
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;flex-wrap:wrap;gap:10px;">
        <h2 style="margin:0;">Activity Logs <span style="font-size:12px;color:#787c82;font-weight:400;">(<?php echo number_format($total); ?> entries)</span></h2>
        <div style="display:flex;gap:8px;align-items:center;">
            <form method="get" style="display:flex;gap:6px;align-items:center;">
                <input type="hidden" name="page" value="ep-influencer-tracking">
                <input type="hidden" name="tab" value="activity">
                <select name="filter_action" style="padding:4px 8px;">
                    <option value="">All Actions</option>
                    <option value="activated" <?php selected($filter_action, 'activated'); ?>>Activated</option>
                    <option value="deactivated" <?php selected($filter_action, 'deactivated'); ?>>Deactivated</option>
                    <option value="created" <?php selected($filter_action, 'created'); ?>>Created</option>
                    <option value="deleted" <?php selected($filter_action, 'deleted'); ?>>Deleted</option>
                    <option value="updated" <?php selected($filter_action, 'updated'); ?>>Updated</option>
                </select>
                <button type="submit" class="button">Filter</button>
                <?php if ($filter_action): ?>
                <a href="?page=ep-influencer-tracking&tab=activity" class="button">Clear</a>
                <?php endif; ?>
            </form>
        </div>
    </div>

    <?php if ($total > 0): ?>
    <form method="post" style="margin-bottom:16px;">
        <?php wp_nonce_field('asl_clear_activity_logs_nonce'); ?>
        <button type="submit" name="asl_clear_activity_logs" class="button" onclick="return confirm('Are you sure you want to clear all activity logs? This cannot be undone.');">Clear All Logs</button>
    </form>
    <?php endif; ?>

    <?php if (empty($paged_logs)): ?>
        <p style="text-align:center;padding:40px;color:#787c82;">No activity logs recorded yet.</p>
    <?php else: ?>
    <table class="asl-activity-table">
        <thead>
            <tr>
                <th>#</th>
                <th>Timestamp</th>
                <th>Action</th>
                <th>Influencer</th>
                <th>Code</th>
                <th>Details</th>
                <th>User</th>
            </tr>
        </thead>
        <tbody>
            <?php
            $row_num = ($current_page - 1) * $per_page;
            foreach ($paged_logs as $log):
                $row_num++;
                $action_class = 'asl-log-' . esc_attr($log['action']);
            ?>
            <tr>
                <td><?php echo $row_num; ?></td>
                <td><?php echo esc_html($log['timestamp']); ?></td>
                <td><span class="<?php echo $action_class; ?>"><?php echo esc_html(ucfirst($log['action'])); ?></span></td>
                <td><strong><?php echo esc_html($log['influencer_name']); ?></strong></td>
                <td><code style="font-size:11px;"><?php echo esc_html($log['influencer_code']); ?></code></td>
                <td style="max-width:300px;"><?php echo esc_html($log['details']); ?></td>
                <td><?php echo esc_html($log['user']); ?></td>
            </tr>
            <?php endforeach; ?>
        </tbody>
    </table>

    <?php if ($total_pages > 1): ?>
    <div style="margin-top:16px;display:flex;justify-content:center;gap:4px;">
        <?php for ($p = 1; $p <= $total_pages; $p++): ?>
            <?php if ($p === $current_page): ?>
                <span class="button button-primary" style="pointer-events:none;"><?php echo $p; ?></span>
            <?php else: ?>
                <a href="?page=ep-influencer-tracking&tab=activity<?php echo $filter_action ? '&filter_action=' . esc_attr($filter_action) : ''; ?>&apage=<?php echo $p; ?>" class="button"><?php echo $p; ?></a>
            <?php endif; ?>
        <?php endfor; ?>
    </div>
    <?php endif; ?>
    <?php endif; ?>
    <?php
}

/**
 * Log an activity event for influencer tracking
 */
function asl_influencer_log_activity($action, $influencer_name, $influencer_code, $details = '') {
    $logs = get_option('asl_influencer_activity_logs', array());

    $current_user = wp_get_current_user();
    $user_display = $current_user->exists() ? $current_user->display_name . ' (' . $current_user->user_login . ')' : 'System';

    $log_entry = array(
        'timestamp' => current_time('mysql'),
        'action' => $action,
        'influencer_name' => $influencer_name,
        'influencer_code' => $influencer_code,
        'details' => $details,
        'user' => $user_display,
    );

    array_unshift($logs, $log_entry);
    $logs = array_slice($logs, 0, 500);
    update_option('asl_influencer_activity_logs', $logs);
}

/**
 * Handle CSV export
 */
function asl_influencer_handle_csv_export() {
    if (!isset($_GET['page']) || $_GET['page'] !== 'ep-influencer-tracking') return;
    if (!isset($_GET['action']) || $_GET['action'] !== 'export_csv') return;
    if (!current_user_can('manage_woocommerce')) return;
    if (!wp_verify_nonce(isset($_GET['_wpnonce']) ? $_GET['_wpnonce'] : '', 'asl_export_csv')) return;

    $influencers = get_option('asl_influencers', array());
    $visits = get_option('asl_influencer_visits', array());
    $date_from = isset($_GET['date_from']) ? sanitize_text_field($_GET['date_from']) : '';
    $date_to = isset($_GET['date_to']) ? sanitize_text_field($_GET['date_to']) : '';
    $wc_currency = function_exists('get_woocommerce_currency') ? get_woocommerce_currency() : 'AED';

    header('Content-Type: text/csv; charset=utf-8');
    header('Content-Disposition: attachment; filename=influencer-stats-' . date('Y-m-d') . '.csv');

    $output = fopen('php://output', 'w');
    fputcsv($output, array(
        'Influencer', 'Code', 'Platform', 'Email', 'Status', 'Unique Visits', 'Total Visits', 'Orders',
        'Revenue (' . $wc_currency . ')', 'Avg Order Value', 'Conversion Rate %',
        'Commission Rate %', 'Total Commission', 'Fixed Amount', 'Total Cost',
        'Profit', 'ROI %', 'Top Cities', 'Top Countries', 'Top Products'
    ));

    foreach ($influencers as $influencer) {
        $code = $influencer['code'];
        $visit_list = isset($visits[$code]) ? $visits[$code] : array();

        if ($date_from || $date_to) {
            $visit_list = array_filter($visit_list, function($v) use ($date_from, $date_to) {
                $ts = strtotime($v['timestamp']);
                if ($date_from && $ts < strtotime($date_from)) return false;
                if ($date_to && $ts > strtotime($date_to . ' 23:59:59')) return false;
                return true;
            });
        }
        $visit_count = count($visit_list);

        // Count unique visits by distinct IP addresses
        $unique_ips = array();
        foreach ($visit_list as $v) {
            if (!empty($v['ip'])) {
                $unique_ips[$v['ip']] = true;
            }
        }
        $unique_visit_count = count($unique_ips);

        $commission_rate = floatval($influencer['commission_rate'] ?? 0);
        $fixed_amount = floatval($influencer['fixed_amount'] ?? 0);

        $orders = asl_influencer_get_orders_by_ref($code, $date_from, $date_to);
        $total_revenue = 0;
        $order_count = count($orders);
        $cities = array();
        $countries = array();
        $products_sold = array();

        foreach ($orders as $order) {
            $total_revenue += floatval($order->get_total());

            $city = $order->get_shipping_city() ?: $order->get_billing_city();
            $country = $order->get_shipping_country() ?: $order->get_billing_country();
            if ($city) $cities[$city] = ($cities[$city] ?? 0) + 1;
            if ($country) $countries[$country] = ($countries[$country] ?? 0) + 1;

            foreach ($order->get_items() as $item) {
                $product = $item->get_product();
                if ($product && floatval($product->get_price()) > 0) {
                    $name = $item->get_name();
                    $products_sold[$name] = ($products_sold[$name] ?? 0) + $item->get_quantity();
                }
            }
        }

        arsort($cities);
        arsort($countries);
        arsort($products_sold);

        $conversion_rate = $unique_visit_count > 0 ? round(($order_count / $unique_visit_count) * 100, 1) : 0;
        $avg_order = $order_count > 0 ? round($total_revenue / $order_count, 2) : 0;
        $total_commission = ($commission_rate / 100) * $total_revenue;
        $total_cost = $total_commission + $fixed_amount;
        $profit = $total_revenue - $total_cost;
        $roi = $total_cost > 0 ? round((($total_revenue - $total_cost) / $total_cost) * 100, 1) : 0;

        $top_cities_str = implode(', ', array_map(function($c, $n) { return "$c ($n)"; }, array_keys(array_slice($cities, 0, 5, true)), array_slice($cities, 0, 5)));
        $top_countries_str = implode(', ', array_map(function($c, $n) { return "$c ($n)"; }, array_keys(array_slice($countries, 0, 5, true)), array_slice($countries, 0, 5)));
        $top_products_str = implode(', ', array_map(function($p, $n) { return "$p ($n)"; }, array_keys(array_slice($products_sold, 0, 5, true)), array_slice($products_sold, 0, 5)));

        fputcsv($output, array(
            $influencer['name'],
            $code,
            ucfirst($influencer['platform']),
            isset($influencer['email']) ? $influencer['email'] : '',
            !empty($influencer['active']) ? 'Active' : 'Inactive',
            $unique_visit_count,
            $visit_count,
            $order_count,
            round($total_revenue, 2),
            $avg_order,
            $conversion_rate,
            $commission_rate,
            round($total_commission, 2),
            $fixed_amount,
            round($total_cost, 2),
            round($profit, 2),
            $roi,
            $top_cities_str,
            $top_countries_str,
            $top_products_str,
        ));
    }

    fclose($output);
    exit;
}

/**
 * Save influencer settings
 */
function asl_influencer_save_settings() {
    $influencers = array();
    $existing = get_option('asl_influencers', array());
    $existing_by_id = array();
    $existing_by_code = array();
    foreach ($existing as $e) {
        if (!empty($e['id'])) {
            $existing_by_id[$e['id']] = $e;
        }
        if (!empty($e['code'])) {
            $existing_by_code[$e['code']] = $e;
        }
    }

    $new_codes = array();
    $new_ids = array();

    if (isset($_POST['asl_influencers']) && is_array($_POST['asl_influencers'])) {
        foreach ($_POST['asl_influencers'] as $influencer) {
            $code = sanitize_text_field($influencer['code'] ?? '');
            if (empty($code)) continue;

            $code = strtolower(preg_replace('/[^a-z0-9_-]/', '', $code));
            $code = substr($code, 0, 50);
            if (empty($code)) continue;

            $submitted_id = sanitize_text_field($influencer['id'] ?? '');
            $submitted_created = sanitize_text_field($influencer['created_at'] ?? '');

            $id = !empty($submitted_id) ? $submitted_id : wp_generate_uuid4();
            $created_at = !empty($submitted_created) ? $submitted_created : current_time('mysql');

            $new_active = isset($influencer['active']) ? true : false;
            $new_name = sanitize_text_field($influencer['name'] ?? '');

            $saved = array(
                'id' => $id,
                'active' => $new_active,
                'name' => $new_name,
                'code' => $code,
                'platform' => sanitize_text_field($influencer['platform'] ?? 'instagram'),
                'email' => sanitize_email($influencer['email'] ?? ''),
                'commission_rate' => floatval($influencer['commission_rate'] ?? 0),
                'fixed_amount' => floatval($influencer['fixed_amount'] ?? 0),
                'notes' => sanitize_textarea_field($influencer['notes'] ?? ''),
                'created_at' => $created_at,
            );

            $influencers[] = $saved;
            $new_codes[] = $code;
            $new_ids[] = $id;

            if (isset($existing_by_id[$id])) {
                $old = $existing_by_id[$id];
                $old_active = !empty($old['active']);
                if ($new_active && !$old_active) {
                    asl_influencer_log_activity('activated', $new_name, $code, 'Influencer was activated');
                } elseif (!$new_active && $old_active) {
                    asl_influencer_log_activity('deactivated', $new_name, $code, 'Influencer was deactivated');
                }
                $changes = array();
                if (($old['name'] ?? '') !== $new_name) $changes[] = 'name';
                if (($old['platform'] ?? '') !== $saved['platform']) $changes[] = 'platform';
                if (($old['email'] ?? '') !== $saved['email']) $changes[] = 'email';
                if (floatval($old['commission_rate'] ?? 0) !== $saved['commission_rate']) $changes[] = 'commission_rate';
                if (floatval($old['fixed_amount'] ?? 0) !== $saved['fixed_amount']) $changes[] = 'fixed_amount';
                if (($old['notes'] ?? '') !== $saved['notes']) $changes[] = 'notes';
                if (($old['code'] ?? '') !== $code) $changes[] = 'code';
                if (!empty($changes)) {
                    asl_influencer_log_activity('updated', $new_name, $code, 'Changed: ' . implode(', ', $changes));
                }
            } else {
                asl_influencer_log_activity('created', $new_name, $code, 'New influencer added');
            }
        }
    }

    foreach ($existing as $old_inf) {
        if (!empty($old_inf['id']) && !in_array($old_inf['id'], $new_ids)) {
            asl_influencer_log_activity('deleted', $old_inf['name'] ?? '', $old_inf['code'] ?? '', 'Influencer removed via save');
        }
    }

    update_option('asl_influencers', $influencers);
}

/**
 * Delete a single influencer
 */
function asl_influencer_delete($influencer_id) {
    $influencers = get_option('asl_influencers', array());
    foreach ($influencers as $inf) {
        if ($inf['id'] === $influencer_id) {
            asl_influencer_log_activity('deleted', $inf['name'] ?? '', $inf['code'] ?? '', 'Influencer deleted');
            break;
        }
    }
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
 * Deduplicates by IP+code within a 24-hour window to count unique visits only.
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

    $influencers = get_option('asl_influencers', array());
    $valid_codes = array_map(function($inf) { return $inf['code']; }, $influencers);
    if (!in_array($code, $valid_codes)) {
        return new WP_Error('unknown_code', 'Unknown referral code.', array('status' => 404));
    }

    $visitor_ip = asl_influencer_get_client_ip();
    $visits = get_option('asl_influencer_visits', array());

    if (!isset($visits[$code])) {
        $visits[$code] = array();
    }

    // Deduplicate: skip if same IP visited this code within the last 24 hours
    $dedup_window = 24 * 60 * 60; // 24 hours in seconds
    $now = current_time('timestamp');
    foreach ($visits[$code] as $existing) {
        if (isset($existing['ip']) && $existing['ip'] === $visitor_ip) {
            $visit_time = strtotime($existing['timestamp']);
            if ($visit_time && ($now - $visit_time) < $dedup_window) {
                return rest_ensure_response(array(
                    'success' => true,
                    'duplicate' => true,
                ));
            }
        }
    }

    $visits[$code][] = array(
        'timestamp' => current_time('mysql'),
        'landing_page' => $landing_page,
        'ip' => $visitor_ip,
        'user_agent' => isset($_SERVER['HTTP_USER_AGENT']) ? sanitize_text_field(substr($_SERVER['HTTP_USER_AGENT'], 0, 500)) : '',
    );

    update_option('asl_influencer_visits', $visits);

    return rest_ensure_response(array(
        'success' => true,
        'duplicate' => false,
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

        if ($date_from || $date_to) {
            $visit_list = array_filter($visit_list, function($v) use ($date_from, $date_to) {
                $ts = strtotime($v['timestamp']);
                if ($date_from && $ts < strtotime($date_from)) return false;
                if ($date_to && $ts > strtotime($date_to . ' 23:59:59')) return false;
                return true;
            });
        }
        $visit_count = count($visit_list);

        // Count unique visits by distinct IP addresses
        $unique_ips = array();
        foreach ($visit_list as $v) {
            if (!empty($v['ip'])) {
                $unique_ips[$v['ip']] = true;
            }
        }
        $unique_visit_count = count($unique_ips);

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

        $commission_rate = floatval($influencer['commission_rate'] ?? 0);
        $fixed_amount = floatval($influencer['fixed_amount'] ?? 0);
        $total_commission = ($commission_rate / 100) * $total_revenue;
        $total_cost = $total_commission + $fixed_amount;
        $conversion_rate = $unique_visit_count > 0 ? round(($order_count / $unique_visit_count) * 100, 1) : 0;
        $avg_order_value = $order_count > 0 ? round($total_revenue / $order_count, 2) : 0;

        $stats[] = array(
            'name' => $influencer['name'],
            'code' => $code,
            'platform' => $influencer['platform'],
            'email' => isset($influencer['email']) ? $influencer['email'] : '',
            'active' => !empty($influencer['active']),
            'visits' => $visit_count,
            'unique_visits' => $unique_visit_count,
            'orders' => $order_count,
            'revenue' => round($total_revenue, 2),
            'free_gifts' => $free_gift_count,
            'conversion_rate' => $conversion_rate,
            'avg_order_value' => $avg_order_value,
            'commission_rate' => $commission_rate,
            'total_commission' => round($total_commission, 2),
            'fixed_amount' => $fixed_amount,
            'total_cost' => round($total_cost, 2),
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
