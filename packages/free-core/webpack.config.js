const defaultConfig = require( '@wordpress/scripts/config/webpack.config' );
const DependencyExtractionWebpackPlugin = require( '@wordpress/dependency-extraction-webpack-plugin' );
const path = require( 'path' );
const {
	webpackOutput,
	WriteAssetPhpPlugin,
} = require( '../../tooling/wp-output.cjs' );

const repoRoot = path.resolve( __dirname, '..' );
const freeRouterDom = path.dirname(
	require.resolve( 'react-router-dom/package.json', { paths: [ __dirname ] } )
);
const freeRouter = path.dirname(
	require.resolve( 'react-router/package.json', {
		paths: [ freeRouterDom, __dirname ],
	} )
);

/**
 * Free admin + setup → stayilo/build/{index,setup}.*
 * Keeps build/portal/ (owned by portal-shell).
 */
module.exports = {
	...defaultConfig,
	entry: {
		index: path.resolve( __dirname, 'src/entry.jsx' ),
		setup: path.resolve( __dirname, 'src/setup-entry.jsx' ),
	},
	output: {
		...defaultConfig.output,
		...webpackOutput( __dirname, 'freeAdmin', { keep: [ 'portal' ] } ),
	},
	externals: {},
	plugins: [
		...defaultConfig.plugins.filter(
			( plugin ) => ! ( plugin instanceof DependencyExtractionWebpackPlugin )
		),
		new WriteAssetPhpPlugin( [ 'index', 'setup' ] ),
	],
	resolve: {
		...defaultConfig.resolve,
		alias: {
			...defaultConfig.resolve.alias,
			'@stayilo/preview': path.resolve( repoRoot, 'preview/src/public.jsx' ),
			'@wordpress/element': require.resolve( 'react' ),
			// Pin one Router tree (free-core nests rrd v6; workspace root has v7).
			// Mixing them causes: useLocation() outside <Router> context.
			'react-router': freeRouter,
			'react-router-dom': freeRouterDom,
		},
		extensions: [
			'.jsx',
			'.js',
			'.json',
			...( defaultConfig.resolve.extensions || [] ),
		],
	},
};
