const shared = require( '../../tailwind.config.js' );

module.exports = {
	...shared,
	content: [
		'./index.html',
		'./src/**/*.{js,jsx}',
		'../design-system/src/**/*.{js,jsx}',
	],
};
