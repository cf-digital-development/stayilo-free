import { formatDeliveryBannerDate, toDateId } from '../monthCalendar.js';
import { __ } from '@stayilo/design-system/i18n';

/**
 * @param {string} gmt
 * @returns {Date|null}
 */
export function parseGmtDate( gmt ) {
	if ( ! gmt ) {
		return null;
	}
	const date = new Date(
		/Z|[+-]\d{2}:?\d{2}$/.test( gmt ) ? gmt : `${ gmt }Z`
	);
	return Number.isNaN( date.getTime() ) ? null : date;
}

/**
 * @param {string} gmt
 * @returns {string}
 */
export function formatClientDeliveryDate( gmt ) {
	const date = parseGmtDate( gmt );
	if ( ! date ) {
		return 'Updated';
	}
	return formatDeliveryBannerDate( date ) || __( 'Updated', 'stayilo' );
}

/**
 * @param {string} gmt
 * @returns {string}
 */
export function formatClientDeliveryDateId( gmt ) {
	const date = parseGmtDate( gmt );
	return date ? toDateId( date ) : '';
}

/**
 * @param {string} gmt
 * @returns {{ dateId: string, dateLabel: string }}
 */
export function gmtToDeliveryFields( gmt ) {
	return {
		dateId: formatClientDeliveryDateId( gmt ),
		dateLabel: formatClientDeliveryDate( gmt ),
	};
}
