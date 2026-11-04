import { applyFilters } from '../hooks/wp-hooks.js';
import { buildDashboardMetrics } from '../domain/metrics.js';
import { buildRetentionTrend } from '../domain/retention.js';
import { formatActivityList } from '../domain/activity.js';
import { formatSubscriberRow, querySubscriberRows } from '../domain/subscribers.js';

export function transformDashboard( raw ) {
	const meta = raw?.meta || {};
	const subscriptions = raw?.subscriptions || [];
	const metrics = buildDashboardMetrics( subscriptions, raw?.snapshot || {}, meta );
	const retention = buildRetentionTrend( subscriptions, '30d' );

	const view = {
		metrics: {
			...metrics,
			retentionRate: retention.latest,
			retentionChangePp: retention.deltaPp,
		},
		subscriptions,
		retention,
		activity: formatActivityList( raw?.activity || [], meta ),
		totalLogsCount: meta.totalActivityCount ?? 0,
		meta,
		raw,
	};

	return applyFilters( 'stayilo.admin.dashboard', view, raw );
}

export function transformSubscribers( raw, query = {} ) {
	const meta = raw?.meta || {};
	const rows = ( raw?.subscriptions || [] ).map( ( sub ) =>
		formatSubscriberRow( sub, meta )
	);

	const view = {
		...querySubscriberRows( rows, query ),
		meta,
		raw,
	};

	return applyFilters( 'stayilo.admin.subscribers', view, raw, query );
}

function coerceSettingFlag( value, fallback = true ) {
	if ( value === undefined ) return fallback;
	if ( value === true || value === 1 || value === '1' ) return true;
	if ( value === false || value === 0 || value === '0' || value === '' || value === null ) {
		return false;
	}
	if ( typeof value === 'string' ) {
		const v = value.trim().toLowerCase();
		if ( [ 'true', 'yes', 'on' ].includes( v ) ) return true;
		if ( [ 'false', 'no', 'off' ].includes( v ) ) return false;
	}
	return Boolean( value );
}

export function normalizePortalSettings( settings = {} ) {
	const hasSettings = settings && typeof settings === 'object';
	const flag = ( key, fallback = true ) =>
		coerceSettingFlag( hasSettings ? settings[ key ] : undefined, fallback );

	return {
		skipDelivery: flag( 'skipDelivery' ),
		updateAddress: flag( 'updateAddress' ),
		showOrderHistory: flag( 'showOrderHistory' ),
		allowReactivation: flag( 'allowReactivation' ),
		storefrontCartDrawer: flag( 'storefrontCartDrawer' ),
		subscriptionMode:
			hasSettings && settings.subscriptionMode === 'multiple'
				? 'multiple'
				: 'single',
	};
}

export function transformSettings( raw ) {
	const view = {
		settings: normalizePortalSettings( raw?.settings ),
		meta: raw?.meta || {},
		raw,
	};

	return applyFilters( 'stayilo.admin.settings', view, raw );
}
