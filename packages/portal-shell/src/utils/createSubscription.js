import { getCheckoutUrl, getShopUrl } from '../api/portal.js';
import { __ } from '@stayilo/design-system/i18n';

/**
 * Start a new subscription by sending the customer to the WooCommerce shop.
 */
export function startCreateSubscription() {
	if ( typeof window === 'undefined' ) {
		return;
	}
	window.location.assign( getShopUrl() );
}

/**
 * @param {boolean} [loading=false]
 * @returns {string}
 */
export function reactivateActionLabel( loading = false ) {
	return loading ? __( 'Starting checkout…', 'stayilo' ) : __( 'Reactivate Subscription', 'stayilo' );
}

/**
 * Reactivate a canceled subscription — always via checkout (new subscription).
 *
 * @param {(id: string) => Promise<{ checkoutUrl?: string }>} reactivateFn
 * @param {string} subscriptionId
 * @returns {Promise<{ ok: boolean }>}
 */
export async function handleReactivateSubscription( reactivateFn, subscriptionId ) {
	try {
		const data = await reactivateFn( subscriptionId );
		const checkoutUrl = data?.checkoutUrl || getCheckoutUrl();
		if ( typeof window !== 'undefined' && checkoutUrl ) {
			window.location.assign( checkoutUrl );
		}
		return { ok: true };
	} catch ( err ) {
		window.alert( err?.message || __( 'Could not reactivate subscription', 'stayilo' ) );
		return { ok: false };
	}
}
