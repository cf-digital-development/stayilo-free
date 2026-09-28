import { __ } from '@stayilo/design-system/i18n';
/** Portal commerce page copy and headers. */

export const CREATE_SUBSCRIPTION_BANNER = {
	title: __( 'Subscribe now and enjoy 10% off every subscription!', 'stayilo' ),
	subtitle:
		"Set up a subscription for your current order, and we'll send your food on the same date.",
	actionLabel: __( 'Create Subscription', 'stayilo' ),
	backgroundColor: 'var(--stayilo-banner-bg)',
};

export const ORDERS_BANNER = {
	title: __( 'Orders', 'stayilo' ),
	subtitle: __( 'Review your complete order history and receipts in one place', 'stayilo' ),
	backgroundColor: 'var(--stayilo-banner-bg)',
	textTone: 'brand',
	showDecorations: true,
};

export const ORDER_DETAILS_HEADER = {
	title: __( 'Order details', 'stayilo' ),
	subtitle: __( 'Review your order details and order information', 'stayilo' ),
};

export const ORDER_DETAILS_BANNER = {
	...ORDER_DETAILS_HEADER,
	backgroundColor: 'var(--stayilo-banner-bg)',
	textTone: 'brand',
	showDecorations: true,
};

export const ORDER_CONVERT_BANNER = {
	title: __( 'Turn this into a subscription', 'stayilo' ),
	subtitle: __( 'Never run out – get this order delivered automatically every 4 weeks and save 10% on every delivery.', 'stayilo' ),
	actionLabel: __( 'Create subscription with this order', 'stayilo' ),
};

/** View box page — next-box card copy. */
export const VIEW_BOX_NEXT_CARD = {
	title: __( 'Your next subscription', 'stayilo' ),
	changeWindowLabel: '15 days left to change',
	viewActionLabel: __( 'View Subscription', 'stayilo' ),
	editBoxActionLabel: __( 'Edit Subscription', 'stayilo' ),
};
