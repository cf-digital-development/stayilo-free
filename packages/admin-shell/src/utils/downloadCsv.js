/**
 * Escape a CSV cell (RFC-style quotes when needed).
 *
 * @param {unknown} value
 * @returns {string}
 */
export function escapeCsvCell( value ) {
	const text = value == null ? '' : String( value );
	if ( /[",\n\r]/.test( text ) ) {
		return `"${ text.replace( /"/g, '""' ) }"`;
	}
	return text;
}

/**
 * Build a CSV string from headers + row objects.
 *
 * @param {string[]} headers
 * @param {Array<Record<string, unknown>>} rows
 * @param {(row: Record<string, unknown>) => unknown[]} mapRow
 * @returns {string}
 */
export function buildCsv( headers, rows, mapRow ) {
	const lines = [ headers.map( escapeCsvCell ).join( ',' ) ];
	for ( const row of rows ) {
		lines.push( mapRow( row ).map( escapeCsvCell ).join( ',' ) );
	}
	return `${ lines.join( '\n' ) }\n`;
}

/**
 * Trigger a browser download for a CSV string.
 *
 * @param {string} csv
 * @param {string} [filename='export.csv']
 */
export function downloadCsv( csv, filename = 'export.csv' ) {
	const blob = new Blob( [ csv ], { type: 'text/csv;charset=utf-8;' } );
	const url = URL.createObjectURL( blob );
	const link = document.createElement( 'a' );
	link.href = url;
	link.download = filename;
	link.rel = 'noopener';
	document.body.appendChild( link );
	link.click();
	link.remove();
	window.setTimeout( () => URL.revokeObjectURL( url ), 0 );
}
