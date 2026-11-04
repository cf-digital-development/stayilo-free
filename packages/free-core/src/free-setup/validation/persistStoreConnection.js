import { __ } from '@stayilo/design-system/i18n';

/**
 * Ask WordPress to confirm this store and return its live subscriber count.
 *
 * @param {object} params
 * @param {string} params.storeUrl
 * @param {string} [params.adminEmail]
 * @param {boolean} [params.marketingOptIn]
 * @returns {Promise<{ storeUrl: string, storeConnected: boolean, subscriberCount: number }>}
 */
export async function persistStoreConnection( {
	storeUrl,
	adminEmail = '',
	marketingOptIn = false,
} ) {
	const admin = window.stayiloAdmin || {};
	const { ajaxUrl, saveStoreNonce } = admin;

	if ( ! ajaxUrl || ! saveStoreNonce ) {
		throw new Error( __( 'Could not connect to your store.', 'stayilo' ) );
	}

	const body = new URLSearchParams( {
		action: 'stayilo_save_store_connection',
		nonce: saveStoreNonce,
		storeUrl: String( storeUrl || '' ).trim(),
		adminEmail: String( adminEmail || '' ).trim(),
		marketingOptIn: marketingOptIn ? '1' : '0',
	} );

	const response = await fetch( ajaxUrl, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
		},
		body,
		credentials: 'same-origin',
	} );

	let json;
	try {
		json = await response.json();
	} catch {
		throw new Error( __( 'Could not connect to your store.', 'stayilo' ) );
	}

	const count = Number( json?.data?.subscriberCount );
	if ( ! response.ok || ! json?.success || json?.data?.storeConnected !== true || ! Number.isInteger( count ) || count < 0 ) {
		throw new Error( json?.data?.message || __( 'Could not connect to your store.', 'stayilo' ) );
	}

	return {
		storeUrl: String( json.data.storeUrl || storeUrl ),
		storeConnected: true,
		subscriberCount: count,
	};
}
