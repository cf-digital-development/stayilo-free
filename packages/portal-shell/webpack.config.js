const defaultConfig = require( '@wordpress/scripts/config/webpack.config' );
const DependencyExtractionWebpackPlugin = require( '@wordpress/dependency-extraction-webpack-plugin' );
const path = require( 'path' );
const {
	webpackOutput,
	WriteAssetPhpPlugin,
} = require( '../../tooling/wp-output.cjs' );

const repoRoot = path.resolve( __dirname, '..' );

/**
 * Free portal shell → stayilo/build/portal/
 * React is bundled (Build_Loader enqueues with react: false).
 */
module.exports = {
	...defaultConfig,
	entry: {
		index: path.resolve( __dirname, 'src/mount-portal.jsx' ),
	},
	output: {
		...defaultConfig.output,
		...webpackOutput( __dirname, 'portal' ),
	},
	externals: {},
	plugins: [
		...defaultConfig.plugins.filter(
			( plugin ) => ! ( plugin instanceof DependencyExtractionWebpackPlugin )
		),
		new WriteAssetPhpPlugin(),
	],
	resolve: {
		...defaultConfig.resolve,
		alias: {
			...defaultConfig.resolve.alias,
			'@stayilo/extension-sdk': path.resolve(
				repoRoot,
				'extension-sdk/src/index.js'
			),
			'@stayilo/design-system': path.resolve(
				repoRoot,
				'design-system/src'
			),
			'@wordpress/element': require.resolve( 'react' ),
		},
		extensions: [
			'.jsx',
			'.js',
			'.json',
			...( defaultConfig.resolve.extensions || [] ),
		],
	},
};
