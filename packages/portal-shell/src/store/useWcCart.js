import { useCallback, useEffect, useMemo, useState } from 'react';
import {
	fetchWcCart,
	removeWcCartItem,
	updateWcCartItemQuantity,
} from '../api/wc.js';
import { getPortal } from '../api/portal.js';
import { __ } from '@stayilo/design-system/i18n';

/**
 * WooCommerce session cart (Store API) — source of truth for the header drawer.
 * Stays empty after checkout when the WC cart is empty.
 */
export function useWcCart( { enabled = true } = {} ) {
	const [ cart, setCart ] = useState( null );
	const [ loading, setLoading ] = useState( false );
	const [ error, setError ] = useState( null );
	const canSync = Boolean( getPortal().restUrl && getPortal().storeApiNonce );

	const refresh = useCallback( async () => {
		if ( ! enabled || ! canSync ) {
			setCart( null );
			return null;
		}
		setLoading( true );
		setError( null );
		try {
			const next = await fetchWcCart();
			setCart( next );
			return next;
		} catch ( err ) {
			setError( err?.message || __( 'Could not load cart', 'stayilo' ) );
			throw err;
		} finally {
			setLoading( false );
		}
	}, [ canSync, enabled ] );

	useEffect( () => {
		if ( ! enabled || ! canSync ) {
			return undefined;
		}
		refresh().catch( () => {} );
		return undefined;
	}, [ canSync, enabled, refresh ] );

	const updateQuantity = useCallback(
		async ( key, quantity ) => {
			if ( ! key ) {
				return;
			}
			const next = await updateWcCartItemQuantity( key, quantity );
			setCart( next );
			return next;
		},
		[]
	);

	const removeLine = useCallback( async ( key ) => {
		if ( ! key ) {
			return;
		}
		const next = await removeWcCartItem( key );
		setCart( next );
		return next;
	}, [] );

	const lines = useMemo(
		() => ( Array.isArray( cart?.lines ) ? cart.lines : [] ),
		[ cart ]
	);
	const itemCount = cart?.itemCount || 0;
	const subtotal = cart?.subtotal || 0;
	const currency = cart?.currency || getPortal().currency || 'GBP';

	return {
		cart,
		lines,
		itemCount,
		subtotal,
		currency,
		loading,
		error,
		canSync,
		refresh,
		updateQuantity,
		removeLine,
	};
}
