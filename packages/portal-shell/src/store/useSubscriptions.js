import { useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
	cancelPortalSubscription,
	fetchPortalBootstrap,
	reactivatePortalSubscription,
	skipPortalDelivery,
	syncWindowBootstrap,
} from '../api/portal.js';
import { callPaidPortalApi } from '../utils/paidPortalApi.js';
import { loadFromSubscription as loadCartFromSubscription, clearSubscriptionLines, hydrateFromSubscriptions } from './cartSlice.js';
import { startCreateSubscription } from '../utils/createSubscription.js';
import {
	applyBootstrap,
	applyBootstrapAccount,
	applyBootstrapOrders,
	applyBootstrapPayment,
} from './bootstrapActions.js';
import {
	applyRescheduleDelivery,
	applySkipDelivery,
	markSubscriptionActive,
	markSubscriptionCanceled,
	selectSubscriptions,
	selectSubscriptionsError,
	selectSubscriptionsLoading,
	setSubscriptionsError,
	setSubscriptionsLoading,
	upsertSubscription,
} from './subscriptionsSlice.js';
import {
	addWeeksToDeliveryDate,
	gmtToDeliveryFields,
	normalizeRescheduleDate,
} from '../utils/delivery/index.js';
import { isPortalActionEnabled } from '../utils/portalActions.js';
import { __ } from '@stayilo/design-system/i18n';

/**
 * Live WooCommerce Subscriptions for portal pages (Redux).
 */
