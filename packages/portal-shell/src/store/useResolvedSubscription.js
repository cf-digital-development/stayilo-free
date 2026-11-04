import { useEffect, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { useLocation, useSearchParams } from 'react-router-dom';
import { useSubscriptions } from './useSubscriptions.js';
import {
	resolvePrimarySubscription,
	resolveSubscriptionId,
} from '../utils/subscriptionOverview.js';
import { setSelectedSubscriptionId } from './cartSlice.js';

/**
 * Read a subscription id from route state or `?subscription=` query.
 *
 * @param {string} [preferredId]
 * @param {object} [locationState]
 * @param {URLSearchParams} [searchParams]
 * @returns {string}
 */
export function readPreferredSubscriptionId(
	preferredId,
	locationState,
	searchParams
) {
	const fromProp = preferredId != null && preferredId !== ''
		? String( preferredId )
		: '';
	if ( fromProp ) {
		return fromProp;
	}
	const fromState = locationState?.subscriptionId;
	if ( fromState != null && fromState !== '' ) {
		return String( fromState );
	}
	const fromQuery = searchParams?.get?.( 'subscription' );
	if ( fromQuery ) {
		return String( fromQuery );
	}
	return '';
}

/**
 * Resolve the active subscription from route state, query, or defaults.
 * When an explicit id is requested, never fall back to another subscription.
 *
 * @param {string} [preferredId]
 */
export function useResolvedSubscription( preferredId ) {
	const dispatch = useDispatch();
	const location = useLocation();
	const [ searchParams ] = useSearchParams();
	const subs = useSubscriptions();

	const requestedId = useMemo(
		() =>
			readPreferredSubscriptionId(
				preferredId,
				location.state,
				searchParams
			),
		[ preferredId, location.state, searchParams ]
	);

	const subscriptionId = useMemo( () => {
		if ( requestedId ) {
			const match = resolveSubscriptionId(
				subs.subscriptions,
				requestedId
			);
			// Keep the requested id even while bootstrap is still loading so
			// we never flash another subscription's box.
			return match || requestedId;
		}
		return resolveSubscriptionId( subs.subscriptions );
	}, [ requestedId, subs.subscriptions ] );

	const subscription = useMemo( () => {
		if ( ! subscriptionId ) {
			return undefined;
		}
		const match = subs.getSubscription( subscriptionId );
		if ( match ) {
			return match;
		}
		// Explicit id was asked for but is missing — do not substitute another.
		if ( requestedId ) {
			return undefined;
		}
		return resolvePrimarySubscription( subs.subscriptions );
	}, [
		subs.getSubscription,
		subscriptionId,
		requestedId,
		subs.subscriptions,
	] );

	useEffect( () => {
		if ( ! subscriptionId ) {
			return;
		}
		dispatch( setSelectedSubscriptionId( String( subscriptionId ) ) );
	}, [ dispatch, subscriptionId ] );

	return {
		...subs,
		subscription,
		subscriptionId: subscription?.id || subscriptionId || '',
		requestedId,
	};
}
