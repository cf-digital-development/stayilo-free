/**
 * Normalize and price cart lines. `price` is always the line total (unit × qty).
 */

import { __, sprintf } from '@stayilo/design-system/i18n';
import { decodeMoney } from './decodeMoney.js';
import { isSubscriptionCanceled } from './subscriptionOverview.js';

/**
 * Parse numeric money from number or formatted string ("£6.83", "$10.00").
 *
 * @param {unknown} value
 * @returns {number}
 */
export function parseMoneyAmount( value ) {
	if ( typeof value === 'number' ) {
		return Number.isFinite( value ) ? value : NaN;
	}
	if ( value == null || value === '' ) {
		return NaN;
	}
	const cleaned = decodeMoney( value )
		.replace( /[^0-9.-]/g, '' );
	const n = Number( cleaned );
	return Number.isFinite( n ) ? n : NaN;
}

/**
 * @param {unknown} value
 * @param {{ min?: number, max?: number }} [options]
 * @returns {number}
 */
export function clampQuantity( value, { min = 1, max } = {} ) {
	const n = Number.parseInt( String( value ), 10 );
	if ( Number.isNaN( n ) ) {
		return min;
	}
	let next = Math.max( min, n );
	if ( max != null ) {
		next = Math.min( max, next );
	}
	return next;
}

/**
 * @param {number} unitPrice
 * @param {number} quantity
 * @returns {number}
 */
export function lineTotal( unitPrice, quantity ) {
	const unit = Number( unitPrice ) || 0;
	const qty = Number( quantity ) || 0;
	return Math.round( unit * qty * 100 ) / 100;
}

/**
 * @param {unknown} value
 * @returns {string}
 */
export function subscriptionIdOf( value ) {
	if ( value == null || value === '' ) {
		return '';
	}
	return String( value );
}

/**
 * @param {object} [line]
 * @param {number} [index]
 * @returns {string}
 */
export function cartLineKey( line, index = 0 ) {
	const subscriptionId = subscriptionIdOf( line?.subscriptionId );
	const id = line?.id != null ? String( line.id ) : '';
	if ( subscriptionId || id ) {
		return `${ subscriptionId }:${ id }`;
	}
	return `line-${ index }`;
}

/**
 * Per-unit servings from a cart line label or numeric field.
 *
 * @param {object} [line]
 * @returns {number}
 */
function lineServingsPerUnit( line ) {
	const explicit = Number( line?.servingsCount );
	if ( Number.isFinite( explicit ) && explicit > 0 ) {
		return Math.floor( explicit );
	}
	const fromLabel = String( line?.servings || '' ).match( /(\d+)/ );
	if ( fromLabel ) {
		const n = Number( fromLabel[ 1 ] );
		if ( Number.isFinite( n ) && n > 0 ) {
			return Math.floor( n );
		}
	}
	return 0;
}


/**
 * @param {object} raw
 * @returns {{
 *   id: string,
 *   title: string,
 *   servings: string,
 *   description: string,
 *   quantity: number,
 *   unitPrice: number,
 *   price: number,
 *   imageUrl: string,
 *   productId: number,
 *   subscriptionId: string,
 *   recurring: boolean,
 * }}
 */