export function useSubscriptions() {
	const dispatch = useDispatch();
	const subscriptions = useSelector( selectSubscriptions );
	const loading = useSelector( selectSubscriptionsLoading );
	const error = useSelector( selectSubscriptionsError );

	const applySubscriptionCard = useCallback(
		( card ) => {
			if ( ! card?.id ) {
				return;
			}
			dispatch( upsertSubscription( card ) );
			if ( card.status === 'active' || card.rawStatus === 'active' ) {
				dispatch( loadCartFromSubscription( card ) );
			} else if (
				card.status === 'canceled' ||
				card.status === 'cancelled'
			) {
				dispatch( clearSubscriptionLines( card.id ) );
			} else {
				dispatch( loadCartFromSubscription( card ) );
			}
		},
		[ dispatch ]
	);

	const refresh = useCallback( async () => {
		dispatch( setSubscriptionsLoading( true ) );
		dispatch( setSubscriptionsError( null ) );
		try {
			const data = await fetchPortalBootstrap();
			dispatch( applyBootstrap( data ) );
			dispatch( applyBootstrapAccount( data?.account ) );
			dispatch( applyBootstrapOrders( data?.orders ) );
			dispatch( applyBootstrapPayment( data ) );
			dispatch( hydrateFromSubscriptions( data?.subscriptions ) );
			syncWindowBootstrap( data );
			if ( typeof window !== 'undefined' ) {
				window.dispatchEvent( new CustomEvent( 'stayilo-portal-bootstrap' ) );
			}
			return data;
		} catch ( err ) {
			dispatch(
				setSubscriptionsError( err?.message || __( 'Failed to load subscriptions', 'stayilo' ) )
			);
			throw err;
		} finally {
			dispatch( setSubscriptionsLoading( false ) );
		}
	}, [ dispatch ] );

	const cancelSubscription = useCallback(
		async ( subscriptionId, meta = {} ) => {
			if ( ! subscriptionId ) {
				return;
			}
			const existing = subscriptions.find(
				( card ) => card.id === String( subscriptionId )
			);
			const data = await cancelPortalSubscription( subscriptionId, meta );
			if ( data?.subscription ) {
				dispatch(
					upsertSubscription( {
						...existing,
						...data.subscription,
						lineItems:
							data.subscription.lineItems ?? existing?.lineItems,
					} )
				);
			} else {
				dispatch( markSubscriptionCanceled( subscriptionId ) );
			}
			dispatch( clearSubscriptionLines( subscriptionId ) );
		},
		[ dispatch, subscriptions ]
	);

	const reactivateSubscription = useCallback(
		async ( subscriptionId ) => {
			if ( ! subscriptionId ) {
				return;
			}
			if ( ! isPortalActionEnabled( 'reactivate' ) ) {
				throw new Error(
					__( 'Reactivation is not available for this store.', 'stayilo' )
				);
			}
			return reactivatePortalSubscription( subscriptionId );
		},
		[]
	);

	const updateBox = useCallback(
		async ( subscriptionId, lines ) => {
			if ( ! subscriptionId ) {
				return;
			}
			const data = await callPaidPortalApi( 'updateBox', subscriptionId, lines );
			if ( data?.subscription ) {
				dispatch( upsertSubscription( data.subscription ) );
				dispatch( loadCartFromSubscription( data.subscription ) );
			}
			return data;
		},
		[ dispatch ]
	);

	const skipDelivery = useCallback(
		async ( subscriptionId ) => {
			if ( ! subscriptionId ) {
				throw new Error( __( 'Missing subscription for skip.', 'stayilo' ) );
			}
			const subscription = subscriptions.find(
				( card ) => card.id === String( subscriptionId )
			);
			const currentDate =
				subscription?.nextDelivery?.dateId ||
				subscription?.nextDelivery?.date;
			const skippedFallback = addWeeksToDeliveryDate( currentDate, 1 );

			const data = await skipPortalDelivery( subscriptionId );
			if ( ! data?.next_payment_gmt ) {
				throw new Error( data?.message || __( 'Could not skip order.', 'stayilo' ) );
			}
			const fromApi = gmtToDeliveryFields( data.next_payment_gmt );

			dispatch(
				applySkipDelivery( {
					subscriptionId,
					nextPaymentGmt: data.next_payment_gmt,
					dateId: fromApi?.dateId || skippedFallback?.dateId,
					dateLabel: fromApi?.dateLabel || skippedFallback?.dateLabel,
				} )
			);
			return data;
		},
		[ dispatch, subscriptions ]
	);

	const rescheduleDelivery = useCallback(
		async ( subscriptionId, date ) => {
			if ( ! subscriptionId ) {
				throw new Error( __( 'Missing subscription for date change.', 'stayilo' ) );
			}
			const normalized = normalizeRescheduleDate( date );
			if ( ! normalized?.dateId ) {
				throw new Error( __( 'Please choose a valid order date.', 'stayilo' ) );
			}

			const data = await callPaidPortalApi(
				'changeSubscriptionDate',
				subscriptionId,
				normalized.dateId
			);

			const fromApi = data?.next_payment_gmt
				? gmtToDeliveryFields( data.next_payment_gmt )
				: null;

			// Never paint a local “success” date unless the server confirmed it.
			if ( ! fromApi?.dateId && ! data?.next_payment_gmt ) {
				throw new Error(
					data?.message || __( 'Order date was not updated. Please try again.', 'stayilo' )
				);
			}

			const dateId = fromApi?.dateId || normalized.dateId;
			const dateLabel = fromApi?.dateLabel || normalized.dateLabel;

			dispatch(
				applyRescheduleDelivery( {
					subscriptionId,
					dateId,
					dateLabel,
					nextPaymentGmt: data?.next_payment_gmt,
				} )
			);
			return {
				dateId,
				dateLabel,
				next_payment_gmt: data?.next_payment_gmt,
				...data,
			};
		},
		[ dispatch ]
	);

	const changeFrequency = useCallback(
		async ( subscriptionId, { interval, period } ) => {
			if ( ! subscriptionId || ! interval || ! period ) {
				return null;
			}

			const existing = subscriptions.find(
				( card ) => card.id === String( subscriptionId )
			);
			const data = await callPaidPortalApi(
				'changeSubscriptionFrequency',
				subscriptionId,
				interval,
				period
			);

			if ( data?.subscription ) {
				dispatch( upsertSubscription( data.subscription ) );
			} else if ( existing ) {
				dispatch(
					upsertSubscription( {
						...existing,
						billingInterval:
							Number( data?.billing_interval ) || Number( interval ),
						billingPeriod: data?.billing_period || period,
					} )
				);
			}

			return data;
		},
		[ dispatch, subscriptions ]
	);

	const pauseSubscription = useCallback(
		async ( subscriptionId ) => {
			if ( ! subscriptionId ) {
				return;
			}
			const existing = subscriptions.find(
				( card ) => card.id === String( subscriptionId )
			);
			const data = await callPaidPortalApi( 'pauseSubscription', subscriptionId );
			dispatch(
				upsertSubscription( {
					...existing,
					status: 'paused',
					rawStatus: data?.status || 'on-hold',
				} )
			);
			return data;
		},
		[ dispatch, subscriptions ]
	);

	const resumeSubscription = useCallback(
		async ( subscriptionId ) => {
			if ( ! subscriptionId ) {
				return;
			}
			const existing = subscriptions.find(
				( card ) => card.id === String( subscriptionId )
			);
			const data = await callPaidPortalApi( 'resumeSubscription', subscriptionId );
			const next = {
				...existing,
				status: 'active',
				rawStatus: data?.status || 'active',
			};
			dispatch( upsertSubscription( next ) );
			dispatch( loadCartFromSubscription( next ) );
			return data;
		},
		[ dispatch, subscriptions ]
	);

	const getSubscription = useCallback(
		( subscriptionId ) =>
			subscriptions.find(
				( card ) => card.id === String( subscriptionId )
			),
		[ subscriptions ]
	);

	const activeCount = useMemo(
		() => subscriptions.filter( ( card ) => card.status === 'active' ).length,
		[ subscriptions ]
	);

	return {
		subscriptions,
		activeCount,
		loading,
		error,
		refresh,
		applySubscriptionCard,
		getSubscription,
		cancelSubscription,
		reactivateSubscription,
		updateBox,
		createSubscription: startCreateSubscription,
		skipDelivery,
		rescheduleDelivery,
		changeFrequency,
		pauseSubscription,
		resumeSubscription,
	};
}
