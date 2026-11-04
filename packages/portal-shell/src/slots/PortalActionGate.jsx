import { Navigate, useLocation } from 'react-router-dom';
import {
	hasPortalActionNonce,
	isPortalActionEnabled,
} from '../utils/portalActions.js';

/** Actions that need a nonce Pro localizes when licensed. */
const ACTION_NONCE_KEYS = {
	'edit-items': 'editItemsNonce',
	'change-delivery-date': 'changeDateNonce',
	'change-date': 'changeDateNonce',
	'change-frequency': 'changeFrequencyNonce',
	'delivery-frequency': 'changeFrequencyNonce',
	pause: 'pauseNonce',
	'pause-subscription': 'pauseNonce',
};

/**
 * Redirect away when a portal action setting is off, or its nonce is missing.
 *
 * @param {{ actionId: string, to?: string, children: import('react').ReactNode }} props
 */
export function PortalActionGate( {
	actionId,
	to = 'my-subscription',
	children,
} ) {
	const location = useLocation();
	const nonceKey = ACTION_NONCE_KEYS[ actionId ];
	const allowed =
		isPortalActionEnabled( actionId ) &&
		( ! nonceKey || hasPortalActionNonce( nonceKey ) );

	if ( ! allowed ) {
		return <Navigate to={ to } replace state={ location.state } />;
	}

	return children;
}
