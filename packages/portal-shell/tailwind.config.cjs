/** @type {import('tailwindcss').Config} */
const rootConfig = require( '../../tailwind.config.js' );

module.exports = {
	...rootConfig,
	content: [
		'./index.html',
		'./src/**/*.{js,jsx,ts,tsx,css}',
		'../design-system/src/**/*.{js,jsx,ts,tsx,css}',
	],
};
