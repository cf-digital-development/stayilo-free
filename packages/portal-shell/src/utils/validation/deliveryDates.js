import {
	earliestSelectableDeliveryDate,
	parseDateId,
} from '../monthCalendar.js';
import { __ } from '@stayilo/design-system/i18n';

/** Default window length for the reschedule date carousel. */
export const DEFAULT_DELIVERY_DATE_COUNT = 21;

/**
 * Normalize a Date into the portal date-badge shape.
 *
 * @param {Date} value
 * @returns {{ id: string, weekday: string, day: number, month: string }}
 */
export function toDateParts( value ) {
	const weekday = value
		.toLocaleDateString( ( typeof document !== 'undefined' && document.documentElement.lang ) || undefined, { weekday: 'short' } )
		.toUpperCase();
	const month = value
		.toLocaleDateString( ( typeof document !== 'undefined' && document.documentElement.lang ) || undefined, { month: 'short' } )
		.toUpperCase()
		.replace( '.', '' );
	const year = value.getFullYear();
	const monthNum = String( value.getMonth() + 1 ).padStart( 2, '0' );
	const dayNum = String( value.getDate() ).padStart( 2, '0' );

	return {
		id: `${ year }-${ monthNum }-${ dayNum }`,
		weekday,
		day: value.getDate(),
		month: month === 'SEP' ? __( 'SEPT', 'stayilo' ) : month,
	};
}

/**
 * Build a consecutive range of selectable order dates.
 *
 * @param {object} [options]
 * @param {Date|string|number} [options.startDate]
 * @param {number} [options.count=21]
 * @returns {Array<{ id: string, weekday: string, day: number, month: string }>}
 */
export function generateDeliveryDates( {
	startDate = new Date(),
	count = DEFAULT_DELIVERY_DATE_COUNT,
} = {} ) {
	const start = new Date( startDate );
	start.setHours( 0, 0, 0, 0 );

	if ( Number.isNaN( start.getTime() ) || count < 1 ) {
		return [];
	}

	return Array.from( { length: count }, ( _, index ) => {
		const value = new Date( start );
		value.setDate( start.getDate() + index );
		return toDateParts( value );
	} );
}

/**
 * Build a badge-carousel range that always includes the scheduled order date
 * (e.g. after picking September in the month calendar).
 *
 * @param {string|Date|null|undefined} anchorDateId
 * @param {number} [windowDays=21]
 * @returns {Array<{ id: string, weekday: string, day: number, month: string }>}
 */
export function buildRescheduleDateRange(
	anchorDateId,
	windowDays = DEFAULT_DELIVERY_DATE_COUNT
) {
	const earliest = earliestSelectableDeliveryDate();
	const anchor = parseDateId( anchorDateId );

	let lastDay = new Date( earliest );
	lastDay.setDate( earliest.getDate() + windowDays - 1 );

	if ( anchor ) {
		const anchorEnd = new Date( anchor );
		anchorEnd.setDate( anchor.getDate() + windowDays - 1 );
		if ( anchorEnd > lastDay ) {
			lastDay = anchorEnd;
		}
	}

	const daySpan =
		Math.floor( ( lastDay.getTime() - earliest.getTime() ) / 86400000 ) + 1;

	return generateDeliveryDates( {
		startDate: earliest,
		count: Math.max( windowDays, daySpan ),
	} );
}
