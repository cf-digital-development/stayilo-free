import { __ } from '@stayilo/design-system/i18n';
/**
 * Merge an order date override onto a subscription card's nextDelivery.
 *
 * @param {object} card
 * @param {{ dateId?: string, dateLabel?: string }} override
 * @returns {object}
 */
export function applyDeliveryOverrideToCard( card, override ) {
	if ( ! override?.dateId && ! override?.dateLabel ) {
		return card;
	}
	return {
		...card,
		nextDelivery: {
			...( card.nextDelivery || {} ),
			date: override.dateLabel || card.nextDelivery?.date,
			dateId: override.dateId || card.nextDelivery?.dateId,
		},
	};
}

/**
 * Patch nextDelivery on a subscription card.
 *
 * @param {object} card
 * @param {{
 *   dateId?: string,
 *   dateLabel?: string,
 *   variant?: string,
 *   label?: string,
 *   nextPaymentGmt?: string,
 * }} patch
 * @returns {object}
 */
export function patchSubscriptionNextDelivery( card, patch ) {
	const { dateId, dateLabel, variant, label, nextPaymentGmt } = patch;
	return {
		...card,
		...( nextPaymentGmt ? { nextPaymentGmt } : {} ),
		nextDelivery: {
			...( card.nextDelivery || {} ),
			variant: variant ?? card.nextDelivery?.variant ?? 'summary',
			label: label ?? card.nextDelivery?.label ?? __( 'Next order', 'stayilo' ),
			date: dateLabel || card.nextDelivery?.date,
			dateId: dateId || card.nextDelivery?.dateId,
		},
	};
}
