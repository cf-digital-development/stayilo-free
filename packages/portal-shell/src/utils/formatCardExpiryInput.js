/**
 * Format card expiry as MM / YY while typing.
 *
 * - Month capped at 12 (e.g. "13" → "12")
 * - Inserts " / " after the month
 * - Year limited to two digits
 * - Backspace over the separator removes the preceding digit
 *
 * @param {string} raw - Current input value.
 * @param {string} [previousFormatted=''] - Previous formatted value (for delete detection).
 * @returns {string}
 */
export function formatCardExpiryInput( raw, previousFormatted = '' ) {
	let digits = String( raw ?? '' ).replace( /\D/g, '' ).slice( 0, 4 );
	const prevDigits = String( previousFormatted ?? '' ).replace( /\D/g, '' );

	// Backspace/delete on " / " — digit count unchanged but text shortened.
	if (
		previousFormatted &&
		String( raw ?? '' ).length < previousFormatted.length &&
		digits === prevDigits &&
		digits.length > 0
	) {
		digits = digits.slice( 0, -1 );
	}

	if ( ! digits.length ) {
		return '';
	}

	let monthDigits = digits.slice( 0, 2 );
	const yearDigits = digits.slice( 2, 4 );

	// Single digit 2–9 → 02–09 (e.g. "3" → "03").
	if ( monthDigits.length === 1 && Number( monthDigits ) > 1 ) {
		monthDigits = `0${ monthDigits }`;
	}

	if ( monthDigits.length === 2 ) {
		let month = Number( monthDigits );
		if ( month === 0 ) {
			month = 1;
		} else if ( month > 12 ) {
			month = 12;
		}
		monthDigits = String( month ).padStart( 2, '0' );
	}

	if ( monthDigits.length < 2 ) {
		return monthDigits;
	}

	if ( ! yearDigits.length ) {
		return `${ monthDigits } / `;
	}

	return `${ monthDigits } / ${ yearDigits }`;
}
