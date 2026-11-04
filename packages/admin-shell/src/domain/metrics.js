import { resolveSubscriberCap } from '@stayilo/design-system/validation';
import {
	parseSubscriptionDate,
	resolveRetentionRange,
	wasActiveAt,
} from './retention.js';

export function subscriptionMrr( subscription ) {
	const total = Number( subscription?.total ) || 0;
	const period = subscription?.billingPeriod || 'month';
	const interval = Math.max( 1, Number( subscription?.billingInterval ) || 1 );

	switch ( period ) {
		case 'month':
			return total / interval;
		case 'year':
			return ( total / 12 ) / interval;
		case 'week':
			return ( ( total * 52 ) / 12 ) / interval;
		case 'day':
			return ( ( total * 365 ) / 12 ) / interval;
		default:
			return total;
	}
}

export function calcTotalMrr( subscriptions = [] ) {
	return subscriptions.reduce( ( sum, sub ) => sum + subscriptionMrr( sub ), 0 );
}

export function countActiveSubscriptions( subscriptions = [] ) {
	return subscriptions.filter( ( sub ) => sub.status === 'active' ).length;
}

export function buildDashboardMetrics( subscriptions = [], snapshot = {}, meta = {} ) {
	const activeOnly = subscriptions.filter( ( sub ) => sub.status === 'active' );
	const activeSubs = activeOnly.length;
	const revenue = calcRevenueSaved( activeOnly );

	const baselineSubs = Array.isArray( snapshot?.subscriptions ) ? snapshot.subscriptions : [];
	const baselineActive = baselineSubs.filter( ( sub ) => sub.status === 'active' );
	const baselineCount = baselineActive.length;
	const baselineRevenue = calcRevenueSaved( baselineActive );

	return {
		activeSubscribers: activeSubs,
		subscriberGrowth: activeSubs - baselineCount,
		revenue: Math.round( revenue * 100 ) / 100,
		revenueChange: Math.round( ( revenue - baselineRevenue ) * 100 ) / 100,
		currency: meta.currency || 'GBP',
		currencySymbol: decodeHtmlEntities( meta.currencySymbol || '£' ),
		baselineDate: snapshot?.date || '',
		freeSubscriberCap: resolveSubscriberCap( meta.freeCap ),
	};
}

/**
 * Free Revenue Saved proxy (master context): one month of recurring value for each
 * subscription still running at the end of the window that skipped or updated its
 * address at least once inside that window. Stamps are UTC.
 *
 * @param {object[]} subscriptions
 * @param {Date} [rangeStart]
 * @param {Date} [rangeEnd]
 */
export function calcRevenueSaved(
	subscriptions = [],
	rangeStart = null,
	rangeEnd = null
) {
	return subscriptions.reduce( ( sum, sub ) => {
		if ( ! subscriptionRetainedInWindow( sub, rangeStart, rangeEnd ) ) {
			return sum;
		}
		return sum + subscriptionMrr( sub );
	}, 0 );
}

/**
 * `gmdate()` stamps arrive as "Y-m-d H:i:s" in UTC. ISO strings keep their own zone.
 *
 * @param {string|null|undefined} value
 * @returns {Date|null}
 */
export function parseUtcTimestamp( value ) {
	if ( ! value || value === '0' ) {
		return null;
	}
	const raw = String( value ).trim();
	if ( ! raw || raw.startsWith( '0000-00-00' ) ) {
		return null;
	}
	const hasZone = /[zZ]$/.test( raw ) || /[+-]\d{2}:\d{2}$/.test( raw );
	const normalized = raw.includes( 'T' ) ? raw : raw.replace( ' ', 'T' );
	const date = new Date( hasZone ? normalized : `${ normalized }Z` );
	return Number.isNaN( date.getTime() ) ? null : date;
}

function retentionEventDates( sub ) {
	const stamps = [
		...( Array.isArray( sub?.skipDates ) ? sub.skipDates : [] ),
		...( Array.isArray( sub?.addressUpdateDates ) ? sub.addressUpdateDates : [] ),
		sub?.lastSkipAt,
		sub?.lastAddressUpdateAt,
	];
	const dates = stamps.map( ( stamp ) => parseUtcTimestamp( stamp ) ).filter( Boolean );
	dates.sort( ( a, b ) => a.getTime() - b.getTime() );
	return dates;
}

