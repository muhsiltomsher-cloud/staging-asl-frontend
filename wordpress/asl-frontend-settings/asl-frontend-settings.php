<?php
/**
 * Plugin Name: ASL Frontend Settings
 * Plugin URI: https://aromaticscentslab.com
 * Description: Admin dashboard and REST API endpoints for ASL Frontend with Media Library upload, dynamic slides, layout options, and ASL Bundles Creator.
 * Version: 5.0.0
 * Author: Aromatic Scents Lab
 * License: GPL v2 or later
 */

if (!defined('ABSPATH')) exit;

if (defined('ASL_FRONTEND_SETTINGS_LOADED')) {
    add_action('admin_notices', function() {
        echo '<div class="notice notice-error"><p><strong>ASL Frontend Settings:</strong> Duplicate plugin detected!</p></div>';
    });
    return;
}
define('ASL_FRONTEND_SETTINGS_LOADED', true);
define('ASL_SETTINGS_VERSION', '5.0.0');

add_action('admin_enqueue_scripts', function($hook) {
    if (strpos($hook, 'asl-settings') === false) return;
    wp_enqueue_media();
    wp_enqueue_script('asl-admin', plugins_url('admin.js', __FILE__), array('jquery'), ASL_SETTINGS_VERSION, true);
});

add_action('admin_menu', function() {
    add_menu_page('ASL Settings', 'ASL Settings', 'manage_options', 'asl-settings', 'asl_render_admin_page', 'dashicons-admin-customizer', 30);
    add_submenu_page('asl-settings', 'Home Page', 'Home Page', 'manage_options', 'asl-settings', 'asl_render_admin_page');
    add_submenu_page('asl-settings', 'Header & Topbar', 'Header & Topbar', 'manage_options', 'asl-settings-header', 'asl_render_header_page');
    add_submenu_page('asl-settings', 'SEO Settings', 'SEO Settings', 'manage_options', 'asl-settings-seo', 'asl_render_seo_page');
    add_submenu_page('asl-settings', 'Mobile Settings', 'Mobile Settings', 'manage_options', 'asl-settings-mobile', 'asl_render_mobile_page');
});

function asl_image_field($name, $value = '') {
    $has = !empty($value);
    echo '<div class="asl-image-field">';
    echo '<input type="hidden" name="'.esc_attr($name).'" id="'.esc_attr($name).'" value="'.esc_url($value).'">';
    echo '<button type="button" class="button asl-upload-btn" data-target="#'.esc_attr($name).'" data-preview="#'.esc_attr($name).'_preview">Upload Image</button>';
    echo '<button type="button" class="button asl-remove-btn" data-target="#'.esc_attr($name).'" data-preview="#'.esc_attr($name).'_preview" style="'.($has ? '' : 'display:none;').'">Remove</button>';
    echo '<div id="'.esc_attr($name).'_preview" class="asl-preview">';
    if ($has) echo '<img src="'.esc_url($value).'" style="max-width:300px;max-height:150px;display:block;margin-top:10px;">';
    echo '</div></div>';
}

function asl_render_admin_page() {
    if (!current_user_can('manage_options')) return;
    if (isset($_POST['asl_save_home_settings']) && check_admin_referer('asl_home_settings_nonce')) {
        asl_save_home_settings();
        echo '<div class="notice notice-success is-dismissible"><p>Settings saved!</p></div>';
    }
    $tab = isset($_GET['tab']) ? sanitize_text_field($_GET['tab']) : 'hero';
    ?>
    <div class="wrap">
        <h1><?php echo esc_html(get_admin_page_title()); ?></h1>
        <nav class="nav-tab-wrapper">
            <?php foreach (['hero'=>'Hero Slider','new-products'=>'New Products','bestseller'=>'Bestsellers','categories'=>'Categories','featured'=>'Featured','collections'=>'Collections','banners'=>'Banners'] as $k=>$l): ?>
                <a href="?page=asl-settings&tab=<?php echo $k; ?>" class="nav-tab <?php echo $tab===$k?'nav-tab-active':''; ?>"><?php echo $l; ?></a>
            <?php endforeach; ?>
        </nav>
        <form method="post">
            <?php wp_nonce_field('asl_home_settings_nonce'); ?>
            <div class="tab-content" style="background:#fff;padding:20px;border:1px solid #ccd0d4;border-top:none;">
                <?php
                switch($tab) {
                    case 'hero': asl_render_hero_tab(); break;
                    case 'new-products': asl_render_products_tab('new_products','New Products'); break;
                    case 'bestseller': asl_render_products_tab('bestseller','Bestseller'); break;
                    case 'categories': asl_render_categories_tab(); break;
                    case 'featured': asl_render_products_tab('featured','Featured'); break;
                    case 'collections': asl_render_collections_tab(); break;
                    case 'banners': asl_render_banners_tab(); break;
                }
                ?>
            </div>
            <?php submit_button('Save Settings','primary','asl_save_home_settings'); ?>
        </form>
    </div>
    <?php
}

function asl_render_hero_tab() {
    $slides = get_theme_mod('asl_hero_slides', array());
    if (empty($slides)) {
        for ($i=1; $i<=5; $i++) {
            $img = get_theme_mod("asl_hero_slide_{$i}_image",'');
            if (!empty($img)) $slides[] = array('image'=>$img,'mobile'=>get_theme_mod("asl_hero_slide_{$i}_mobile",''),'link'=>get_theme_mod("asl_hero_slide_{$i}_link",''));
        }
        if (empty($slides)) $slides[] = array('image'=>'','mobile'=>'','link'=>'');
    }
    ?>
    <h2>Hero Slider Settings</h2>
    <table class="form-table">
        <tr><th>Enable</th><td><label><input type="checkbox" name="asl_hero_enabled" value="1" <?php checked(get_theme_mod('asl_hero_enabled',true)); ?>> Show hero slider</label></td></tr>
        <tr><th>Hide on Mobile</th><td><label><input type="checkbox" name="asl_hero_hide_mobile" value="1" <?php checked(get_theme_mod('asl_hero_hide_mobile',false)); ?>> Hide on mobile</label></td></tr>
        <tr><th>Hide on Desktop</th><td><label><input type="checkbox" name="asl_hero_hide_desktop" value="1" <?php checked(get_theme_mod('asl_hero_hide_desktop',false)); ?>> Hide on desktop</label></td></tr>
        <tr><th>Autoplay</th><td><label><input type="checkbox" name="asl_hero_autoplay" value="1" <?php checked(get_theme_mod('asl_hero_autoplay',true)); ?>> Enable</label></td></tr>
        <tr><th>Autoplay Delay</th><td><input type="number" name="asl_hero_autoplay_delay" value="<?php echo esc_attr(get_theme_mod('asl_hero_autoplay_delay',5000)); ?>" min="1000" max="10000" class="small-text"> ms</td></tr>
        <tr><th>Loop</th><td><label><input type="checkbox" name="asl_hero_loop" value="1" <?php checked(get_theme_mod('asl_hero_loop',true)); ?>> Enable</label></td></tr>
    </table>
    <h3>Slides <button type="button" class="button" id="asl-add-slide">+ Add Slide</button></h3>
    <div id="asl-hero-slides">
        <?php foreach ($slides as $i=>$s): ?>
        <div class="asl-slide-item" style="background:#f9f9f9;padding:15px;margin-bottom:15px;border:1px solid #ddd;">
            <h4>Slide <?php echo $i+1; ?> <button type="button" class="button asl-remove-slide" style="float:right;color:red;">Remove</button></h4>
            <table class="form-table">
                <tr><th>Desktop Image</th><td><?php asl_image_field("asl_hero_slides[{$i}][image]",$s['image']??''); ?></td></tr>
                <tr><th>Mobile Image</th><td><?php asl_image_field("asl_hero_slides[{$i}][mobile]",$s['mobile']??''); ?></td></tr>
                <tr><th>Link URL</th><td><input type="url" name="asl_hero_slides[<?php echo $i; ?>][link]" value="<?php echo esc_url($s['link']??''); ?>" class="large-text"></td></tr>
            </table>
        </div>
        <?php endforeach; ?>
    </div>
    <?php
}

