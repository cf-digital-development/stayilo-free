import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { svgWebpackCompat } from './vite-svg-compat.js';

const __dirname = path.dirname( fileURLToPath( import.meta.url ) );
const repoRoot = path.resolve( __dirname, '../..' );
const designSystem = path.resolve( repoRoot, 'packages/design-system/src' );

export default defineConfig( {
	plugins: [
		react( {
			include: /\.(js|jsx)$/,
		} ),
		svgWebpackCompat(),
	],
	root: __dirname,
	resolve: {
		alias: [
			{
				find: '@stayilo/design-system/styles/tokens.css',
				replacement: path.join( designSystem, 'styles/tokens.css' ),
			},
			{
				find: '@stayilo/design-system/styles/styles.css',
				replacement: path.join( designSystem, 'styles/styles.css' ),
			},
			{
				find: '@stayilo/design-system/styles/components.css',
				replacement: path.join( designSystem, 'styles/components.css' ),
			},
			{
				find: /^@stayilo\/design-system\/assets\/(.*)$/,
				replacement: path.join( designSystem, 'assets/$1' ),
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
				find: '@stayilo/design-system',
				replacement: path.join( designSystem, 'index.js' ),
			},
			{
				find: '@stayilo/admin-shell',
				replacement: path.resolve(
					repoRoot,
					'packages/admin-shell/src/index.js'
				),
			},
			{
				find: '@stayilo/extension-sdk',
				replacement: path.resolve(
					repoRoot,
					'packages/extension-sdk/src/index.js'
				),
			},
			{
				find: '@stayilo/preview',
				replacement: path.resolve( repoRoot, 'packages/preview/src/public.jsx' ),
			},
			{
				find: '@wordpress/element',
				replacement: 'react',
			},
		],
	},
	server: {
		port: 5174,
		open: false,
	},
		build: {
		outDir: 'dist',
		emptyOutDir: true,
	},
} );
