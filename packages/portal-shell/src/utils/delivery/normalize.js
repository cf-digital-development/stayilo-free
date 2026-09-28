import {
	formatDeliveryBannerDate,
	parseDateId,
	toDateId,
} from '../monthCalendar.js';

/**
 * Normalize popup / API date payloads into store fields.
 *
 * @param {object|string|Date|null|undefined} date
 * @returns {{ dateId: string, dateLabel: string }|null}
 */
export function normalizeRescheduleDate( date ) {
	if ( ! date ) {
		return null;
	}

	if ( typeof date === 'string' || date instanceof Date ) {
		const parsed = parseDateId( date );
		if ( ! parsed ) {
			return null;
		}
		return {
			dateId: toDateId( parsed ),
			dateLabel: formatDeliveryBannerDate( parsed ),
		};
	}

	const parsed =
		parseDateId( date.id ) ||
		parseDateId( date.dateId ) ||
		parseDateId( date.label ) ||
		parseDateId( date.date );
	if ( ! parsed ) {
		return null;
	}

	return {
		dateId: toDateId( parsed ),
		dateLabel:
			date.label ||
			date.date ||
			formatDeliveryBannerDate( parsed ),
	};
}
