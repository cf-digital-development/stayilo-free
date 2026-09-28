import { formatCurrency } from './metrics.js';

const EVENT_COPY = {
	skip_delivery: {
		description: 'Skipped next delivery',
		useCustomerAsActor: true,
	},
	address_update: {
		description: 'Updated shipping address',
		useCustomerAsActor: true,
	},
	payment_received: {
		actor: 'Payment',
		description: 'Payment received',
		useCustomerAsActor: false,
	},
	payment_failed: {
		description: 'Payment failed — retry scheduled',
		useCustomerAsActor: true,
	},
	payment_failed_reminder: {
		description: 'Payment failed — 48h reminder sent',
		useCustomerAsActor: true,
	},
	status_change: {
		description: 'Status changed',
		useCustomerAsActor: true,
	},
};

export function formatActivityRow( row, meta = {} ) {
	const symbol = meta.currencySymbol || '£';
	const customer =
		row.meta?.customerLabel || `Subscriber #${ row.subscriptionId }`;
	const copy = EVENT_COPY[ row.eventType ] || {
		description: row.eventType,
		useCustomerAsActor: true,
	};

	const actor = copy.useCustomerAsActor
		? customer
		: copy.actor || customer;
	let description = copy.description;

	if ( row.eventType === 'skip_delivery' && row.meta?.offerShown ) {
		description = 'Skipped delivery — offer shown';
	}

	if ( row.eventType === 'payment_received' && row.meta?.recovered ) {
		description = 'Failed charge retried successfully';
	}

	if ( row.eventType === 'status_change' && row.meta?.newStatus ) {
		description = `Status → ${ row.meta.newStatus }`;
	}

	if ( row.meta?.description ) {
		description = row.meta.description;
	}

	return {
		id: row.id,
		subscriptionId: row.subscriptionId,
		eventType: row.eventType,
		actor,
		description,
		message: `${ actor } ${ description }`,
		amount: row.meta?.amount ?? null,
		amountFormatted:
			row.meta?.amount != null && Number( row.meta.amount ) > 0
				? formatCurrency( row.meta.amount, symbol )
				: null,
		currency: row.meta?.currency || meta.currency,
		timeAgo: formatTimeAgo( row.createdAt ),
		createdAt: row.createdAt,
		raw: row,
	};
}

export function formatActivityList( rows = [], meta = {} ) {
	return rows.map( ( row ) => formatActivityRow( row, meta ) );
}

function formatTimeAgo( dateString ) {
	if ( ! dateString ) {
		return '';
	}

	const date = new Date( dateString );
	if ( Number.isNaN( date.getTime() ) ) {
		return dateString;
	}

	const seconds = Math.floor( ( Date.now() - date.getTime() ) / 1000 );
	const intervals = [
		{ label: 'year', seconds: 31536000 },
		{ label: 'month', seconds: 2592000 },
		{ label: 'week', seconds: 604800 },
		{ label: 'day', seconds: 86400 },
		{ label: 'hour', seconds: 3600 },
		{ label: 'minute', seconds: 60 },
	];

	for ( const interval of intervals ) {
		const count = Math.floor( seconds / interval.seconds );
		if ( count >= 1 ) {
			return `${ count } ${ interval.label }${ count > 1 ? 's' : '' } ago`;
		}
	}

	return 'just now';
}
