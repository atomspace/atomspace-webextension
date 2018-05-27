let path = require('path');

let deepmerge = require('deepmerge');
let CopyWebpackPlugin = require('copy-webpack-plugin');

let isTruethy = require('./utils/is-truethy');

module.exports = function (neutrino, manifest = {}) {
	const LOCALES_DIR = '_locales';
	let src = neutrino.options.source;
	let localesDirPath = path.join(src, LOCALES_DIR);

	let icons = ['browser_action', 'page_action', 'sidebar_action']
		.map(function (name) {
			return manifest[name];
		})
		.filter(isTruethy)
		.map(function (section) {
			switch (typeof section.default_icon) {
				case 'object': return Object.values(section.default_icon);
				case 'string': return [section.default_icon];
				default: return [];
			}
		})
		.reduce(deepmerge, [])
		.concat(Object.values(manifest.icons || {}));

	neutrino.config
		.plugin('copy-static')
		.use(CopyWebpackPlugin, [
			icons.map(function (icon) {
				return {
					context: src,
					from: icon,
					to: path.dirname(icon)
				};
			}).concat({
				context: localesDirPath,
				from: '**/*',
				to: path.basename(localesDirPath)
			})
		])
		.end();
};