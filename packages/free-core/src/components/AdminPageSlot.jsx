import { useSyncExternalStore } from 'react';
import { getStayiloRegistry } from '@stayilo/extension-sdk';
import { ProTeaserCard } from '@stayilo/preview';
import { PremiumLoadingState } from '@stayilo/admin-shell';
import { TIER_RANK } from '@stayilo/admin-shell';
import {
	getPremiumSnapshot,
	subscribePremium,
	useMerchantTier,
} from '@stayilo/admin-shell';

export { useMerchantTier } from '@stayilo/admin-shell';

/**
 * Renders a registry-registered admin page, a free fallback, loading, or teaser.
 */
export function AdminPageSlot( {
	routeId,
	lockTier = 'core',
	title,
	description,
	fallback = null,
} ) {
	useSyncExternalStore( subscribePremium, getPremiumSnapshot, () => null );

	const tier = useMerchantTier();
	const Registered = getStayiloRegistry().getAdminPage( routeId );

	if ( Registered ) {
		return <Registered />;
	}

	const hasPlanAccess = TIER_RANK[ tier ] >= TIER_RANK[ lockTier ];

	if ( hasPlanAccess ) {
		return <PremiumLoadingState title={ title } />;
	}

	if ( fallback ) {
		return fallback;
	}

	const upgradeLabel =
		lockTier === 'growth' ? 'Upgrade to Growth' : 'Upgrade to Core';

	return (
		<ProTeaserCard
			title={ title }
			description={
				description ||
				`This screen unlocks on ${ lockTier === 'growth' ? 'Growth' : 'Core' }. ${ upgradeLabel }.`
			}
		/>
	);
}
