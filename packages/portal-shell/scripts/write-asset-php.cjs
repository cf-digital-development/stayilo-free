const fs = require( 'fs' );
const path = require( 'path' );

const buildDir = path.join( __dirname, '..', 'build' );
const version = String( Date.now() );
const php = `<?php return array( 'dependencies' => array(), 'version' => '${ version }' );\n`;

fs.mkdirSync( buildDir, { recursive: true } );
fs.writeFileSync( path.join( buildDir, 'index.asset.php' ), php );
