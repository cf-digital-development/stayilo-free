import { __, sprintf } from '@stayilo/design-system/i18n';
/**
 * @param {string|undefined} status
 * @returns {boolean}
 */
export function isSubscriptionCanceled( status ) {
	return status === 'canceled' || status === 'cancelled';
}

/**
 * Unresolved payment-failed episode from portal bootstrap / subscription card.
 *
 * @param {object} [subscription]
 * @returns {boolean}
 */
export function subscriptionHasPaymentFailed( subscription ) {
	return Boolean( subscription?.paymentFailed );
}

/**
 * @param {Array<object>} [subscriptions]
 * @returns {boolean}
 */
export function anySubscriptionPaymentFailed( subscriptions = [] ) {
	return subscriptions.some( ( sub ) => subscriptionHasPaymentFailed( sub ) );
}

/**
 * First subscription in a payment-failed episode (optional preferred id).
 *
 * @param {Array<object>} [subscriptions]
 * @param {string} [preferredId]
 * @returns {object|null}
 */
export function resolvePaymentFailedSubscription( subscriptions = [], preferredId ) {
	if ( preferredId ) {
		const preferred = subscriptions.find(
			( sub ) => String( sub.id ) === String( preferredId )
		);
		if ( subscriptionHasPaymentFailed( preferred ) ) {
			return preferred;
		}
	}
	return subscriptions.find( ( sub ) => subscriptionHasPaymentFailed( sub ) ) || null;
}

/**
 * WooCommerce pay-for-order / checkout URL for an unpaid renewal.
 *
 * @param {object} [subscription]
 * @returns {string}
 */
export function resolvePaymentCheckoutUrl( subscription ) {
	return String( subscription?.paymentCheckoutUrl || '' ).trim();
}

/**
 * Navigate to the subscription's repayment checkout page.
 *
 * @param {object} [subscription]
 * @returns {boolean} true when a navigation was started
 */
export function goToSubscriptionPaymentCheckout( subscription ) {
	const url = resolvePaymentCheckoutUrl( subscription );
	if ( ! url || typeof window === 'undefined' ) {
		return false;
	}
	window.location.assign( url );
	return true;
}

/**
 * @param {string|undefined} status
 * @returns {boolean}
 */
export function isSubscriptionPaused( status ) {
	return status === 'paused' || status === 'on-hold' || status === 'onhold';
}

/**
 * @param {object} [subscription]
 * @returns {boolean}
 */
export function isActiveSubscription( subscription ) {
	return Boolean( subscription?.id ) && subscription.status === 'active';
}

/**
 * Prefer an explicit id, else the first active plan, else the first card.
 *
 * @param {Array<{ id?: string, status?: string }>} [subscriptions]
 * @param {string} [preferredId]
 * @returns {object|undefined}
 */
export function resolvePrimarySubscription( subscriptions = [], preferredId ) {
	if ( preferredId ) {
		const match = subscriptions.find(
			( sub ) => String( sub.id ) === String( preferredId )
		);
		if ( match ) {
			return match;
		}
	}
	return (
		subscriptions.find( ( sub ) => sub.status === 'active' ) ||
		subscriptions[ 0 ]
	);
}

/**
 * Prefer an explicit id, else the first active plan, else the first card.
 *
 * @param {Array<{ id?: string, status?: string }>} [subscriptions]
 * @param {string} [preferredId]
 * @returns {string|undefined}
 */
export function resolveSubscriptionId( subscriptions = [], preferredId ) {
	const primary = resolvePrimarySubscription( subscriptions, preferredId );
	return primary?.id;
}

/**
 * Parse a servings count from API label ("2 servings") or numeric field.
 *
 * @param {object} [line]
 * @returns {number} 0 when unknown
 */
export function lineServingsCount( line ) {
	const explicit = Number( line?.servingsCount );
	if ( Number.isFinite( explicit ) && explicit > 0 ) {
		return Math.floor( explicit );
	}
	const fromLabel = String( line?.servings || '' ).match( /(\d+)/ );
	if ( fromLabel ) {
		const n = Number( fromLabel[ 1 ] );
		if ( Number.isFinite( n ) && n > 0 ) {
			return Math.floor( n );
		}
	}
	return 0;
}

/**
 * Bottom-right card flag: "1 in your subscription".
 *
 * @param {number} quantity
 * @returns {string}
 */
export function formatBoxStatus( quantity ) {
	const qty = Math.max( 1, Number( quantity ) || 1 );
	return sprintf( __( '%d in your subscription', 'stayilo' ), qty );
}

/**
 * Map a subscription into Your Order slider cards — one card per product line.
 *
 * @param {object} [subscription]
 * @returns {Array<object>}
 */
export function toOrderSliderItems( subscription ) {
	if ( ! subscription ) {
		return [];
	}

	const lines = Array.isArray( subscription.lineItems )
		? subscription.lineItems
		: [];

	if ( lines.length > 0 ) {
		return lines.map( ( line ) => {
			const qty = Math.max( 1, Number( line.quantity ) || 1 );

			return {
				id: line.id || `${ subscription.id }-${ line.productId }`,
				title: line.title || __( 'Product', 'stayilo' ),
				description: line.description || '',
				imageUrl: line.imageUrl || subscription.imageUrl,
				imageAlt: line.title || subscription.imageAlt,
				stats: Array.isArray( line.stats ) ? line.stats : [],
				quantity: qty,
				servings: line.servings || '',
				boxStatus: formatBoxStatus( qty ),
			};
		} );
	}

	return [
		{
			id: subscription.id,
			title: subscription.title || __( 'Subscription', 'stayilo' ),
			description: subscription.description,
			imageUrl: subscription.imageUrl,
			imageAlt: subscription.imageAlt,
			stats: Array.isArray( subscription.stats ) ? subscription.stats : [],
			boxStatus: formatBoxStatus( 1 ),
		},
	];
}

/**
 * Whether the subscription has any active discounts to surface in the portal.
 *
 * @param {object} [subscription]
 * @returns {boolean}
 */
export function subscriptionHasDiscounts( subscription ) {
	if ( ! subscription ) {
		return false;
	}
	if (
		Array.isArray( subscription.discounts ) &&
		subscription.discounts.length > 0
	) {
		return true;
	}
	if ( subscription.retentionDiscount?.percent > 0 ) {
		return true;
	}
	const discountTotal = Number( subscription.orderSummary?.discountTotal );
	return Number.isFinite( discountTotal ) && discountTotal > 0;
}

/**
 * Labels for the weekly discount strip.
 *
 * @param {object} [subscription]
 * @returns {string[]}
 */
export function subscriptionDiscountLabels( subscription ) {
	if ( Array.isArray( subscription?.discounts ) && subscription.discounts.length ) {
		return subscription.discounts
			.map( ( row ) => String( row?.label || '' ).trim() )
			.filter( Boolean );
	}
	if ( subscription?.retentionDiscount?.percent > 0 ) {
		return [ sprintf( __( '%d%% off', 'stayilo' ), subscription.retentionDiscount.percent ) ];
	}
	return [];
}
