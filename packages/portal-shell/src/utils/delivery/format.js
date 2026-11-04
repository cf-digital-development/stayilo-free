import { __, _n, sprintf } from '@stayilo/design-system/i18n';
import {
	DELIVERY_CHANGE_BUFFER_DAYS,
	parseDateId,
	startOfDay,
	toDateId,
} from '../monthCalendar.js';
import { resolveDeliveryDateParts } from './resolve.js';

const WEEKDAY_LONG = {
	MON: __( 'Monday', 'stayilo' ),
	TUE: __( 'Tuesday', 'stayilo' ),
	WED: __( 'Wednesday', 'stayilo' ),
	THU: __( 'Thursday', 'stayilo' ),
	FRI: __( 'Friday', 'stayilo' ),
	SAT: __( 'Saturday', 'stayilo' ),
	SUN: __( 'Sunday', 'stayilo' ),
};

/**
 * Short label — e.g. "Sun, Aug 17".
 *
 * @param {{ id?: string, weekday?: string, day?: number|string, month?: string }|null|undefined} parts
 * @returns {string}
 */
export function formatShortDeliveryDate( parts ) {
	if ( ! parts ) {
		return '';
	}
	const parsed = parseDateId( parts.id );
	if ( parsed ) {
		return parsed.toLocaleDateString( ( typeof document !== 'undefined' && document.documentElement.lang ) || undefined, {
			weekday: 'short',
			month: 'short',
			day: 'numeric',
		} );
	}
	const weekday = String( parts.weekday || '' ).toLowerCase();
	const pretty =
		weekday.charAt( 0 ).toUpperCase() + weekday.slice( 1 ).toLowerCase();
	return `${ pretty }, ${ parts.month } ${ parts.day }`.replace( 'SEPT', 'Sep' );
}

/**
 * Last calendar day the customer can still change this order
 * (order date minus any fulfilment buffer).
 *
 * @param {string|object|null|undefined} value
 * @returns {Date|null}
 */
export function lastDeliveryChangeDate( value ) {
	const parts = resolveDeliveryDateParts( value );
	const parsed = parseDateId( parts?.id );
	if ( ! parsed ) {
		return null;
	}
	if ( DELIVERY_CHANGE_BUFFER_DAYS > 0 ) {
		parsed.setDate( parsed.getDate() - DELIVERY_CHANGE_BUFFER_DAYS );
	}
	return startOfDay( parsed );
}

/**
 * @param {string|object|null|undefined} value
 * @returns {string}
 */
export function formatEditUntilLabel( value ) {
	const last = lastDeliveryChangeDate( value );
	if ( ! last ) {
		return '';
	}
	return formatShortDeliveryDate( { id: toDateId( last ) } );
}

/**
 * Remaining change window for this delivery, e.g. "3 days left to change".
 *
 * @param {string|object|null|undefined} value
 * @returns {string}
 */
export function formatChangeWindowLabel( value ) {
	const last = lastDeliveryChangeDate( value );
	if ( ! last ) {
		return '';
	}
	const today = startOfDay( new Date() );
	const days = Math.round(
		( last.getTime() - today.getTime() ) / 86400000
	);
	if ( days < 0 ) {
		return __( 'Changes closed', 'stayilo' );
	}
	if ( days === 0 ) {
		return __( 'Last day to change', 'stayilo' );
	}
	return sprintf( _n( '%d day left to change', '%d days left to change', days, 'stayilo' ), days );
}

/**
 * @param {{ weekday?: string }|null|undefined} date
 * @returns {string}
 */
export function formatWeekdayLong( date ) {
	if ( ! date ) {
		return '';
	}
	return WEEKDAY_LONG[ date.weekday ] || date.weekday;
}
