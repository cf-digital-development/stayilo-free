/**
 * Display helpers only. The live cap is PHP `STAYILO_FREE_SUBSCRIBER_CAP`
 * via stayiloAdmin / stayiloPortal. Do not hardcode 50 here — the public
 * bundle is editable and is not enforcement.
 */

function readBootstrappedCap() {
	if ( typeof window === 'undefined' ) {
		return undefined;
	}

	const admin = window.stayiloAdmin || {};
	const portal = window.stayiloPortal || {};

	if ( admin.freeSubscriberCap !== undefined && admin.freeSubscriberCap !== '' ) {
		return admin.freeSubscriberCap;
	}
	if ( portal.freeSubscriberCap !== undefined && portal.freeSubscriberCap !== '' ) {
		return portal.freeSubscriberCap;
	}

	return undefined;
}

function toCap( value ) {
	if ( value === undefined || value === null || value === '' ) {
		return null;
	}

	const cap = Number( value );
	if ( ! Number.isFinite( cap ) || cap < 0 ) {
		return null;
	}

	return Math.floor( cap );
}

/**
 * @returns {number} 0 means unlimited.
 */
export function resolveSubscriberCap( provided ) {
	const fromArg = toCap( provided );
	if ( fromArg !== null ) {
		return fromArg;
	}

	const fromBootstrap = toCap( readBootstrappedCap() );
	if ( fromBootstrap !== null ) {
		return fromBootstrap;
	}

	return 0;
}

/** Alias of the live localized cap. Not a second hardcoded limit. */
export const FREE_SUBSCRIBER_CAP = resolveSubscriberCap();

export function hasPaidSubscriberLicense() {
	return false;
}

export function isSubscriberCapLocked() {
	if ( typeof window === 'undefined' ) {
		return false;
	}

	const admin = window.stayiloAdmin || {};
	const portal = window.stayiloPortal || {};

	if ( admin.subscriberCapLocked !== undefined ) {
		return Boolean( admin.subscriberCapLocked );
	}
	if ( portal.subscriberCapLocked !== undefined ) {
		return Boolean( portal.subscriberCapLocked );
	}

	return false;
}
