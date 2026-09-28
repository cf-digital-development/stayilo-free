/**
 * Decode HTML entities in money strings from WooCommerce
 * (e.g. "&pound;4.00" → "£4.00").
 *
 * @param {unknown} value
 * @returns {string}
 */
export function decodeMoney( value ) {
	if ( value === null || value === undefined ) {
		return '';
	}
	const text = String( value );
	if ( ! text.includes( '&' ) ) {
		return text;
	}
	if ( typeof document !== 'undefined' ) {
		const el = document.createElement( 'textarea' );
		el.innerHTML = text;
		return el.value;
	}
	return text
		.replace( /&pound;/gi, '£' )
		.replace( /&euro;/gi, '€' )
		.replace( /&yen;/gi, '¥' )
		.replace( /&dollar;/gi, '$' )
		.replace( /&#36;/g, '$' )
		.replace( /&amp;/g, '&' );
}
