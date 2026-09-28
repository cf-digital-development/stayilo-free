import {
	formatDeliveryBannerDate,
	parseDateId,
	toDateId,
} from '../monthCalendar.js';
import { toDateParts } from '../validation/deliveryDates.js';
import { resolveDeliveryDateParts } from './resolve.js';

/**
 * Shift an order date by day delta; returns date-badge parts.
 *
 * @param {string|object|null|undefined} date
 * @param {number} dayDelta
 * @returns {{ id: string, weekday: string, day: number, month: string }}
 */
export function shiftDeliveryDateParts( date, dayDelta ) {
	const parts = resolveDeliveryDateParts( date );
	const parsed = parseDateId( parts?.id );
	if ( ! parsed ) {
		return date;
	}
	parsed.setDate( parsed.getDate() + dayDelta );
	return toDateParts( parsed );
}

/**
 * Shift an order date forward by whole weeks.
 *
 * @param {string|Date|null|undefined} date
 * @param {number} [weeks=1]
 * @returns {{ dateId: string, dateLabel: string }|null}
 */
export function addWeeksToDeliveryDate( date, weeks = 1 ) {
	const start = parseDateId( date );
	if ( ! start || weeks < 1 ) {
		return null;
	}
	const value = new Date( start );
	value.setDate( value.getDate() + weeks * 7 );
	return {
		dateId: toDateId( value ),
		dateLabel: formatDeliveryBannerDate( value ),
	};
}
