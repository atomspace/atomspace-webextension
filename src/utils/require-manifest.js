let path = require('path');

let safeRequire = require('./safe-require.js');
let normalizeManifest = require('./normalize-manifest');

module.exports = function (root) {
	return normalizeManifest(
		safeRequire(path.join(root, '/manifest.json'))
	) || {};
};