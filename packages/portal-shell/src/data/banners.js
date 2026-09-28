import { __ } from '@stayilo/design-system/i18n';

/**
 * Example banner configs for the dynamic Banner component.
 * Pass these (or overrides) as props — one component covers all layouts.
 */

/** Green welcome strip with light text (image 1). */
export const WELCOME_BANNER = {
	title: __( 'Welcome!', 'stayilo' ),
	subtitle: __(
		'Manage your meal subscriptions, upcoming orders, and account details here.',
		'stayilo'
	),
	backgroundColor: 'var(--stayilo-banner-bg)',
	textTone: 'brand',
	showDecorations: true,
};

/** Edit-box header with single-select tabs (image 2). */
export const EDIT_BOX_BANNER = {
	title: __( 'Edit your subscription', 'stayilo' ),
	subtitle: __(
		'Review what’s in your next order, or browse more items to add before the cutoff.',
		'stayilo'
	),
	backgroundColor: '#F7F4EE',
	textTone: 'dark',
	titleClassName: 'sm:!text-[32px] !text-2xl !font-bold !leading-[100%] sm:!leading-[40px]',
	subtitleClassName: '!text-base !font-normal !leading-[26px]',
	paddingClassName: 'py-10',
	tabs: [
		{ id: 'in-box', label: __( 'In your subscription', 'stayilo' ), icon: 'box' },
		{ id: 'add-more', label: __( 'Add more items', 'stayilo' ), icon: 'plus' },
	],
	activeTabId: 'in-box',
};

/** Canceled / reactivate CTA banner (image 3). */
export const REACTIVATE_BANNER = {
	title: __( 'Welcome back, Coby!', 'stayilo' ),
	subtitle: __( 'We missed you! Your subscription is currently cancelled.', 'stayilo' ),
	backgroundColor: '#FFDAA7',
	textTone: 'dark',
	subtitleClassName: '!text-xl !font-medium !leading-[26px]',
	showAccent: false,
	// accentColor: '#C4F07A',
	actions: [
		{ label: __( 'Reactivate My Plan', 'stayilo' ), variant: 'primary' },
		{ label: __( 'Review your subscription', 'stayilo' ), variant: 'secondary' },
	],
};

/** Payment failed — replaces welcome banner; CTA opens unpaid renewal checkout. */
export const PAYMENT_FAILED_BANNER = {
	title: __( 'Payment failed', 'stayilo' ),
	subtitle: __(
		'We couldn’t process your payment. Please complete repayment to keep your meals coming.',
		'stayilo'
	),
	backgroundColor: '#C00808',
	textTone: 'light',
	subtitleClassName: '!text-xl !font-medium !leading-[26px]',
	showAccent: false,
	showDecorations: false,
	actions: [
		{
			label: __( 'Repay now', 'stayilo' ),
			variant: 'secondary',
			className: 'portal-btn--on-dark',
		},
	],
};
