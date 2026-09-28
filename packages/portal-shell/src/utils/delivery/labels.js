import { formatShortDeliveryDate } from './format.js';
import { formatClientDeliveryDateId } from './gmt.js';
import { todayDateId } from './hydrate.js';
import { resolveDeliveryDateParts } from './resolve.js';

/**
 * Manage step — date only, e.g. "Sun, Aug 17".
 *
 * @param {string|object|null|undefined} value
 * @param {string} [_timeWindow] - Ignored; kept for call-site compatibility.
 * @returns {string}
 */
export function formatDeliveryEstimateLabel( value, _timeWindow ) {
	const parts = resolveDeliveryDateParts( value );
	if ( ! parts ) {
		return '';
	}
	return formatShortDeliveryDate( parts );
}

/**
 * Skip / confirm — date only, e.g. "Thu, Sep 20".
 *
 * @param {string|object|null|undefined} value
 * @param {string} [_timeWindow] - Ignored; kept for call-site compatibility.
 * @returns {string}
 */
export function formatDeliverySkipLabel( value, _timeWindow ) {
	const parts = resolveDeliveryDateParts( value );
	if ( ! parts ) {
		return '';
	}
	return formatShortDeliveryDate( parts );
}

/**
 * Build popup copy from subscription nextDelivery.
 *
 * @param {object|null|undefined} nextDelivery
 * @param {string} [nextPaymentGmt]
 * @returns {{ dateId?: string, estimateLabel: string, skipLabel: string }}
 */
export function deliveryLabelsFromNextDelivery( nextDelivery, nextPaymentGmt ) {
	const parts = resolveDeliveryDateParts(
		nextDelivery?.dateId || nextDelivery?.date
	);
	if ( ! parts ) {
		const dateId =
			nextDelivery?.dateId ||
			( nextPaymentGmt ? formatClientDeliveryDateId( nextPaymentGmt ) : '' ) ||
			todayDateId();
		return {
			dateId,
			estimateLabel: formatDeliveryEstimateLabel( dateId ),
			skipLabel: formatDeliverySkipLabel( dateId ),
		};
	}
	return {
		dateId: parts.id,
		estimateLabel: formatDeliveryEstimateLabel( parts ),
		skipLabel: formatDeliverySkipLabel( parts ),
	};
}

/**
 * Shared ManageDeliveryPopup props from a subscription card.
 *
 * @param {object|null|undefined} subscription
 * @returns {{
 *   currentDeliveryDateId: string|undefined,
 *   estimateLabel: string,
 *   skipDeliveryLabel: string,
 * }}
 */
export function getManageDeliveryPopupProps( subscription ) {
	const labels = deliveryLabelsFromNextDelivery(
		subscription?.nextDelivery,
		subscription?.nextPaymentGmt
	);
	return {
		currentDeliveryDateId:
			labels.dateId ||
			subscription?.nextDelivery?.dateId ||
			( subscription?.nextPaymentGmt
				? formatClientDeliveryDateId( subscription.nextPaymentGmt )
				: todayDateId() ),
		estimateLabel: labels.estimateLabel,
		skipDeliveryLabel: labels.skipLabel,
	};
}
