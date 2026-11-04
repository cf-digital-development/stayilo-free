/**
 * Safe JSON read/write for portal prototype persistence.
 */

/**
 * @param {string} key
 * @returns {unknown|undefined}
 */
export function readStorageJson( key ) {
	if ( typeof window === 'undefined' ) {
		return undefined;
	}
	try {
		const raw = window.localStorage.getItem( key );
		if ( raw == null || raw === '' ) {
			return undefined;
		}
		return JSON.parse( raw );
	} catch {
		return undefined;
	}
}

/**
 * @param {string} key
 * @param {unknown} value
 */
export function writeStorageJson( key, value ) {
	if ( typeof window === 'undefined' ) {
		return;
	}
	try {
		window.localStorage.setItem( key, JSON.stringify( value ) );
	} catch {
		// Quota / private mode — ignore for prototype.
	}
}
