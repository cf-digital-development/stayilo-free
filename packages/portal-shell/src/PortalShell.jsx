import { useEffect, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { ACCOUNT_PROFILE } from './data/accountInfo.js';
import { DEFAULT_NAV_ITEMS } from './data/navItems.js';
import { Chrome } from './templates/chrome/Chrome.jsx';
import { useTemplateRecipe } from './templates/TemplateProvider.jsx';
import {
	MY_SUBSCRIPTION_PATH,
	NAV_ROUTES,
	PORTAL_HOME_PATH,
} from './routes.js';
import { setSelectedSubscriptionId } from './store/cartSlice.js';
import { useAccount } from './store/useAccount.js';
import { useSubscriptions } from './store/useSubscriptions.js';
import { isSubscriptionCanceled } from './utils/subscriptionOverview.js';
import {
	isPortalActionEnabled,
	usePortalPremiumRevision,
} from './utils/portalActions.js';
import {
	brandingStyle,
	ensurePreviewFont,
	portalIconUrl,
	readPortalBranding,
	readPreviewBranding,
} from './utils/branding.js';
import { getPortal } from './api/portal.js';

export {
	NAV_ROUTES,
	PORTAL_HOME_PATH,
	MY_SUBSCRIPTION_PATH,
	MANAGE_SUBSCRIPTION_PATH,
	SUBSCRIPTION_ACTIONS_PATH,
	MANAGE_SUBSCRIPTION_OVERVIEW_PATH,
	ACCOUNT_INFO_PATH,
	ACCOUNT_SUBSCRIPTION_PATH,
	ORDER_PATH,
	ORDER_DETAILS_PATH,
	EDIT_BOX_PATH,
	VIEW_BOX_PATH,
	PAYMENT_PATH,
} from './routes.js';

function resolveActiveNavId( pathname, state ) {
	if ( state?.activeNavId ) {
		return state.activeNavId;
	}

	if (
		pathname.includes( 'account-info' ) ||
		pathname.includes( 'manage-subscription' )
	) {
		return 'account';
	}

	if ( pathname.includes( 'payment' ) ) {
		return 'payment';
	}

	if ( pathname.includes( 'my-subscription' ) ) {
		return 'subscription';
	}

	if ( pathname.includes( 'order-overview' ) ) {
		return 'subscription';
	}

	if (
		pathname.includes( 'order-details' ) ||
		pathname === '/order' ||
		pathname.endsWith( '/order' )
	) {
		return 'order';
	}

	if (
		pathname.includes( 'view-subscription' ) ||
		pathname.includes( 'subscription-actions' ) ||
		pathname.includes( 'edit-box' ) ||
		pathname.includes( 'view-box' )
	) {
		return 'subscription';
	}

	return 'subscription';
}

function isCartScopedPath( pathname ) {
	return (
		pathname.includes( 'view-subscription' ) ||
		pathname.includes( 'subscription-actions' ) ||
		pathname.includes( 'edit-box' ) ||
		pathname.includes( 'view-box' )
	);
}

/**
 * Customer portal frame owned by stayilo-free.
 * Paid `portal-core` registers additional actions into the same registry.
 *
 * @param {{ brandName?: string, logoUrl?: string }} props
 */
export function PortalShell( { brandName = '', logoUrl } ) {
	usePortalPremiumRevision();
	const navigate = useNavigate();
	const location = useLocation();
	const dispatch = useDispatch();
	const activeNavId = resolveActiveNavId( location.pathname, location.state );
	const { subscriptions, activeCount } = useSubscriptions();
	const searchParams = new URLSearchParams( location.search || '' );
	const selectedFromRoute = location.state?.subscriptionId
		? String( location.state.subscriptionId )
		: searchParams.get( 'subscription' )
			? String( searchParams.get( 'subscription' ) )
			: '';

	useEffect( () => {
		if ( selectedFromRoute ) {
			dispatch( setSelectedSubscriptionId( selectedFromRoute ) );
			return;
		}
		if ( isCartScopedPath( location.pathname ) ) {
			return;
		}
		dispatch( setSelectedSubscriptionId( '' ) );
	}, [ dispatch, location.pathname, selectedFromRoute ] );

	const {
		avatarUrl,
		avatarAlt,
		isDefaultAvatar,
		updateAvatar,
		resetAvatar,
	} = useAccount();

	const outletContext = useMemo(
		() => ( {
			avatarUrl,
			avatarAlt: avatarAlt || ACCOUNT_PROFILE.avatarAlt,
			isDefaultAvatar,
			updateAvatar,
			resetAvatar,
		} ),
		[ avatarUrl, avatarAlt, isDefaultAvatar, updateAvatar, resetAvatar ]
	);

	const handleNavChange = ( navId ) => {
		let path = NAV_ROUTES[ navId ];
		if ( navId === 'subscription' ) {
			const hasCanceled = subscriptions.some( ( sub ) =>
				isSubscriptionCanceled( sub.status )
			);
			path =
				activeCount === 0 && hasCanceled
					? PORTAL_HOME_PATH
					: MY_SUBSCRIPTION_PATH;
		}
		if ( path ) {
			navigate( path, { state: { activeNavId: navId } } );
		}
	};

	const recipe = useTemplateRecipe();
	const branding = readPortalBranding();
	const preview = readPreviewBranding();
	const brandStyle = brandingStyle( branding, recipe.id );
	const hasGrowth = getPortal().tier === 'growth';
	const navItems = DEFAULT_NAV_ITEMS.filter(
		( item ) => item.id !== 'order' || isPortalActionEnabled( 'order-history' )
	);

	useEffect( () => {
		if ( preview?.font ) {
			ensurePreviewFont( preview.font );
		}
	}, [ preview?.font ] );

	return (
		<div
			className="portal-shell"
			data-template={ recipe.id }
			style={ brandStyle }
		>
			<Chrome
				recipe={ recipe }
				bannerEnabled={ hasGrowth && Boolean( branding.bannerEnabled ) }
				bannerText={ branding.bannerText }
				bannerColor={ branding.bannerColor }
				bannerLink={ branding.bannerLink }
				brandName={ preview?.brandName || brandName }
				logoUrl={ portalIconUrl( 'logo', recipe.id, branding ) || preview?.logoUrl || logoUrl }
				navItems={ navItems }
				activeNavId={ activeNavId }
				onNavChange={ handleNavChange }
				avatarUrl={ avatarUrl }
				avatarAlt={ avatarAlt || ACCOUNT_PROFILE.avatarAlt }
				outletContext={ outletContext }
			/>
		</div>
	);
}
