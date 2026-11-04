import { Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from '@stayilo/admin-shell';
import { initStayiloRegistry } from '@stayilo/extension-sdk';
import Subscribers from './pages/Subscribers.jsx';
import TemplatesBranding from './pages/TemplatesBranding.jsx';
import Settings from './pages/Settings.jsx';
import Account from './pages/Account.jsx';
import { AdminPageSlot, useMerchantTier } from './components/AdminPageSlot.jsx';
import DashboardRoute from './components/DashboardRoute.jsx';

initStayiloRegistry();

const admin = typeof window !== 'undefined' ? window.stayiloAdmin || {} : {};

export default function App() {
	const tier = useMerchantTier();

	return (
		<Routes>
			<Route
				element={
					<AppShell
						tier={ tier }
						storeName={ admin.siteName || 'Your store' }
					/>
				}
			>
				<Route index element={ <DashboardRoute /> } />
				<Route
					path="subscribers"
					element={
						<AdminPageSlot
							routeId="subscribers"
							lockTier="core"
							title="Subscribers"
							fallback={ <Subscribers /> }
						/>
					}
				/>
				<Route
					path="subscribers/:id"
					element={
						<AdminPageSlot
							routeId="subscriber-detail"
							lockTier="core"
							title="Subscriber Detail"
						/>
					}
				/>
				<Route
					path="templates"
					element={
						<AdminPageSlot
							routeId="templates"
							lockTier="core"
							title={ tier === 'free' ? 'Branding' : 'Templates' }
							fallback={ <TemplatesBranding /> }
						/>
					}
				/>
				<Route
					path="settings"
					element={
						<AdminPageSlot
							routeId="settings"
							lockTier="core"
							title="Settings"
							fallback={ <Settings /> }
						/>
					}
				/>
				{ /* Account always renders Free page; Licence slot filled by Core/Growth */ }
				<Route path="account" element={ <Account /> } />
				<Route
					path="emails"
					element={
						<AdminPageSlot
							routeId="emails"
							lockTier="core"
							title="Email + Editor"
						/>
					}
				/>
				<Route
					path="reports"
					element={
						<AdminPageSlot
							routeId="reports"
							lockTier="growth"
							title="Reports"
						/>
					}
				/>
				<Route
					path="rules"
					element={
						<AdminPageSlot
							routeId="rules"
							lockTier="growth"
							title="Rules"
						/>
					}
				/>
				<Route
					path="flows"
					element={
						<AdminPageSlot
							routeId="flows"
							lockTier="core"
							title="Flows"
						/>
					}
				/>
				<Route
					path="activity"
					element={
						<AdminPageSlot
							routeId="activity"
							lockTier="growth"
							title="Activity Log"
						/>
					}
				/>
				<Route
					path="integrations"
					element={
						<AdminPageSlot
							routeId="integrations"
							lockTier="growth"
							title="Integration"
						/>
					}
				/>
				<Route path="*" element={ <Navigate to="/" replace /> } />
			</Route>
		</Routes>
	);
}
