/**
 * Map WooCommerce Store API products to Edit Subscription catalog lines.
 */

import { decodeMoney } from './decodeMoney.js';

function storePriceToNumber( prices ) {
	if ( ! prices || typeof prices !== 'object' ) {
		return 0;
	}
	const minor = Number( prices.currency_minor_unit );
	const divisor = Number.isFinite( minor ) ? 10 ** minor : 100;
	const raw = Number( prices.price );
	if ( ! Number.isFinite( raw ) ) {
		return 0;
	}
	return Math.round( ( raw / divisor ) * 10000 ) / 10000;
}

function productImageUrl( product ) {
	const image = Array.isArray( product?.images ) ? product.images[ 0 ] : null;
	return image?.src || image?.thumbnail || '';
}

function productServings( product ) {
	const attrs = Array.isArray( product?.attributes ) ? product.attributes : [];
	const servings = attrs.find( ( attr ) =>
		/serv/i.test( String( attr?.name || '' ) )
	);
	const term = servings?.terms?.[ 0 ]?.name;
	return term ? String( term ) : '';
}

function plainText( value ) {
	return decodeMoney( String( value || '' ).replace( /<[^>]+>/g, ' ' ) )
		.replace( /\s+/g, ' ' )
		.trim();
}

function isVariationProduct( product ) {
	return (
		String( product?.type || '' ) === 'variation' ||
		Number( product?.parent ) > 0
	);
}

function variationSize( product ) {
	const raw = plainText( product?.variation );
	if ( ! raw ) {
		return '';
	}
	return raw
		.split( /\s*,\s*/ )
		.map( ( part ) => part.replace( /^[^:]+:\s*/, '' ).trim() )
		.filter( Boolean )
		.join( ', ' );
}

function productBaseName( product ) {
	return plainText( product?.name )
		.replace( /\s+[\u2013\u2014-]\s+[^:]+:\s*.+$/, '' )
		.trim();
}

function catalogTitle( product ) {
	const name = productBaseName( product );
	if ( ! name || ! isVariationProduct( product ) ) {
		return name;
	}
	const size = variationSize( product );
	if ( ! size || name.toLowerCase().includes( size.toLowerCase() ) ) {
		return name;
	}
	return `${ name } - ${ size }`;
}

function isVariableParent( product ) {
	const type = String( product?.type || '' );
	if ( type === 'variable' || type === 'variable-subscription' ) {
		return true;
	}
	return (
		Array.isArray( product?.variations ) &&
		product.variations.length > 0 &&
		! Number( product.parent )
	);
}

/**
 * @param {object} product Store API product
 * @returns {object|null}
 */
export function mapStoreProductToCatalog( product ) {
	if ( ! product || product.id == null ) {
		return null;
	}
	if ( isVariableParent( product ) ) {
		return null;
	}
	if ( product.is_purchasable === false ) {
		return null;
	}

	const productId = Number( product.id );
	if ( ! Number.isFinite( productId ) || productId < 1 ) {
		return null;
	}

	const unitPrice = storePriceToNumber( product.prices );

	return {
		id: String( productId ),
		productId,
		title: catalogTitle( product ),
		servings: productServings( product ),
		imageUrl: productImageUrl( product ),
		unitPrice,
		quantity: 1,
		price: unitPrice,
	};
}

/**
 * @param {unknown} products
 * @returns {Array<object>}
 */
export function mapStoreProductsToCatalog( products ) {
	if ( ! Array.isArray( products ) ) {
		return [];
	}
	return products
		.map( ( product ) => mapStoreProductToCatalog( product ) )
		.filter( Boolean );
}
