const path = require( 'path' );

module.exports = {
	plugins: {
		'postcss-import': {},
		tailwindcss: {
			// Absolute path so CSS from design-system still uses portal-shell theme
			// (relative `./` can resolve against the wrong package and drop colors).
			config: path.join( __dirname, 'tailwind.config.cjs' ),
		},
		autoprefixer: {},
	},
};
