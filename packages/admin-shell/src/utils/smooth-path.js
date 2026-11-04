/**
 * Smooth horizontal cubic path — wavy spline through points (Figma retention style).
 * @param {{ x: number, y: number }[]} points
 * @returns {string}
 */
export function smoothLinePath( points ) {
	if ( ! points.length ) {
		return '';
	}
	if ( points.length === 1 ) {
		return `M ${ points[ 0 ].x } ${ points[ 0 ].y }`;
	}

	let d = `M ${ points[ 0 ].x.toFixed( 1 ) } ${ points[ 0 ].y.toFixed( 1 ) }`;

	for ( let i = 0; i < points.length - 1; i++ ) {
		const p0 = points[ i ];
		const p1 = points[ i + 1 ];
		const midX = ( p0.x + p1.x ) / 2;

		d += ` C ${ midX.toFixed( 1 ) } ${ p0.y.toFixed( 1 ) }, ${ midX.toFixed( 1 ) } ${ p1.y.toFixed( 1 ) }, ${ p1.x.toFixed( 1 ) } ${ p1.y.toFixed( 1 ) }`;
	}

	return d;
}

/**
 * Map numeric series into chart points.
 */
export function seriesToPoints( values, { toX, toY } ) {
	return values.map( ( v, i ) => ( {
		x: toX( i, values.length ),
		y: toY( v ),
	} ) );
}
