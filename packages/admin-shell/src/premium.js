import { useSyncExternalStore } from 'react';

const PREVIEW_STORAGE_KEY = 'stayiloPreviewTier';

function normalizePaidTier( raw ) {
	const tier = String( raw || '' ).toLowerCase();
	if ( tier === 'growth' ) {
		return 'growth';
	}
	if ( tier === 'core' || tier === 'pro' ) {
		return 'core';
	}
	return null;
}

function licenceMarkedValid( data ) {
	if ( ! data ) {
		return false;
	}
	// wp_localize_script stringifies booleans, so a real licence arrives as "1".
	return data.valid === true || data.valid === 1 || data.valid === '1';
}

function localizedPaidTier() {
	if ( typeof window === 'undefined' ) {
		return null;
	}

	// Only a licence payload from Pro counts. stayiloAdmin.tier is display
	// config and can be rewritten in the browser.
	const data = window.stayiloData;
	if ( ! licenceMarkedValid( data ) ) {
		return null;
	}

	return normalizePaidTier( data.tier );
}

function clearPreviewTier() {
	if ( typeof window === 'undefined' ) {
		return;
	}
	try {
		window.sessionStorage.removeItem( PREVIEW_STORAGE_KEY );
	} catch {
		// Ignore private-mode quota errors.
	}
}

function getPreviewTier() {
	if ( typeof window === 'undefined' ) {
		return null;
	}
	try {
		return normalizePaidTier( window.sessionStorage.getItem( PREVIEW_STORAGE_KEY ) );
	} catch {
		return null;
	}
}

function notifyPremium() {
	if ( typeof window === 'undefined' ) {
		return;
	}
	window.dispatchEvent( new CustomEvent( 'stayilo-premium-loaded' ) );
}

/**
 * True when the store has a valid Core or Growth licence (not Free).
 */
export function isLicensedPaid() {
	return Boolean( localizedPaidTier() );
}

/**
 * Temporary Core/Growth UI switch for licensed paid sites.
 * Stored in sessionStorage so it resets when the tab is closed.
 *
 * @param {'core'|'growth'} tier
 */
export function setPreviewMerchantTier( tier ) {
	const next = normalizePaidTier( tier );
	if ( ! next || ! isLicensedPaid() || typeof window === 'undefined' ) {
		return;
	}

	try {
		window.sessionStorage.setItem( PREVIEW_STORAGE_KEY, next );
	} catch {
		// Ignore private-mode quota errors; in-memory premium still updates.
	}

	window.StayiloReactPremium = {
		...( window.StayiloReactPremium || {} ),
		isVerified: true,
		tier: next,
		preview: true,
	};

	notifyPremium();
}

/**
 * First paint happens before main-loader fetch. Seed from PHP localize so
 * StayiloReactPremium.tier exists immediately on a licensed site.
 */
export function seedMerchantPremium() {
	if ( typeof window === 'undefined' ) {
		return;
	}

	if ( ! isLicensedPaid() ) {
		clearPreviewTier();
		if ( window.StayiloReactPremium?.preview || ! localizedPaidTier() ) {
			window.StayiloReactPremium = {
				isVerified: false,
				tier: 'free',
			};
		}
		return;
	}

	if ( ! window.StayiloReactPremium ) {
		const paid = getPreviewTier() || localizedPaidTier();
		if ( paid ) {
			window.StayiloReactPremium = {
				isVerified: true,
				tier: paid,
				pending: true,
			};
		}
	}
}

export function subscribePremium( onStoreChange ) {
	window.addEventListener( 'stayilo-premium-loaded', onStoreChange );
	return () =>
		window.removeEventListener( 'stayilo-premium-loaded', onStoreChange );
}

export function getPremiumSnapshot() {
	return window.StayiloReactPremium || null;
}

/**
 * Free plugin screens do not switch on a licence tier.
 *
 * @returns {'free'}
 */
export function getMerchantTier() {
	return 'free';
}

/**
 * @returns {'free'|'core'|'growth'}
 */
export function useMerchantTier() {
	return useSyncExternalStore(
		subscribePremium,
		getMerchantTier,
		() => 'free'
	);
}
