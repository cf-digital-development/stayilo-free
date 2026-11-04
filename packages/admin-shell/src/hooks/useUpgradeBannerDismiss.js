import { useCallback, useState } from 'react';
import { dismissUpgradeBanner } from '../api/wp-admin.js';

function readDismissed() {
	if ( typeof window === 'undefined' ) {
		return false;
	}

	return Boolean( window.stayiloAdmin?.upgradeBannerDismissed );
}

/**
 * Persist upgrade-banner dismiss in user meta so it stays gone after reload.
 * Optimistic hide: Guideline 11 treats the click as the notice being resolved.
 */
export function useUpgradeBannerDismiss() {
	const [ dismissed, setDismissed ] = useState( readDismissed );

	const dismiss = useCallback( () => {
		setDismissed( true );
		if ( typeof window !== 'undefined' && window.stayiloAdmin ) {
			window.stayiloAdmin.upgradeBannerDismissed = true;
		}
		dismissUpgradeBanner().catch( () => {
			// Stay hidden for this session even if the request fails.
		} );
	}, [] );

	return [ dismissed, dismiss ];
}
