const TerserPlugin = require( 'terser-webpack-plugin' );
const webpack = require( 'webpack' );

/**
 * cssnano keeps the original multiline selector text, so descendant
 * selectors stay broken across lines. Collapse that whitespace after
 * RTL generation. A newline that is the only gap between two selector
 * tokens becomes one space; other newlines are removed.
 *
 * @param {string} css
 * @return {string}
 */
function compactCssWhitespace( css ) {
	return css.replace( /[\n\r\t]+/g, ( match, offset, source ) => {
		const prev = source[ offset - 1 ];
		const next = source[ offset + match.length ];

		if (
			prev &&
			next &&
			/[^\s{};,>+~]/.test( prev ) &&
			/[#.a-zA-Z*[:_&\u0080-\uFFFF]/.test( next )
		) {
			return ' ';
		}

		return '';
	} );
}

/**
 * Drop translator comments so production JS stays one line.
 * wp-scripts keeps `translators:` comments, and Terser prints each one
 * on its own line.
 *
 * @param {import('webpack').Configuration} defaultConfig
 * @return {import('webpack').WebpackPluginInstance[]}
 */
function singleLineMinimizers( defaultConfig ) {
	return ( defaultConfig.optimization?.minimizer || [] ).map( ( plugin ) => {
		if ( plugin?.constructor?.name !== 'TerserPlugin' ) {
			return plugin;
		}

		return new TerserPlugin( {
			parallel: true,
			extractComments: true,
			terserOptions: {
				compress: {
					passes: 2,
				},
				mangle: {
					reserved: [ '__', '_n', '_nx', '_x' ],
				},
				format: {
					comments: false,
				},
			},
		} );
	} );
}

class SingleLineCssPlugin {
	apply( compiler ) {
		compiler.hooks.compilation.tap(
			'SingleLineCssPlugin',
			( compilation ) => {
				compilation.hooks.processAssets.tap(
					{
						name: 'SingleLineCssPlugin',
						stage: webpack.Compilation
							.PROCESS_ASSETS_STAGE_OPTIMIZE_SIZE,
					},
					() => {
						if ( compiler.options.mode !== 'production' ) {
							return;
						}

						for ( const filename of Object.keys(
							compilation.assets
						) ) {
							if ( ! filename.endsWith( '.css' ) ) {
								continue;
							}

							const raw = compilation.assets[ filename ]
								.source()
								.toString();

							if ( ! /[\n\r\t]/.test( raw ) ) {
								continue;
							}

							compilation.updateAsset(
								filename,
								new webpack.sources.RawSource(
									compactCssWhitespace( raw )
								)
							);
						}
					}
				);
			}
		);
	}
}

module.exports = {
	compactCssWhitespace,
	singleLineMinimizers,
	SingleLineCssPlugin,
};
