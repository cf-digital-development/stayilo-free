const fs = require( 'fs' );
const path = require( 'path' );

/**
 * WordPress root when STAYILO_WP_ROOT is set. Otherwise builds stay in-repo.
 *
 * @returns {string|null}
 */
function resolveWpRoot() {
	if ( process.env.STAYILO_WP_ROOT ) {
		return path.resolve( process.env.STAYILO_WP_ROOT );
	}
	return null;
}

const targets = {
	freeAdmin: 'wp-content/plugins/stayilo/build',
	portal: 'wp-content/plugins/stayilo/build/portal',
};

/**
 * Default: each package's own `build/`.
 * With STAYILO_WP_ROOT: write into that WordPress tree.
 *
 * @param {string} packageDir
 * @param {string} targetKey
 * @returns {string}
 */
function resolveOutput( packageDir, targetKey ) {
	const local = path.resolve( packageDir, 'build' );
	const wpRoot = resolveWpRoot();

	if ( ! wpRoot ) {
		console.log( `[stayilo] ${ targetKey } → ${ local }` );
		return local;
	}

	if ( ! targets[ targetKey ] ) {
		throw new Error( `Unknown Stayilo WP output target: ${ targetKey }` );
	}

	const outDir = path.join( wpRoot, targets[ targetKey ] );
	fs.mkdirSync( outDir, { recursive: true } );
	console.log( `[stayilo] ${ targetKey } → ${ outDir }` );
	return outDir;
}

function webpackOutput( packageDir, targetKey, options = {} ) {
	const keepNames = [ 'fonts', 'images', ...( options.keep || [] ) ];
	return {
		path: resolveOutput( packageDir, targetKey ),
		clean: {
			keep: new RegExp( `^(${ keepNames.join( '|' ) })/` ),
		},
	};
}

const liveFetchExternals = {
	react: 'React',
	'react-dom': 'ReactDOM',
	'react-dom/client': 'ReactDOMClient',
	'react/jsx-runtime': 'ReactJSXRuntime',
	'@wordpress/element': 'React',
	'react-router': 'ReactRouter',
	'react-router-dom': 'ReactRouterDOM',
	'react-redux': 'ReactRedux',
	'@reduxjs/toolkit': 'ReduxToolkit',
};

class WriteAssetPhpPlugin {
	constructor( names = [ 'index' ] ) {
		this.names = names;
	}

	apply( compiler ) {
		compiler.hooks.afterEmit.tap( 'WriteAssetPhpPlugin', ( compilation ) => {
			const outDir = compilation.outputOptions.path;
			const php =
				"<?php return array( 'dependencies' => array(), 'version' => '" +
				Date.now() +
				"' );\n";
			fs.mkdirSync( outDir, { recursive: true } );
			this.names.forEach( ( name ) => {
				fs.writeFileSync( path.join( outDir, `${ name }.asset.php` ), php );
			} );
		} );
	}
}

module.exports = {
	resolveWpRoot,
	resolveOutput,
	webpackOutput,
	WriteAssetPhpPlugin,
	liveFetchExternals,
	targets,
};
