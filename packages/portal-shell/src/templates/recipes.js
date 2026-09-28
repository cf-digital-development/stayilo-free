/**
 * Free portal layout. Only Classic ships with this plugin.
 * Other ids fall back to Classic. Minimal stays in the paid frontend.
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
	return RECIPES[ id ] || RECIPES[ DEFAULT_TEMPLATE_ID ];
}
