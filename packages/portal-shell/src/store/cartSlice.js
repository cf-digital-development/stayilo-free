import { createSlice } from '@reduxjs/toolkit';
import { getBootstrapFromWindow } from '../api/portal.js';
import {
	addProductToCart,
	filterActiveSubscriptionLines,
	filterCartLinesBySubscription,
	hasTaggedCartLines,
	linesFromSubscriptions,
	normalizeCartLine,
	normalizeCartLines,
	removeCartLine,
	replaceSubscriptionLines,
	subscriptionIdOf,
	updateLineQuantity,
} from '../utils/cartLines.js';
import { isActiveSubscription } from '../utils/subscriptionOverview.js';

function activeSubscriptions( list ) {
	return ( Array.isArray( list ) ? list : [] ).filter( isActiveSubscription );
}

function linesFromBootstrap() {
	const seed = getBootstrapFromWindow();
	return linesFromSubscriptions( activeSubscriptions( seed?.subscriptions ) );
}

function payloadSubscriptionId( payload, fallback = '' ) {
	if ( payload && typeof payload === 'object' ) {
		return (
			subscriptionIdOf( payload.subscriptionId ) ||
			subscriptionIdOf( payload.options?.subscriptionId ) ||
			fallback
		);
	}
	return fallback;
}

const cartSlice = createSlice( {
	name: 'cart',
	initialState: {
		lines: linesFromBootstrap(),
		selectedSubscriptionId: '',
	},
	reducers: {
		setSelectedSubscriptionId( state, action ) {
			state.selectedSubscriptionId = subscriptionIdOf( action.payload );
		},
		setLines( state, action ) {
			const payload = action.payload;
			const isScoped = payload && ! Array.isArray( payload );
			const nextLines = isScoped ? payload.lines : payload;
			const subscriptionId = isScoped
				? subscriptionIdOf( payload.subscriptionId ) ||
				  state.selectedSubscriptionId
				: state.selectedSubscriptionId;

			if ( subscriptionId ) {
				state.lines = replaceSubscriptionLines(
					state.lines,
					subscriptionId,
					nextLines
				);
				return;
			}
			state.lines = normalizeCartLines( nextLines );
		},
		loadFromSubscription( state, action ) {
			const subscription = action.payload;
			const subscriptionId = subscriptionIdOf( subscription?.id );
			if ( ! subscriptionId ) {
				return;
			}
			state.lines = replaceSubscriptionLines(
				state.lines,
				subscriptionId,
				subscription.lineItems
			);
		},
		hydrateFromSubscriptions( state, action ) {
			const subscriptions = activeSubscriptions(
				Array.isArray( action.payload ) ? action.payload : []
			);
			const activeIds = new Set(
				subscriptions.map( ( subscription ) => String( subscription.id ) )
			);

			// Drop lines for canceled / removed subscriptions, then replace each
			// active box from the server card so badge + drawer stay in sync.
			let next = normalizeCartLines( state.lines ).filter( ( line ) => {
				const id = subscriptionIdOf( line.subscriptionId );
				return ! id || activeIds.has( id );
			} );

			if ( ! hasTaggedCartLines( next ) && subscriptions.length > 0 ) {
				state.lines = linesFromSubscriptions( subscriptions );
				return;
			}

			subscriptions.forEach( ( subscription ) => {
				next = replaceSubscriptionLines(
					next,
					subscription.id,
					subscription.lineItems
				);
			} );
			state.lines = next;
		},
		clearSubscriptionLines( state, action ) {
			const subscriptionId = subscriptionIdOf( action.payload );
			if ( ! subscriptionId ) {
				return;
			}
			state.lines = replaceSubscriptionLines(
				state.lines,
				subscriptionId,
				[]
			);
			if ( state.selectedSubscriptionId === subscriptionId ) {
				state.selectedSubscriptionId = '';
			}
		},
		updateQuantity( state, action ) {
			const { id, quantity, options } = action.payload || {};
			if ( ! id ) {
				return;
			}
			const subscriptionId = payloadSubscriptionId(
				action.payload,
				state.selectedSubscriptionId
			);
			state.lines = updateLineQuantity(
				state.lines,
				String( id ),
				quantity,
				{ ...( options || {} ), subscriptionId }
			);
		},
		removeLine( state, action ) {
			const payload = action.payload;
			const id =
				payload && typeof payload === 'object' ? payload.id : payload;
			if ( ! id ) {
				return;
			}
			const subscriptionId = payloadSubscriptionId(
				payload,
				state.selectedSubscriptionId
			);
			state.lines = removeCartLine(
				state.lines,
				String( id ),
				subscriptionId
			);
		},
		upsertLine( state, action ) {
			const next = normalizeCartLine( {
				...action.payload,
				subscriptionId:
					subscriptionIdOf( action.payload?.subscriptionId ) ||
					state.selectedSubscriptionId,
			} );
			if ( ! next.id ) {
				return;
			}
			const idx = state.lines.findIndex(
				( line ) =>
					line.id === next.id &&
					subscriptionIdOf( line.subscriptionId ) ===
						subscriptionIdOf( next.subscriptionId )
			);
			if ( idx === -1 ) {
				state.lines.push( next );
			} else {
				state.lines[ idx ] = {
					...state.lines[ idx ],
					...next,
					price: next.price,
					unitPrice: next.unitPrice,
					quantity: next.quantity,
				};
			}
		},
		addProduct( state, action ) {
			const subscriptionId =
				subscriptionIdOf( action.payload?.subscriptionId ) ||
				state.selectedSubscriptionId;
			const product = {
				...( action.payload || {} ),
				subscriptionId,
			};
			const scoped = subscriptionId
				? filterCartLinesBySubscription( state.lines, subscriptionId )
				: state.lines;
			const nextScoped = addProductToCart( scoped, product );
			if ( subscriptionId ) {
				state.lines = replaceSubscriptionLines(
					state.lines,
					subscriptionId,
					nextScoped
				);
				return;
			}
			state.lines = nextScoped;
		},
	},
} );

export const {
	setSelectedSubscriptionId,
	setLines,
	loadFromSubscription,
	hydrateFromSubscriptions,
	clearSubscriptionLines,
	updateQuantity,
	removeLine,
	upsertLine,
	addProduct,
} = cartSlice.actions;

export const selectCartLines = ( state ) => state.cart.lines;
export const selectSelectedSubscriptionId = ( state ) =>
	state.cart.selectedSubscriptionId || '';
export const selectVisibleCartLines = ( state ) =>
	filterActiveSubscriptionLines(
		filterCartLinesBySubscription(
			state.cart.lines,
			state.cart.selectedSubscriptionId
		),
		state.subscriptions.items
	);

export default cartSlice.reducer;
