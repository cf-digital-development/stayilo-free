const EVENT_TITLES = {
	skip_delivery: 'Delivery skipped',
	payment_received: 'Payment received',
	payment_failed: 'Payment failed',
	payment_failed_reminder: 'Payment reminder sent',
	status_change: 'Subscription updated',
};

const READ_IDS_STORAGE_PREFIX = 'stayilo-admin-notification-read-ids';

function isRecent( dateString, withinHours = 48 ) {
	if ( ! dateString ) {
		return true;
	}
	const t = new Date( dateString ).getTime();
	if ( Number.isNaN( t ) ) {
		return true;
	}
	return Date.now() - t <= withinHours * 3600 * 1000;
}

function readIdsStorageKey() {
	const siteUrl =
		typeof window !== 'undefined'
			? window.stayiloAdmin?.siteUrl || window.location.origin
			: '';
	return `${ READ_IDS_STORAGE_PREFIX }:${ siteUrl || 'default' }`;
}

/**
 * @returns {Set<string>}
 */
export function getReadNotificationIds() {
	if ( typeof window === 'undefined' ) {
		return new Set();
	}
	try {
		const raw = window.localStorage.getItem( readIdsStorageKey() );
		const parsed = raw ? JSON.parse( raw ) : [];
		return new Set( Array.isArray( parsed ) ? parsed.map( String ) : [] );
	} catch {
		return new Set();
	}
}

/**
 * Persist notification ids as read across reloads.
 *
 * @param {string[]} ids
 */
export function markNotificationsRead( ids = [] ) {
	if ( typeof window === 'undefined' || ! Array.isArray( ids ) || ids.length === 0 ) {
		return;
	}
	const next = getReadNotificationIds();
	ids.forEach( ( id ) => {
		if ( id ) {
			next.add( String( id ) );
		}
	} );
	try {
		window.localStorage.setItem(
			readIdsStorageKey(),
			JSON.stringify( [ ...next ] )
		);
	} catch {
		/* ignore quota / private mode */
	}
}

/**
 * Apply persisted read state onto notification items.
 *
 * @param {Array<object>} items
 * @returns {Array<object>}
 */
export function applyPersistedReadState( items = [] ) {
	const readIds = getReadNotificationIds();
	return ( Array.isArray( items ) ? items : [] ).map( ( item ) => {
		if ( ! item?.id || ! readIds.has( String( item.id ) ) ) {
			return item;
		}
		return { ...item, unread: false };
	} );
}

/**
 * Map a formatted activity row into a header notification item.
 *
 * @param {object} item
 * @returns {{ id: string, title: string, body: string, time: string, unread: boolean, createdAt?: string }}
 */
export function notificationFromActivity( item ) {
	const title =
		EVENT_TITLES[ item?.eventType ] ||
		item?.description ||
		'Subscription activity';
	const bodyParts = [ item?.actor, item?.description ].filter( Boolean );
	const body =
		bodyParts.length > 0
			? bodyParts.join( ' — ' )
			: item?.message || 'New activity on a subscription.';

	return {
		id: `activity-${ item?.id ?? title }`,
		title,
		body,
		time: item?.timeAgo || 'Just now',
		unread: isRecent( item?.createdAt ),
		createdAt: item?.createdAt || '',
	};
}

/**
 * System notices derived from live dashboard metrics (not marketing copy).
 *
 * @param {object} [metrics]
 * @returns {Array<object>}
 */
export function systemNotificationsFromMetrics() {
	return [];
}

/**
 * Build notification bell items from live activity + metric notices.
 *
 * @param {Array<object>} [activity]
 * @param {object} [metrics]
 * @param {number} [limit=8]
 * @returns {Array<{ id: string, title: string, body: string, time: string, unread: boolean }>}
 */
export function buildDashboardNotifications(
	activity = [],
	metrics = {},
	limit = 8
) {
	const system = systemNotificationsFromMetrics( metrics );
	const fromActivity = ( Array.isArray( activity ) ? activity : [] )
		.slice( 0, Math.max( 0, limit - system.length ) )
		.map( notificationFromActivity );

	return applyPersistedReadState( [ ...system, ...fromActivity ] );
}
