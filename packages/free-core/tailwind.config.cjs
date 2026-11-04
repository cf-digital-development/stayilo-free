const shared = require( '../../tailwind.config.js' );

module.exports = {
	...shared,
	content: [
		'./index.html',
		'./setup.html',
		'./src/**/*.{js,jsx}',
		'../admin-shell/src/**/*.{js,jsx}',
		'../design-system/src/**/*.{js,jsx}',
		'../preview/src/**/*.{js,jsx}',
	],
};
