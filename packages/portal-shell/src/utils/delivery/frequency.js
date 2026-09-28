import { __, _n, sprintf } from '@stayilo/design-system/i18n';
/** @typedef {{ id: string, interval: number, period: string, label: string }} DeliveryFrequencyOption */

/** @type {DeliveryFrequencyOption[]} */
export const DELIVERY_FREQUENCY_OPTIONS = [
	{ id: '1-week', interval: 1, period: 'week', label: __( 'Every 1 week', 'stayilo' ) },
	{ id: '2-week', interval: 2, period: 'week', label: __( 'Every 2 weeks', 'stayilo' ) },
	{ id: '3-week', interval: 3, period: 'week', label: __( 'Every 3 weeks', 'stayilo' ) },
	{ id: '1-month', interval: 1, period: 'month', label: __( 'Every 1 month', 'stayilo' ) },
	{ id: '2-month', interval: 2, period: 'month', label: __( 'Every 2 months', 'stayilo' ) },
];

/**
 * @param {number} interval
 * @param {string} period
 * @returns {string}
 */
export function frequencyOptionId( interval, period ) {
	return `${ Math.max( 1, Number( interval ) || 1 ) }-${ String( period || 'week' ).toLowerCase() }`;
}

/**
 * @param {object|null|undefined} subscription
 * @returns {string}
 */
export function getSubscriptionFrequencyOptionId( subscription ) {
	return frequencyOptionId(
		subscription?.billingInterval,
		subscription?.billingPeriod
	);
}

/**
 * @param {object|null|undefined} raw
 * @returns {string}
 */
export function formatDeliveryFrequency( raw ) {
	const interval = Math.max( 1, Number( raw?.billingInterval ) || 1 );
	const period = String( raw?.billingPeriod || 'month' ).toLowerCase();
	const match = DELIVERY_FREQUENCY_OPTIONS.find(
		( option ) => option.interval === interval && option.period === period
	);
	if ( match ) {
		return match.label;
	}
	if ( period === 'day' ) {
		return sprintf( _n( 'Every %d day', 'Every %d days', interval, 'stayilo' ), interval );
	}
	if ( period === 'week' ) {
		return sprintf( _n( 'Every %d week', 'Every %d weeks', interval, 'stayilo' ), interval );
	}
	if ( period === 'year' ) {
		return sprintf( _n( 'Every %d year', 'Every %d years', interval, 'stayilo' ), interval );
	}
	return sprintf( _n( 'Every %d month', 'Every %d months', interval, 'stayilo' ), interval );
}

/**
 * @param {object|null|undefined} subscription
 * @returns {DeliveryFrequencyOption[]}
 */
export function getSelectableFrequencyOptions() {
	return DELIVERY_FREQUENCY_OPTIONS;
}

/**
 * Advance a date by a billing interval/period.
 *
 * @param {Date} date
 * @param {number} interval
 * @param {string} period
 * @returns {Date}
 */
export function addBillingPeriod( date, interval, period ) {
	const next = new Date( date );
	const step = Math.max( 1, Number( interval ) || 1 );
	const unit = String( period || 'week' ).toLowerCase();

	if ( unit === 'day' ) {
		next.setDate( next.getDate() + step );
		return next;
	}
	if ( unit === 'week' ) {
		next.setDate( next.getDate() + step * 7 );
		return next;
	}
	if ( unit === 'month' ) {
		next.setMonth( next.getMonth() + step );
		return next;
	}
	if ( unit === 'year' ) {
		next.setFullYear( next.getFullYear() + step );
		return next;
	}

	next.setDate( next.getDate() + step * 7 );
	return next;
}
