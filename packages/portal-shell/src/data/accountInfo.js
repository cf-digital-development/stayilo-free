import { __ } from '@stayilo/design-system/i18n';
/** Account information page defaults. */
export const ACCOUNT_INFO_BANNER = {
	title: __( 'Personal details', 'stayilo' ),
	subtitle: __( 'Keep your contact details up to date.', 'stayilo' ),
	backgroundColor: 'var(--stayilo-banner-bg)',
	textTone: 'brand',
	showDecorations: true,
};

export const ACCOUNT_PROFILE = {
	fullName: '',
	email: '',
	avatarUrl: '',
	avatarAlt: __( 'Account', 'stayilo' ),
};

export const SUBSCRIPTION_MANAGEMENT = {
	title: __( 'Subscription management', 'stayilo' ),
	headline: __( 'Want to take break or cancel?', 'stayilo' ),
	body: __(
		"If you're away or need a pause, you can skip upcoming orders or cancel your subscription.",
		'stayilo'
	),
	actionLabel: __( 'Manage Subscription', 'stayilo' ),
};