function asl_render_products_tab($key,$label) {
    ?>
    <h2><?php echo $label; ?> Section</h2>
    <table class="form-table">
        <tr><th>Enable</th><td><label><input type="checkbox" name="asl_<?php echo $key; ?>_enabled" value="1" <?php checked(get_theme_mod("asl_{$key}_enabled",true)); ?>> Show</label></td></tr>
        <tr><th>Hide on Mobile</th><td><label><input type="checkbox" name="asl_<?php echo $key; ?>_hide_mobile" value="1" <?php checked(get_theme_mod("asl_{$key}_hide_mobile",false)); ?>></label></td></tr>
        <tr><th>Hide on Desktop</th><td><label><input type="checkbox" name="asl_<?php echo $key; ?>_hide_desktop" value="1" <?php checked(get_theme_mod("asl_{$key}_hide_desktop",false)); ?>></label></td></tr>
        <tr><th>Title (EN)</th><td><input type="text" name="asl_<?php echo $key; ?>_title" value="<?php echo esc_attr(get_theme_mod("asl_{$key}_title",$label)); ?>" class="regular-text"></td></tr>
        <tr><th>Title (AR)</th><td><input type="text" name="asl_<?php echo $key; ?>_title_ar" value="<?php echo esc_attr(get_theme_mod("asl_{$key}_title_ar",'')); ?>" class="regular-text" dir="rtl"></td></tr>
        <tr><th>Subtitle (EN)</th><td><input type="text" name="asl_<?php echo $key; ?>_subtitle" value="<?php echo esc_attr(get_theme_mod("asl_{$key}_subtitle",'')); ?>" class="regular-text"></td></tr>
        <tr><th>Subtitle (AR)</th><td><input type="text" name="asl_<?php echo $key; ?>_subtitle_ar" value="<?php echo esc_attr(get_theme_mod("asl_{$key}_subtitle_ar",'')); ?>" class="regular-text" dir="rtl"></td></tr>
        <tr><th>Count</th><td><input type="number" name="asl_<?php echo $key; ?>_count" value="<?php echo esc_attr(get_theme_mod("asl_{$key}_count",8)); ?>" min="4" max="24" class="small-text"></td></tr>
        <tr><th>Display</th><td><select name="asl_<?php echo $key; ?>_display"><option value="slider" <?php selected(get_theme_mod("asl_{$key}_display",'slider'),'slider'); ?>>Slider</option><option value="grid" <?php selected(get_theme_mod("asl_{$key}_display",'slider'),'grid'); ?>>Grid</option></select></td></tr>
        <tr><th>Autoplay</th><td><label><input type="checkbox" name="asl_<?php echo $key; ?>_autoplay" value="1" <?php checked(get_theme_mod("asl_{$key}_autoplay",true)); ?>></label></td></tr>
        <tr><th>Desktop Cols</th><td><input type="number" name="asl_<?php echo $key; ?>_cols_desktop" value="<?php echo esc_attr(get_theme_mod("asl_{$key}_cols_desktop",4)); ?>" min="2" max="6" class="small-text"></td></tr>
        <tr><th>Tablet Cols</th><td><input type="number" name="asl_<?php echo $key; ?>_cols_tablet" value="<?php echo esc_attr(get_theme_mod("asl_{$key}_cols_tablet",3)); ?>" min="2" max="4" class="small-text"></td></tr>
        <tr><th>Mobile Cols</th><td><input type="number" name="asl_<?php echo $key; ?>_cols_mobile" value="<?php echo esc_attr(get_theme_mod("asl_{$key}_cols_mobile",2)); ?>" min="1" max="3" class="small-text"></td></tr>
    </table>
    <?php
}

function asl_render_categories_tab() {
    ?>
    <h2>Categories Section</h2>
    <table class="form-table">
        <tr><th>Enable</th><td><label><input type="checkbox" name="asl_categories_enabled" value="1" <?php checked(get_theme_mod('asl_categories_enabled',true)); ?>> Show</label></td></tr>
        <tr><th>Hide on Mobile</th><td><label><input type="checkbox" name="asl_categories_hide_mobile" value="1" <?php checked(get_theme_mod('asl_categories_hide_mobile',false)); ?>></label></td></tr>
        <tr><th>Hide on Desktop</th><td><label><input type="checkbox" name="asl_categories_hide_desktop" value="1" <?php checked(get_theme_mod('asl_categories_hide_desktop',false)); ?>></label></td></tr>
        <tr><th>Title (EN)</th><td><input type="text" name="asl_categories_title" value="<?php echo esc_attr(get_theme_mod('asl_categories_title','Shop by Category')); ?>" class="regular-text"></td></tr>
        <tr><th>Title (AR)</th><td><input type="text" name="asl_categories_title_ar" value="<?php echo esc_attr(get_theme_mod('asl_categories_title_ar','')); ?>" class="regular-text" dir="rtl"></td></tr>
        <tr><th>Count</th><td><input type="number" name="asl_categories_count" value="<?php echo esc_attr(get_theme_mod('asl_categories_count',6)); ?>" min="3" max="12" class="small-text"></td></tr>
        <tr><th>Desktop Cols</th><td><input type="number" name="asl_categories_cols_desktop" value="<?php echo esc_attr(get_theme_mod('asl_categories_cols_desktop',6)); ?>" min="3" max="8" class="small-text"></td></tr>
        <tr><th>Tablet Cols</th><td><input type="number" name="asl_categories_cols_tablet" value="<?php echo esc_attr(get_theme_mod('asl_categories_cols_tablet',4)); ?>" min="2" max="6" class="small-text"></td></tr>
        <tr><th>Mobile Cols</th><td><input type="number" name="asl_categories_cols_mobile" value="<?php echo esc_attr(get_theme_mod('asl_categories_cols_mobile',3)); ?>" min="2" max="4" class="small-text"></td></tr>
    </table>
    <?php
}

