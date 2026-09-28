export { AppShell } from './AppShell.jsx';
export { NAV_ITEMS, TIER_RANK, isNavItemLocked, navItemLabel } from './nav-config.js';
export { DashboardSlot } from './components/DashboardSlot.jsx';
export { PremiumLoadingState } from './components/PremiumLoadingState.jsx';
export { PageHeader } from './components/PageHeader.jsx';
export {
	SearchField,
	FilterTabs,
	FilterDropdown,
	ExportButton,
} from './components/toolbar/index.js';
export { LockedFeature, LOCKED_CARD_SHADOW } from './components/LockedFeature.jsx';
export { UpgradeBanner } from './components/UpgradeBanner.jsx';
export { RecentActivity } from './components/RecentActivity.jsx';
export { QuickActions } from './components/QuickActions.jsx';
export { GrowthUpsellCards } from './components/GrowthUpsellCards.jsx';
export { SetupChecklist } from './components/SetupChecklist.jsx';
export { StatCard } from './components/StatCard.jsx';
export { SidebarPlanCard } from './components/SidebarPlanCard.jsx';
export { LockedSettingsCard } from './components/LockedSettingsCard.jsx';
export { SubscriptionMode } from './components/SubscriptionMode.jsx';
export {
	LOCKED_SETTINGS_CARDS,
	visibleLockedSettingsCards,
} from './components/settings-locked-cards.js';
export {
	CancellationFunnel,
	CancellationReasonsChart,
	ChartCard,
	PaymentRecoveryChart,
	RangeSelector,
	RetentionTrendChart,
} from './components/charts/index.js';
export { hasTierAccess } from './utils/tier.js';
export { DashboardPage } from './pages/DashboardPage.jsx';
export { SubscribersPage } from './pages/SubscribersPage.jsx';
export { TemplatesBrandingPage } from './pages/TemplatesBrandingPage.jsx';
export { SettingsPage } from './pages/SettingsPage.jsx';
export {
	fetchAdminData,
	fetchDashboardRaw,
	fetchPortalBrandingRaw,
	fetchPortalSettingsRaw,
	fetchSubscribersRaw,
	isWpAdmin,
	savePortalBranding,
	savePortalSettings,
	saveSubscriptionMode,
	adminSkipSubscription,
	adminChangeSubscriptionDate,
	adminPauseSubscription,
	adminCancelSubscription,
	adminEditSubscriptionItems,
	fetchEmailTemplatesRaw,
	saveEmailTemplates,
	sendTestEmail,
} from './api/wp-admin.js';
export {
	DEFAULT_PORTAL_BRANDING,
	PORTAL_FONTS,
	PORTAL_FONT_SELECT,
	TEMPLATE_COLOR_DEFAULTS,
	brandingCssVars,
	colorsForTemplate,
	contrastColor,
	fontStack,
	normalizeHex,
	persistableBranding,
	readAdminBranding,
	readTemplateColors,
} from './branding.js';
export { useDashboardData, usePortalSettings, useSubscribers } from './hooks/useAdminData.js';
export { addFilter, addAction, applyFilters, doAction } from './hooks/wp-hooks.js';
export {
	buildDashboardMetrics,
	buildPeriodMetrics,
	calcTotalMrr,
	calcRevenueSaved,
	formatCurrency,
	formatGrowth,
	subscriptionMrr,
} from './domain/metrics.js';
export {
	buildRetentionTrend,
	resolveRetentionRange,
	retentionRateAt,
	subscriptionsHaveRetentionDates,
} from './domain/retention.js';
export { filterSubscribers, formatSubscriberRow, paginateSubscribers } from './domain/subscribers.js';
export { formatActivityList, formatActivityRow } from './domain/activity.js';
export { buildDashboardNotifications } from './domain/notifications.js';
export {
	transformDashboard,
	transformSettings,
	transformSubscribers,
} from './transforms/admin-data.js';
export {
	getMerchantTier,
	getPremiumSnapshot,
	isLicensedPaid,
	ensureGrowthPreviewBundle,
	seedMerchantPremium,
	setPreviewMerchantTier,
	subscribePremium,
	useMerchantTier,
} from './premium.js';
