import { loadStripe } from '@stripe/stripe-js';
import { getPortal } from '../api/portal.js';

let stripePromise = null;

/**
 * Localized Stripe.js config from stayiloPortal.stripe.
 *
 * @returns {{ available: boolean, publishableKey: string }}
 */
export function getStripeConfig() {
	const stripe = getPortal().stripe || {};
	return {
		available: Boolean( stripe.available && stripe.publishableKey ),
		publishableKey: String( stripe.publishableKey || '' ),
	};
}

/**
 * Cached Stripe.js instance for the portal add-card popup.
 *
 * @returns {Promise<import('@stripe/stripe-js').Stripe|null>}
 */
export function getStripe() {
	const { available, publishableKey } = getStripeConfig();
	if ( ! available ) {
		return Promise.resolve( null );
	}
	if ( ! stripePromise ) {
		stripePromise = loadStripe( publishableKey );
	}
	return stripePromise;
}

/** Match portal-field-inset__input typography. */
export const STRIPE_ELEMENT_STYLE = {
	base: {
		fontSize: '18px',
		fontWeight: '500',
		lineHeight: '26px',
		color: '#101010',
		fontFamily:
			'inherit, system-ui, -apple-system, Segoe UI, Roboto, sans-serif',
		'::placeholder': {
			color: 'transparent',
			fontWeight: '400',
		},
	},
	invalid: {
		color: '#101010',
	},
};
