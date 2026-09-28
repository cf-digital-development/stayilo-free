import { boxLinesToPersistPayload } from '../utils/cartLines.js';
import { __, sprintf } from '@stayilo/design-system/i18n';

export function getPortal() {
	return typeof window !== 'undefined' ? window.stayiloPortal || {} : {};
}


export function syncWindowBootstrap( data ) {
	if ( typeof window === 'undefined' || ! data ) {
		return;
	}
	window.stayiloPortal = window.stayiloPortal || {};
	window.stayiloPortal.bootstrap = {
		...( window.stayiloPortal.bootstrap || {} ),
		...data,
	};
}

export async function portalAjax( action, fields = {}, nonceKey = 'nonce' ) {
	const portal = getPortal();
	const ajaxUrl = portal.ajaxUrl;

	if ( ! ajaxUrl ) {
		throw new Error( __( 'Portal ajaxUrl is missing', 'stayilo' ) );
	}

	const body = new FormData();
	body.append( 'action', action );
	body.append( 'nonce', portal[ nonceKey ] || portal.nonce || '' );

	Object.entries( fields ).forEach( ( [ key, value ] ) => {
		if ( value === undefined || value === null ) {
			return;
		}
		if ( typeof Blob !== 'undefined' && value instanceof Blob ) {
			const filename =
				value instanceof File && value.name ? value.name : 'avatar';
			body.append( key, value, filename );
			return;
		}
		body.append( key, String( value ) );
	} );

	const response = await fetch( ajaxUrl, {
		method: 'POST',
		credentials: 'same-origin',
		body,
	} );

	const json = await response.json().catch( () => ( {} ) );

	if ( ! response.ok || json?.success === false ) {
		const message =
			json?.data?.message ||
			json?.message ||
			sprintf( __( 'Portal request failed (%d)', 'stayilo' ), response.status );
		const error = new Error( message );
		error.code = json?.data?.code || '';
		error.redirect = json?.data?.redirect || '';
		throw error;
	}

	return json?.data ?? json;
}

export function getShopUrl() {
	return getStorefrontUrl( 'shopUrl', '/shop/' );
}

export function getCheckoutUrl() {
	return getStorefrontUrl( 'checkoutUrl', '/checkout/' );
}

/** WooCommerce add-payment-method (real gateway tokenization). */
export function getAddPaymentMethodUrl() {
	return getStorefrontUrl(
		'addPaymentMethodUrl',
		'/my-account/add-payment-method/'
	);
}

function getStorefrontUrl( key, fallbackPath ) {
	const portal = getPortal();
	if ( portal[ key ] ) {
		return String( portal[ key ] );
	}
	try {
		const account = portal.accountUrl
			? new URL( portal.accountUrl, window.location.origin )
			: new URL( window.location.origin );
		return new URL( fallbackPath, account.origin ).href;
	} catch {
		return fallbackPath;
	}
}

export function fetchPortalBootstrap() {
	return portalAjax( 'stayilo_portal_bootstrap' );
}

export function fetchPortalAccount() {
	return portalAjax( 'stayilo_portal_account', {
		payload: JSON.stringify( { method: 'get' } ),
	} );
}

export function updatePortalAccount( account ) {
	return portalAjax( 'stayilo_portal_account', {
		payload: JSON.stringify( { method: 'update', account } ),
	} );
}

export function updatePortalAvatar( file ) {
	return portalAjax( 'stayilo_portal_avatar', {
		method: 'update',
		avatar: file,
	} );
}

export function deletePortalAvatar() {
	return portalAjax( 'stayilo_portal_avatar', {
		method: 'delete',
	} );
}



export function cancelPortalSubscription( subscriptionId, meta = {} ) {
	const reasonIds = Array.isArray( meta.reasonIds )
		? meta.reasonIds.filter( Boolean )
		: [];
	return portalAjax( 'stayilo_portal_cancel_subscription', {
		subscription_id: subscriptionId,
		reason_ids: reasonIds.length ? JSON.stringify( reasonIds ) : undefined,
		other_reason: meta.otherReason || undefined,
	} );
}

export function reactivatePortalSubscription( subscriptionId ) {
	return portalAjax( 'stayilo_portal_reactivate_subscription', {
		subscription_id: subscriptionId,
	} );
}

export function skipPortalDelivery( subscriptionId ) {
	return portalAjax(
		'stayilo_skip_subscription',
		{ subscription_id: subscriptionId },
		'skipNonce'
	);
}