export function normalizeCartLine( raw = {} ) {
	const quantity = Math.max( 1, Number( raw.quantity ) || 1 );
	const storedUnit = parseMoneyAmount( raw.unitPrice );
	const storedTotal = parseMoneyAmount( raw.price );

	let unitPrice = Number.isFinite( storedUnit ) ? storedUnit : NaN;
	if ( ! Number.isFinite( unitPrice ) || unitPrice < 0 ) {
		unitPrice =
			Number.isFinite( storedTotal ) && quantity > 0
				? storedTotal / quantity
				: 0;
	}

	// Recover unit from a stale line total when unitPrice was lost (e.g. old persist).
	if (
		( ! Number.isFinite( unitPrice ) || unitPrice === 0 ) &&
		Number.isFinite( storedTotal ) &&
		storedTotal > 0 &&
		quantity > 0
	) {
		unitPrice = storedTotal / quantity;
	}

	unitPrice = Math.round( ( Number( unitPrice ) || 0 ) * 10000 ) / 10000;

	const productId = Number( raw.productId );
	const regularUnit = parseMoneyAmount( raw.regularUnitPrice );
	const regularPrice = parseMoneyAmount( raw.regularPrice );
	const savings = parseMoneyAmount( raw.savings );
	const discountPercent = Number( raw.discountPercent );

	const servingsCount = Number( raw.servingsCount );

	return {
		id: String( raw.id ?? '' ),
		title: raw.title || '',
		servings: raw.servings || '',
		description:
			typeof raw.description === 'string' ? raw.description : '',
		servingsCount:
			Number.isFinite( servingsCount ) && servingsCount > 0
				? Math.floor( servingsCount )
				: 0,
		quantity,
		unitPrice,
		price: lineTotal( unitPrice, quantity ),
		imageUrl: raw.imageUrl || '',
		productId: Number.isFinite( productId ) && productId > 0 ? productId : 0,
		subscriptionId: subscriptionIdOf( raw.subscriptionId ),
		recurring: raw.recurring !== false,
		regularUnitPrice:
			Number.isFinite( regularUnit ) && regularUnit > unitPrice
				? regularUnit
				: undefined,
		regularPrice:
			Number.isFinite( regularPrice ) && regularPrice > lineTotal( unitPrice, quantity )
				? regularPrice
				: Number.isFinite( regularUnit ) && regularUnit > unitPrice
					? lineTotal( regularUnit, quantity )
					: undefined,
		discountPercent:
			Number.isFinite( discountPercent ) && discountPercent > 0
				? discountPercent
				: undefined,
		savings:
			Number.isFinite( savings ) && savings > 0 ? savings : undefined,
		savingsLabel:
			typeof raw.savingsLabel === 'string' && raw.savingsLabel
				? raw.savingsLabel
				: undefined,
		tags: Array.isArray( raw.tags )
			? raw.tags
				.map( ( tag ) => String( tag ).trim() )
				.filter( Boolean )
			: [],
	};
}

/**
 * @param {Array<object>|null|undefined} list
 * @returns {Array<object>}
 */
export function normalizeCartLines( list ) {
	if ( ! Array.isArray( list ) ) {
		return [];
	}
	return list
		.filter( ( line ) => line && line.id != null && String( line.id ) !== '' )
		.map( ( line ) => normalizeCartLine( line ) );
}

/**
 * @param {Array<object>|null|undefined} lines
 * @param {string|number} [subscriptionId]
 * @returns {Array<object>}
 */
export function stampCartLines( lines, subscriptionId ) {
	const id = subscriptionIdOf( subscriptionId );
	return normalizeCartLines( lines ).map( ( line ) => ( {
		...line,
		subscriptionId: id || line.subscriptionId || '',
	} ) );
}

/**
 * Editable (recurring) lines for a subscription — excludes one-time parent-order extras.
 *
 * @param {object} [subscription]
 * @returns {Array<object>}
 */
export function linesFromSubscription( subscription ) {
	if ( ! subscription?.id ) {
		return [];
	}
	const items = Array.isArray( subscription.lineItems )
		? subscription.lineItems.filter( ( line ) => line?.recurring !== false )
		: [];
	return stampCartLines( items, subscription.id );
}

/**
 * One-time extras from the parent checkout order (not part of renewals).
 *
 * @param {object} [subscription]
 * @returns {Array<object>}
 */
export function oneTimeLinesFromSubscription( subscription ) {
	if ( ! subscription?.id ) {
		return [];
	}
	const items = Array.isArray( subscription.lineItems )
		? subscription.lineItems.filter( ( line ) => line?.recurring === false )
		: [];
	return stampCartLines( items, subscription.id ).map( ( line ) => ( {
		...line,
		recurring: false,
	} ) );
}

/**
 * @param {Array<object>|null|undefined} subscriptions
 * @returns {Array<object>}
 */
export function linesFromSubscriptions( subscriptions ) {
	if ( ! Array.isArray( subscriptions ) ) {
		return [];
	}
	return subscriptions.flatMap( ( subscription ) =>
		linesFromSubscription( subscription )
	);
}

/**
 * Replace one subscription's lines without touching other boxes.
 *
 * @param {Array<object>|null|undefined} allLines
 * @param {string|number} subscriptionId
 * @param {Array<object>|null|undefined} nextLines
 * @returns {Array<object>}
 */
