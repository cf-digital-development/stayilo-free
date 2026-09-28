import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
	addProduct as addProductAction,
	loadFromSubscription as loadFromSubscriptionAction,
	removeLine as removeLineAction,
	selectCartLines,
	selectSelectedSubscriptionId,
	setLines as setLinesAction,
	setSelectedSubscriptionId as setSelectedSubscriptionIdAction,
	updateQuantity as updateQuantityAction,
} from './cartSlice.js';
import { __ } from '@stayilo/design-system/i18n';
import { selectSubscriptions } from './subscriptionsSlice.js';
import { getPortal } from '../api/portal.js';
import { useSubscriptions } from './useSubscriptions.js';
import {
	addProductToCart,
	buildBoxTotalProps,
	filterActiveSubscriptionLines,
	filterCartLinesBySubscription,
	normalizeCartLines,
	removeCartLine,
	subscriptionIdOf,
	sumCartLines,
	updateLineQuantity,
} from '../utils/cartLines.js';
import { isSubscriptionCanceled } from '../utils/subscriptionOverview.js';
import {
	hasPortalActionNonce,
	isPortalActionEnabled,
} from '../utils/portalActions.js';

/**
 * Cart lines from the Redux store — synced to WooCommerce on edit (Core+).
 * Pass a subscription id to read/write that box only; otherwise the header
 * cart follows the selected plan, or every box when none is selected.
 *
 * @param {string|number} [scopeSubscriptionId]
 * @param {{ onPersistState?: (state: { status: string, message: string }) => void }} [persistOptions]
 */
