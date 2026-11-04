import { useCallback, useEffect, useRef, useState } from 'react';
import { useCartLines } from './useCartLines.js';
import { useResolvedSubscription } from './useResolvedSubscription.js';

/**
 * Edit/View box: scoped cart lines plus save-status around the shared persist path.
 *
 * @param {string} [preferredId]
 */
export function useSaveSubscriptionBox( preferredId ) {
	const resolved = useResolvedSubscription( preferredId );
	const { subscription, subscriptionId } = resolved;
	const [ saveState, setSaveState ] = useState( {
		status: 'idle',
		message: '',
	} );
	const {
		lines,
		updateQuantity,
		removeLine,
		addProduct: addCartProduct,
		loadFromSubscription,
		setSelectedSubscriptionId,
	} = useCartLines( subscriptionId, { onPersistState: setSaveState } );
	const loadedId = useRef( '' );

	useEffect( () => {
		if ( ! subscription?.id ) {
			return;
		}
		const id = String( subscription.id );
		setSelectedSubscriptionId( id );
		if ( loadedId.current === id ) {
			return;
		}
		loadedId.current = id;
		loadFromSubscription( subscription );
	}, [ subscription, loadFromSubscription, setSelectedSubscriptionId ] );

	const addProduct = useCallback(
		( product ) => {
			addCartProduct( {
				...product,
				subscriptionId: product.subscriptionId || subscriptionId,
			} );
		},
		[ addCartProduct, subscriptionId ]
	);

	return {
		...resolved,
		lines,
		saveState,
		updateQuantity,
		removeLine,
		addProduct,
	};
}