export function replaceSubscriptionLines( allLines, subscriptionId, nextLines ) {
	const id = subscriptionIdOf( subscriptionId );
	const recurring = ( Array.isArray( nextLines ) ? nextLines : [] ).filter(
		( line ) => line?.recurring !== false
	);
	if ( ! id ) {
		return normalizeCartLines( recurring );
	}
	const rest = ( Array.isArray( allLines ) ? allLines : [] ).filter(
		( line ) => subscriptionIdOf( line.subscriptionId ) !== id
	);
	return [ ...rest, ...stampCartLines( recurring, id ) ];
}

/**
 * @param {Array<object>|null|undefined} lines
 * @param {string|number} [subscriptionId]
 * @returns {Array<object>}
 */
export function filterCartLinesBySubscription( lines, subscriptionId ) {
	const id = subscriptionIdOf( subscriptionId );
	const normalized = normalizeCartLines( lines );
	if ( ! id ) {
		return normalized;
	}
	return normalized.filter(
		( line ) => subscriptionIdOf( line.subscriptionId ) === id
	);
}

/**
 * Hide lines that belong to canceled subscriptions.
 *
 * @param {Array<object>|null|undefined} lines
 * @param {Array<{ id?: string, status?: string }>|null|undefined} subscriptions
 * @returns {Array<object>}
 */
export function filterActiveSubscriptionLines( lines, subscriptions ) {
	const cards = Array.isArray( subscriptions ) ? subscriptions : [];
	const normalized = normalizeCartLines( lines );
	if ( cards.length === 0 ) {
		return normalized;
	}
	const activeIds = new Set(
		cards
			.filter(
				( subscription ) =>
					subscription?.id &&
					! isSubscriptionCanceled( subscription.status )
			)
			.map( ( subscription ) => String( subscription.id ) )
	);
	return normalized.filter( ( line ) => {
		const id = subscriptionIdOf( line.subscriptionId );
		return ! id || activeIds.has( id );
	} );
}

/**
 * Map editable cart lines to the portal update-box payload (WCS line sync).
 *
 * @param {Array<object>|null|undefined} lines
 * @returns {Array<{ productId: number, quantity: number, itemId?: number }>}
 */
export function boxLinesToPersistPayload( lines ) {
	return ( Array.isArray( lines ) ? lines : [] )
		.filter( ( line ) => line?.recurring !== false )
		.map( ( line ) => {
			const normalized = normalizeCartLine( line );
			const productId = Number( normalized.productId );
			if ( ! Number.isFinite( productId ) || productId < 1 ) {
				return null;
			}

			const payload = {
				productId,
				quantity: Math.max( 1, Number( normalized.quantity ) || 1 ),
			};

			const lineId = String( normalized.id ?? '' );
			if (
				lineId &&
				lineId !== String( productId ) &&
				/^\d+$/.test( lineId )
			) {
				payload.itemId = Number( lineId );
			}

			return payload;
		} )
		.filter( Boolean );
}

/**
 * @param {Array<object>|null|undefined} lines
 * @returns {boolean}
 */
export function hasTaggedCartLines( lines ) {
	return ( Array.isArray( lines ) ? lines : [] ).some( ( line ) =>
		subscriptionIdOf( line?.subscriptionId )
	);
}

/**
 * @param {Array<object>} lines
 * @param {string} id
 * @param {unknown} quantity
 * @param {{ min?: number, max?: number }} [options]
 * @returns {Array<object>}
 */
function lineMatchesId( line, id, subscriptionId ) {
	if ( String( line.id ) !== String( id ) ) {
		return false;
	}
	const scope = subscriptionIdOf( subscriptionId );
	if ( ! scope ) {
		return true;
	}
	return subscriptionIdOf( line.subscriptionId ) === scope;
}

export function updateLineQuantity( lines, id, quantity, options ) {
	const next = clampQuantity( quantity, options );
	const subscriptionId = subscriptionIdOf( options?.subscriptionId );
	return lines.map( ( line ) => {
		if ( ! lineMatchesId( line, id, subscriptionId ) ) {
			return line;
		}
		const normalized = normalizeCartLine( line );
		const updated = {
			...normalized,
			quantity: next,
			price: lineTotal( normalized.unitPrice, next ),
		};
		if ( Number( normalized.regularUnitPrice ) > Number( normalized.unitPrice ) ) {
			const regularTotal = lineTotal( normalized.regularUnitPrice, next );
			const save = Math.round(
				( regularTotal - updated.price ) * 100
			) / 100;
			updated.regularPrice = regularTotal;
			updated.savings = save > 0 ? save : undefined;
			if ( normalized.savingsLabel && save > 0 ) {
				// Keep period suffix; refresh the money portion when qty changes.
				updated.savingsLabel = normalized.savingsLabel.replace(
					/Save\s+[^\s/]+/,
					sprintf( __( 'Save %s', 'stayilo' ), formatCartMoney( save, options?.currency ) )
				);
			}
		}
		return updated;
	} );
}