function subscriptionRetainedInWindow( sub, rangeStart, rangeEnd ) {
	const events = retentionEventDates( sub );
	if ( ! events.length ) {
		return false;
	}
	if ( ! rangeStart || ! rangeEnd ) {
		return true;
	}
	return events.some( ( d ) => d >= rangeStart && d <= rangeEnd );
}

/**
 * Period-scoped KPIs for the dashboard date-range picker (7d / 30d / 90d / ytd).
 * Compares end-of-period vs end of the previous equal-length window.
 *
 * @param {object[]} subscriptions
 * @param {string} rangeId
 * @param {object} [meta]
 * @param {Date} [now]
 */
export function buildPeriodMetrics(
	subscriptions = [],
	rangeId = '30d',
	meta = {},
	now = new Date()
) {
	const list = Array.isArray( subscriptions ) ? subscriptions : [];
	const { end, previousEnd, start, previousStart, label, days } =
		resolveRetentionRange( rangeId, now );

	const periodEnd = endOfDayLocal( end );
	const prevEnd = previousEnd;

	const currentActive = list.filter( ( sub ) => wasActiveAt( sub, periodEnd ) );
	const previousActive = list.filter( ( sub ) => wasActiveAt( sub, prevEnd ) );

	const revenue = calcRevenueSaved( currentActive, start, periodEnd );
	const previousRevenue = calcRevenueSaved(
		previousActive,
		previousStart,
		prevEnd
	);
	const activeSubscribers = currentActive.length;
	const previousCount = previousActive.length;

	const startedInPeriod = list.filter( ( sub ) => {
		const startDate =
			parseSubscriptionDate( sub?.startDate ) ||
			parseSubscriptionDate( sub?.dateCreated );
		return startDate && startDate >= start && startDate <= periodEnd;
	} ).length;

	const endedInPeriod = list.filter( ( sub ) => {
		const endDate =
			parseSubscriptionDate( sub?.endDate ) ||
			parseSubscriptionDate( sub?.cancelledDate );
		return endDate && endDate >= start && endDate <= periodEnd;
	} ).length;

	const endedPrevious = list.filter( ( sub ) => {
		const endDate =
			parseSubscriptionDate( sub?.endDate ) ||
			parseSubscriptionDate( sub?.cancelledDate );
		return endDate && endDate >= previousStart && endDate <= prevEnd;
	} ).length;

	return {
		rangeId,
		rangeLabel: label,
		days,
		activeSubscribers,
		subscriberGrowth: activeSubscribers - previousCount,
		revenue: Math.round( revenue * 100 ) / 100,
		revenueChange: Math.round( ( revenue - previousRevenue ) * 100 ) / 100,
		startedInPeriod,
		endedInPeriod,
		endedPrevious,
		currency: meta.currency || 'GBP',
		currencySymbol: decodeHtmlEntities( meta.currencySymbol || '£' ),
		freeSubscriberCap: resolveSubscriberCap( meta.freeCap ),
	};
}

function endOfDayLocal( date ) {
	const d = new Date( date );
	d.setHours( 23, 59, 59, 999 );
	return d;
}

export function decodeHtmlEntities( value ) {
	if ( typeof value !== 'string' || ! value.includes( '&' ) ) {
		return value;
	}

	if ( typeof document !== 'undefined' ) {
		const el = document.createElement( 'textarea' );
		el.innerHTML = value;
		return el.value;
	}

	return value
		.replace( /&pound;/gi, '£' )
		.replace( /&euro;/gi, '€' )
		.replace( /&yen;/gi, '¥' )
		.replace( /&#36;/g, '$' )
		.replace( /&amp;/g, '&' );
}

export function formatCurrency( amount, symbol = '£' ) {
	const value = Number( amount ) || 0;
	const mark = decodeHtmlEntities( symbol ) || '£';
	return `${ mark }${ value.toLocaleString( 'en-GB', {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	} ) }`;
}

export function formatGrowth( value, symbol = '£', type = 'currency' ) {
	const num = Number( value ) || 0;
	const prefix = num >= 0 ? '+' : '';
	const mark = decodeHtmlEntities( symbol ) || '£';

	if ( type === 'count' ) {
		return `${ prefix }${ num } this period`;
	}

	return `${ prefix }${ mark }${ Math.abs( num ).toLocaleString( 'en-GB', {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	} ) } vs last period`;
}
