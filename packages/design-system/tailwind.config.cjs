const shared = require( '../../tailwind.config.js' );

/**
 * Scans this package so consumers (and local tooling) pick up class names
 * used in shared components. Prefer extending from the monorepo root config.
 */
module.exports = {
	...shared,
	content: [
		'./src/**/*.{js,jsx}',
	],
};
