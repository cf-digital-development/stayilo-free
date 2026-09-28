import { hasTierAccess } from '../utils/tier.js';

export const LOCKED_SETTINGS_CARDS = [
	{
		id: 'emails',
		title: 'Email notifications',
		subtitle: 'Templates',
		value: '3',
		tier: 'core',
	},
	{
		id: 'wording',
		title: 'Wording',
		subtitle: 'Portal copy',
		value: 'Classic',
		tier: 'growth',
	},
	{
		id: 'integration',
		title: 'Integration',
		subtitle: 'Connected apps',
		value: 'Klaviyo',
		tier: 'growth',
	},
];

/**
 * Free → Core-locked cards (emails). Subscription mode is available on all tiers.
 * Core → Growth-locked cards only.
 * Growth → none.
 */
export function visibleLockedSettingsCards( merchantTier ) {
	if ( hasTierAccess( merchantTier, 'growth' ) ) {
		return [];
	}

	if ( hasTierAccess( merchantTier, 'core' ) ) {
		return LOCKED_SETTINGS_CARDS.filter( ( card ) => card.tier === 'growth' );
	}

	return LOCKED_SETTINGS_CARDS;
}
