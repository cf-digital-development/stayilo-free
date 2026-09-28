import { __, sprintf } from '@stayilo/design-system/i18n';
import { getBootstrapFromWindow, getPortal } from '../api/portal.js';

const READ_IDS_STORAGE_PREFIX = 'stayilo-portal-notification-read-ids';

function isRecent( dateString, withinHours = 72 ) {
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
			? getPortal().accountUrl || window.location.origin
			: '';
	const userId =
		typeof window !== 'undefined' ? getPortal().customerId || '' : '';
	return `${ READ_IDS_STORAGE_PREFIX }:${ siteUrl || 'default' }:${ userId || '0' }`;
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
 * @param {Array<object>} items
 * @returns {Array<object>}
 */
export function applyPersistedReadState( items = [] ) {
	const readIds = getReadNotificationIds();
	return ( Array.isArray( items ) ? items : [] ).map( ( item ) => {
		const id = item?.id != null ? String( item.id ) : '';
		const unread = id && readIds.has( id ) ? false : isRecent( item?.createdAt );
		return {
			...item,
			id,
			unread,
			time: item?.time || formatTimeAgo( item?.createdAt ),
		};
	} );
}

/**
 * @param {string} [dateString]
 * @returns {string}
 */
export function formatTimeAgo( dateString ) {
	if ( ! dateString ) {
		return '';
	}
	const t = new Date( dateString ).getTime();
	if ( Number.isNaN( t ) ) {
		return '';
	}
	const seconds = Math.max( 0, Math.floor( ( Date.now() - t ) / 1000 ) );
	if ( seconds < 60 ) {
		return __( 'Just now', 'stayilo' );
	}
	const minutes = Math.floor( seconds / 60 );
	if ( minutes < 60 ) {
		return sprintf( __( '%dm ago', 'stayilo' ), minutes );
	}
	const hours = Math.floor( minutes / 60 );
	if ( hours < 24 ) {
		return sprintf( __( '%dh ago', 'stayilo' ), hours );
	}
	const days = Math.floor( hours / 24 );
	if ( days < 7 ) {
		return sprintf( __( '%dd ago', 'stayilo' ), days );
	}
	return new Date( t ).toLocaleDateString( undefined, {
		month: 'short',
		day: 'numeric',
	} );
}

/**
 * Seed notifications from localized bootstrap.
 *
 * @returns {Array<object>}
 */
export function getBootstrapNotifications() {
	const bootstrap = getBootstrapFromWindow();
	return applyPersistedReadState(
		Array.isArray( bootstrap?.notifications ) ? bootstrap.notifications : []
	);
}