function asl_render_collections_tab() {
    $items = get_theme_mod('asl_collections_items', array());
    if (empty($items)) {
        for ($i=1; $i<=6; $i++) {
            $img = get_theme_mod("asl_collection_{$i}_image",'');
            $title = get_theme_mod("asl_collection_{$i}_title",'');
            if (!empty($img)||!empty($title)) $items[] = array('image'=>$img,'title'=>$title,'title_ar'=>get_theme_mod("asl_collection_{$i}_title_ar",''),'description'=>get_theme_mod("asl_collection_{$i}_description",''),'description_ar'=>get_theme_mod("asl_collection_{$i}_description_ar",''),'link'=>get_theme_mod("asl_collection_{$i}_link",''));
        }
        if (empty($items)) $items[] = array('image'=>'','title'=>'','title_ar'=>'','description'=>'','description_ar'=>'','link'=>'');
    }
    ?>
    <h2>Collections Section</h2>
    <table class="form-table">
        <tr><th>Enable</th><td><label><input type="checkbox" name="asl_collections_enabled" value="1" <?php checked(get_theme_mod('asl_collections_enabled',true)); ?>> Show</label></td></tr>
        <tr><th>Hide on Mobile</th><td><label><input type="checkbox" name="asl_collections_hide_mobile" value="1" <?php checked(get_theme_mod('asl_collections_hide_mobile',false)); ?>></label></td></tr>
        <tr><th>Hide on Desktop</th><td><label><input type="checkbox" name="asl_collections_hide_desktop" value="1" <?php checked(get_theme_mod('asl_collections_hide_desktop',false)); ?>></label></td></tr>
        <tr><th>Title (EN)</th><td><input type="text" name="asl_collections_title" value="<?php echo esc_attr(get_theme_mod('asl_collections_title','Our Collections')); ?>" class="regular-text"></td></tr>
        <tr><th>Title (AR)</th><td><input type="text" name="asl_collections_title_ar" value="<?php echo esc_attr(get_theme_mod('asl_collections_title_ar','')); ?>" class="regular-text" dir="rtl"></td></tr>
        <tr><th>Layout</th><td><select name="asl_collections_layout"><option value="grid" <?php selected(get_theme_mod('asl_collections_layout','grid'),'grid'); ?>>Grid</option><option value="masonry" <?php selected(get_theme_mod('asl_collections_layout','grid'),'masonry'); ?>>Masonry</option><option value="slider" <?php selected(get_theme_mod('asl_collections_layout','grid'),'slider'); ?>>Slider</option></select></td></tr>
        <tr><th>Desktop Cols</th><td><input type="number" name="asl_collections_cols_desktop" value="<?php echo esc_attr(get_theme_mod('asl_collections_cols_desktop',3)); ?>" min="2" max="4" class="small-text"></td></tr>
        <tr><th>Tablet Cols</th><td><input type="number" name="asl_collections_cols_tablet" value="<?php echo esc_attr(get_theme_mod('asl_collections_cols_tablet',2)); ?>" min="1" max="3" class="small-text"></td></tr>
        <tr><th>Mobile Cols</th><td><input type="number" name="asl_collections_cols_mobile" value="<?php echo esc_attr(get_theme_mod('asl_collections_cols_mobile',1)); ?>" min="1" max="2" class="small-text"></td></tr>
    </table>
    <h3>Items <button type="button" class="button" id="asl-add-collection">+ Add</button></h3>
    <div id="asl-collections-items">
        <?php foreach ($items as $i=>$item): ?>
        <div class="asl-collection-item" style="background:#f9f9f9;padding:15px;margin-bottom:15px;border:1px solid #ddd;">
            <h4>Collection <?php echo $i+1; ?> <button type="button" class="button asl-remove-collection" style="float:right;color:red;">Remove</button></h4>
            <table class="form-table">
                <tr><th>Image</th><td><?php asl_image_field("asl_collections_items[{$i}][image]",$item['image']??''); ?></td></tr>
                <tr><th>Title (EN)</th><td><input type="text" name="asl_collections_items[<?php echo $i; ?>][title]" value="<?php echo esc_attr($item['title']??''); ?>" class="regular-text"></td></tr>
                <tr><th>Title (AR)</th><td><input type="text" name="asl_collections_items[<?php echo $i; ?>][title_ar]" value="<?php echo esc_attr($item['title_ar']??''); ?>" class="regular-text" dir="rtl"></td></tr>
                <tr><th>Description (EN)</th><td><textarea name="asl_collections_items[<?php echo $i; ?>][description]" class="large-text" rows="2"><?php echo esc_textarea($item['description']??''); ?></textarea></td></tr>
                <tr><th>Description (AR)</th><td><textarea name="asl_collections_items[<?php echo $i; ?>][description_ar]" class="large-text" rows="2" dir="rtl"><?php echo esc_textarea($item['description_ar']??''); ?></textarea></td></tr>
                <tr><th>Link</th><td><input type="url" name="asl_collections_items[<?php echo $i; ?>][link]" value="<?php echo esc_url($item['link']??''); ?>" class="large-text"></td></tr>
            </table>
        </div>
        <?php endforeach; ?>
    </div>
    <?php
}

function asl_render_banners_tab() {
    $items = get_theme_mod('asl_banners_items', array());
    if (empty($items)) {
        for ($i=1; $i<=4; $i++) {
            $img = get_theme_mod("asl_banner_{$i}_image",'');
            if (!empty($img)) $items[] = array('image'=>$img,'mobile'=>get_theme_mod("asl_banner_{$i}_mobile",''),'title'=>get_theme_mod("asl_banner_{$i}_title",''),'title_ar'=>get_theme_mod("asl_banner_{$i}_title_ar",''),'subtitle'=>get_theme_mod("asl_banner_{$i}_subtitle",''),'subtitle_ar'=>get_theme_mod("asl_banner_{$i}_subtitle_ar",''),'link'=>get_theme_mod("asl_banner_{$i}_link",''));
        }
        if (empty($items)) $items[] = array('image'=>'','mobile'=>'','title'=>'','title_ar'=>'','subtitle'=>'','subtitle_ar'=>'','link'=>'');
    }
    ?>
    <h2>Banners Section</h2>
    <table class="form-table">
        <tr><th>Enable</th><td><label><input type="checkbox" name="asl_banners_enabled" value="1" <?php checked(get_theme_mod('asl_banners_enabled',true)); ?>> Show</label></td></tr>
        <tr><th>Hide on Mobile</th><td><label><input type="checkbox" name="asl_banners_hide_mobile" value="1" <?php checked(get_theme_mod('asl_banners_hide_mobile',false)); ?>></label></td></tr>
        <tr><th>Hide on Desktop</th><td><label><input type="checkbox" name="asl_banners_hide_desktop" value="1" <?php checked(get_theme_mod('asl_banners_hide_desktop',false)); ?>></label></td></tr>
        <tr><th>Layout</th><td><select name="asl_banners_layout"><option value="grid" <?php selected(get_theme_mod('asl_banners_layout','grid'),'grid'); ?>>Grid</option><option value="full-width" <?php selected(get_theme_mod('asl_banners_layout','grid'),'full-width'); ?>>Full Width</option><option value="slider" <?php selected(get_theme_mod('asl_banners_layout','grid'),'slider'); ?>>Slider</option></select></td></tr>
        <tr><th>Desktop Cols</th><td><input type="number" name="asl_banners_cols_desktop" value="<?php echo esc_attr(get_theme_mod('asl_banners_cols_desktop',2)); ?>" min="1" max="4" class="small-text"></td></tr>
        <tr><th>Tablet Cols</th><td><input type="number" name="asl_banners_cols_tablet" value="<?php echo esc_attr(get_theme_mod('asl_banners_cols_tablet',2)); ?>" min="1" max="3" class="small-text"></td></tr>
        <tr><th>Mobile Cols</th><td><input type="number" name="asl_banners_cols_mobile" value="<?php echo esc_attr(get_theme_mod('asl_banners_cols_mobile',1)); ?>" min="1" max="2" class="small-text"></td></tr>
    </table>
    <h3>Items <button type="button" class="button" id="asl-add-banner">+ Add</button></h3>
    <div id="asl-banners-items">
        <?php foreach ($items as $i=>$item): ?>
        <div class="asl-banner-item" style="background:#f9f9f9;padding:15px;margin-bottom:15px;border:1px solid #ddd;">
            <h4>Banner <?php echo $i+1; ?> <button type="button" class="button asl-remove-banner" style="float:right;color:red;">Remove</button></h4>
            <table class="form-table">
                <tr><th>Desktop Image</th><td><?php asl_image_field("asl_banners_items[{$i}][image]",$item['image']??''); ?></td></tr>
                <tr><th>Mobile Image</th><td><?php asl_image_field("asl_banners_items[{$i}][mobile]",$item['mobile']??''); ?></td></tr>
                <tr><th>Title (EN)</th><td><input type="text" name="asl_banners_items[<?php echo $i; ?>][title]" value="<?php echo esc_attr($item['title']??''); ?>" class="regular-text"></td></tr>
                <tr><th>Title (AR)</th><td><input type="text" name="asl_banners_items[<?php echo $i; ?>][title_ar]" value="<?php echo esc_attr($item['title_ar']??''); ?>" class="regular-text" dir="rtl"></td></tr>
                <tr><th>Subtitle (EN)</th><td><input type="text" name="asl_banners_items[<?php echo $i; ?>][subtitle]" value="<?php echo esc_attr($item['subtitle']??''); ?>" class="regular-text"></td></tr>
                <tr><th>Subtitle (AR)</th><td><input type="text" name="asl_banners_items[<?php echo $i; ?>][subtitle_ar]" value="<?php echo esc_attr($item['subtitle_ar']??''); ?>" class="regular-text" dir="rtl"></td></tr>
                <tr><th>Link</th><td><input type="url" name="asl_banners_items[<?php echo $i; ?>][link]" value="<?php echo esc_url($item['link']??''); ?>" class="large-text"></td></tr>
            </table>
        </div>
        <?php endforeach; ?>
    </div>
    <?php
}

