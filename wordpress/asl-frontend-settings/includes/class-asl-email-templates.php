<?php
/**
 * ASL Email Templates
 *
 * Overrides WooCommerce email templates with custom ASL-branded versions
 * that use the headless frontend URLs instead of WordPress admin URLs.
 *
 * @package ASL_Frontend_Settings
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class ASL_Email_Templates {

	private static $instance = null;

	public static function get_instance() {
		if ( null === self::$instance ) {
			self::$instance = new self();
		}
		return self::$instance;
	}

	private function __construct() {
		add_filter( 'woocommerce_locate_template', array( $this, 'override_woocommerce_template' ), 10, 3 );
	}

	public function override_woocommerce_template( $template, $template_name, $template_path ) {
		if ( strpos( $template_name, 'emails/' ) !== 0 ) {
			return $template;
		}

		$plugin_template = ASL_SETTINGS_PATH . 'woocommerce/' . $template_name;

		if ( file_exists( $plugin_template ) ) {
			return $plugin_template;
		}

		return $template;
	}
}

ASL_Email_Templates::get_instance();
