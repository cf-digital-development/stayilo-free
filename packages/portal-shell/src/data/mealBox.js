import { __, sprintf } from '@stayilo/design-system/i18n';

export const MY_SUBSCRIPTION_HEADER = {
	title: __( 'My subscription', 'stayilo' ),
	subtitle: __(
		'You can update your subscription, schedule orders, or make changes at any time.',
		'stayilo'
	),
};

/** Account → Manage subscriptions page header. */
export const ACCOUNT_SUBSCRIPTION_HEADER = {
	title: __( 'Manage your subscription', 'stayilo' ),
	subtitle: __( 'If you want to take a break, here are your options', 'stayilo' ),
};

export const ACCOUNT_SUBSCRIPTION_BANNER = {
	title: __( 'Subscription management', 'stayilo' ),
	subtitle: __( 'If you want to take a break, here are your options', 'stayilo' ),
	backgroundColor: 'var(--stayilo-banner-bg)',
	textTone: 'brand',
	showDecorations: true,
};

/**
 * @param {number} activeCount
 * @returns {string}
 */
export function formatActiveSubscriptionsSubtitle( activeCount ) {
	if ( activeCount <= 0 ) {
		return __(
			'You can update your subscription, schedule orders, or make changes at any time.',
			'stayilo'
		);
	}
	if ( activeCount === 1 ) {
		return __(
			'You have 1 active subscription. Update it, schedule orders, or make changes anytime.',
			'stayilo'
		);
	}
	return sprintf(
		__(
			'You have %d active subscriptions. Update them, schedule orders, or make changes anytime.',
			'stayilo'
		),
		activeCount
	);
}