function asl_render_header_page() {
    if (!current_user_can('manage_options')) return;
    if (isset($_POST['asl_save_header_settings']) && check_admin_referer('asl_header_settings_nonce')) {
        asl_save_header_settings();
        echo '<div class="notice notice-success is-dismissible"><p>Settings saved!</p></div>';
    }
    ?>
    <div class="wrap">
        <h1>Header & Topbar Settings</h1>
        <form method="post">
            <?php wp_nonce_field('asl_header_settings_nonce'); ?>
            <div style="background:#fff;padding:20px;border:1px solid #ccd0d4;">
                <h2>Header Settings</h2>
                <table class="form-table">
                    <tr><th>Sticky Header</th><td><label><input type="checkbox" name="asl_header_sticky" value="1" <?php checked(get_theme_mod('asl_header_sticky',true)); ?>> Enable</label></td></tr>
                    <tr><th>Sticky Logo</th><td><?php asl_image_field('asl_sticky_logo',get_theme_mod('asl_sticky_logo','')); ?></td></tr>
                    <tr><th>Dark Mode Logo</th><td><?php asl_image_field('asl_logo_dark',get_theme_mod('asl_logo_dark','')); ?></td></tr>
                </table>
                <h2>Promotional Top Bar</h2>
                <table class="form-table">
                    <tr><th>Enable</th><td><label><input type="checkbox" name="asl_topbar_enabled" value="1" <?php checked(get_theme_mod('asl_topbar_enabled',true)); ?>> Show</label></td></tr>
                    <tr><th>Text (EN)</th><td><input type="text" name="asl_topbar_text" value="<?php echo esc_attr(get_theme_mod('asl_topbar_text','Free shipping on orders over 200 SAR')); ?>" class="large-text"></td></tr>
                    <tr><th>Text (AR)</th><td><input type="text" name="asl_topbar_text_ar" value="<?php echo esc_attr(get_theme_mod('asl_topbar_text_ar','')); ?>" class="large-text" dir="rtl"></td></tr>
                    <tr><th>Link</th><td><input type="url" name="asl_topbar_link" value="<?php echo esc_url(get_theme_mod('asl_topbar_link','')); ?>" class="large-text"></td></tr>
                    <tr><th>BG Color</th><td><input type="text" name="asl_topbar_bg_color" value="<?php echo esc_attr(get_theme_mod('asl_topbar_bg_color','#f3f4f6')); ?>" class="regular-text"></td></tr>
                    <tr><th>Text Color</th><td><input type="text" name="asl_topbar_text_color" value="<?php echo esc_attr(get_theme_mod('asl_topbar_text_color','#4b5563')); ?>" class="regular-text"></td></tr>
                    <tr><th>Dismissible</th><td><label><input type="checkbox" name="asl_topbar_dismissible" value="1" <?php checked(get_theme_mod('asl_topbar_dismissible',false)); ?>> Allow dismiss</label></td></tr>
                </table>
            </div>
            <?php submit_button('Save Settings','primary','asl_save_header_settings'); ?>
        </form>
    </div>
    <?php
}

function asl_render_seo_page() {
    if (!current_user_can('manage_options')) return;
    if (isset($_POST['asl_save_seo_settings']) && check_admin_referer('asl_seo_settings_nonce')) {
        asl_save_seo_settings();
        echo '<div class="notice notice-success is-dismissible"><p>Settings saved!</p></div>';
    }
    ?>
    <div class="wrap">
        <h1>SEO Settings</h1>
        <form method="post">
            <?php wp_nonce_field('asl_seo_settings_nonce'); ?>
            <div style="background:#fff;padding:20px;border:1px solid #ccd0d4;">
                <table class="form-table">
                    <tr><th>Meta Title (EN)</th><td><input type="text" name="asl_seo_title" value="<?php echo esc_attr(get_theme_mod('asl_seo_title','')); ?>" class="large-text"></td></tr>
                    <tr><th>Meta Title (AR)</th><td><input type="text" name="asl_seo_title_ar" value="<?php echo esc_attr(get_theme_mod('asl_seo_title_ar','')); ?>" class="large-text" dir="rtl"></td></tr>
                    <tr><th>Meta Description (EN)</th><td><textarea name="asl_seo_description" class="large-text" rows="3"><?php echo esc_textarea(get_theme_mod('asl_seo_description','')); ?></textarea></td></tr>
                    <tr><th>Meta Description (AR)</th><td><textarea name="asl_seo_description_ar" class="large-text" rows="3" dir="rtl"><?php echo esc_textarea(get_theme_mod('asl_seo_description_ar','')); ?></textarea></td></tr>
                    <tr><th>OG Image</th><td><?php asl_image_field('asl_seo_og_image',get_theme_mod('asl_seo_og_image','')); ?></td></tr>
                    <tr><th>Robots</th><td><select name="asl_seo_robots"><option value="index,follow" <?php selected(get_theme_mod('asl_seo_robots','index,follow'),'index,follow'); ?>>Index, Follow</option><option value="noindex,follow" <?php selected(get_theme_mod('asl_seo_robots','index,follow'),'noindex,follow'); ?>>No Index, Follow</option><option value="index,nofollow" <?php selected(get_theme_mod('asl_seo_robots','index,follow'),'index,nofollow'); ?>>Index, No Follow</option><option value="noindex,nofollow" <?php selected(get_theme_mod('asl_seo_robots','index,follow'),'noindex,nofollow'); ?>>No Index, No Follow</option></select></td></tr>
                </table>
            </div>
            <?php submit_button('Save Settings','primary','asl_save_seo_settings'); ?>
        </form>
    </div>
    <?php
}

function asl_render_mobile_page() {
    if (!current_user_can('manage_options')) return;
    if (isset($_POST['asl_save_mobile_settings']) && check_admin_referer('asl_mobile_settings_nonce')) {
        asl_save_mobile_settings();
        echo '<div class="notice notice-success is-dismissible"><p>Settings saved!</p></div>';
    }
    $icons = array('home'=>'Home','shop'=>'Shop','categories'=>'Categories','wishlist'=>'Wishlist','account'=>'Account','cart'=>'Cart','search'=>'Search','menu'=>'Menu');
    ?>
    <div class="wrap">
        <h1>Mobile Settings</h1>
        <form method="post">
            <?php wp_nonce_field('asl_mobile_settings_nonce'); ?>
            <div style="background:#fff;padding:20px;border:1px solid #ccd0d4;">
                <h2>Mobile Bottom Bar</h2>
                <table class="form-table">
                    <tr><th>Enable</th><td><label><input type="checkbox" name="asl_mobile_bar_enabled" value="1" <?php checked(get_theme_mod('asl_mobile_bar_enabled',true)); ?>> Show</label></td></tr>
                </table>
                <h3>Navigation Items (5 max)</h3>
                <?php for ($i=1; $i<=5; $i++): ?>
                <div style="background:#f9f9f9;padding:15px;margin-bottom:15px;border:1px solid #ddd;">
                    <h4>Item <?php echo $i; ?></h4>
                    <table class="form-table">
                        <tr><th>Enable</th><td><label><input type="checkbox" name="asl_mobile_bar_<?php echo $i; ?>_enabled" value="1" <?php checked(get_theme_mod("asl_mobile_bar_{$i}_enabled",true)); ?>> Show</label></td></tr>
                        <tr><th>Icon</th><td><select name="asl_mobile_bar_<?php echo $i; ?>_icon"><?php foreach ($icons as $v=>$l): ?><option value="<?php echo $v; ?>" <?php selected(get_theme_mod("asl_mobile_bar_{$i}_icon",''),$v); ?>><?php echo $l; ?></option><?php endforeach; ?></select></td></tr>
                        <tr><th>Label (EN)</th><td><input type="text" name="asl_mobile_bar_<?php echo $i; ?>_label" value="<?php echo esc_attr(get_theme_mod("asl_mobile_bar_{$i}_label",'')); ?>" class="regular-text"></td></tr>
                        <tr><th>Label (AR)</th><td><input type="text" name="asl_mobile_bar_<?php echo $i; ?>_label_ar" value="<?php echo esc_attr(get_theme_mod("asl_mobile_bar_{$i}_label_ar",'')); ?>" class="regular-text" dir="rtl"></td></tr>
                        <tr><th>URL</th><td><input type="text" name="asl_mobile_bar_<?php echo $i; ?>_url" value="<?php echo esc_attr(get_theme_mod("asl_mobile_bar_{$i}_url",'')); ?>" class="regular-text"></td></tr>
                    </table>
                </div>
                <?php endfor; ?>
            </div>
            <?php submit_button('Save Settings','primary','asl_save_mobile_settings'); ?>
        </form>
    </div>
    <?php
}

