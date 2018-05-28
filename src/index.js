let path = require('path');

let chunk = require('@neutrinojs/chunk');
let clean = require('@neutrinojs/clean');
// let minify = require('@neutrinojs/minify')
let styleLoader = require('@neutrinojs/style-loader');
let fontLoader = require('@neutrinojs/font-loader');
let imageLoader = require('@neutrinojs/image-loader');
let env = require('@neutrinojs/env');

// let hotReload = require('./hot-reload.js')
let babel = require('./babel');
let webextensionManifest = require('./webextension-manifest');
let webextensionEntries = require('./webextension-entries');
let webextensionPackager = require('./webextension-packager');
let webextensionStatic = require('./webextension-static');
let liveReload = require('./live-reload');
let requireManifest = require('./utils/require-manifest');
let merge = require('./utils/merge');

module.exports = function (neutrino, settings = {}) {
	const NODE_MODULES = path.resolve(__dirname, '../node_modules');
	const PROJECT_NODE_MODULES = path.resolve(process.cwd(), 'node_modules');
	let config = neutrino.config;
	let testRun = (process.env.NODE_ENV === 'test');
	let devRun = (process.env.NODE_ENV === 'development');
	let lintRule = config.module.rules.get('lint');
	let eslintLoader = lintRule && lintRule.uses.get('eslint');
	let manifest = requireManifest(neutrino.options.source);

	if (!settings.browsers) {
		settings.browsers = [
			'firefox >=45',
			'firefoxandroid >=48',
			'chrome >=17',
			'opera >=15',
			'edge >=14' // march 2016
		];
	}

	config
		.devtool(devRun ? 'inline-source-map' : 'source-map')
		.target('web')
		.context(neutrino.options.root)
		.entry('polyfill')
			.add(require.resolve('./polyfills.js'))
			.end()
		.output
			.path(neutrino.options.output)
			.publicPath('./')
			.filename('[name].js')
			.chunkFilename('[name].[chunkhash].js')
			.end()
		.resolve.extensions
			.add('.js')
			.add('.json')
			.end().end()
		.resolve.alias

			// Make sure 2 versions of "core-js" always match in package.json and babel-polyfill/package.json
			.set('core-js', path.dirname(require.resolve('core-js')))
			.end().end()
		.resolve.modules
			.add('node_modules')
			.add(NODE_MODULES)
			.add(PROJECT_NODE_MODULES)
			.add(neutrino.options.node_modules)
			.end().end()
		.resolveLoader.modules
			.add(NODE_MODULES)
			.add(PROJECT_NODE_MODULES)
			.add(neutrino.options.node_modules)
			.end().end()
		.node
			.set('console', false)
			.set('global', true)
			.set('process', true)
			.set('Buffer', false)
			.set('__filename', 'mock')
			.set('__dirname', 'mock')
			.set('setImmediate', true)
			.set('fs', 'empty')
			.set('tls', 'empty')
			.end();

	neutrino.use(env);

	neutrino.use(babel, {
		include: [
			neutrino.options.source,
			neutrino.options.tests,
			require.resolve('./polyfills.js')
		],
		browsers: settings.browsers
	});
	neutrino.use(styleLoader);
	neutrino.use(fontLoader);
	neutrino.use(imageLoader);
	neutrino.use(clean, { paths: [neutrino.options.output] });
	neutrino.use(webextensionEntries, manifest);
	neutrino.use(webextensionManifest, manifest);
	neutrino.use(webextensionPackager, manifest);
	neutrino.use(webextensionStatic, manifest);

	if (!testRun) {
		neutrino.use(chunk);
	}

	if (devRun) {
		// neutrino.use(hotReload, settings.server)
		neutrino.use(liveReload);
	}
	else {
		// neutrino.use(minify)
	}

	if (eslintLoader) {
		lintRule
			.pre();
		eslintLoader
			.tap(merge({
				envs: ['browser', 'commonjs', 'webextensions']
			}));
	}
};