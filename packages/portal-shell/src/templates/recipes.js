import { getStayiloRegistry } from '@stayilo/extension-sdk';
import { getPortal } from '../api/portal.js';

/**
 * Free portal layouts. Classic only — Minimal registers from Stayilo Pro.
 */

export const DEFAULT_TEMPLATE_ID = 'classic';

export const CLASSIC_RECIPE = {
	id: 'classic',
	chrome: 'topnav',
	home: 'stacked',
	card: 'chip',
	view: 'split',
};

const RECIPES = {
	classic: CLASSIC_RECIPE,
};

/**
 * @param {string} [id]
 * @returns {{ id: string, chrome: string, home: string, card: string, view: string }}
 */
export function getRecipe( id ) {
	const registry = getStayiloRegistry();
	const registryTier =
		typeof registry.getMerchantTier === 'function'
			? registry.getMerchantTier()
			: 'free';
	const portalTier = String( getPortal().tier || 'free' ).toLowerCase();
	const tier =
		registryTier && registryTier !== 'free' ? registryTier : portalTier;

	// Free-only: always Classic. Paid UI unlocks after Pro calls setMerchantTier.
	if ( tier === 'free' ) {
		return CLASSIC_RECIPE;
	}

	const registered = registry.getPortalRecipe?.( id );
	if ( registered ) {
		return registered;
	}
	return RECIPES[ id ] || RECIPES[ DEFAULT_TEMPLATE_ID ];
}