function asl_save_home_settings() {
    set_theme_mod('asl_hero_enabled', isset($_POST['asl_hero_enabled']));
    set_theme_mod('asl_hero_hide_mobile', isset($_POST['asl_hero_hide_mobile']));
    set_theme_mod('asl_hero_hide_desktop', isset($_POST['asl_hero_hide_desktop']));
    set_theme_mod('asl_hero_autoplay', isset($_POST['asl_hero_autoplay']));
    set_theme_mod('asl_hero_autoplay_delay', absint($_POST['asl_hero_autoplay_delay'] ?? 5000));
    set_theme_mod('asl_hero_loop', isset($_POST['asl_hero_loop']));
    $slides = array();
    if (isset($_POST['asl_hero_slides']) && is_array($_POST['asl_hero_slides'])) {
        foreach ($_POST['asl_hero_slides'] as $s) {
            $slides[] = array('image'=>esc_url_raw($s['image']??''),'mobile'=>esc_url_raw($s['mobile']??''),'link'=>esc_url_raw($s['link']??''));
        }
    }
    set_theme_mod('asl_hero_slides', $slides);
    foreach (['new_products','bestseller','featured'] as $key) {
        set_theme_mod("asl_{$key}_enabled", isset($_POST["asl_{$key}_enabled"]));
        set_theme_mod("asl_{$key}_hide_mobile", isset($_POST["asl_{$key}_hide_mobile"]));
        set_theme_mod("asl_{$key}_hide_desktop", isset($_POST["asl_{$key}_hide_desktop"]));
        set_theme_mod("asl_{$key}_title", sanitize_text_field($_POST["asl_{$key}_title"]??''));
        set_theme_mod("asl_{$key}_title_ar", sanitize_text_field($_POST["asl_{$key}_title_ar"]??''));
        set_theme_mod("asl_{$key}_subtitle", sanitize_text_field($_POST["asl_{$key}_subtitle"]??''));
        set_theme_mod("asl_{$key}_subtitle_ar", sanitize_text_field($_POST["asl_{$key}_subtitle_ar"]??''));
        set_theme_mod("asl_{$key}_count", absint($_POST["asl_{$key}_count"]??8));
        set_theme_mod("asl_{$key}_display", sanitize_text_field($_POST["asl_{$key}_display"]??'slider'));
        set_theme_mod("asl_{$key}_autoplay", isset($_POST["asl_{$key}_autoplay"]));
        set_theme_mod("asl_{$key}_cols_desktop", absint($_POST["asl_{$key}_cols_desktop"]??4));
        set_theme_mod("asl_{$key}_cols_tablet", absint($_POST["asl_{$key}_cols_tablet"]??3));
        set_theme_mod("asl_{$key}_cols_mobile", absint($_POST["asl_{$key}_cols_mobile"]??2));
    }
    set_theme_mod('asl_categories_enabled', isset($_POST['asl_categories_enabled']));
    set_theme_mod('asl_categories_hide_mobile', isset($_POST['asl_categories_hide_mobile']));
    set_theme_mod('asl_categories_hide_desktop', isset($_POST['asl_categories_hide_desktop']));
    set_theme_mod('asl_categories_title', sanitize_text_field($_POST['asl_categories_title']??''));
    set_theme_mod('asl_categories_title_ar', sanitize_text_field($_POST['asl_categories_title_ar']??''));
    set_theme_mod('asl_categories_count', absint($_POST['asl_categories_count']??6));
    set_theme_mod('asl_categories_cols_desktop', absint($_POST['asl_categories_cols_desktop']??6));
    set_theme_mod('asl_categories_cols_tablet', absint($_POST['asl_categories_cols_tablet']??4));
    set_theme_mod('asl_categories_cols_mobile', absint($_POST['asl_categories_cols_mobile']??3));
    set_theme_mod('asl_collections_enabled', isset($_POST['asl_collections_enabled']));
    set_theme_mod('asl_collections_hide_mobile', isset($_POST['asl_collections_hide_mobile']));
    set_theme_mod('asl_collections_hide_desktop', isset($_POST['asl_collections_hide_desktop']));
    set_theme_mod('asl_collections_title', sanitize_text_field($_POST['asl_collections_title']??''));
    set_theme_mod('asl_collections_title_ar', sanitize_text_field($_POST['asl_collections_title_ar']??''));
    set_theme_mod('asl_collections_layout', sanitize_text_field($_POST['asl_collections_layout']??'grid'));
    set_theme_mod('asl_collections_cols_desktop', absint($_POST['asl_collections_cols_desktop']??3));
    set_theme_mod('asl_collections_cols_tablet', absint($_POST['asl_collections_cols_tablet']??2));
    set_theme_mod('asl_collections_cols_mobile', absint($_POST['asl_collections_cols_mobile']??1));
    $collections = array();
    if (isset($_POST['asl_collections_items']) && is_array($_POST['asl_collections_items'])) {
        foreach ($_POST['asl_collections_items'] as $item) {
            $collections[] = array('image'=>esc_url_raw($item['image']??''),'title'=>sanitize_text_field($item['title']??''),'title_ar'=>sanitize_text_field($item['title_ar']??''),'description'=>sanitize_textarea_field($item['description']??''),'description_ar'=>sanitize_textarea_field($item['description_ar']??''),'link'=>esc_url_raw($item['link']??''));
        }
    }
    set_theme_mod('asl_collections_items', $collections);
    set_theme_mod('asl_banners_enabled', isset($_POST['asl_banners_enabled']));
    set_theme_mod('asl_banners_hide_mobile', isset($_POST['asl_banners_hide_mobile']));
    set_theme_mod('asl_banners_hide_desktop', isset($_POST['asl_banners_hide_desktop']));
    set_theme_mod('asl_banners_layout', sanitize_text_field($_POST['asl_banners_layout']??'grid'));
    set_theme_mod('asl_banners_cols_desktop', absint($_POST['asl_banners_cols_desktop']??2));
    set_theme_mod('asl_banners_cols_tablet', absint($_POST['asl_banners_cols_tablet']??2));
    set_theme_mod('asl_banners_cols_mobile', absint($_POST['asl_banners_cols_mobile']??1));
    $banners = array();
    if (isset($_POST['asl_banners_items']) && is_array($_POST['asl_banners_items'])) {
        foreach ($_POST['asl_banners_items'] as $item) {
            $banners[] = array('image'=>esc_url_raw($item['image']??''),'mobile'=>esc_url_raw($item['mobile']??''),'title'=>sanitize_text_field($item['title']??''),'title_ar'=>sanitize_text_field($item['title_ar']??''),'subtitle'=>sanitize_text_field($item['subtitle']??''),'subtitle_ar'=>sanitize_text_field($item['subtitle_ar']??''),'link'=>esc_url_raw($item['link']??''));
        }
    }
    set_theme_mod('asl_banners_items', $banners);
}

