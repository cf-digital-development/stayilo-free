import { useCallback } from 'react';
import { useSelector } from 'react-redux';
import { selectOrders } from './ordersSlice.js';

/**
 * Recent customer orders (Redux).
 */
export function useOrders() {
	const orders = useSelector( selectOrders );

	const getOrder = useCallback(
		( orderId ) =>
			orders.find( ( order ) => String( order.id ) === String( orderId ) ),
		[ orders ]
	);

	return { orders, getOrder };
}
