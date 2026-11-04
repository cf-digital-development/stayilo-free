import { useSyncExternalStore } from 'react';
import { getStayiloRegistry } from '@stayilo/extension-sdk';

function notifyPremium() {
	if ( typeof window === 'undefined' ) {
		return;
	}
	window.dispatchEvent( new CustomEvent( 'stayilo-premium-loaded' ) );
}

/**
 * Display tier for Free screens. Pro calls registry.setMerchantTier() after
 * licence verification; Free never reads a local licence payload.
 *
 * @returns {'free'|'core'|'growth'}
 */
export function getMerchantTier() {
	return getStayiloRegistry().getMerchantTier();
}

/**
 * Subscribe to Pro load / tier changes so Free slots re-render.
 *
 * @param {() => void} onStoreChange
 * @returns {() => void}
 */
export function subscribePremium( onStoreChange ) {
	if ( typeof window === 'undefined' ) {
		return () => {};
	}
	window.addEventListener( 'stayilo-premium-loaded', onStoreChange );
	window.addEventListener( 'stayilo-merchant-tier', onStoreChange );
	return () => {
		window.removeEventListener( 'stayilo-premium-loaded', onStoreChange );
		window.removeEventListener( 'stayilo-merchant-tier', onStoreChange );
	};
}

/**
 * Snapshot for useSyncExternalStore. Must be referentially stable when unchanged
 * (returning a fresh object each call causes React error #185).
 *
 * @returns {'free'|'core'|'growth'}
 */
export function getPremiumSnapshot() {
	return getMerchantTier();
}

/**
 * Ensure registry defaults to free before Pro registers.
 * Does not notify when already free — avoids a pointless remount storm.
 */
export function seedMerchantPremium() {
	const registry = getStayiloRegistry();
	if ( registry.getMerchantTier() === 'free' ) {
		return;
	}
	registry.setMerchantTier( 'free' );
	notifyPremium();
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
