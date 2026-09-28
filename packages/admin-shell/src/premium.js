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

const GROWTH_SCRIPT_ATTR = 'data-stayilo-growth-preview';
let growthPreviewLoaderBooted = false;

function loadGrowthPreviewBundle() {
	if ( typeof window === 'undefined' || window.StayiloReactPremium?.growthLoaded ) {
		return true;
	}

	if ( document.querySelector( `script[${ GROWTH_SCRIPT_ATTR }]` ) ) {
		return true;
	}

	const scriptUrl = window.stayiloData?.scriptUrl;
	if ( ! scriptUrl ) {
		return false;
	}

	try {
		const base = scriptUrl.replace( /script\.php.*$/i, '' );
		const bust = String( Date.now() );
		const growthUrl = new URL( 'builds/growth/index.js', base );
		growthUrl.searchParams.set( 'v', bust );

		const cssUrl = new URL( 'builds/growth/index.css', base );
		cssUrl.searchParams.set( 'v', bust );
		if ( ! document.querySelector( `link[${ GROWTH_SCRIPT_ATTR }]` ) ) {
			const link = document.createElement( 'link' );
			link.rel = 'stylesheet';
			link.href = cssUrl.href;
			link.setAttribute( GROWTH_SCRIPT_ATTR, '1' );
			document.head.appendChild( link );
		}

		const script = document.createElement( 'script' );
		script.src = growthUrl.href;
		script.async = true;
		script.setAttribute( GROWTH_SCRIPT_ATTR, '1' );
		document.body.appendChild( script );
		return true;
	} catch {
		return false;
	}
}

/**
 * Temp plan preview stores Growth in sessionStorage, but script.php only
 * emits the Growth bundle for a real Growth licence. Re-inject on refresh.
 */
export function ensureGrowthPreviewBundle() {
	if ( typeof window === 'undefined' ) {
		return;
	}
	if ( getPreviewTier() !== 'growth' ) {
		return;
	}
	loadGrowthPreviewBundle();
}

function bootGrowthPreviewLoader() {
	if ( typeof window === 'undefined' || growthPreviewLoaderBooted ) {
		return;
	}
	growthPreviewLoaderBooted = true;

	const tryLoad = () => ensureGrowthPreviewBundle();
	window.addEventListener( 'stayilo-premium-loaded', tryLoad );
	document.addEventListener( 'DOMContentLoaded', tryLoad );
	tryLoad();
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

	if ( next === 'growth' ) {
		ensureGrowthPreviewBundle();
	}

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

	bootGrowthPreviewLoader();

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

	ensureGrowthPreviewBundle();
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
