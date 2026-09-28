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
	body: "If you're out of town or simply want a break from cooking, you can skip your weekly orders or cancel your subscription.",
	actionLabel: __( 'Manage Subscription', 'stayilo' ),
};
