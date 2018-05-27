module.exports = function (filePath) {
	try {
		return require(filePath);
	}
	catch (err) {
		return undefined;
	}
};