/**
 * @param {Array<{ id: string }>} lines
 * @param {string} id
 * @returns {Array<object>}
 */
export function removeCartLine( lines, id, subscriptionId ) {
	const scope = subscriptionIdOf( subscriptionId );
	return lines.filter( ( line ) => ! lineMatchesId( line, id, scope ) );
}

/**
 * Find a box line by catalog id or WooCommerce productId.
 *
 * @param {Array<object>} lines
 * @param {{ id?: string|number, productId?: number }} product
 * @returns {object|undefined}
 */
export function findCartLineForProduct( lines, product = {} ) {
	const id = String( product.id ?? '' );
	const productId = Number( product.productId );
	const hasProductId = Number.isFinite( productId ) && productId > 0;
	const subscriptionId = subscriptionIdOf( product.subscriptionId );

	if ( ! id && ! hasProductId ) {
		return undefined;
	}

	return ( Array.isArray( lines ) ? lines : [] ).find( ( line ) => {
		if (
			subscriptionId &&
			subscriptionIdOf( line.subscriptionId ) !== subscriptionId
		) {
			return false;
		}
		if ( id && String( line.id ) === id ) {
			return true;
		}
		if ( hasProductId && Number( line.productId ) === productId ) {
			return true;
		}
		if ( hasProductId && String( line.id ) === String( productId ) ) {
			return true;
		}
		if ( id && Number( line.productId ) === Number( id ) ) {
			return true;
		}
		return false;
	} );
}

/**
 * Add a catalog product (or bump quantity if already in the box).
 *
 * @param {Array<object>} lines
 * @param {object} product
 * @returns {Array<object>}
 */
export function addProductToCart( lines, product ) {
	const incoming = normalizeCartLine( {
		...product,
		quantity: product.quantity ?? 1,
	} );
	if ( ! incoming.id ) {
		return lines;
	}

	const existingLine = findCartLineForProduct( lines, incoming );
	const idx = existingLine
		? lines.findIndex(
				( line ) =>
					String( line.id ) === String( existingLine.id ) &&
					subscriptionIdOf( line.subscriptionId ) ===
						subscriptionIdOf( existingLine.subscriptionId )
		  )
		: -1;
	if ( idx === -1 ) {
		return [ ...lines, incoming ];
	}

	const existing = normalizeCartLine( lines[ idx ] );
	const quantity = existing.quantity + ( Number( product.quantity ) || 1 );
	const next = {
		...existing,
		...incoming,
		quantity,
		unitPrice: incoming.unitPrice || existing.unitPrice,
	};
	next.price = lineTotal( next.unitPrice, next.quantity );

	const copy = [ ...lines ];
	copy[ idx ] = next;
	return copy;
}

/**
 * @param {Array<{ price?: number }>} lines
 * @returns {number}
 */
export function sumCartLines( lines ) {
	if ( ! Array.isArray( lines ) ) {
		return 0;
	}
	return lines.reduce( ( sum, line ) => sum + ( Number( line.price ) || 0 ), 0 );
}

/**
 * @param {number} amount
 * @param {string} [currency]
 * @returns {string}
 */
export function formatCartMoney( amount, currency = 'GBP' ) {
	const value = Number( amount ) || 0;
	const code = ( currency || 'GBP' ).toUpperCase();
	try {
		return new Intl.NumberFormat( undefined, {
			style: 'currency',
			currency: code,
			minimumFractionDigits: 2,
			maximumFractionDigits: 2,
		} ).format( value );
	} catch {
		const symbols = { GBP: '£', USD: '$', EUR: '€' };
		const symbol = symbols[ code ] || `${ code } `;
		return `${ symbol }${ value.toFixed( 2 ) }`;
	}
}

