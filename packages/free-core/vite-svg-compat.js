import fs from 'node:fs';
import path from 'node:path';
import { transform } from '@svgr/core';
import jsx from '@svgr/plugin-jsx';
import { transformWithEsbuild } from 'vite';

/**
 * Webpack-style SVG imports for Vite: default URL + named ReactComponent.
 * Works in dev (data URLs) and production build (emitted assets).
 */
export function svgWebpackCompat() {
	return {
		name: 'svg-webpack-compat',
		enforce: 'pre',
		async load( id ) {
			if ( ! id.endsWith( '.svg' ) || id.includes( '?' ) ) {
				return null;
			}

			const svg = await fs.promises.readFile( id, 'utf8' );
			const componentCode = await transform(
				svg,
				{
					exportType: 'named',
					namedExport: 'ReactComponent',
					ref: true,
				},
				{
					filePath: id,
					caller: { defaultPlugins: [ jsx ] },
				}
			);

			const { code } = await transformWithEsbuild( componentCode, id, {
				loader: 'jsx',
			} );

			if ( this.meta.watchMode ) {
				const dataUrl = `data:image/svg+xml;base64,${ Buffer.from( svg ).toString( 'base64' ) }`;
				return `${ code }\nexport default ${ JSON.stringify( dataUrl ) };\n`;
			}

			const refId = this.emitFile( {
				type: 'asset',
				name: path.basename( id ),
				source: svg,
			} );

			return `${ code }\nexport default import.meta.ROLLUP_FILE_URL_${ refId };\n`;
		},
	};
}
