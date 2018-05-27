let deepmerge = require('deepmerge');

module.exports = function merge (options = {}) {
	return function (opts = {}) {
		return deepmerge(opts, options);
	};
};