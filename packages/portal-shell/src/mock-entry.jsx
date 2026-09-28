import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@stayilo/design-system/styles/styles.css';
import './styles/portal.css';
import { PortalApp } from './PortalApp.jsx';

/**
 * Local Vite mock only. In WordPress, `stayiloPortal.brandName` /
 * `siteName` come from `get_bloginfo( 'name' )` via class-portal-assets.php.
 *
 * Optional local override: `?siteName=MyShop` or `.env` `VITE_SITE_NAME`.
 */
const params = new URLSearchParams( window.location.search );
const siteName =
	params.get( 'siteName' ) ||
	import.meta.env.VITE_SITE_NAME ||
	'';

window.stayiloPortal = {
	...( window.stayiloPortal || {} ),
	portalMountId: 'stayilo-portal-root',
	brandName: siteName,
	siteName,
	accountUrl:
		window.stayiloPortal?.accountUrl ||
		`${ window.location.origin }/my-account/`,
	portalActions: {
		skipDelivery: true,
		updateAddress: true,
		...( window.stayiloPortal?.portalActions || {} ),
	},
};

if ( ! window.location.pathname.startsWith( '/my-account' ) ) {
	window.history.replaceState( null, '', '/my-account/my-subscription' );
}

const portal = window.stayiloPortal;

createRoot( document.getElementById( 'stayilo-portal-root' ) ).render(
	<StrictMode>
		<PortalApp
			brandName={ portal.brandName || portal.siteName }
			logoUrl={ portal.logoUrl }
			accountUrl={ portal.accountUrl }
		/>
	</StrictMode>
);
