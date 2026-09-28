const fs = require( 'fs' );
const path = require( 'path' );


const XAMPP_ROOT = 'D:/xampp/htdocs/SubXP/SubXP';
const DOCKER_ROOT = path.resolve( __dirname, '../../SubXP' );
const LICENSE_DEMO_ROOT = 'D:/xampp/htdocs/SubXP/license-demo/server';

function resolveWpRoot() {
	if ( process.env.STAYILO_WP_ROOT ) {
		return path.resolve( process.env.STAYILO_WP_ROOT );
	}

	const xamppPlugin = path.join(
		XAMPP_ROOT,
		'wp-content/plugins/stayilo'
	);
	if ( fs.existsSync( xamppPlugin ) ) {
		return XAMPP_ROOT;
	}

	return DOCKER_ROOT;
}

/**
 * Pro script.php lives in license-demo/server on this XAMPP setup.
 * Fall back to WP-root license-server/ for Docker.
 */
function resolveLicenseRoot() {
	if ( process.env.STAYILO_LICENSE_ROOT ) {
		return path.resolve( process.env.STAYILO_LICENSE_ROOT );
	}

	if ( fs.existsSync( path.join( LICENSE_DEMO_ROOT, 'script.php' ) ) ) {
		return LICENSE_DEMO_ROOT;
	}

	return path.join( resolveWpRoot(), 'license-server' );
}

function useLocalBuild() {
	return process.env.STAYILO_WP_OUT === '0';
}

function resolveProPluginDir() {
	const wp = resolveWpRoot();
	const plugin = path.join( wp, 'wp-content/plugins/stayilo-pro-plugin' );
	const legacy = path.join( wp, 'wp-content/plugins/stayilo-pro' );

	if ( fs.existsSync( path.join( plugin, 'stayilo-pro.php' ) ) ) {
		return plugin;
	}

	return legacy;
}

function wpPath( relative ) {
	return path.join( resolveWpRoot(), relative );
}

const targets = {
	freeAdmin: 'wp-content/plugins/stayilo/build',
	portal: 'wp-content/plugins/stayilo/build/portal',
	wizard: 'wp-content/plugins/stayilo-pro/build/wizard-pro',
	licenseCore: 'license-server/builds/core',
	licenseGrowth: 'license-server/builds/growth',
	licensePortal: 'license-server/builds/portal',
};

function resolveOutput( packageDir, targetKey ) {
	if ( useLocalBuild() ) {
		const local = path.resolve( packageDir, 'build' );
		console.log( `[stayilo] ${ targetKey } → ${ local } (STAYILO_WP_OUT=0)` );
		return local;
	}

	if ( ! targets[ targetKey ] ) {
		throw new Error( `Unknown Stayilo WP output target: ${ targetKey }` );
	}

	let outDir;
	if ( targetKey === 'wizard' ) {
		outDir = path.join( resolveProPluginDir(), 'build/wizard-pro' );
	} else if ( targetKey.startsWith( 'license' ) ) {
		outDir = path.join(
			resolveLicenseRoot(),
			targets[ targetKey ].replace( /^license-server\//, '' )
		);
	} else {
		outDir = wpPath( targets[ targetKey ] );
	}

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