function asl_save_header_settings() {
    set_theme_mod('asl_header_sticky', isset($_POST['asl_header_sticky']));
    set_theme_mod('asl_sticky_logo', esc_url_raw($_POST['asl_sticky_logo']??''));
    set_theme_mod('asl_logo_dark', esc_url_raw($_POST['asl_logo_dark']??''));
    set_theme_mod('asl_topbar_enabled', isset($_POST['asl_topbar_enabled']));
    set_theme_mod('asl_topbar_text', sanitize_text_field($_POST['asl_topbar_text']??''));
    set_theme_mod('asl_topbar_text_ar', sanitize_text_field($_POST['asl_topbar_text_ar']??''));
    set_theme_mod('asl_topbar_link', esc_url_raw($_POST['asl_topbar_link']??''));
    set_theme_mod('asl_topbar_bg_color', sanitize_hex_color($_POST['asl_topbar_bg_color']??'#f3f4f6'));
    set_theme_mod('asl_topbar_text_color', sanitize_hex_color($_POST['asl_topbar_text_color']??'#4b5563'));
    set_theme_mod('asl_topbar_dismissible', isset($_POST['asl_topbar_dismissible']));
}

function asl_save_seo_settings() {
    set_theme_mod('asl_seo_title', sanitize_text_field($_POST['asl_seo_title']??''));
    set_theme_mod('asl_seo_title_ar', sanitize_text_field($_POST['asl_seo_title_ar']??''));
    set_theme_mod('asl_seo_description', sanitize_textarea_field($_POST['asl_seo_description']??''));
    set_theme_mod('asl_seo_description_ar', sanitize_textarea_field($_POST['asl_seo_description_ar']??''));
    set_theme_mod('asl_seo_og_image', esc_url_raw($_POST['asl_seo_og_image']??''));
    set_theme_mod('asl_seo_robots', sanitize_text_field($_POST['asl_seo_robots']??'index,follow'));
}

function asl_save_mobile_settings() {
    set_theme_mod('asl_mobile_bar_enabled', isset($_POST['asl_mobile_bar_enabled']));
    for ($i=1; $i<=5; $i++) {
        set_theme_mod("asl_mobile_bar_{$i}_enabled", isset($_POST["asl_mobile_bar_{$i}_enabled"]));
        set_theme_mod("asl_mobile_bar_{$i}_icon", sanitize_text_field($_POST["asl_mobile_bar_{$i}_icon"]??''));
        set_theme_mod("asl_mobile_bar_{$i}_label", sanitize_text_field($_POST["asl_mobile_bar_{$i}_label"]??''));
        set_theme_mod("asl_mobile_bar_{$i}_label_ar", sanitize_text_field($_POST["asl_mobile_bar_{$i}_label_ar"]??''));
        set_theme_mod("asl_mobile_bar_{$i}_url", sanitize_text_field($_POST["asl_mobile_bar_{$i}_url"]??''));
    }
}

add_action('rest_api_init', function() {
    register_rest_route('asl/v1', '/customizer', array('methods'=>'GET','callback'=>'asl_get_customizer_settings','permission_callback'=>'__return_true'));
    register_rest_route('asl/v1', '/home-settings', array('methods'=>'GET','callback'=>'asl_get_home_settings','permission_callback'=>'__return_true'));
    register_rest_route('asl/v1', '/site-settings', array('methods'=>'GET','callback'=>'asl_get_site_settings','permission_callback'=>'__return_true'));
    register_rest_route('asl/v1', '/header-settings', array('methods'=>'GET','callback'=>'asl_get_header_settings','permission_callback'=>'__return_true'));
    register_rest_route('asl/v1', '/seo-settings', array('methods'=>'GET','callback'=>'asl_get_seo_settings','permission_callback'=>'__return_true'));
    register_rest_route('asl/v1', '/mobile-bar', array('methods'=>'GET','callback'=>'asl_get_mobile_bar_settings','permission_callback'=>'__return_true'));
    register_rest_route('asl/v1', '/topbar', array('methods'=>'GET','callback'=>'asl_get_topbar_settings','permission_callback'=>'__return_true'));
    register_rest_route('asl/v1', '/menu/(?P<location>[a-zA-Z0-9_-]+)', array('methods'=>'GET','callback'=>'asl_get_menu','permission_callback'=>'__return_true'));
});

function asl_get_customizer_settings() {
    return array('site'=>asl_get_site_settings(),'header'=>asl_get_header_settings(),'topBar'=>asl_get_topbar_settings(),'seo'=>asl_get_seo_settings(),'mobileBar'=>asl_get_mobile_bar_settings(),'hero'=>asl_get_hero_settings(),'newProducts'=>asl_get_products_settings('new_products'),'bestseller'=>asl_get_products_settings('bestseller'),'categories'=>asl_get_categories_settings(),'featured'=>asl_get_products_settings('featured'),'collections'=>asl_get_collections_settings(),'banners'=>asl_get_banners_settings());
}

function asl_get_home_settings() {
    return array('hero'=>asl_get_hero_settings(),'newProducts'=>asl_get_products_settings('new_products'),'bestseller'=>asl_get_products_settings('bestseller'),'categories'=>asl_get_categories_settings(),'featured'=>asl_get_products_settings('featured'),'collections'=>asl_get_collections_settings(),'banners'=>asl_get_banners_settings());
}

function asl_get_site_settings() {
    $logo_id = get_theme_mod('custom_logo');
    $icon_id = get_option('site_icon');
    return array('name'=>get_bloginfo('name'),'description'=>get_bloginfo('description'),'url'=>get_bloginfo('url'),'logo'=>array('id'=>$logo_id,'url'=>$logo_id?wp_get_attachment_image_url($logo_id,'full'):''),'favicon'=>array('id'=>$icon_id,'url'=>$icon_id?wp_get_attachment_image_url($icon_id,'full'):''));
}

function asl_get_header_settings() {
    $logo_id = get_theme_mod('custom_logo');
    return array('sticky'=>get_theme_mod('asl_header_sticky',true),'logo'=>$logo_id?wp_get_attachment_image_url($logo_id,'full'):'','stickyLogo'=>get_theme_mod('asl_sticky_logo',''),'logoDark'=>get_theme_mod('asl_logo_dark',''));
}

function asl_get_topbar_settings() {
    return array('enabled'=>get_theme_mod('asl_topbar_enabled',true),'text'=>get_theme_mod('asl_topbar_text','Free shipping on orders over 200 SAR'),'textAr'=>get_theme_mod('asl_topbar_text_ar',''),'link'=>get_theme_mod('asl_topbar_link',''),'bgColor'=>get_theme_mod('asl_topbar_bg_color','#f3f4f6'),'textColor'=>get_theme_mod('asl_topbar_text_color','#4b5563'),'dismissible'=>get_theme_mod('asl_topbar_dismissible',false));
}

function asl_get_seo_settings() {
    return array('title'=>get_theme_mod('asl_seo_title',''),'titleAr'=>get_theme_mod('asl_seo_title_ar',''),'description'=>get_theme_mod('asl_seo_description',''),'descriptionAr'=>get_theme_mod('asl_seo_description_ar',''),'ogImage'=>get_theme_mod('asl_seo_og_image',''),'robots'=>get_theme_mod('asl_seo_robots','index,follow'));
}

function asl_get_mobile_bar_settings() {
    $items = array();
    for ($i=1; $i<=5; $i++) {
        if (get_theme_mod("asl_mobile_bar_{$i}_enabled",true)) {
            $items[] = array('icon'=>get_theme_mod("asl_mobile_bar_{$i}_icon",''),'label'=>get_theme_mod("asl_mobile_bar_{$i}_label",''),'labelAr'=>get_theme_mod("asl_mobile_bar_{$i}_label_ar",''),'url'=>get_theme_mod("asl_mobile_bar_{$i}_url",''));
        }
    }
    return array('enabled'=>get_theme_mod('asl_mobile_bar_enabled',true),'items'=>$items);
}

