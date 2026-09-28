import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname( fileURLToPath( import.meta.url ) );
const repoRoot = path.resolve( __dirname, '../..' );
const designSystem = path.resolve( repoRoot, 'packages/design-system/src' );

export default defineConfig( {
	plugins: [
		react(),
		svgr( {
			include: '**/*.svg',
			svgrOptions: {
				exportType: 'named',
				namedExport: 'ReactComponent',
			},
		} ),
	],
	root: __dirname,
	resolve: {
		alias: [
			{ find: '@wordpress/element', replacement: 'react' },
			{
				find: '@stayilo/design-system/styles/styles.css',
				replacement: path.join( designSystem, 'styles/styles.css' ),
			},
			{
				find: '@stayilo/design-system/styles/components.css',
				replacement: path.join( designSystem, 'styles/components.css' ),
			},
			{
				find: '@stayilo/design-system/styles/tokens.css',
				replacement: path.join( designSystem, 'styles/tokens.css' ),
			},
			{
				find: /^@stayilo\/design-system\/assets\/(.*)$/,
				replacement: path.join( designSystem, 'assets/$1' ),
			},
			{
				find: /^@stayilo\/design-system\/hooks\/(.*)$/,
				replacement: path.join( designSystem, 'hooks/$1' ),
			},
			{
				find: /^@stayilo\/design-system\/validation\/(.*)$/,
				replacement: path.join( designSystem, 'validation/$1' ),
			},
			{
				find: '@stayilo/design-system/validation',
				replacement: path.join( designSystem, 'validation/index.js' ),
			},
			{
				find: /^@stayilo\/design-system\/([^/]+)$/,
				replacement: path.join( designSystem, 'components/$1/index.js' ),
			},
			{
				find: '@stayilo/free-core/free-setup',
				replacement: path.resolve(
					repoRoot,
					'packages/free-core/src/free-setup/index.js'
				),
			},
		],
	},
	server: {
		port: 5176,
		open: true,
	},
	build: {
		outDir: 'dist',
		emptyOutDir: true,
	},
} );
