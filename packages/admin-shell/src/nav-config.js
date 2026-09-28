/**
 * Merchant admin navigation.
 * Labels lean toward Figma (Templates, Email + Editor, Flows, Integration).
 * tier: minimum plan required — 'free' | 'core' | 'growth'
 */
export const NAV_ITEMS = [
	{ id: 'dashboard', label: 'Dashboard', path: '/', tier: 'free' },
	{ id: 'subscribers', label: 'Subscribers', path: '/subscribers', tier: 'free' },
	{ id: 'reports', label: 'Reports', path: '/reports', tier: 'growth' },
	{ id: 'rules', label: 'Rules', path: '/rules', tier: 'growth' },
	{ id: 'templates', label: 'Templates', freeLabel: 'Branding', path: '/templates', tier: 'free' },
	{ id: 'emails', label: 'Email + Editor', path: '/emails', tier: 'core' },
	{ id: 'flows', label: 'Flows', path: '/flows', tier: 'core' },
	{ id: 'activity', label: 'Activity Log', path: '/activity', tier: 'growth' },
	{ id: 'integrations', label: 'Integration', path: '/integrations', tier: 'growth', sidebar: false },
	{ id: 'account', label: 'Account', path: '/account', tier: 'free' },
	{ id: 'settings', label: 'Settings', path: '/settings', tier: 'free' },
];

/** @type {Record<'free'|'core'|'growth', number>} */
export const TIER_RANK = {
	free: 0,
	core: 1,
	growth: 2,
};

/**
 * @param {{ tier: 'free'|'core'|'growth' }} item
 * @param {'free'|'core'|'growth'} merchantTier
 */
export function isNavItemLocked( item, merchantTier ) {
	return TIER_RANK[ item.tier ] > TIER_RANK[ merchantTier ];
}

/**
 * Sidebar / nav label. Free merchants see Branding (no template picker).
 *
 * @param {{ label: string, freeLabel?: string }} item
 * @param {'free'|'core'|'growth'} merchantTier
 */
export function navItemLabel( item, merchantTier ) {
	if ( merchantTier === 'free' && item.freeLabel ) {
		return item.freeLabel;
	}
	return item.label;
}
