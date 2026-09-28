import { parseDateId, toDateId } from './monthCalendar.js';
import { todayStart } from './delivery/hydrate.js';

/**
 * Map a Date into an UpcomingBoxesSlider card.
 *
 * @param {Date} value
 * @param {boolean} [isNext=false]
 * @returns {{ id: string, day: string, date: string, month: string, isNext: boolean }}
 */
export function toUpcomingBoxItem( value, isNext = false ) {
	const date = value instanceof Date ? value : parseDateId( value );
	if ( ! date ) {
		return null;
	}

	return {
		id: toDateId( date ),
		day: date.toLocaleDateString( ( typeof document !== 'undefined' && document.documentElement.lang ) || undefined, { weekday: 'long' } ),
		date: String( date.getDate() ).padStart( 2, '0' ),
		month: date.toLocaleDateString( ( typeof document !== 'undefined' && document.documentElement.lang ) || undefined, { month: 'long' } ),
		isNext: Boolean( isNext ),
	};
}

/**
 * Build upcoming-box cards starting from the next order date.
 *
 * @param {string|Date|null|undefined} nextDate
 * @param {number} [count=4]
 * @param {{ interval?: number, period?: string, addPeriod?: (date: Date, interval: number, period: string) => Date }} [schedule]
 * @returns {Array<{ id: string, day: string, date: string, month: string, isNext: boolean }>}
 */
export function buildUpcomingBoxesFromDate( nextDate, count = 4, schedule ) {
	const start = parseDateId( nextDate ) || todayStart();
	if ( count < 1 ) {
		return [];
	}

	const interval = Math.max( 1, Number( schedule?.interval ) || 1 );
	const period = String( schedule?.period || 'week' ).toLowerCase();
	const advance =
		schedule?.addPeriod ||
		( ( date ) => {
			const next = new Date( date );
			next.setDate( next.getDate() + interval * 7 );
			return next;
		} );

	let cursor = start;
	return Array.from( { length: count }, ( _, index ) => {
		if ( index > 0 ) {
			cursor = advance( cursor, interval, period );
		}
		return toUpcomingBoxItem( cursor, index === 0 );
	} ).filter( Boolean );
}
