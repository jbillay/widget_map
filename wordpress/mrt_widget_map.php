<?php
/*
Plugin Name: My Run Trip Widget Carte des départs
Plugin URI: http://www.myruntrip.com
Description: A widget to show all journey start from My Run Trip website
Version: 0.1
Author: Jeremy Billay
Author URI: http://www.myruntrip.com
License: GPL2
*/
/*
Copyright 2012  Jeremy Billay  (email : jeremy.billay@myruntrip.com)

This program is free software; you can redistribute it and/or modify
it under the terms of the GNU General Public License, version 2, as 
published by the Free Software Foundation.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program; if not, write to the Free Software
Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA  02110-1301  USA
*/

if(!class_exists('MRT_Widget_Map'))
{
    class MRT_Widget_Map
    {
        /**
         * Construct the plugin object
         */
        public function __construct()
        {
            // register actions
			add_action('admin_init', array(&$this, 'admin_init'));
			add_action('admin_menu', array(&$this, 'add_menu'));
        } // END public function __construct
    
        /**
         * Activate the plugin
         */
        public static function activate()
        {
            // Do nothing
        } // END public static function activate
    
        /**
         * Deactivate the plugin
         */     
        public static function deactivate()
        {
            // Do nothing
        } // END public static function deactivate
		
		public function admin_init()
		{
			// Set up the settings for this plugin
			$this->init_settings();
			// Possibly do additional admin_init tasks
		} // END public static function activate
		
		public function init_settings()
		{
			// register the settings for this plugin
			register_setting('mrt_widget_map-group', 'mrt_map_run_id');
			register_setting('mrt_widget_map-group', 'mrt_map_api_key');
			register_setting('mrt_widget_map-group', 'mrt_map_display_size');
		} // END public function init_custom_settings()
		
		public function add_menu()
		{
			add_options_page('MRT Widget Map Settings', 'MRT Widget Map', 'manage_options', 'mrt_widget_map', array(&$this, 'plugin_settings_page'));
		} // END public function add_menu()

		public function plugin_settings_page()
		{
			if(!current_user_can('manage_options'))
			{
				wp_die(__('You do not have sufficient permissions to access this page.'));
			}

			// Render the settings template
			include(sprintf("%s/templates/settings.html", dirname(__FILE__)));
		} // END public function plugin_settings_page()
    } // END class MRT_Widget_Map
	
    // Installation and uninstallation hooks
    register_activation_hook(__FILE__, array('MRT_Widget_Map', 'activate'));
    register_deactivation_hook(__FILE__, array('MRT_Widget_Map', 'deactivate'));

    // instantiate the plugin class
    $mrt_widget_map = new MRT_Widget_Map();

	function my_scripts_method_mrt_map() {
		wp_enqueue_style( 'mrt-map-style', plugins_url( '/assets/css/mrt.css' , __FILE__ ) );
		wp_enqueue_script('google-script', 'https://maps.googleapis.com/maps/api/js', array(), '1.0.0', true);
		wp_enqueue_script('mrt-map-script', plugins_url( '/assets/js/main_mrt_map_widget.js' , __FILE__ ), array(), '1.0.0', true);
	}

	add_action( 'wp_enqueue_scripts', 'my_scripts_method_mrt_map' );
		
	function mrt_widget_map_display()
	{
		include(sprintf("%s/templates/widget.html", dirname(__FILE__)));
	}
	
	add_shortcode('mrt_widget_map', 'mrt_widget_map_display');
	
	if(isset($mrt_widget_map))
	{
		// Add the settings link to the plugins page
		function mrt_map_plugin_settings_link($links)
		{ 
			$settings_link = '<a href="options-general.php?page=mrt_widget_map">Settings</a>';
			array_unshift($links, $settings_link);
			return $links; 
		}

		$plugin = plugin_basename(__FILE__); 
		add_filter("plugin_action_links_$plugin", 'mrt_map_plugin_settings_link');
	}
} // END if(!class_exists('MRT_Widget_Map'))