export function useCartLines( scopeSubscriptionId, persistOptions = {} ) {
	const dispatch = useDispatch();
	const { updateBox } = useSubscriptions();
	const rawLines = useSelector( selectCartLines );
	const subscriptions = useSelector( selectSubscriptions );
	const selectedSubscriptionId = useSelector( selectSelectedSubscriptionId );
	const scopedId =
		scopeSubscriptionId !== undefined && scopeSubscriptionId !== null
			? subscriptionIdOf( scopeSubscriptionId )
			: selectedSubscriptionId;
	const persistTimers = useRef( {} );
	const onPersistStateRef = useRef( persistOptions.onPersistState );
	onPersistStateRef.current = persistOptions.onPersistState;

	useEffect( () => {
		const timers = persistTimers.current;
		return () => {
			Object.values( timers ).forEach( ( timer ) => {
				window.clearTimeout( timer );
			} );
		};
	}, [] );

	const lines = useMemo(
		() =>
			filterActiveSubscriptionLines(
				filterCartLinesBySubscription( rawLines, scopedId ),
				subscriptions
			),
		[ rawLines, scopedId, subscriptions ]
	);
	const allLines = useMemo(
		() =>
			filterActiveSubscriptionLines(
				normalizeCartLines( rawLines ),
				subscriptions
			),
		[ rawLines, subscriptions ]
	);

	const persistBox = useCallback(
		( subscriptionId, nextLines ) => {
			const id = subscriptionIdOf( subscriptionId );
			if ( ! id ) {
				return;
			}
			const subscription = subscriptions.find(
				( card ) => String( card.id ) === id
			);
			if ( isSubscriptionCanceled( subscription?.status ) ) {
				return;
			}
			if (
				! isPortalActionEnabled( 'edit-items' ) ||
				! hasPortalActionNonce( 'editItemsNonce' )
			) {
				return;
			}
			if ( ! getPortal().ajaxUrl ) {
				return;
			}

			window.clearTimeout( persistTimers.current[ id ] );
			onPersistStateRef.current?.( { status: 'pending', message: '' } );
			persistTimers.current[ id ] = window.setTimeout( async () => {
				const report = onPersistStateRef.current;
				report?.( { status: 'saving', message: '' } );
				try {
					await updateBox( id, nextLines );
					report?.( { status: 'saved', message: '' } );
				} catch ( err ) {
					report?.( {
						status: 'error',
						message:
							err?.message ||
							__( 'Could not update your WooCommerce subscription.', 'stayilo' ),
					} );
					const subscription = subscriptions.find(
						( card ) => String( card.id ) === id
					);
					if ( subscription ) {
						dispatch( loadFromSubscriptionAction( subscription ) );
					}
				}
			}, 400 );
		},
		[ dispatch, subscriptions, updateBox ]
	);

	const updateQuantity = useCallback(
		( id, quantity, options ) => {
			const subscriptionId =
				typeof options === 'string'
					? options
					: options?.subscriptionId || scopedId;
			const qtyOptions =
				typeof options === 'object' && options ? options : undefined;
			dispatch(
				updateQuantityAction( {
					id,
					quantity,
					options: qtyOptions,
					subscriptionId,
				} )
			);
			const nextAll = updateLineQuantity(
				rawLines,
				String( id ),
				quantity,
				{ ...( qtyOptions || {} ), subscriptionId }
			);
			persistBox(
				subscriptionId,
				filterCartLinesBySubscription( nextAll, subscriptionId )
			);
		},
		[ dispatch, persistBox, rawLines, scopedId ]
	);

	const removeLine = useCallback(
		( id, meta ) => {
			const subscriptionId =
				typeof meta === 'string'
					? meta
					: meta?.subscriptionId || scopedId;
			dispatch( removeLineAction( { id, subscriptionId } ) );
			const nextAll = removeCartLine(
				rawLines,
				String( id ),
				subscriptionId
			);
			persistBox(
				subscriptionId,
				filterCartLinesBySubscription( nextAll, subscriptionId )
			);
		},
		[ dispatch, persistBox, rawLines, scopedId ]
	);

	const setLines = useCallback(
		( next ) => {
			dispatch(
				setLinesAction(
					scopedId
						? { lines: next, subscriptionId: scopedId }
						: next
				)
			);
		},
		[ dispatch, scopedId ]
	);

	const loadFromSubscription = useCallback(
		( subscription ) => {
			dispatch( loadFromSubscriptionAction( subscription ) );
		},
		[ dispatch ]
	);

	const addProduct = useCallback(
		( product ) => {
			const subscriptionId =
				subscriptionIdOf( product?.subscriptionId ) || scopedId;
			dispatch(
				addProductAction( {
					...product,
					subscriptionId,
				} )
			);
			const nextScoped = addProductToCart(
				filterCartLinesBySubscription( rawLines, subscriptionId ),
				{ ...product, subscriptionId }
			);
			persistBox( subscriptionId, nextScoped );
		},
		[ dispatch, persistBox, rawLines, scopedId ]
	);

	const setSelectedSubscriptionId = useCallback(
		( subscriptionId ) => {
			dispatch(
				setSelectedSubscriptionIdAction(
					subscriptionIdOf( subscriptionId )
				)
			);
		},
		[ dispatch ]
	);

	const subtotal = useMemo( () => sumCartLines( lines ), [ lines ] );
	const itemCount = useMemo(
		() =>
			lines.reduce(
				( sum, line ) => sum + ( Number( line.quantity ) || 0 ),
				0
			),
		[ lines ]
	);

	return {
		lines,
		allLines,
		selectedSubscriptionId,
		subtotal,
		itemCount,
		setLines,
		setSelectedSubscriptionId,
		updateQuantity,
		removeLine,
		loadFromSubscription,
		addProduct,
	};
}

/**
 * Build BoxTotalCard props from current cart lines.
 *
 * @param {object} [options]
 * @param {string} [options.currency]
 * @param {object} [options.defaults]
 * @param {Array<object>} [options.lines]
 * @param {string|number} [options.subscriptionId]
 * @param {object} [options.orderSummary]
 * @param {number} [options.discountPercent]
 * @param {number} [options.discountTotal]
 * @param {string} [options.discountLabel]
 * @param {number} [options.shippingTotal]
 * @param {string} [options.shippingLabel]
 */
export function useBoxTotalProps( options = {} ) {
	const { lines: storeLines } = useCartLines( options.subscriptionId );
	const lines = options.lines ?? storeLines;
	const {
		currency = 'GBP',
		defaults = {},
		orderSummary,
		discountPercent = 0,
		discountTotal = 0,
		discountLabel,
		shippingTotal = 0,
		shippingLabel,
	} = options;

	return useMemo(
		() =>
			buildBoxTotalProps( lines, {
				currency,
				label: defaults.label,
				summaryTitle: defaults.summaryTitle,
				orderSummary,
				discountPercent,
				discountTotal,
				discountLabel,
				shippingTotal,
				shippingLabel,
			} ),
		[
			lines,
			currency,
			defaults.label,
			defaults.summaryTitle,
			orderSummary,
			discountPercent,
			discountTotal,
			discountLabel,
			shippingTotal,
			shippingLabel,
		]
	);
}
