let path = require('path');

let isTruethy = require('./utils/is-truethy');

module.exports = function (neutrino, manifest = {}) {
	let config = neutrino.config;
	let src = neutrino.options.source;

	// let testRun = (process.env.NODE_ENV === 'test')
	// let devRun = (process.env.NODE_ENV === 'development')

	let pages = {
		browser_action: manifest.browser_action && manifest.browser_action.default_popup,
		page_action: manifest.page_action && manifest.page_action.default_popup,
		options_ui: manifest.options_ui && manifest.options_ui.page,
		sidebar_action: manifest.sidebar_action && manifest.sidebar_action.default_panel,
		devtools_page: manifest.devtools_page
	};

	let pagesPaths = Object.keys(pages)
		.map(function (name) { return pages[name]; })
		.filter(isTruethy)
		.map(function (page) {
			return path.resolve(src, page);
		});

	neutrino.options.mains = {};

	if (manifest.background && manifest.background.scripts) {
		config.entry('background').merge(
			manifest.background.scripts.map(function (module) {
				return path.resolve(src, module);
			})
		);
		manifest.background.scripts = ['background.js'];
	}

	if (manifest.content_scripts) {
		manifest.content_scripts = manifest.content_scripts.map(function (script, index) {
			config.entry(`content-${index}`).merge(
				script.js.map(function (module) {
					return path.resolve(src, module);
				})
			);
			script.js = [`content-${index}.js`];
			return script;
		});
	}

	pagesPaths.forEach(function (pagePath) {
		config.entry('entry-pages').add(pagePath);
	});

	config.when(pagesPaths.length, function () {
		config
			.module.rule('entry-pages')
				.test(pagesPaths)
				.include
					.add(src)
					.end()
				.use('file')
					.loader(require.resolve('file-loader'))
					.options({
						name: '[name].[ext]'
					})
					.end()
				.use('extract')
					.loader(require.resolve('extract-loader'))
					.end()
				.use('html')
					.loader(require.resolve('html-loader'))
					.options({
						attrs: ['img:src', 'script:src', 'link:href'],
						interpolate: true
					})
					.end()
				.use('post-html')
					.loader(require.resolve('posthtml-loader'))
					.options({
						plugins: [
							require('posthtml-shorten')({
								shortener: {
									process (url) {
										return Promise.resolve(url.replace(
											url,
											`\${require('spawn-loader!./${url}')}`
										));
									}
								},
								tags: ['script'],
								attributes: ['src']
							})
						]
					})
					.end()
				.end().end();
	});

};