export function pausePortalSubscription( subscriptionId ) {
	return portalAjax(
		'stayilo_pause_subscription',
		{ subscription_id: subscriptionId },
		'pauseNonce'
	);
}

export function resumePortalSubscription( subscriptionId ) {
	return portalAjax(
		'stayilo_resume_subscription',
		{ subscription_id: subscriptionId },
		'resumeNonce'
	);
}

export function changePortalSubscriptionDate( subscriptionId, nextPaymentDate ) {
	return portalAjax(
		'stayilo_change_subscription_date',
		{
			subscription_id: subscriptionId,
			next_payment_date: nextPaymentDate,
		},
		'changeDateNonce'
	);
}

export function changePortalSubscriptionFrequency(
	subscriptionId,
	billingInterval,
	billingPeriod
) {
	return portalAjax(
		'stayilo_change_subscription_frequency',
		{
			subscription_id: subscriptionId,
			billing_interval: billingInterval,
			billing_period: billingPeriod,
		},
		'changeFrequencyNonce'
	);
}

export function editPortalSubscriptionItems( subscriptionId, items ) {
	return portalAjax(
		'stayilo_edit_subscription_items',
		{
			subscription_id: subscriptionId,
			items: JSON.stringify( items ),
		},
		'editItemsNonce'
	);
}

export function createPortalPaymentSetupIntent() {
	return portalAjax( 'stayilo_portal_payment_setup_intent' );
}

export function addPortalPaymentMethod( fields ) {
	return portalAjax( 'stayilo_portal_payment_add', fields );
}

export function fetchPortalNotifications() {
	return portalAjax( 'stayilo_portal_notifications' );
}

export function deletePortalPaymentMethod( tokenId ) {
	return portalAjax( 'stayilo_portal_payment_delete', {
		token_id: tokenId,
	} );
}

export function setDefaultPortalPaymentMethod( tokenId ) {
	return portalAjax( 'stayilo_portal_payment_default', {
		token_id: tokenId,
	} );
}

export function updatePortalBox( subscriptionId, lines ) {
	const payload = boxLinesToPersistPayload( lines );
	if ( payload.length === 0 ) {
		return Promise.reject(
			new Error( __( 'Your subscription must contain at least one item.', 'stayilo' ) )
		);
	}

	return portalAjax(
		'stayilo_portal_update_box',
		{
			subscription_id: subscriptionId,
			lines: JSON.stringify( payload ),
		},
		hasPortalEditItemsNonce() ? 'editItemsNonce' : 'nonce'
	);
}

function hasPortalEditItemsNonce() {
	const portal = getPortal();
	return Boolean( portal.editItemsNonce );
}

export function acceptPortalOffer(
	subscriptionId,
	{
		offerId = '',
		quantity,
		billingInterval,
		billingPeriod,
		delayWeeks,
	} = {}
) {
	return portalAjax( 'stayilo_portal_accept_offer', {
		subscription_id: subscriptionId,
		offer_id: offerId || undefined,
		quantity: quantity != null ? Number( quantity ) : undefined,
		billing_interval:
			billingInterval != null ? Number( billingInterval ) : undefined,
		billing_period: billingPeriod || undefined,
		delay_weeks: delayWeeks != null ? Number( delayWeeks ) : undefined,
	} );
}

function asList( value ) {
	if ( Array.isArray( value ) ) {
		return value;
	}
	if ( value && typeof value === 'object' ) {
		return Object.values( value );
	}
	return null;
}

export function getBootstrapFromWindow() {
	const portal = getPortal();
	const bootstrap = portal.bootstrap;
	if ( ! bootstrap || typeof bootstrap !== 'object' || Array.isArray( bootstrap ) ) {
		return null;
	}

	const next = { ...bootstrap };
	for ( const key of [
		'subscriptions',
		'orders',
		'paymentMethods',
		'paymentHistory',
		'notifications',
	] ) {
		if ( ! Object.prototype.hasOwnProperty.call( bootstrap, key ) ) {
			continue;
		}
		next[ key ] = asList( bootstrap[ key ] ) || [];
	}

	return next;
}

export function getPortalUserFirstName() {
	const bootstrap = getBootstrapFromWindow();
	const first =
		bootstrap?.account?.user?.firstName ||
		bootstrap?.account?.user?.displayName ||
		'';
	return typeof first === 'string' ? first.split( ' ' )[ 0 ] : '';
}
