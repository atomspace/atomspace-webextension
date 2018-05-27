module.exports = function (manifest) {
	let pageActionIcon = manifest.page_action && manifest.page_action.default_icon;
	let browserActionIcon = manifest.browser_action && manifest.browser_action.default_icon;
	let sidebarActionIcon = manifest.sidebar_action && manifest.sidebar_action.default_icon;

	if (typeof browserActionIcon === 'string') {
		manifest.browser_action.default_icon = {
			16: browserActionIcon,
			32: browserActionIcon,
			64: browserActionIcon
		};
	}
	if (typeof pageActionIcon === 'string') {
		manifest.page_action.default_icon = {
			19: pageActionIcon,
			38: pageActionIcon
		};
	}
	if (typeof sidebarActionIcon === 'string') {
		manifest.sidebar_action.default_icon = {
			16: sidebarActionIcon,
			32: sidebarActionIcon,
			64: sidebarActionIcon
		};
	}

	return manifest;
};