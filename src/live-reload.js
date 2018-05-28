// let opn = require('opn');
let hot = require('@neutrinojs/hot');
let LiveReloadPlugin = require('webpack-livereload-plugin');

module.exports = function (neutrino, settings = {}) {
	// let openInBrowser = settings.open === undefined ? false : Boolean(settings.open);
	let livereload = settings.hot === undefined ? true : Boolean(settings.hot);

	neutrino.config
		.devServer
			.clear()
			.end()

		// .when(openInBrowser, function () {
		// 		neutrino.on('start', function () {
		// 			opn(`${protocol}://${localHost}:${port}`, { wait: false })
		// 		})
		// 	})
		.when(livereload, function (config) {
			neutrino.use(hot);
			config.plugin('livereload')
				.use(LiveReloadPlugin, [{
					quiet: true,
					protocol: 'http',
					port: 35729,
					hostname: 'localhost',
					appendScriptTag: true,
					ignore: null, // RegExp
					delay: 400
				}])
				.end();
		});
};