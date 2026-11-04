import { getPortal } from './portal.js';
import { __, sprintf } from '@stayilo/design-system/i18n';

function buildUrl( path, query = {} ) {
	const portal = getPortal();
	const base = ( portal.restUrl || '/' ).replace( /\/?$/, '/' );
	const url = new URL( path.replace( /^\//, '' ), base );

	Object.entries( query ).forEach( ( [ key, value ] ) => {
		if ( value !== undefined && value !== null && value !== '' ) {
			url.searchParams.set( key, String( value ) );
		}
	} );

	return url.toString();
}

export async function fetchStoreApi( path, { query, method = 'GET', body } = {} ) {
	const portal = getPortal();

	const response = await fetch( buildUrl( path, query ), {
		method,
		credentials: 'same-origin',
		headers: {
			'Content-Type': 'application/json',
			Nonce: portal.storeApiNonce || '',
		},
		body: body ? JSON.stringify( body ) : undefined,
	} );

	if ( ! response.ok ) {
		let message = sprintf( __( 'Store API failed (%d)', 'stayilo' ), response.status );
		try {
			const errorBody = JSON.parse( await response.text() );
			message =
				errorBody?.message ||
				errorBody?.data?.message ||
				errorBody?.code ||
				message;
		} catch {
			// Keep generic message when the body is not JSON.
		}
		throw new Error( message );
	}

	const text = await response.text();
	if ( ! text ) {
		return null;
	}
	try {
		return JSON.parse( text );
	} catch {
		return null;
	}
}

/**
 * Published WooCommerce shop products (Store API).
 * Simple products plus each variation as its own row.
 *
 * @param {Record<string, string|number>} [query]
 * @returns {Promise<Array<object>>}
 */
export async function fetchShopProducts( query = {} ) {
	const portal = getPortal();
	if ( ! portal.restUrl ) {
		return [];
	}

	const baseQuery = {
		per_page: 100,
		order: 'asc',
		orderby: 'title',
		...query,
	};

	const requests = [ fetchStoreApi( 'wc/store/v1/products', { query: baseQuery } ) ];
	if ( ! baseQuery.type ) {
		requests.push(
			fetchStoreApi( 'wc/store/v1/products', {
				query: { ...baseQuery, type: 'variation' },
			} )
		);
	}

	const pages = await Promise.all( requests );
	const byId = new Map();
	pages.forEach( ( data ) => {
		( Array.isArray( data ) ? data : [] ).forEach( ( product ) => {
			if ( product?.id == null ) {
				return;
			}
			byId.set( Number( product.id ), product );
		} );
	} );

	return [ ...byId.values() ];
}

function minorToMajor( amount, minorUnit = 2 ) {
	const unit = Number.isFinite( Number( minorUnit ) ) ? Number( minorUnit ) : 2;
	return ( Number( amount ) || 0 ) / 10 ** unit;
}

/**
 * Map Store API cart payload → portal cart lines + totals.
 *
 * @param {object|null} cart
 */
export function mapStoreCart( cart ) {
	if ( ! cart || typeof cart !== 'object' ) {
		return {
			lines: [],
			itemCount: 0,
			subtotal: 0,
			currency: getPortal().currency || 'GBP',
		};
	}

	const currency =
		cart.totals?.currency_code ||
		cart.items?.[ 0 ]?.prices?.currency_code ||
		getPortal().currency ||
		'GBP';
	const minorUnit =
		cart.totals?.currency_minor_unit ??
		cart.items?.[ 0 ]?.prices?.currency_minor_unit ??
		2;

	const lines = ( Array.isArray( cart.items ) ? cart.items : [] ).map(
		( item ) => {
			const qty = Math.max( 1, Number( item.quantity ) || 1 );
			const lineTotal = minorToMajor(
				item.totals?.line_total ?? item.prices?.line_total ?? 0,
				item.totals?.currency_minor_unit ?? minorUnit
			);
			const unit = minorToMajor(
				item.prices?.price ?? item.prices?.regular_price ?? 0,
				item.prices?.currency_minor_unit ?? minorUnit
			);
			const image =
				item.images?.[ 0 ]?.thumbnail ||
				item.images?.[ 0 ]?.src ||
				'';

			return {
				id: String( item.key || item.id || '' ),
				key: String( item.key || '' ),
				productId: Number( item.id ) || 0,
				title: item.name || __( 'Item', 'stayilo' ),
				servings: '',
				quantity: qty,
				unitPrice: unit,
				price: lineTotal,
				imageUrl: image,
			};
		}
	);

	const itemCount = lines.reduce(
		( sum, line ) => sum + ( Number( line.quantity ) || 0 ),
		0
	);
	const subtotal = minorToMajor(
		cart.totals?.total_items ?? cart.totals?.total_price ?? 0,
		minorUnit
	);

	return { lines, itemCount, subtotal, currency, raw: cart };
}

/**
 * @returns {Promise<{ lines: Array<object>, itemCount: number, subtotal: number, currency: string }>}
 */
export async function fetchWcCart() {
	const portal = getPortal();
	if ( ! portal.restUrl || ! portal.storeApiNonce ) {
		return mapStoreCart( null );
	}
	const cart = await fetchStoreApi( 'wc/store/v1/cart' );
	return mapStoreCart( cart );
}

/**
 * @param {string} key
 * @param {number} quantity
 */
export async function updateWcCartItemQuantity( key, quantity ) {
	const qty = Math.max( 0, Number( quantity ) || 0 );
	if ( ! key ) {
		return fetchWcCart();
	}
	if ( qty < 1 ) {
		return removeWcCartItem( key );
	}
	const cart = await fetchStoreApi( 'wc/store/v1/cart/update-item', {
		method: 'POST',
		body: { key, quantity: qty },
	} );
	return cart ? mapStoreCart( cart ) : fetchWcCart();
}

/**
 * @param {string} key
 */
export async function removeWcCartItem( key ) {
	if ( ! key ) {
		return fetchWcCart();
	}
	const cart = await fetchStoreApi( 'wc/store/v1/cart/remove-item', {
		method: 'POST',
		body: { key },
	} );
	return cart ? mapStoreCart( cart ) : fetchWcCart();
}

/**
 * Replace the WooCommerce session cart with portal box lines that have a productId.
 *
 * @param {Array<{ productId?: number, quantity?: number }>} lines
 */
export async function syncPortalCartToStore( lines ) {
	const items = ( Array.isArray( lines ) ? lines : [] ).filter(
		( line ) => Number( line.productId ) > 0
	);
	if ( items.length === 0 ) {
		return;
	}

	const portal = getPortal();
	if ( ! portal.restUrl || ! portal.storeApiNonce ) {
		return;
	}

	await fetchStoreApi( 'wc/store/v1/cart/items', { method: 'DELETE' } );

	for ( const line of items ) {
		await fetchStoreApi( 'wc/store/v1/cart/add-item', {
			method: 'POST',
			body: {
				id: Number( line.productId ),
				quantity: Math.max( 1, Number( line.quantity ) || 1 ),
			},
		} );
	}
}
