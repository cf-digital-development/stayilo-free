import { useSyncExternalStore } from 'react';
import { getStayiloRegistry } from '@stayilo/extension-sdk';
import { ProTeaserCard } from '@stayilo/preview';
import { TIER_RANK } from '../nav-config.js';
import {
	getMerchantTier,
	subscribePremium,
} from '../premium.js';
import { PremiumLoadingState } from './PremiumLoadingState.jsx';

/**
 * Dashboard slot — renders a registered widget, a loading state, or a locked teaser.
 *
 * @param {{ slotId: string, lockTier?: 'core' | 'growth', title?: string, description?: string }} props
 */
export function DashboardSlot( {
	slotId,
	lockTier = 'growth',
	title = 'Growth feature',
	description = 'Upgrade to unlock this screen.',
} ) {
	useSyncExternalStore( subscribePremium, getMerchantTier, () => 'free' );

	const tier = getMerchantTier();
	const Registered = getStayiloRegistry().getDashboardWidget( slotId );

	if ( Registered ) {
		return <Registered />;
	}

	if ( TIER_RANK[ tier ] >= TIER_RANK[ lockTier ] ) {
		return <PremiumLoadingState title={ title } />;
	}

	const upgradeLabel =
		lockTier === 'core' ? 'Upgrade to Core' : 'Upgrade to Growth';

	return (
		<ProTeaserCard
			tier={ lockTier }
			title={ title }
			description={ `${ description } ${ upgradeLabel }.` }
		/>
	);
}
