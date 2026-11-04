import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { getStayiloRegistry, initStayiloRegistry } from '@stayilo/extension-sdk';
import { PortalProviders } from './context/PortalProviders.jsx';
import { PortalShell } from './PortalShell.jsx';
import { PortalHome } from './pages/PortalHome.jsx';
import { MySubscription } from './pages/MySubscription.jsx';
import { ManageSubscription } from './pages/ManageSubscription.jsx';
import { SubscriptionActions } from './pages/SubscriptionActions.jsx';
import { AccountInfo } from './pages/AccountInfo.jsx';
import { AccountSubscription } from './pages/AccountSubscription.jsx';
import { Order } from './pages/Order.jsx';
import { OrderDetails } from './pages/OrderDetails.jsx';
import { ViewBox } from './pages/ViewBox.jsx';
import { Payment } from './pages/Payment.jsx';
import { registerFreePortalActions } from './registerFreeActions.js';
import { PortalActionGate } from './slots/PortalActionGate.jsx';
import { usePortalPremiumRevision } from './utils/portalActions.js';

initStayiloRegistry();
registerFreePortalActions();

/**
 * Basename for BrowserRouter from WooCommerce My Account URL
 * e.g. https://shop.test/my-account/ → /my-account
 */
export function accountBasename( accountUrl ) {
	if ( ! accountUrl ) {
		return '/my-account';
	}

	try {
		const { pathname } = new URL( accountUrl, window.location.origin );
		const base = pathname.replace( /\/+$/, '' );
		return base || '/my-account';
	} catch {
		return '/my-account';
	}
}

function registeredPortalRoutes() {
	const routes = getStayiloRegistry().getPortalRoutes?.() || {};

	return Object.entries( routes ).map( ( [ path, RouteComponent ] ) => (
		<Route
			key={ path }
			path={ String( path ).replace( /^\//, '' ) }
			element={ <RouteComponent /> }
		/>
	) );
}

/**
 * Portal shell app — endpoint frame + Free built-in actions.
 * Paid plugins register extra routes after load.
 */
export function PortalApp( { brandName, logoUrl, accountUrl } = {} ) {
	usePortalPremiumRevision();
	const basename = accountBasename(
		accountUrl ??
			( typeof window !== 'undefined'
				? window.stayiloPortal?.accountUrl
				: undefined )
	);

	return (
		<BrowserRouter basename={ basename }>
			<PortalProviders>
				<Routes>
					<Route
						element={
							<PortalShell brandName={ brandName } logoUrl={ logoUrl } />
						}
					>
						<Route index element={ <Navigate to="my-subscription" replace /> } />
						<Route path="order-overview" element={ <PortalHome /> } />
						<Route path="my-subscription" element={ <MySubscription /> } />
						<Route path="subscription-actions" element={ <SubscriptionActions /> } />
						<Route path="view-subscription" element={ <ManageSubscription /> } />
						<Route path="order" element={
							<PortalActionGate actionId="order-history">
								<Order />
							</PortalActionGate>
						} />
						<Route path="order-details/:orderId?" element={
							<PortalActionGate actionId="order-history">
								<OrderDetails />
							</PortalActionGate>
						} />
						<Route path="view-box" element={ <ViewBox /> } />
						{ registeredPortalRoutes() }
						<Route path="payment" element={ <Payment /> } />
						<Route path="account-info" element={ <AccountInfo /> } />
						<Route path="manage-subscription" element={ <AccountSubscription /> } />
						<Route path="*" element={ <Navigate to="my-subscription" replace /> } />
					</Route>
				</Routes>
			</PortalProviders>
		</BrowserRouter>
	);
}
