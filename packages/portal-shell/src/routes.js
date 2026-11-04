/** Portal route paths — kept out of PortalShell to avoid circular imports. */

export const NAV_ROUTES = {
	subscription: '/my-subscription',
	order: '/order',
	payment: '/payment',
	account: '/account-info',
};

/** PortalHome — linked from My Subscription Cancel. */
export const PORTAL_HOME_PATH = '/order-overview';

/** My Subscription list page. */
export const MY_SUBSCRIPTION_PATH = '/my-subscription';

/** Subscription actions help cards — linked from Account Subscription Manage. */
export const MANAGE_SUBSCRIPTION_PATH = '/subscription-actions';

/** Alias for subscription actions page. */
export const SUBSCRIPTION_ACTIONS_PATH = '/subscription-actions';

/** Manage subscription order overview — opened from My Subscription Manage CTA. */
export const MANAGE_SUBSCRIPTION_OVERVIEW_PATH = '/view-subscription';

/** Account information page. */
export const ACCOUNT_INFO_PATH = '/account-info';

/** Account manage-subscriptions list — opened from Account Info. */
export const ACCOUNT_SUBSCRIPTION_PATH = '/manage-subscription';

/** Order page — past orders list. */
export const ORDER_PATH = '/order';

/** Single order details — opened from View Order. */
export const ORDER_DETAILS_PATH = '/order-details';

/** Edit your subscription — opened from Your Order slider Edit subscription. */
export const EDIT_BOX_PATH = '/edit-box';

/** View box / upcoming order details — opened from Your Order slider View Subscription. */
export const VIEW_BOX_PATH = '/view-box';

/** Payment methods + history page. */
export const PAYMENT_PATH = '/payment';
