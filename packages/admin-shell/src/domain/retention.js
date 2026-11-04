/**
 * Rolling retention: of subscriptions that had started by day D,
 * what share were still active at end of day D.
 */

const ENDED_STATUSES = new Set( [
	'cancelled',
	'canceled',
	'expired',
	'trash',
	'switched',
] );

/**
 * @param {string|null|undefined} value
 * @returns {Date|null}
 */
export function parseSubscriptionDate( value ) {
	if ( ! value || value === '0' ) {
		return null;
	}
	const raw = String( value ).trim();
	if ( ! raw || raw.startsWith( '0000-00-00' ) ) {
		return null;
	}
	// WCS stores "Y-m-d H:i:s" — treat as local wall time.
	const normalized = raw.includes( 'T' ) ? raw : raw.replace( ' ', 'T' );
	const date = new Date( normalized );
	return Number.isNaN( date.getTime() ) ? null : date;
}

function startOfDay( date ) {
	const d = new Date( date );
	d.setHours( 0, 0, 0, 0 );
	return d;
}

function endOfDay( date ) {
	const d = new Date( date );
	d.setHours( 23, 59, 59, 999 );
	return d;
}

function addDays( date, days ) {
	const d = new Date( date );
	d.setDate( d.getDate() + days );
	return d;
}

function subscriptionStart( sub ) {
	return parseSubscriptionDate( sub?.startDate ) || parseSubscriptionDate( sub?.dateCreated );
}

function subscriptionEnd( sub ) {
	return (
		parseSubscriptionDate( sub?.endDate ) ||
		parseSubscriptionDate( sub?.cancelledDate )
	);
}

/**
 * Whether the subscription was still active at the given instant.
 *
 * @param {object} sub
 * @param {Date} at
 */
export function wasActiveAt( sub, at ) {
	const start = subscriptionStart( sub );
	if ( ! start || start > at ) {
		return false;
	}

	const end = subscriptionEnd( sub );
	if ( end && end <= at ) {
		return false;
	}

	const status = String( sub?.status || '' ).toLowerCase();
	if ( ENDED_STATUSES.has( status ) && ! end ) {
		return false;
	}

	return true;
}

function hadStartedBy( sub, at ) {
	const start = subscriptionStart( sub );
	return Boolean( start && start <= at );
}

/**
 * @param {object[]} subscriptions
 * @param {Date} at
 * @returns {number} 0–100
 */
export function retentionRateAt( subscriptions, at ) {
	const started = subscriptions.filter( ( sub ) => hadStartedBy( sub, at ) );
	if ( ! started.length ) {
		return 0;
	}
	const active = started.filter( ( sub ) => wasActiveAt( sub, at ) );
	return Math.round( ( active.length / started.length ) * 100 );
}

/**
 * @param {string} rangeId
 * @param {Date} [now]
 * @returns {{ days: number, maxPoints: number, labelMode: 'day'|'month', end: Date, start: Date, previousEnd: Date, previousStart: Date, label: string }}
 */
export function resolveRetentionRange( rangeId, now = new Date() ) {
	const today = startOfDay( now );

	const withWindow = ( days, maxPoints, labelMode, label ) => {
		const end = today;
		const start = startOfDay( addDays( end, -( days - 1 ) ) );
		const previousEnd = endOfDay( addDays( start, -1 ) );
		const previousStart = startOfDay( addDays( previousEnd, -( days - 1 ) ) );
		return { days, maxPoints, labelMode, end, start, previousEnd, previousStart, label };
	};

	switch ( rangeId ) {
		case '7d':
			return withWindow( 7, 7, 'day', 'Last 7 days' );
		case '15d':
			return withWindow( 15, 8, 'day', 'Last 15 days' );
		case '30d':
			return withWindow( 30, 7, 'day', 'Last 30 days' );
		case '90d':
			return withWindow( 90, 6, 'day', 'Last 90 days' );
		case '12m':
			return withWindow( 365, 6, 'month', 'Last 12 months' );
		case 'ytd': {
			const jan1 = new Date( today.getFullYear(), 0, 1 );
			const days = Math.max(
				1,
				Math.round( ( today.getTime() - jan1.getTime() ) / 86400000 ) + 1
			);
			return withWindow(
				days,
				Math.min( 12, Math.max( 4, Math.ceil( days / 30 ) ) ),
				days > 60 ? 'month' : 'day',
				'This year'
			);
		}
		default:
			return withWindow( 30, 7, 'day', 'Last 30 days' );
	}
}

function formatAxisLabel( date, labelMode ) {
	if ( labelMode === 'month' ) {
		return date.toLocaleDateString( 'en-US', { month: 'short' } );
	}
	return date.toLocaleDateString( 'en-US', { month: 'short', day: 'numeric' } );
}

/**
 * Evenly sample indices from a daily series (always keep first + last).
 *
 * @template T
 * @param {T[]} items
 * @param {number} maxPoints
 * @returns {T[]}
 */
function sampleEvenly( items, maxPoints ) {
	if ( items.length <= maxPoints ) {
		return items;
	}
	const out = [];
	for ( let i = 0; i < maxPoints; i++ ) {
		const idx = Math.round( ( i * ( items.length - 1 ) ) / ( maxPoints - 1 ) );
		out.push( items[ idx ] );
	}
	return out;
}

/**
 * Build current vs previous retention series for a chart range.
 *
 * @param {object[]} subscriptions
 * @param {string} rangeId
 * @param {Date} [now]
 * @returns {{ dates: string[], current: number[], previous: number[], tipIndex: number, latest: number, previousLatest: number, deltaPp: number }}
 */
export function buildRetentionTrend( subscriptions = [], rangeId = '30d', now = new Date() ) {
	const list = Array.isArray( subscriptions ) ? subscriptions : [];
	const { days, maxPoints, labelMode, end } = resolveRetentionRange( rangeId, now );

	const currentDaily = [];
	const previousDaily = [];

	for ( let i = days - 1; i >= 0; i-- ) {
		const currentDay = endOfDay( addDays( end, -i ) );
		const previousDay = endOfDay( addDays( end, -i - days ) );

		currentDaily.push( {
			date: startOfDay( currentDay ),
			value: retentionRateAt( list, currentDay ),
		} );
		previousDaily.push( {
			date: startOfDay( previousDay ),
			value: retentionRateAt( list, previousDay ),
		} );
	}

	const sampledCurrent = sampleEvenly( currentDaily, maxPoints );
	const sampledPrevious = sampleEvenly( previousDaily, maxPoints );

	const dates = sampledCurrent.map( ( point ) =>
		formatAxisLabel( point.date, labelMode )
	);
	const current = sampledCurrent.map( ( point ) => point.value );
	const previous = sampledPrevious.map( ( point ) => point.value );

	const tipIndex = Math.max( 0, dates.length - 1 );
	const latest = current[ tipIndex ] ?? 0;
	const previousLatest = previous[ tipIndex ] ?? 0;

	return {
		dates,
		current,
		previous,
		tipIndex,
		latest,
		previousLatest,
		deltaPp: latest - previousLatest,
	};
}

/**
 * @param {object[]} subscriptions
 * @returns {boolean}
 */
export function subscriptionsHaveRetentionDates( subscriptions = [] ) {
	return ( subscriptions || [] ).some(
		( sub ) => Boolean( subscriptionStart( sub ) )
	);
}