/**
 * Build BoxTotalCard props from a WooCommerce-style summary.
 * Prefer server `orderSummary` when present; otherwise compute from cart lines.
 *
 * @param {Array<object>} lines
 * @param {{
 *   currency?: string,
 *   label?: string,
 *   summaryTitle?: string,
 *   orderSummary?: object,
 *   shippingTotal?: number,
 *   shippingLabel?: string,
 *   discountTotal?: number,
 *   discountLabel?: string,
 *   discountPercent?: number,
 * }} [options]
 */
export function buildBoxTotalProps( lines, options = {} ) {
	const {
		currency = 'GBP',
		label = 'Subscription total',
		summaryTitle = 'Order summary',
		orderSummary,
		shippingTotal = 0,
		shippingLabel,
		discountTotal = 0,
		discountLabel = 'Subscription Savings',
		discountPercent = 0,
	} = options;

	if (
		orderSummary &&
		Array.isArray( orderSummary.lines ) &&
		orderSummary.lines.length > 0
	) {
		const summarySubtotal = Math.max( 0, Number( orderSummary.subtotal ) || 0 );
		const summaryDiscount = Math.max(
			0,
			Number( orderSummary.discountTotal ) || 0
		);
		const percent =
			Math.max( 0, Number( discountPercent ) || 0 ) ||
			( summarySubtotal > 0 && summaryDiscount > 0
				? Math.round( ( summaryDiscount / summarySubtotal ) * 100 )
				: 0 );

		return {
			label,
			summaryTitle,
			total: orderSummary.total || formatCartMoney( 0, currency ),
			originalTotal: orderSummary.originalTotal || undefined,
			lines: orderSummary.lines.map( ( row ) => {
				const id = String( row?.id || '' );
				const rowLabel = String( row?.label || '' );
				if (
					id === 'shipping' ||
					/^free shipping$/i.test( rowLabel ) ||
					/^shipping$/i.test( rowLabel )
				) {
					return { ...row, label: __( 'Delivery', 'stayilo' ) };
				}
				if (
					id === 'subscription-discount' ||
					/^subscription discount$/i.test( rowLabel )
				) {
					return {
						...row,
						label:
							percent > 0
								? sprintf( __( 'Subscription Savings %d%%', 'stayilo' ), Math.round( percent ) )
								: __( 'Subscription Savings', 'stayilo' ),
					};
				}
				return row;
			} ),
		};
	}

	const subtotal = roundMoney( sumCartLines( lines ) );
	const shipping = Math.max( 0, Number( shippingTotal ) || 0 );
	let discount = Math.max( 0, Number( discountTotal ) || 0 );
	const percent = Math.max( 0, Number( discountPercent ) || 0 );

	if ( discount <= 0 && percent > 0 && percent < 100 && subtotal > 0 ) {
		discount = roundMoney( subtotal * ( percent / 100 ) );
	}

	const shipLabel = shippingLabel || __( 'Delivery', 'stayilo' );
	const grandTotal = roundMoney( subtotal - discount + shipping );

	const summaryLines = [
		{
			id: 'subtotal',
			label: __( 'Subtotal', 'stayilo' ),
			value: formatCartMoney( subtotal, currency ),
		},
		discount > 0
			? {
					id: 'discount',
					label:
						percent > 0
							? `${ discountLabel } ${ Math.round( percent ) }%`
							: discountLabel,
					value: `-${ formatCartMoney( discount, currency ) }`,
					tone: 'discount',
			  }
			: null,
		{
			id: 'shipping',
			label: shipLabel === 'Free shipping' || shipLabel === 'Shipping'
				? __( 'Delivery', 'stayilo' )
				: shipLabel,
			value: shipping > 0 ? formatCartMoney( shipping, currency ) : __( 'Free', 'stayilo' ),
		},
		{
			id: 'total',
			label: __( 'Total', 'stayilo' ),
			value: formatCartMoney( grandTotal, currency ),
			tone: 'total',
		},
	].filter( Boolean );

	return {
		label,
		summaryTitle,
		total: formatCartMoney( grandTotal, currency ),
		originalTotal:
			discount > 0
				? formatCartMoney( roundMoney( subtotal + shipping ), currency )
				: undefined,
		lines: summaryLines,
	};
}

/**
 * @param {number} amount
 * @returns {number}
 */
function roundMoney( amount ) {
	return Math.round( ( Number( amount ) || 0 ) * 100 ) / 100;
}
