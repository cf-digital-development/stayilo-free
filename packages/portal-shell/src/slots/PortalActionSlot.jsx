import { getStayiloRegistry } from '@stayilo/extension-sdk';
import { usePortalPremiumRevision } from '../utils/portalActions.js';

/**
 * Renders a registered portal action, or nothing when absent.
 * Extra props are passed through to the registered component.
 *
 * @param {{ actionId: string } & Record<string, unknown>} props
 */
export function PortalActionSlot( { actionId, ...props } ) {
	usePortalPremiumRevision();
	const Registered = getStayiloRegistry().getPortalAction( actionId );
	if ( ! Registered ) {
		return null;
	}
	return <Registered { ...props } />;
}
