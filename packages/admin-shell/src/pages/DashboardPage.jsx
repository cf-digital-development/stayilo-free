import { useMemo, useState } from 'react';
import { useUpgradeBannerDismiss } from '../hooks/useUpgradeBannerDismiss.js';
import { PageHeader } from '../components/PageHeader.jsx';
import { StatCard } from '../components/StatCard.jsx';
import { UpgradeBanner } from '../components/UpgradeBanner.jsx';
import { RecentActivity } from '../components/RecentActivity.jsx';
import { QuickActions } from '../components/QuickActions.jsx';
import { GrowthUpsellCards } from '../components/GrowthUpsellCards.jsx';
import { SetupChecklist } from '../components/SetupChecklist.jsx';
import { CancellationReasonsChart } from '../components/charts/CancellationReasonsChart.jsx';
import { RetentionTrendChart } from '../components/charts/RetentionTrendChart.jsx';
import { DashboardHeaderActions } from '../components/DashboardHeaderActions.jsx';
import { hasTierAccess } from '../utils/tier.js';
import { useMerchantTier } from '../premium.js';
import { useDashboardData } from '../hooks/useAdminData.js';
import { buildPeriodMetrics, formatCurrency } from '../domain/metrics.js';
import { buildDashboardNotifications } from '../domain/notifications.js';
import { buildRetentionTrend, resolveRetentionRange } from '../domain/retention.js';
import { openUpgrade } from '../utils/upgradeUrl.js';

function formatDate() {
	return new Date().toLocaleDateString( 'en-GB', {
		weekday: 'long',
		day: 'numeric',
		month: 'long',
		year: 'numeric',
	} );
}

function finiteCount( value ) {
	if ( value === undefined || value === null || value === '' ) {
		return null;
	}
	const count = Number( value );
	return Number.isFinite( count ) ? count : null;
}

/**
 * Prefer the uncapped active-status total from the dashboard API.
 * Fall back to the bootstrapped admin count, then the period calculation.
 */
function resolveActiveSubscriberTotal( activeCount, configuredCount, periodCount ) {
	const fromApi = finiteCount( activeCount );
	if ( fromApi !== null ) {
		return fromApi;
	}
	const fromConfig = finiteCount( configuredCount );
	if ( fromConfig !== null ) {
		return fromConfig;
	}
	return finiteCount( periodCount ) ?? 0;
}

function filterActivityByRange( items, rangeId ) {
	if ( ! Array.isArray( items ) || ! items.length ) {
		return [];
	}
	const { start } = resolveRetentionRange( rangeId );
	const startMs = start.getTime();
	return items.filter( ( item ) => {
		if ( ! item?.createdAt ) {
			return true;
		}
		const t = new Date( item.createdAt ).getTime();
		return ! Number.isNaN( t ) && t >= startMs;
	} );
}

/** Fixed decorative placeholders for locked Free/Core cards (ignore date filter). */
const LOCKED_DEMO_SAVES = { saved: 31, attempted: 44, rate: 70 };
const LOCKED_DEMO_RETENTION = { latest: 91, deltaPp: 1.8 };
const LOCKED_PLACEHOLDER_RANGE = '30d';

/** Decorative save-rate preview once Growth unlocks (until cancel-attempt logging exists). */
function demoSaves( rangeId ) {
	switch ( rangeId ) {
		case '7d':
			return { saved: 8, attempted: 12, rate: 67 };
		case '90d':
			return { saved: 74, attempted: 108, rate: 69 };
		case 'ytd':
			return { saved: 142, attempted: 210, rate: 68 };
		case '30d':
		default:
			return { saved: 31, attempted: 44, rate: 70 };
	}
}

