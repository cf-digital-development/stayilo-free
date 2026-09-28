import { __ } from '@stayilo/design-system/i18n';
/** Subscription actions page copy + card defaults. */

export const SUBSCRIPTION_ACTIONS_HEADER = {
	title: __( 'What would you like to do?', 'stayilo' ),
	subtitle: __( 'Skip an order, adjust your subscription, or manage your plan — pick the option that works best for you.', 'stayilo' ),
};

export const SUBSCRIPTION_ACTION_CARDS = [
	{
		id: 'skip-delivery',
		title: __( 'Skip order for this week', 'stayilo' ),
		description: __( 'Need a break? Skip your next order and we’ll resume on your following scheduled date.', 'stayilo' ),
		actionLabel: __( 'Skip Order', 'stayilo' ),
		actionKey: 'skip-delivery',
	},
	{
		id: 'cancel-subscription',
		title: __( 'Cancel subscription', 'stayilo' ),
		description: __( 'End your plan when you’re ready. You can always come back and reactivate later.', 'stayilo' ),
		actionLabel: __( 'Cancel', 'stayilo' ),
		actionKey: 'cancel-subscription',
	},
];

export const CLASSIC_SUBSCRIPTION_ACTION_COPY = {
	'skip-delivery': {
		title: __( 'Skip this delivery', 'stayilo' ),
		description: __( 'Push your next shipment back — your plan picks up right where it left off.', 'stayilo' ),
		actionLabel: __( 'Skip delivery', 'stayilo' ),
	},
	'cancel-subscription': {
		title: __( 'Cancel subscription', 'stayilo' ),
		description: __( 'We’ll walk you through it. No pressure, no hidden steps.', 'stayilo' ),
		actionLabel: __( 'Continue to cancel', 'stayilo' ),
	},
};
