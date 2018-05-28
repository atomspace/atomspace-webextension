let path = require('path');

// let GenerateJsonPlugin = require('generate-json-webpack-plugin');
// let deepmerge = require('deepmerge');
const FileManagerPlugin = require('filemanager-webpack-plugin');

module.exports = function (neutrino, options = {}) {
	// const OPERA_MANIFEST_NAME = 'opera.manifest.json';
	let output = path.resolve(neutrino.options.root, options.output || 'dist');
	let prodRun = (process.env.NODE_ENV === 'production');
	let { name, version } = neutrino.options.packageJson;


	neutrino.config.when(prodRun, function (config) {
		config

			// .plugin('opera-manifest')
			// .use(GenerateJsonPlugin, [
			// 	OPERA_MANIFEST_NAME,
			// 	manifest,
			// 	null,
			// 	3
			// ])
			.plugin('packager')
			.use(FileManagerPlugin, [{
				onStart: [
					{ delete: [path.relative(neutrino.options.root, output)] },
					{ mkdir: [path.relative(neutrino.options.root, output)] }
				],
				onEnd: {
					archive: [
						{
							source: path.relative(neutrino.options.root, neutrino.options.output),
							destination: path.resolve(output, `${name}-${version}.zip`),
							format: 'zip' // or 'tar'
						}
					]
				}
			}])
			.end();
	});
};