let opn = require('opn');
let hot = require('@neutrinojs/hot');

module.exports = function (neutrino, settings = {}) {
	let config = neutrino.config;
	let https = settings.https;
	let protocol = https ? 'https' : 'http';
	let port = settings.port || 5000;

	// let host = serverPublic ? '0.0.0.0' : 'localhost';
	let host = 'localhost';
	let localHost = 'localhost';
	let openInBrowser = settings.open === undefined ? true : Boolean(settings.open);

	config
		.devServer
			.clear()
			.end()
			.when(openInBrowser, function () {
				neutrino.on('start', function () {
					opn(`${protocol}://${localHost}:${port}`, { wait: false });
				});
			})
			.end();

	neutrino.use(hot);
	Object.keys(neutrino.options.mains)
		.forEach(function (key) {
			config.entry(key).prepend(require.resolve('webpack/hot/dev-server'));
			config.entry(key).prepend(`${require.resolve('webpack-dev-server/client')}?${protocol}://${host}:${port}`);
		});
};