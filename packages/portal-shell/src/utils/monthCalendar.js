import { toDateParts } from './validation/deliveryDates.js';

const ISO_DATE_ID = /^\d{4}-\d{2}-\d{2}$/;

/** Sunday-first weekday labels (matches Order Date mockup). */
export const WEEKDAY_HEADERS = [
	'Sun',
	'Mon',
	'Tue',
	'Wed',
	'Thu',
	'Fri',
	'Sat',
];

/**
 * @param {Date} value
 * @returns {Date}
 */
export function startOfDay( value ) {
	const next = new Date( value );
	next.setHours( 0, 0, 0, 0 );
	return next;
}

/**
 * Parse `YYYY-MM-DD` (or Date / timestamp) into a local Date at midnight.
 *
 * @param {string|Date|number|null|undefined} value
 * @returns {Date|null}
 */
export function parseDateId( value ) {
	if ( value == null || value === '' ) {
		return null;
	}
	if ( value instanceof Date ) {
		const next = startOfDay( value );
		return Number.isNaN( next.getTime() ) ? null : next;
	}
	if ( typeof value === 'number' ) {
		const next = startOfDay( new Date( value ) );
		return Number.isNaN( next.getTime() ) ? null : next;
	}
	const raw = String( value ).trim();
	if ( ISO_DATE_ID.test( raw ) ) {
		const [ year, month, day ] = raw.split( '-' ).map( Number );
		return new Date( year, month - 1, day );
	}
	const parsed = startOfDay( new Date( raw ) );
	return Number.isNaN( parsed.getTime() ) ? null : parsed;
}

/**
 * @param {Date} value
 * @returns {string}
 */
export function toDateId( value ) {
	return toDateParts( value ).id;
}

/**
 * Fulfilment buffer in calendar days before an order date.
 * 0 = customers can edit through the order date / pick from today.
 */
export const DELIVERY_CHANGE_BUFFER_DAYS = 0;

/**
 * First day a customer may pick for change-delivery-date.
 *
 * @param {Date} [from]
 * @returns {Date}
 */
export function earliestSelectableDeliveryDate( from = new Date() ) {
	const next = startOfDay( from );
	next.setDate( next.getDate() + DELIVERY_CHANGE_BUFFER_DAYS );
	return next;
}

/**
 * @param {Date} [from]
 * @returns {string}
 */
export function earliestSelectableDeliveryDateId( from = new Date() ) {
	return toDateId( earliestSelectableDeliveryDate( from ) );
}

/**
 * Month title like "August 2026".
 *
 * @param {number} year
 * @param {number} monthIndex 0–11
 * @returns {string}
 */
export function formatMonthTitle( year, monthIndex ) {
	const value = new Date( year, monthIndex, 1 );
	return value.toLocaleDateString( ( typeof document !== 'undefined' && document.documentElement.lang ) || undefined, {
		month: 'long',
		year: 'numeric',
	} );
}

/**
 * Banner-friendly label, e.g. "Friday, 14 Aug 2026".
 *
 * @param {Date|string} value
 * @returns {string}
 */
export function formatDeliveryBannerDate( value ) {
	const date = parseDateId( value );
	if ( ! date ) {
		return '';
	}
	return date.toLocaleDateString( ( typeof document !== 'undefined' && document.documentElement.lang ) || undefined, {
		weekday: 'long',
		day: 'numeric',
		month: 'short',
		year: 'numeric',
	} );
}

/**
 * Build a Sunday-first grid (always 6 weeks) including adjacent-month days.
 *
 * @param {number} year
 * @param {number} monthIndex 0–11
 * @returns {Array<{
 *   key: string,
 *   date: Date,
 *   id: string,
 *   day: number,
 *   inMonth: boolean,
 * }>}
 */
export function getMonthGrid( year, monthIndex ) {
	const firstOfMonth = new Date( year, monthIndex, 1 );
	const startOffset = firstOfMonth.getDay(); // Sunday = 0
	const gridStart = new Date( year, monthIndex, 1 - startOffset );

	return Array.from( { length: 42 }, ( _, index ) => {
		const date = new Date( gridStart );
		date.setDate( gridStart.getDate() + index );
		const inMonth = date.getMonth() === monthIndex;
		return {
			key: `${ toDateId( date ) }-${ index }`,
			date,
			id: toDateId( date ),
			day: date.getDate(),
			inMonth,
		};
	} );
}
