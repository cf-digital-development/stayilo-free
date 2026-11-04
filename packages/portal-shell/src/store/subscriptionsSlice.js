import { createSlice } from '@reduxjs/toolkit';
import { getBootstrapFromWindow } from '../api/portal.js';
import {
	applyDeliveryOverrideToCard,
	formatClientDeliveryDate,
	formatClientDeliveryDateId,
	gmtToDeliveryFields,
	hydrateSubscriptionDelivery,
	patchSubscriptionNextDelivery,
} from '../utils/delivery/index.js';
import { __ } from '@stayilo/design-system/i18n';
import {
	clearDeliveryOverride,
	readDeliveryOverrides,
	setDeliveryOverride,
} from '../utils/deliveryOverrides.js';

/** @deprecated Import from `../utils/delivery/gmt.js` instead. */
export { formatClientDeliveryDate, formatClientDeliveryDateId };

/**
 * Prefer Woo next payment from the server; fall back to a saved local override
 * only when no server timestamp is present (mock / offline).
 *
 * @param {object|null|undefined} card
 * @returns {object|null}
 */
export function normalizeSubscriptionCard( card ) {
	if ( ! card || card.id == null ) {
		return null;
	}

	const id = String( card.id );
	let normalized = { ...card, id };

	if ( card.nextPaymentGmt ) {
		const fromServer = gmtToDeliveryFields( card.nextPaymentGmt );
		const serverDateId =
			card.nextDelivery?.dateId || fromServer.dateId || '';
		const serverDateLabel =
			card.nextDelivery?.date || fromServer.dateLabel || '';

		normalized = {
			...normalized,
			nextDelivery: {
				...( normalized.nextDelivery || {} ),
				dateId: serverDateId,
				date: serverDateLabel,
			},
		};

		const override = readDeliveryOverrides()[ id ];
		if ( override?.dateId && override.dateId !== serverDateId ) {
			clearDeliveryOverride( id );
		}
	} else {
		const override = readDeliveryOverrides()[ id ] || {};
		if ( override.dateId || override.dateLabel ) {
			normalized = applyDeliveryOverrideToCard( normalized, override );
		}
	}

	return hydrateSubscriptionDelivery( normalized );
}

/**
 * @param {Array<object>|null|undefined} list
 * @returns {Array<object>}
 */
export function normalizeSubscriptionCards( list ) {
	if ( ! Array.isArray( list ) ) {
		return [];
	}
	return list.map( normalizeSubscriptionCard ).filter( Boolean );
}

function seedSubscriptions() {
	const seed = getBootstrapFromWindow();
	return normalizeSubscriptionCards( seed?.subscriptions );
}

const hasBootstrapSeed = Array.isArray(
	getBootstrapFromWindow()?.subscriptions
);

const subscriptionsSlice = createSlice( {
	name: 'subscriptions',
	initialState: {
		items: seedSubscriptions(),
		loading: ! hasBootstrapSeed,
		error: null,
	},
	reducers: {
		setSubscriptions( state, action ) {
			state.items = normalizeSubscriptionCards( action.payload );
		},
		setSubscriptionsLoading( state, action ) {
			state.loading = Boolean( action.payload );
		},
		setSubscriptionsError( state, action ) {
			state.error = action.payload ?? null;
		},
		upsertSubscription( state, action ) {
			const card = action.payload;
			if ( ! card?.id ) {
				return;
			}
			const next = normalizeSubscriptionCard( card );
			if ( ! next ) {
				return;
			}
			const idx = state.items.findIndex( ( item ) => item.id === next.id );
			if ( idx === -1 ) {
				state.items.unshift( next );
			} else {
				state.items[ idx ] = { ...state.items[ idx ], ...next };
			}
		},
		markSubscriptionCanceled( state, action ) {
			const id = String( action.payload || '' );
			state.items = state.items.map( ( card ) =>
				card.id === id
					? { ...card, status: 'canceled', rawStatus: 'cancelled' }
					: card
			);
		},
		markSubscriptionActive( state, action ) {
			const id = String( action.payload || '' );
			state.items = state.items.map( ( card ) =>
				card.id === id
					? { ...card, status: 'active', rawStatus: 'active' }
					: card
			);
		},
		applySkipDelivery( state, action ) {
			const {
				subscriptionId,
				nextPaymentGmt,
				dateId: payloadDateId,
				dateLabel: payloadDateLabel,
			} = action.payload || {};
			const id = String( subscriptionId || '' );
			const fromApi = nextPaymentGmt ? gmtToDeliveryFields( nextPaymentGmt ) : null;
			const dateId = fromApi?.dateId || payloadDateId || '';
			const dateLabel = fromApi?.dateLabel || payloadDateLabel || '';
			if ( id && ( dateId || dateLabel ) ) {
				setDeliveryOverride( id, { dateId, dateLabel } );
			}
			state.items = state.items.map( ( card ) => {
				if ( card.id !== id ) {
					return card;
				}
				return patchSubscriptionNextDelivery( card, {
					dateId,
					dateLabel,
					nextPaymentGmt,
					variant: 'summary',
					label: __( 'Next order', 'stayilo' ),
				} );
			} );
		},
		applyRescheduleDelivery( state, action ) {
			const { subscriptionId, dateId, dateLabel, nextPaymentGmt } =
				action.payload || {};
			const id = String( subscriptionId || '' );
			if ( ! id || ( ! dateId && ! dateLabel ) ) {
				return;
			}
			setDeliveryOverride( id, { dateId, dateLabel } );
			state.items = state.items.map( ( card ) => {
				if ( card.id !== id ) {
					return card;
				}
				return patchSubscriptionNextDelivery( card, {
					dateId,
					dateLabel,
					nextPaymentGmt,
				} );
			} );
		},
		applyBootstrap( state, action ) {
			const data = action.payload || {};
			if ( Array.isArray( data.subscriptions ) ) {
				state.items = normalizeSubscriptionCards( data.subscriptions );
			}
			state.loading = false;
			state.error = null;
		},
	},
} );

export const {
	setSubscriptions,
	setSubscriptionsLoading,
	setSubscriptionsError,
	upsertSubscription,
	markSubscriptionCanceled,
	markSubscriptionActive,
	applySkipDelivery,
	applyRescheduleDelivery,
	applyBootstrap,
} = subscriptionsSlice.actions;

export const selectSubscriptions = ( state ) => state.subscriptions.items;
export const selectSubscriptionsLoading = ( state ) =>
	state.subscriptions.loading;
export const selectSubscriptionsError = ( state ) => state.subscriptions.error;

export default subscriptionsSlice.reducer;
