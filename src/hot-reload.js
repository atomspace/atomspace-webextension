

let opn = require('opn');
let hot = require('@neutrinojs/hot');


module.exports = function (neutrino, settings = {}) {
	let config = neutrino.config;
	let https = settings.https;
	let protocol = https ? 'https' : 'http';
	let port = settings.port || 5000;
	let host = serverPublic ? '0.0.0.0' : 'localhost';
	let openInBrowser = settings.open !== undefined ? Boolean(settings.open) : true;
	let livereload = settings.hot !== undefined ? Boolean(settings.hot) : true;

	config
		.devServer
			.clear()
			.end()
		.when(openInBrowser, function (devServer) {
			neutrino.on('start', function () {
				opn(`${protocol}://${localHost}:${port}`, { wait: false });
			});
		})
			.end()
		.when(livereload, function (config) {
			let https = config.devServer.get('https');
			let protocol = https ? 'https' : 'http';
			let host = config.devServer.get('host');
			let port = config.devServer.get('port');

			neutrino.use(hot);
			Object.keys(neutrino.options.mains)
				.forEach(function (key) {
					config.entry(key).prepend(require.resolve('webpack/hot/dev-server'));
					config.entry(key).prepend(`${require.resolve('webpack-dev-server/client')}?${protocol}://${host}:${port}`);
				});
		});
};