import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { svgWebpackCompat } from '../free-core/vite-svg-compat.js';

const __dirname = path.dirname( fileURLToPath( import.meta.url ) );
const repoRoot = path.resolve( __dirname, '../..' );
const designSystem = path.resolve( repoRoot, 'packages/design-system/src' );

/**
 * Local Free portal mock — npm run start / npm run dev:portal-free
 */
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
				find: '@stayilo/design-system',
				replacement: path.join( designSystem, 'index.js' ),
			},
			{
				find: '@stayilo/extension-sdk',
				replacement: path.resolve( repoRoot, 'packages/extension-sdk/src/index.js' ),
			},
		],
	},
	server: {
		port: 5176,
		open: '/my-account/my-subscription',
	},
	build: {
		outDir: 'dist',
		emptyOutDir: true,
	},
} );
