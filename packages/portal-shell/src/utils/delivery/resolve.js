import { toDateParts } from '../validation/deliveryDates.js';
import { parseDateId } from '../monthCalendar.js';
import { formatClientDeliveryDateId } from './gmt.js';
import { todayDateId } from './hydrate.js';

/**
 * Resolve portal date-badge parts from id, parts object, or label string.
 *
 * @param {string|object|null|undefined} value
 * @returns {{ id: string, weekday: string, day: number, month: string }|null}
 */
export function resolveDeliveryDateParts( value ) {
	if ( ! value ) {
		return null;
	}
	if ( typeof value === 'object' && value.id ) {
		return value;
	}
	const parsed = parseDateId(
		typeof value === 'string' ? value : value?.dateId || value?.date
	);
	if ( ! parsed ) {
		return null;
	}
	return toDateParts( parsed );
}

/**
 * Resolve the current scheduled delivery from a date list.
 *
 * @param {Array<{ id: string }>} dates
 * @param {string} [currentDeliveryDateId]
 * @returns {{ id: string, weekday: string, day: number|string, month: string }|null}
 */
export function resolveCurrentDeliveryDate( dates, currentDeliveryDateId ) {
	if ( ! dates?.length && ! currentDeliveryDateId ) {
		return null;
	}

	if ( currentDeliveryDateId ) {
		const match = dates?.find( ( item ) => item.id === currentDeliveryDateId );
		if ( match ) {
			return match;
		}
		const parsed = parseDateId( currentDeliveryDateId );
		if ( parsed ) {
			return toDateParts( parsed );
		}
	}

	return dates?.[ 0 ] ?? null;
}

/**
 * @param {Array<{ id: string }>} dates
 * @param {string} [dateId]
 * @returns {number}
 */
export function findDateIndex( dates, dateId ) {
	if ( ! dates?.length || ! dateId ) {
		return 0;
	}
	const exact = dates.findIndex( ( item ) => item.id === dateId );
	if ( exact >= 0 ) {
		return exact;
	}
	// Floor id missing from the list — first date on/after it (or end).
	const next = dates.findIndex( ( item ) => item.id >= dateId );
	return next >= 0 ? next : dates.length;
}

/**
 * Best date id/string for upcoming-box builders from a subscription.
 *
 * @param {object|null|undefined} subscription
 * @returns {string|undefined}
 */
export function resolveNextDeliveryDate( subscription ) {
	const parts = resolveDeliveryDateParts(
		subscription?.nextDelivery?.dateId || subscription?.nextDelivery?.date
	);
	if ( parts?.id ) {
		return parts.id;
	}
	if ( subscription?.nextPaymentGmt ) {
		return formatClientDeliveryDateId( subscription.nextPaymentGmt );
	}
	return subscription?.nextDelivery?.dateId || todayDateId();
}
