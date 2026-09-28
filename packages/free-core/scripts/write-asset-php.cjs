const fs = require( 'fs' );
const path = require( 'path' );

const buildDir = path.join( __dirname, '..', 'build' );
const version = String( Date.now() );
const php = `<?php return array( 'dependencies' => array(), 'version' => '${ version }' );\n`;

for ( const name of [ 'index', 'setup' ] ) {
	fs.writeFileSync( path.join( buildDir, `${ name }.asset.php` ), php );
}
