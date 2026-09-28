import { __ } from '@stayilo/design-system/i18n';
import { clearFreeWizardStep } from '../validation/wizardProgress';

/**
 * Mark Free setup complete and return the dashboard URL.
 *
 * @param {object} [options]
 * @param {string} [options.storeUrl]
 * @param {boolean} [options.storeConnected]
 * @param {number|null} [options.subscriberCount]
 * @param {'single'|'multiple'} [options.subscriptionMode]
 * @param {string} [options.adminEmail]
 * @param {boolean} [options.marketingOptIn]
 */
export async function completeFreeSetup( {
	storeUrl = '',
	storeConnected = true,
	subscriberCount = null,
	subscriptionMode = 'single',
	adminEmail = '',
	marketingOptIn = false,
} = {} ) {
	const admin = typeof window !== 'undefined' ? window.stayiloAdmin || {} : {};

	if ( ! admin.ajaxUrl || ! admin.completeSetupNonce ) {
		throw new Error( __( 'Setup completion is not available.', 'stayilo' ) );
	}

	const body = new URLSearchParams( {
		action: 'stayilo_complete_free_setup',
		nonce: admin.completeSetupNonce,
		storeUrl: storeUrl || '',
		storeConnected: storeConnected ? '1' : '0',
		subscriptionMode: subscriptionMode === 'multiple' ? 'multiple' : 'single',
		adminEmail: String( adminEmail || '' ).trim(),
		marketingOptIn: marketingOptIn ? '1' : '0',
	} );

	if ( subscriberCount !== null && subscriberCount !== undefined ) {
		body.set( 'subscriberCount', String( subscriberCount ) );
	}

	const response = await fetch( admin.ajaxUrl, {
		method: 'POST',
		credentials: 'same-origin',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
		},
		body,
	} );

	const json = await response.json();

	if ( ! json?.success ) {
		throw new Error( json?.data?.message || __( 'Could not complete setup.', 'stayilo' ) );
	}

	clearFreeWizardStep( admin );

	return json.data?.dashboardUrl || admin.dashboardUrl || '';
}