function asl_get_hero_settings() {
    $slides = get_theme_mod('asl_hero_slides', array());
    if (empty($slides)) {
        for ($i=1; $i<=5; $i++) {
            $img = get_theme_mod("asl_hero_slide_{$i}_image",'');
            if (!empty($img)) $slides[] = array('image'=>$img,'mobileImage'=>get_theme_mod("asl_hero_slide_{$i}_mobile",$img),'link'=>get_theme_mod("asl_hero_slide_{$i}_link",''));
        }
    } else {
        $slides = array_map(function($s) { return array('image'=>$s['image']??'','mobileImage'=>$s['mobile']??$s['image']??'','link'=>$s['link']??''); }, $slides);
    }
    return array('enabled'=>get_theme_mod('asl_hero_enabled',true),'hideOnMobile'=>get_theme_mod('asl_hero_hide_mobile',false),'hideOnDesktop'=>get_theme_mod('asl_hero_hide_desktop',false),'autoplay'=>get_theme_mod('asl_hero_autoplay',true),'autoplayDelay'=>get_theme_mod('asl_hero_autoplay_delay',5000),'loop'=>get_theme_mod('asl_hero_loop',true),'slides'=>$slides);
}

function asl_get_products_settings($key) {
    return array('enabled'=>get_theme_mod("asl_{$key}_enabled",true),'hideOnMobile'=>get_theme_mod("asl_{$key}_hide_mobile",false),'hideOnDesktop'=>get_theme_mod("asl_{$key}_hide_desktop",false),'title'=>get_theme_mod("asl_{$key}_title",''),'titleAr'=>get_theme_mod("asl_{$key}_title_ar",''),'subtitle'=>get_theme_mod("asl_{$key}_subtitle",''),'subtitleAr'=>get_theme_mod("asl_{$key}_subtitle_ar",''),'count'=>get_theme_mod("asl_{$key}_count",8),'display'=>get_theme_mod("asl_{$key}_display",'slider'),'autoplay'=>get_theme_mod("asl_{$key}_autoplay",true),'responsive'=>array('desktop'=>get_theme_mod("asl_{$key}_cols_desktop",4),'tablet'=>get_theme_mod("asl_{$key}_cols_tablet",3),'mobile'=>get_theme_mod("asl_{$key}_cols_mobile",2)));
}

function asl_get_categories_settings() {
    return array('enabled'=>get_theme_mod('asl_categories_enabled',true),'hideOnMobile'=>get_theme_mod('asl_categories_hide_mobile',false),'hideOnDesktop'=>get_theme_mod('asl_categories_hide_desktop',false),'title'=>get_theme_mod('asl_categories_title','Shop by Category'),'titleAr'=>get_theme_mod('asl_categories_title_ar',''),'subtitle'=>get_theme_mod('asl_categories_subtitle',''),'subtitleAr'=>get_theme_mod('asl_categories_subtitle_ar',''),'count'=>get_theme_mod('asl_categories_count',6),'responsive'=>array('desktop'=>get_theme_mod('asl_categories_cols_desktop',6),'tablet'=>get_theme_mod('asl_categories_cols_tablet',4),'mobile'=>get_theme_mod('asl_categories_cols_mobile',3)));
}

function asl_get_collections_settings() {
    $items = get_theme_mod('asl_collections_items', array());
    if (empty($items)) {
        for ($i=1; $i<=6; $i++) {
            $img = get_theme_mod("asl_collection_{$i}_image",'');
            $title = get_theme_mod("asl_collection_{$i}_title",'');
            if (!empty($img)||!empty($title)) $items[] = array('image'=>$img,'title'=>$title,'titleAr'=>get_theme_mod("asl_collection_{$i}_title_ar",''),'description'=>get_theme_mod("asl_collection_{$i}_description",''),'descriptionAr'=>get_theme_mod("asl_collection_{$i}_description_ar",''),'link'=>get_theme_mod("asl_collection_{$i}_link",''));
        }
    } else {
        $items = array_map(function($item) { return array('image'=>$item['image']??'','title'=>$item['title']??'','titleAr'=>$item['title_ar']??'','description'=>$item['description']??'','descriptionAr'=>$item['description_ar']??'','link'=>$item['link']??''); }, $items);
    }
    return array('enabled'=>get_theme_mod('asl_collections_enabled',true),'hideOnMobile'=>get_theme_mod('asl_collections_hide_mobile',false),'hideOnDesktop'=>get_theme_mod('asl_collections_hide_desktop',false),'title'=>get_theme_mod('asl_collections_title','Our Collections'),'titleAr'=>get_theme_mod('asl_collections_title_ar',''),'subtitle'=>get_theme_mod('asl_collections_subtitle',''),'subtitleAr'=>get_theme_mod('asl_collections_subtitle_ar',''),'layout'=>get_theme_mod('asl_collections_layout','grid'),'responsive'=>array('desktop'=>get_theme_mod('asl_collections_cols_desktop',3),'tablet'=>get_theme_mod('asl_collections_cols_tablet',2),'mobile'=>get_theme_mod('asl_collections_cols_mobile',1)),'items'=>$items);
}

function asl_get_banners_settings() {
    $items = get_theme_mod('asl_banners_items', array());
    if (empty($items)) {
        for ($i=1; $i<=4; $i++) {
            $img = get_theme_mod("asl_banner_{$i}_image",'');
            if (!empty($img)) $items[] = array('image'=>$img,'mobileImage'=>get_theme_mod("asl_banner_{$i}_mobile",$img),'title'=>get_theme_mod("asl_banner_{$i}_title",''),'titleAr'=>get_theme_mod("asl_banner_{$i}_title_ar",''),'subtitle'=>get_theme_mod("asl_banner_{$i}_subtitle",''),'subtitleAr'=>get_theme_mod("asl_banner_{$i}_subtitle_ar",''),'link'=>get_theme_mod("asl_banner_{$i}_link",''));
        }
    } else {
        $items = array_map(function($item) { return array('image'=>$item['image']??'','mobileImage'=>$item['mobile']??$item['image']??'','title'=>$item['title']??'','titleAr'=>$item['title_ar']??'','subtitle'=>$item['subtitle']??'','subtitleAr'=>$item['subtitle_ar']??'','link'=>$item['link']??''); }, $items);
    }
    return array('enabled'=>get_theme_mod('asl_banners_enabled',true),'hideOnMobile'=>get_theme_mod('asl_banners_hide_mobile',false),'hideOnDesktop'=>get_theme_mod('asl_banners_hide_desktop',false),'layout'=>get_theme_mod('asl_banners_layout','grid'),'responsive'=>array('desktop'=>get_theme_mod('asl_banners_cols_desktop',2),'tablet'=>get_theme_mod('asl_banners_cols_tablet',2),'mobile'=>get_theme_mod('asl_banners_cols_mobile',1)),'items'=>$items);
}

function asl_get_menu($request) {
    $location = $request['location'];
    $locations = get_nav_menu_locations();
    if (!isset($locations[$location])) {
        $menu = wp_get_nav_menu_object($location);
        if (!$menu) return new WP_Error('no_menu','Menu not found',array('status'=>404));
        $menu_id = $menu->term_id;
    } else {
        $menu_id = $locations[$location];
    }
    $menu_items = wp_get_nav_menu_items($menu_id);
    if (!$menu_items) return array('items'=>array());
    $items = array();
    foreach ($menu_items as $item) {
        $items[] = array('id'=>$item->ID,'title'=>$item->title,'url'=>$item->url,'target'=>$item->target,'parent'=>$item->menu_item_parent,'classes'=>implode(' ',$item->classes),'order'=>$item->menu_order);
    }
    return array('id'=>$menu_id,'name'=>wp_get_nav_menu_object($menu_id)->name,'items'=>$items);
}

add_action('after_setup_theme', function() {
    register_nav_menus(array('primary'=>'Primary Menu','footer'=>'Footer Menu'));
    add_theme_support('custom-logo',array('height'=>100,'width'=>400,'flex-height'=>true,'flex-width'=>true));
});

