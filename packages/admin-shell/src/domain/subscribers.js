import { formatCurrency, subscriptionMrr } from './metrics.js';
import { formatSubscriptionStatusLabel } from '@stayilo/design-system';

export function formatSubscriberRow( subscription, meta = {} ) {
	const symbol = meta.currencySymbol || '£';
	const name =
		subscription?.customer?.name ||
		`Subscriber #${ subscription?.id || '' }`;
	const email = subscription?.customer?.email || '';
	const products = Array.isArray( subscription?.products )
		? subscription.products.join( ', ' )
		: '—';
	const nextPayment = subscription?.nextPayment;

	return {
		id: subscription.id,
		name,
		email,
		product: products || '—',
		status: formatSubscriptionStatusLabel( subscription.status ),
		nextRenewal: nextPayment ? formatDate( nextPayment ) : '—',
		price: formatCurrency( subscription.total, symbol ),
		mrr: formatCurrency( subscriptionMrr( subscription ), symbol ),
		lastActivity: formatLastActivity( subscription ),
		editUrl: subscription.editUrl || buildWooSubscriptionEditUrl( subscription.id ),
		raw: subscription,
	};
}

export function matchesSubscriberStatus( row, status = 'all' ) {
	if ( ! status || status === 'all' ) {
		return true;
	}

	const raw = normalizeStatus( row?.raw?.status || row?.status );
	const want = normalizeStatus( status );

	if ( want === 'on-hold' || want === 'paused' ) {
		return raw === 'on-hold' || raw === 'paused' || raw === 'onhold';
	}

	if ( want === 'payment-failed' ) {
		return raw === 'payment-failed' || raw === 'failed';
	}

	if ( want === 'cancelled' || want === 'canceled' ) {
		return raw === 'cancelled' || raw === 'canceled';
	}

	if ( want === 'pending-cancel' ) {
		return raw === 'pending-cancel' || raw === 'pending-cancellation';
	}

	return raw === want;
}

export function subscriberStatusCounts( rows = [] ) {
	const counts = {
		all: rows.length,
		active: 0,
		paused: 0,
		'on-hold': 0,
		'payment-failed': 0,
		'pending-cancel': 0,
		cancelled: 0,
		expired: 0,
	};

	for ( const row of rows ) {
		const bucket = statusBucket( row?.raw?.status || row?.status );
		if ( bucket && counts[ bucket ] !== undefined ) {
			counts[ bucket ] += 1;
		}
		// Keep legacy "paused" count in sync with on-hold for existing tabs.
		if ( bucket === 'on-hold' ) {
			counts.paused += 1;
		}
	}

	return counts;
}

export function querySubscriberRows(
	rows = [],
	{ search = '', status = 'all', page = 1, perPage = 15 } = {}
) {
	const searched = rows.filter( ( row ) => matchesSubscriberSearch( row, search ) );
	const counts = subscriberStatusCounts( searched );
	const filtered = searched.filter( ( row ) => matchesSubscriberStatus( row, status ) );

	return {
		...paginateSubscribers( filtered, { page, perPage } ),
		filtered,
		counts,
	};
}

export function filterSubscribers( subscriptions, { search = '', status = 'all' } = {}, meta = {} ) {
	let rows = subscriptions.map( ( sub ) => formatSubscriberRow( sub, meta ) );

	if ( status && status !== 'all' ) {
		rows = rows.filter( ( row ) => matchesSubscriberStatus( row, status ) );
	}

	if ( search ) {
		const q = search.toLowerCase();
		rows = rows.filter(
			( row ) =>
				row.name.toLowerCase().includes( q ) ||
				row.email.toLowerCase().includes( q )
		);
	}

	return rows;
}

export function paginateSubscribers( items, { page = 1, perPage = 15 } = {} ) {
	const total = items.length;
	const totalPages = Math.max( 1, perPage > 0 ? Math.ceil( total / perPage ) : 1 );
	const offset = ( page - 1 ) * perPage;

	return {
		items: items.slice( offset, offset + perPage ),
		total,
		page,
		perPage,
		totalPages,
	};
}

function formatLastActivity( subscription ) {
	if ( typeof subscription?.lastActivity === 'string' && subscription.lastActivity ) {
		return subscription.lastActivity;
	}

	if ( typeof subscription?.last_activity === 'string' && subscription.last_activity ) {
		return subscription.last_activity;
	}

	return '—';
}

function matchesSubscriberSearch( row, search = '' ) {
	if ( ! search ) {
		return true;
	}

	const q = search.toLowerCase();
	return (
		String( row?.name || '' ).toLowerCase().includes( q ) ||
		String( row?.email || '' ).toLowerCase().includes( q )
	);
}

function normalizeStatus( status = '' ) {
	return String( status || '' )
		.toLowerCase()
		.replace( /^wc-/, '' )
		.replace( /\s+/g, '-' );
}

function statusBucket( status ) {
	const raw = normalizeStatus( status );

	if ( raw === 'active' ) {
		return 'active';
	}

	if ( raw === 'on-hold' || raw === 'paused' || raw === 'onhold' ) {
		return 'on-hold';
	}

	if ( raw === 'payment-failed' || raw === 'failed' ) {
		return 'payment-failed';
	}

	if ( raw === 'pending-cancel' || raw === 'pending-cancellation' ) {
		return 'pending-cancel';
	}

	if ( raw === 'expired' ) {
		return 'expired';
	}

	if ( raw === 'cancelled' || raw === 'canceled' ) {
		return 'cancelled';
	}

	return null;
}

/**
 * Fallback WooCommerce Subscriptions HPOS edit URL when PHP does not send editUrl.
 */
function buildWooSubscriptionEditUrl( subscriptionId ) {
	if ( ! subscriptionId ) {
		return '#';
	}

	const ajaxUrl =
		typeof window !== 'undefined' ? window.stayiloAdmin?.ajaxUrl : '';
	const adminBase = ajaxUrl
		? String( ajaxUrl ).replace( /admin-ajax\.php$/, '' )
		: '/wp-admin/';

	return `${ adminBase }admin.php?page=wc-orders--shop_subscription&action=edit&id=${ encodeURIComponent( subscriptionId ) }`;
}

function formatDate( isoDate ) {
	const date = new Date( isoDate );
	if ( Number.isNaN( date.getTime() ) ) {
		return isoDate;
	}
	return date.toLocaleDateString( 'en-GB', {
		day: 'numeric',
		month: 'short',
		year: 'numeric',
	} );
}
