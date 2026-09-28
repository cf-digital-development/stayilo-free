import { TIER_RANK } from '../nav-config.js';

export function hasTierAccess( merchantTier, requiredTier ) {
	return TIER_RANK[ merchantTier ] >= TIER_RANK[ requiredTier ];
}