add_action('rest_api_init', function() {
    remove_filter('rest_pre_serve_request','rest_send_cors_headers');
    add_filter('rest_pre_serve_request', function($value) {
        $origin = get_http_origin();
        $allowed = array('https://aromaticscentslab.com','https://asl-frontend-seven.vercel.app','http://localhost:3000','http://localhost:3001');
        header('Access-Control-Allow-Origin: '.(in_array($origin,$allowed)?esc_url_raw($origin):'*'));
        header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
        header('Access-Control-Allow-Credentials: true');
        header('Access-Control-Allow-Headers: Authorization, Content-Type');
        return $value;
    });
}, 15);

add_action('admin_head', function() {
    if (strpos(get_current_screen()->id,'asl-settings')===false) return;
    echo '<style>.nav-tab-wrapper{margin-bottom:0}.tab-content{margin-top:0}.form-table th{width:200px}.asl-image-field{display:flex;flex-wrap:wrap;align-items:flex-start;gap:10px}.asl-preview{flex-basis:100%}</style>';
});

// ============================================================================
// ASL BUNDLES CREATOR - REST API ENDPOINTS
// ============================================================================

add_action('rest_api_init', function() {
    // Get all bundles or filter by product_id
    register_rest_route('asl-bundles/v1', '/bundles', array(
        'methods' => 'GET',
        'callback' => 'asl_bundles_get_all',
        'permission_callback' => '__return_true',
    ));

    // Get single bundle by ID
    register_rest_route('asl-bundles/v1', '/bundles/(?P<id>[a-zA-Z0-9-]+)', array(
        'methods' => 'GET',
        'callback' => 'asl_bundles_get_single',
        'permission_callback' => '__return_true',
    ));

    // Create new bundle
    register_rest_route('asl-bundles/v1', '/bundles', array(
        'methods' => 'POST',
        'callback' => 'asl_bundles_create',
        'permission_callback' => 'asl_bundles_check_permission',
    ));

    // Update bundle
    register_rest_route('asl-bundles/v1', '/bundles/(?P<id>[a-zA-Z0-9-]+)', array(
        'methods' => 'PUT',
        'callback' => 'asl_bundles_update',
        'permission_callback' => 'asl_bundles_check_permission',
    ));

    // Delete bundle
    register_rest_route('asl-bundles/v1', '/bundles/(?P<id>[a-zA-Z0-9-]+)', array(
        'methods' => 'DELETE',
        'callback' => 'asl_bundles_delete',
        'permission_callback' => 'asl_bundles_check_permission',
    ));
});

function asl_bundles_check_permission() {
    return current_user_can('manage_options') || current_user_can('manage_woocommerce');
}

function asl_bundles_get_all($request) {
    $bundles = get_option('asl_bundles_data', array());
    $product_id = $request->get_param('product_id');
    
    if ($product_id) {
        $product_id = intval($product_id);
        $filtered = array_filter($bundles, function($bundle) use ($product_id) {
            return isset($bundle['product_id']) && intval($bundle['product_id']) === $product_id;
        });
        return array_values($filtered);
    }
    
    return array_values($bundles);
}

function asl_bundles_get_single($request) {
    $id = $request->get_param('id');
    $bundles = get_option('asl_bundles_data', array());
    
    if (isset($bundles[$id])) {
        return $bundles[$id];
    }
    
    return new WP_Error('not_found', 'Bundle not found', array('status' => 404));
}

function asl_bundles_create($request) {
    $data = $request->get_json_params();
    
    if (empty($data['id'])) {
        $data['id'] = wp_generate_uuid4();
    }
    
    $bundle = asl_bundles_sanitize_bundle($data);
    $bundle['created_at'] = $data['created_at'] ?? current_time('c');
    $bundle['updated_at'] = current_time('c');
    
    $bundles = get_option('asl_bundles_data', array());
    $bundles[$bundle['id']] = $bundle;
    update_option('asl_bundles_data', $bundles);
    
    return $bundle;
}

function asl_bundles_update($request) {
    $id = $request->get_param('id');
    $data = $request->get_json_params();
    
    $bundles = get_option('asl_bundles_data', array());
    
    if (!isset($bundles[$id])) {
        return new WP_Error('not_found', 'Bundle not found', array('status' => 404));
    }
    
    $bundle = asl_bundles_sanitize_bundle($data);
    $bundle['id'] = $id;
    $bundle['created_at'] = $bundles[$id]['created_at'] ?? current_time('c');
    $bundle['updated_at'] = current_time('c');
    
    $bundles[$id] = $bundle;
    update_option('asl_bundles_data', $bundles);
    
    return $bundle;
}

function asl_bundles_delete($request) {
    $id = $request->get_param('id');
    $bundles = get_option('asl_bundles_data', array());
    
    if (!isset($bundles[$id])) {
        return new WP_Error('not_found', 'Bundle not found', array('status' => 404));
    }
    
    unset($bundles[$id]);
    update_option('asl_bundles_data', $bundles);
    
    return array('success' => true, 'message' => 'Bundle deleted successfully');
}

function asl_bundles_sanitize_bundle($data) {
    $bundle = array(
        'id' => sanitize_text_field($data['id'] ?? ''),
        'product_id' => isset($data['product_id']) ? intval($data['product_id']) : null,
        'title' => sanitize_text_field($data['title'] ?? ''),
        'bundle_type' => sanitize_text_field($data['bundle_type'] ?? 'custom'),
        'shipping_fee' => sanitize_text_field($data['shipping_fee'] ?? 'apply_to_each_bundled_product'),
        'is_enabled' => !empty($data['is_enabled']),
        'pricing' => array(
            'mode' => sanitize_text_field($data['pricing']['mode'] ?? 'box_fixed_price'),
            'box_price' => floatval($data['pricing']['box_price'] ?? 0),
            'included_items_count' => intval($data['pricing']['included_items_count'] ?? 3),
            'extra_item_charging_method' => sanitize_text_field($data['pricing']['extra_item_charging_method'] ?? 'cheapest_first'),
            'show_product_prices' => !empty($data['pricing']['show_product_prices']),
        ),
        'items' => array(),
    );
    
    if (!empty($data['items']) && is_array($data['items'])) {
        foreach ($data['items'] as $item) {
            $bundle['items'][] = array(
                'id' => sanitize_text_field($item['id'] ?? ''),
                'title' => sanitize_text_field($item['title'] ?? ''),
                'is_expanded' => !empty($item['is_expanded']),
                'rule' => array(
                    'categories' => array_map('intval', $item['rule']['categories'] ?? array()),
                    'exclude_categories' => array_map('intval', $item['rule']['exclude_categories'] ?? array()),
                    'tags' => array_map('intval', $item['rule']['tags'] ?? array()),
                    'exclude_tags' => array_map('intval', $item['rule']['exclude_tags'] ?? array()),
                    'products' => array_map('intval', $item['rule']['products'] ?? array()),
                    'product_variations' => array_map('intval', $item['rule']['product_variations'] ?? array()),
                    'exclude_products' => array_map('intval', $item['rule']['exclude_products'] ?? array()),
                    'exclude_product_variations' => array_map('intval', $item['rule']['exclude_product_variations'] ?? array()),
                ),
                'display' => array(
                    'custom_title' => sanitize_text_field($item['display']['custom_title'] ?? ''),
                    'sort_by' => sanitize_text_field($item['display']['sort_by'] ?? 'price'),
                    'sort_order' => sanitize_text_field($item['display']['sort_order'] ?? 'asc'),
                    'is_default' => !empty($item['display']['is_default']),
                    'default_product_id' => isset($item['display']['default_product_id']) ? intval($item['display']['default_product_id']) : null,
                    'quantity' => intval($item['display']['quantity'] ?? 1),
                    'quantity_min' => intval($item['display']['quantity_min'] ?? 1),
                    'quantity_max' => intval($item['display']['quantity_max'] ?? 10),
                    'discount_type' => sanitize_text_field($item['display']['discount_type'] ?? 'percent'),
                    'discount_value' => floatval($item['display']['discount_value'] ?? 0),
                    'is_optional' => !empty($item['display']['is_optional']),
                    'show_price' => isset($item['display']['show_price']) ? !empty($item['display']['show_price']) : true,
                ),
            );
        }
    }
    
    return $bundle;
}
