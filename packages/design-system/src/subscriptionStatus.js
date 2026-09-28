/**
 * Shared subscription status labels and colors (portal + admin).
 *
 * Green: active · Red: cancelled · Yellow: on hold ·
 * Orange: pending cancellation · Grey: expired
 */

export const SUBSCRIPTION_STATUS_COLORS = {
	active: {
		color: '#16A34A',
		backgroundColor: '#ECFDF3',
		borderColor: '#16A34A4D',
		solid: '#16A34A',
	},
	'on-hold': {
		color: '#A16207',
		backgroundColor: '#FEF9C3',
		borderColor: '#EAB3084D',
		solid: '#CA8A04',
	},
	cancelled: {
		color: '#FF6467',
		backgroundColor: '#FEF2F2',
		borderColor: '#FFC9C9',
		solid: '#FF6467',
	},
	'pending-cancel': {
		color: '#C2410C',
		backgroundColor: '#FFF4E5',
		borderColor: '#EA580C4D',
		solid: '#EA580C',
	},
	expired: {
		color: '#4B5563',
		backgroundColor: '#F3F4F6',
		borderColor: '#9CA3AF4D',
		solid: '#6B7280',
	},
	'payment-failed': {
		color: '#FB2C36',
		backgroundColor: '#FB2C361A',
		borderColor: '#FB2C364D',
		solid: '#C00808',
	},
};

const STATUS_LABELS = {
	active: 'Active',
	'on-hold': 'On hold',
	onhold: 'On hold',
	paused: 'On hold',
	cancelled: 'Cancelled',
	canceled: 'Cancelled',
	'pending-cancel': 'Pending cancellation',
	expired: 'Expired',
	'payment-failed': 'Payment failed',
	failed: 'Payment failed',
};

/**
 * @param {string|undefined} status
 * @returns {string}
 */
export function normalizeSubscriptionStatus( status ) {
	return String( status || '' )
		.toLowerCase()
		.trim()
		.replace( /\s+/g, '-' );
}

/**
 * Canonical tone key used for colors.
 *
 * @param {string|undefined} status
 * @returns {keyof typeof SUBSCRIPTION_STATUS_COLORS}
 */
export function subscriptionStatusTone( status ) {
	const key = normalizeSubscriptionStatus( status );

	if ( key === 'active' ) {
		return 'active';
	}
	if ( key === 'on-hold' || key === 'onhold' || key === 'paused' ) {
		return 'on-hold';
	}
	if ( key === 'pending-cancel' || key === 'pending-cancellation' ) {
		return 'pending-cancel';
	}
	if ( key === 'expired' ) {
		return 'expired';
	}
	if ( key === 'payment-failed' || key === 'failed' ) {
		return 'payment-failed';
	}
	if ( key === 'cancelled' || key === 'canceled' ) {
		return 'cancelled';
	}

	return 'active';
}

/**
 * @param {string|undefined} status
 * @returns {{ color: string, backgroundColor: string, borderColor: string, solid: string }}
 */
export function subscriptionStatusColors( status ) {
	return SUBSCRIPTION_STATUS_COLORS[ subscriptionStatusTone( status ) ];
}

/**
 * Human-readable label for a WCS / portal status slug.
 *
 * @param {string|undefined} status
 * @returns {string}
 */
export function formatSubscriptionStatusLabel( status ) {
	const key = normalizeSubscriptionStatus( status );
	if ( STATUS_LABELS[ key ] ) {
		return STATUS_LABELS[ key ];
	}
	if ( ! key ) {
		return '';
	}
	return key.charAt( 0 ).toUpperCase() + key.slice( 1 ).replace( /-/g, ' ' );
}
