import { useMemo } from 'react';
import { resolveNextDeliveryDate } from './delivery/index.js';
import { addBillingPeriod } from './delivery/frequency.js';
import { buildUpcomingBoxesFromDate } from './upcomingBoxes.js';

/**
 * UpcomingBoxesSlider items derived from a subscription's next order.
 *
 * @param {object|null|undefined} subscription
 * @param {string} [fallbackDate]
 */
export function useUpcomingBoxItems( subscription, fallbackDate ) {
	const nextDate =
		resolveNextDeliveryDate( subscription ) || fallbackDate || '';

	return useMemo(
		() =>
			buildUpcomingBoxesFromDate( nextDate, 12, {
				interval: subscription?.billingInterval,
				period: subscription?.billingPeriod,
				addPeriod: addBillingPeriod,
			} ),
		[
			nextDate,
			subscription?.billingInterval,
			subscription?.billingPeriod,
		]
	);
}