export function DashboardPage( { tier: tierProp } ) {
	const merchantTier = useMerchantTier();
	const tier = tierProp ?? merchantTier;
	const isFree = tier === 'free';
	const hasGrowth = hasTierAccess( tier, 'growth' );
	const [ bannerDismissed, dismissBanner ] = useUpgradeBannerDismiss();
	const [ dateRange, setDateRange ] = useState( '30d' );
	const {
		metrics,
		activity,
		subscriptions,
		activeCount,
		formatCurrency: fmt,
	} = useDashboardData();

	const period = useMemo( () => {
		const list = Array.isArray( subscriptions ) ? subscriptions : [];
		return buildPeriodMetrics( list, dateRange, {
			currency: metrics.currency,
			currencySymbol: metrics.currencySymbol,
			freeCap: metrics.freeSubscriberCap,
		} );
	}, [ subscriptions, dateRange, metrics.currency, metrics.currencySymbol, metrics.freeSubscriberCap ] );

	const retention = useMemo( () => {
		// Locked Growth KPIs: static placeholder — date filter must not move numbers.
		if ( ! hasGrowth ) {
			return LOCKED_DEMO_RETENTION;
		}
		return Array.isArray( subscriptions )
			? buildRetentionTrend( subscriptions, dateRange )
			: buildRetentionTrend( [], dateRange );
	}, [ hasGrowth, subscriptions, dateRange ] );

	const periodActivity = useMemo(
		() => filterActivityByRange( activity, dateRange ),
		[ activity, dateRange ]
	);

	const saves = hasGrowth ? demoSaves( dateRange ) : LOCKED_DEMO_SAVES;
	const cap = metrics.freeSubscriberCap;
	const adminConfig = typeof window !== 'undefined' ? window.stayiloAdmin || {} : {};
	const activeTotal = resolveActiveSubscriberTotal(
		activeCount,
		adminConfig.subscriberCount,
		period.activeSubscribers
	);
	const symbol = metrics.currencySymbol || '£';
	const revenueChange = formatCurrency( Math.abs( period.revenueChange || 0 ), symbol );
	const growthSign = ( period.revenueChange || 0 ) >= 0 ? '+' : '-';
	const subGrowthSign = ( period.subscriberGrowth || 0 ) >= 0 ? '+' : '';
	const retentionDelta = Number( retention?.deltaPp );
	const hasRetentionDelta = Number.isFinite( retentionDelta );
	const retentionTrendValue = hasRetentionDelta
		? `${ retentionDelta >= 0 ? '+' : '' }${ retentionDelta.toFixed( 1 ) }pp`
		: undefined;

	const notifications = useMemo(
		() => buildDashboardNotifications( activity, metrics ),
		[ activity, metrics ]
	);

	return (
		<>
		<div className="border-b border-[#0D11171A] md:px-10 px-4 py-4">
		    <PageHeader
				title="Dashboard"
				subtitle={ formatDate() }
				actions={
					<DashboardHeaderActions
						dateRange={ dateRange }
						onDateRangeChange={ setDateRange }
						notifications={ notifications }
					/>
				}
			/>
		</div>
		<div className=" md:px-10 px-4 pt-6 pb-10 lg:pb-[209px]">

			{ isFree && ! bannerDismissed ? (
				<UpgradeBanner
					title={
						cap > 0
							? `You're on the Free plan · ${ cap } subscriber cap`
							: "You're on the Free plan"
					}
					description="Upgrade to Core for the full subscriber UI, email notifications, and cancellation flow — or Growth for analytics, rules, and integrations."
					actionLabel="View plans"
					onAction={ () => openUpgrade( 'dashboard_banner' ) }
					onDismiss={ dismissBanner }
				/>
			) : ! hasGrowth && ! bannerDismissed ? (
				<UpgradeBanner
					title="You're on Core — missing analytics, rules & integrations"
					description="Upgrade to Growth for the full reporting dashboard, retention analytics, rules engine, event timeline, and Klaviyo + webhook integrations."
					actionLabel="Upgrade to growth"
					variant="growth"
					onAction={ () => openUpgrade( 'dashboard_growth_banner' ) }
					onDismiss={ dismissBanner }
				/>
			) : hasGrowth ? (
				<SetupChecklist />
			) : null }

			<div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4 mt-6 mb-5">
				<StatCard
					label="Revenue saved"
					subtitle="this period"
					value={ fmt( period.revenue ) || '£0' }
					trendValue={ `${ growthSign }${ revenueChange }` }
					trendSuffix="vs last period"
					trendAsPill
					dark
				/>
				<StatCard
					label="Active subscribers"
					subtitle="total active"
					value={ String( activeTotal ) }
					trendValue={ `${ subGrowthSign }${ period.subscriberGrowth || 0 } this period` }
				/>
				<StatCard
					label="Retention rate"
					subtitle="this period"
					value={ `${ retention.latest ?? 0 }%` }
					trendValue={ retentionTrendValue }
					locked={ ! hasGrowth }
					lockTier="growth"
				/>
				<StatCard
					label="Saves"
					subtitle="attempted cancellations"
					value={ `${ saves.saved } / ${ saves.attempted }` }
					trendValue={ `${ saves.rate }% save rate` }
					locked={ ! hasGrowth }
					lockTier="growth"
				/>
			</div>

			<div className="stayilo-dashboard-split stayilo-dashboard-split--gap-4 grid w-full grid-cols-1 gap-4 xl:!grid-cols-[minmax(0,59.62fr)_minmax(0,40.38fr)] xl:items-stretch">
				<div className="min-w-0 h-full [&>*]:h-full">
					<RetentionTrendChart
						compact
						locked={ isFree }
						lockTier="core"
						rangeId={ isFree ? LOCKED_PLACEHOLDER_RANGE : dateRange }
						subscriptions={ isFree ? undefined : subscriptions }
					/>
				</div>
				<div className="min-w-0 h-full [&>*]:h-full">
					<CancellationReasonsChart
						compact
						locked={ ! hasGrowth }
						rangeId={
							! hasGrowth ? LOCKED_PLACEHOLDER_RANGE : dateRange
						}
					/>
				</div>
			</div>

			<div className="stayilo-dashboard-split stayilo-dashboard-split--gap-5 mt-5 grid w-full grid-cols-1 gap-5 xl:!grid-cols-[minmax(0,59.62fr)_minmax(0,40.38fr)] xl:items-stretch">
				<div className="min-w-0 h-full [&>*]:h-full">
					<RecentActivity items={ periodActivity.slice( 0, 5 ) } hasGrowth={ hasGrowth } />
				</div>

				<div className="min-w-0 h-full [&>*]:h-full">
					<QuickActions tier={ tier } />
				</div>
			</div>

			{ ! hasGrowth ? (
				<GrowthUpsellCards
					tier={ tier }
					onUpgrade={ () => openUpgrade( 'dashboard_upsell' ) }
				/>
			) : null }
		</div>
		</>
	);
}

export default DashboardPage;
