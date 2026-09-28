import { Navigate, useLocation } from 'react-router-dom';
import {
	hasPortalActionNonce,
	isPortalActionEnabled,
} from '../utils/portalActions.js';
import { __ } from '@stayilo/design-system/i18n';

/** Pro-only actions — require a nonce Free never localizes. */
const PAID_ACTION_NONCES = {
	'edit-items': 'editItemsNonce',
	'change-delivery-date': 'changeDateNonce',
	'change-date': 'changeDateNonce',
	'change-frequency': 'changeFrequencyNonce',
	'delivery-frequency': 'changeFrequencyNonce',
	pause: 'pauseNonce',
	'pause-subscription': 'pauseNonce',
};

/**
 * Redirect away when a Core/Growth portal setting is turned off
 * (or when a paid action’s Pro nonce is missing on Free).
 *
 * @param {{ actionId: string, to?: string, children: import('react').ReactNode }} props
 */
export function PortalActionGate( {
	actionId,
	to = 'my-subscription',
	children,
} ) {
	const location = useLocation();
	const nonceKey = PAID_ACTION_NONCES[ actionId ];
	const allowed =
		isPortalActionEnabled( actionId ) &&
		( ! nonceKey || hasPortalActionNonce( nonceKey ) );

	if ( ! allowed ) {
		return <Navigate to={ to } replace state={ location.state } />;
	}

	return children;
}
