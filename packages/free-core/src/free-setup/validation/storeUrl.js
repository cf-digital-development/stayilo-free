import * as Yup from 'yup';
import { __ } from '@stayilo/design-system/i18n';

/**
 * Accepts http(s) URLs including localhost and ports.
 * Yup's built-in .url() rejects localhost (no TLD).
 *
 * @param {unknown} value
 * @returns {boolean}
 */
export function isHttpStoreUrl( value ) {
	const trimmed = String( value || '' ).trim();
	if ( ! trimmed ) {
		return false;
	}

	try {
		const parsed = new URL( trimmed );
		return parsed.protocol === 'http:' || parsed.protocol === 'https:';
	} catch {
		return false;
	}
}

export const storeUrlSchema = Yup.string()
	.trim()
	.required( __( 'Store URL is required', 'stayilo' ) )
	.test( 'http-url', __( 'Enter a valid store URL', 'stayilo' ), isHttpStoreUrl );

/**
 * @param {string} url
 * @returns {string|undefined}
 */
export function getStoreUrlError( url ) {
	const trimmed = String( url || '' ).trim();
	if ( ! trimmed ) {
		return __( 'Store URL is required', 'stayilo' );
	}

	try {
		storeUrlSchema.validateSync( trimmed );
		return undefined;
	} catch ( error ) {
		return error.message;
	}
}

/**
 * @param {string} url
 * @returns {boolean}
 */
export function isValidStoreUrl( url ) {
	return ! getStoreUrlError( url );
}
