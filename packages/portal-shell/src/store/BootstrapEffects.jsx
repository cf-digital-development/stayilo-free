import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getBootstrapFromWindow, getPortal } from '../api/portal.js';
import { useSubscriptions } from './useSubscriptions.js';
import { hydrateFromSubscriptions } from './cartSlice.js';
import {
	selectSubscriptions,
	selectSubscriptionsLoading,
	setSubscriptionsLoading,
} from './subscriptionsSlice.js';

/**
 * Fetch bootstrap when PHP did not seed subscriptions on first paint.
 * Seed the cart with every subscription box when no tagged lines exist.
 */
export function BootstrapEffects() {
	const dispatch = useDispatch();
	const { refresh } = useSubscriptions();
	const items = useSelector( selectSubscriptions );
	const subscriptionsLoading = useSelector( selectSubscriptionsLoading );
	const cartSeededRef = useRef( false );
	const seed = getBootstrapFromWindow();
	const hasSeed = Array.isArray( seed?.subscriptions );

	useEffect( () => {
		if ( hasSeed ) {
			return;
		}
		if ( items.length > 0 ) {
			dispatch( setSubscriptionsLoading( false ) );
			return;
		}
		if ( ! getPortal().ajaxUrl ) {
			dispatch( setSubscriptionsLoading( false ) );
			return;
		}
		refresh().catch( () => {} );
	}, [ dispatch, hasSeed, items.length, refresh ] );

	useEffect( () => {
		if ( cartSeededRef.current ) {
			return;
		}
		if ( subscriptionsLoading || items.length === 0 ) {
			return;
		}
		dispatch( hydrateFromSubscriptions( items ) );
		cartSeededRef.current = true;
	}, [ dispatch, items, subscriptionsLoading ] );

	return null;
}
