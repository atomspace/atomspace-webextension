let GenerateJsonPlugin = require('generate-json-webpack-plugin');
let deepmerge = require('deepmerge');

module.exports = function (neutrino, extensionManifest = {}) {
	const MANIFEST_NAME = 'manifest.json';
	let devRun = (process.env.NODE_ENV === 'development');
	let npmManifest = neutrino.options.packageJson;
	let manifest = {
		manifest_version: 2,
		version: npmManifest.version,
		name: npmManifest.name,
		description: npmManifest.description,
		author: npmManifest.author,
		homepage_url: npmManifest.homepage,

		background: extensionManifest.background ? {
			persistent: true, // https://developer.chrome.com/extensions/event_pages
			scripts: ['runtime.js']
		} : undefined,

		content_scripts: extensionManifest.content_scripts ? [
			{
				matches: ['<all_urls>'],
				js: ['runtime.js'],
				all_frames: true
			}
		] : undefined,

		browser_action: extensionManifest.browser_action ? {
			// browser_style: false,
			default_icon: {
				16: extensionManifest.icons[16],
				32: extensionManifest.icons[32],
				64: extensionManifest.icons[64]
			},
			default_title: extensionManifest.name || npmManifest.name

			// 'default_popup': 'popup/geo.html'
		} : undefined,

		page_action: extensionManifest.page_action ? {
			// browser_style: false,
			default_icon: {
				19: extensionManifest.icons[19],
				38: extensionManifest.icons[38]
			},
			default_title: extensionManifest.name || npmManifest.name

			// 'default_popup': 'page-popup.html'
		} : undefined,

		// options_ui: {
		// 	page: 'options/options.html'
		// },

		sidebar_action: extensionManifest.sidebar_action ? {
			default_icon: {
				16: extensionManifest.icons[16],
				32: extensionManifest.icons[32],
				64: extensionManifest.icons[64]
			},
			default_title: extensionManifest.name || npmManifest.name

			// 'default_panel': 'sidebar/sidebar.html'
		} : undefined,

		// permissions: devRun ? [
		// 	'*://localhost/*',
		// 	'*://127.0.0.1/*'
		// ]: [],

		content_security_policy: 'script-src \'self\'; object-src \'self\'',
		web_accessible_resources: [
			'static/**/*',
			'*.js.map',
			'*.css.map'
		]
	};

	manifest = deepmerge(manifest, extensionManifest);

	if (devRun) {
		manifest.content_security_policy = manifest.content_security_policy
			.replace('script-src', 'script-src http://localhost:35729')
			.replace('default-src', 'default-src http://localhost:35729')
			.replace('connect-src', 'connect-src ws://localhost:35729');

		if (manifest.background) {
			manifest.background.persistent = true;
		}
	}


	neutrino.config
		.plugin('webextension-manifest')
		.use(GenerateJsonPlugin, [
			MANIFEST_NAME,
			manifest,
			null,
			3
		])
		.end();
};