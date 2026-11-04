/**
 * Stayilo translations via WordPress wp.i18n.
 * English is returned when the script runs outside wp-admin or My Account.
 */
const DOMAIN = 'stayilo';

function getI18n() {
	if ( typeof window !== 'undefined' && window.wp && window.wp.i18n ) {
		return window.wp.i18n;
	}
	return null;
}

export function __( text, domain = DOMAIN ) {
	const i18n = getI18n();
	return i18n && typeof i18n.__ === 'function' ? i18n.__( text, domain ) : text;
}

export function _n( single, plural, number, domain = DOMAIN ) {
	const i18n = getI18n();
	if ( i18n && typeof i18n._n === 'function' ) {
		return i18n._n( single, plural, number, domain );
	}
	return Number( number ) === 1 ? single : plural;
}

export function sprintf( format, ...args ) {
	const i18n = getI18n();
	if ( i18n && typeof i18n.sprintf === 'function' ) {
		return i18n.sprintf( format, ...args );
	}

	let index = 0;
	return String( format ).replace( /%(?:(\d+)\$)?[sd]/g, ( match, position ) => {
		const argIndex = position ? Number( position ) - 1 : index++;
		return args[ argIndex ] !== undefined ? String( args[ argIndex ] ) : match;
	} );
}
