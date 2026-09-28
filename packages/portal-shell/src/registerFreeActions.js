import { getStayiloRegistry } from '@stayilo/extension-sdk';
import { SkipDeliveryAction } from './actions/SkipDeliveryAction.jsx';
import { UpdateAddressAction } from './actions/UpdateAddressAction.jsx';
import { isPortalActionEnabled } from './utils/portalActions.js';

/**
 * Register Free portal actions into the shared StayiloRegistry.
 */
export function registerFreePortalActions() {
	const registry = getStayiloRegistry();

	if ( isPortalActionEnabled( 'skip-delivery' ) ) {
		registry.registerPortalAction( 'skip-delivery', SkipDeliveryAction );
	}

	registry.registerPortalAction( 'update-address', UpdateAddressAction );
}
