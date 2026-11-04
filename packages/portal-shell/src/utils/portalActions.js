import { useEffect, useState } from 'react';
import { getStayiloRegistry } from '@stayilo/extension-sdk';
import { getPortal } from '../api/portal.js';

/** Actions that stay off until a paid plugin registers them. */
const PAID_ACTION_IDS = new Set( [
	'pause',
	'pause-subscription',
	'change-date',
	'change-delivery-date',
	'edit-box',
	'edit-items',
	'change-frequency',
	'delivery-frequency',
] );

function paidActionReady( actionId ) {
	if ( isPortalActionRegistered( actionId ) ) {
		return true;
	}

	if (
		actionId === 'pause-subscription' &&
		isPortalActionRegistered( 'pause' )
	) {
		return true;
	}

	if (
		( actionId === 'edit-box' || actionId === 'edit-items' ) &&
		( isPortalActionRegistered( 'edit-items' ) ||
			isPortalActionRegistered( 'edit-box' ) ||
			Boolean( getStayiloRegistry().getPortalRoute?.( 'edit-box' ) ) )
	) {
		return true;
	}

	if (
		( actionId === 'change-date' || actionId === 'change-delivery-date' ) &&
		( isPortalActionRegistered( 'change-date' ) ||
			isPortalActionRegistered( 'change-delivery-date' ) )
	) {
		return true;
	}

	if (
		( actionId === 'change-frequency' ||
			actionId === 'delivery-frequency' ) &&
		( isPortalActionRegistered( 'change-frequency' ) ||
			isPortalActionRegistered( 'delivery-frequency' ) )
	) {
		return true;
	}

	return false;
}

export const PORTAL_ACTION_SETTING_MAP = {
	'skip-delivery': 'skipDelivery',
	'update-address': 'updateAddress',
	pause: 'allowPause',
	'pause-subscription': 'allowPause',
	'change-date': 'allowDateChange',
	'change-delivery-date': 'allowDateChange',
	'edit-box': 'allowEditItems',
	'edit-items': 'allowEditItems',
	'change-frequency': 'allowFrequencyChange',
	'delivery-frequency': 'allowFrequencyChange',
	'order-history': 'showOrderHistory',
	reactivate: 'allowReactivation',
	'allow-reactivation': 'allowReactivation',
};

function coerceFlag( value, fallback = true ) {
	// wp_localize_script historically turns booleans into "" — treat as missing.
	if ( value === undefined || value === '' ) return fallback;
	if ( value === true || value === 1 || value === '1' ) return true;
	if ( value === false || value === 0 || value === '0' || value === null ) {
		return false;
	}
	if ( typeof value === 'string' ) {
		const v = value.trim().toLowerCase();
		if ( [ 'true', 'yes', 'on' ].includes( v ) ) return true;
		if ( [ 'false', 'no', 'off' ].includes( v ) ) return false;
	}
	return Boolean( value );
}

export function getPortalActionSettings() {
	const raw = getPortal().portalActions;

	if ( ! raw || typeof raw !== 'object' ) {
		return {
			skipDelivery: true,
			updateAddress: true,
			allowPause: false,
			allowDateChange: false,
			allowEditItems: false,
			allowFrequencyChange: false,
			showOrderHistory: true,
			allowReactivation: true,
		};
	}

	return {
		skipDelivery: coerceFlag( raw.skipDelivery, false ),
		updateAddress: coerceFlag( raw.updateAddress, false ),
		allowPause: coerceFlag( raw.allowPause, false ),
		allowDateChange: coerceFlag( raw.allowDateChange, false ),
		allowEditItems: coerceFlag( raw.allowEditItems, false ),
		allowFrequencyChange: coerceFlag( raw.allowFrequencyChange, false ),
		showOrderHistory: coerceFlag( raw.showOrderHistory, true ),
		allowReactivation: coerceFlag( raw.allowReactivation, true ),
	};
}

export function isPortalActionEnabled( actionId ) {
	if ( PAID_ACTION_IDS.has( actionId ) && ! paidActionReady( actionId ) ) {
		return false;
	}

	// Cancel + reactivate are Free features — always available in the portal.
	if (
		actionId === 'reactivate' ||
		actionId === 'allow-reactivation' ||
		actionId === 'cancel' ||
		actionId === 'cancel-subscription'
	) {
		return true;
	}

	const key = PORTAL_ACTION_SETTING_MAP[ actionId ];
	if ( ! key ) return true;
	return getPortalActionSettings()[ key ] === true;
}

/**
 * Whether the Manage Subscription CTA should show on meal-box cards.
 * Always true — Free includes skip, address, cancel, and reactivate, so the
 * manage entry point is not gated on a single portal-action toggle.
 *
 * @returns {boolean}
 */
export function canShowManageSubscriptionCta() {
	return true;
}

/**
 * Free plan only exposes Skip order + Update address as self-serve toggles.
 * When both are off, Edit Order / manage CTAs stay visible but disabled.
 *
 * @returns {boolean}
 */
export function canShowFreeSelfServeManageUi() {
	const tier = String( getPortal().tier || 'free' ).toLowerCase();
	if ( tier !== 'free' ) {
		return true;
	}

	return (
		isPortalActionEnabled( 'skip-delivery' ) ||
		isPortalActionEnabled( 'update-address' )
	);
}

export function hasPortalActionNonce( nonceKey ) {
	return Boolean( getPortal()?.[ nonceKey ] );
}

/**
 * True when paid (or Free) JS has registered this action into StayiloRegistry.
 * Used to keep Pro-only features absent on Free-only installs.
 *
 * @param {string} actionId
 * @returns {boolean}
 */
export function isPortalActionRegistered( actionId ) {
	return Boolean( getStayiloRegistry().getPortalAction( actionId ) );
}

/**
 * Re-render when live-fetched portal-core registers paid actions.
 *
 * @returns {number}
 */
export function usePortalPremiumRevision() {
	const [ revision, setRevision ] = useState( 0 );

	useEffect( () => {
		const bump = () => setRevision( ( n ) => n + 1 );
		window.addEventListener( 'stayilo-premium-loaded', bump );
		if ( window.StayiloReactPremium?.portalLoaded ) {
			bump();
		}
		return () => {
			window.removeEventListener( 'stayilo-premium-loaded', bump );
		};
	}, [] );

	return revision;
}
