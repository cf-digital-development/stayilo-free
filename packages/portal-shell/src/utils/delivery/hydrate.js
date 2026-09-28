import {
	formatDeliveryBannerDate,
	parseDateId,
	startOfDay,
	toDateId,
} from '../monthCalendar.js';
import { parseGmtDate } from './gmt.js';
import { __ } from '@stayilo/design-system/i18n';

/**
 * @returns {Date}
 */
export function todayStart() {
	return startOfDay( new Date() );
}

/**
 * @returns {string}
 */
export function todayDateId() {
	return toDateId( todayStart() );
}

/**
 * @param {Date} [date]
 * @returns {{ dateId: string, dateLabel: string }}
 */
export function deliveryFieldsFromDate( date = todayStart() ) {
	const value = startOfDay( date );
	return {
		dateId: toDateId( value ),
		dateLabel: formatDeliveryBannerDate( value ),
	};
}

/**
 * Best parseable order date on a subscription card.
 *
 * @param {object|null|undefined} card
 * @returns {Date|null}
 */
export function parseSubscriptionDeliveryDate( card ) {
	const next = card?.nextDelivery || {};
	const fromId = parseDateId( next.dateId );
	if ( fromId ) {
		return fromId;
	}

	const fromGmt = parseGmtDate( card?.nextPaymentGmt || card?.startDateGmt );
	if ( fromGmt ) {
		return startOfDay( fromGmt );
	}

	return (
		parseDateId( card?.startDate ) ||
		parseDateId( next.date ) ||
		null
	);
}

/**
 * Normalize nextDelivery from the best backend date on the card
 * (`nextPaymentGmt`, `dateId`, or formatted label).
 *
 * @param {object|null|undefined} card
 * @returns {object|null|undefined}
 */
export function hydrateSubscriptionDelivery( card ) {
	if ( ! card ) {
		return card;
	}

	const date = parseSubscriptionDeliveryDate( card );
	if ( ! date ) {
		return card;
	}

	const fields = deliveryFieldsFromDate( date );

	return {
		...card,
		startDate: card.startDate || fields.dateId,
		nextDelivery: {
			variant: 'summary',
			label: __( 'Next order', 'stayilo' ),
			...( card.nextDelivery || {} ),
			date: fields.dateLabel,
			dateId: fields.dateId,
		},
	};
}
