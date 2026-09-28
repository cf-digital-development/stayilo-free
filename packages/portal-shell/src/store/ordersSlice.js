import { createSlice } from '@reduxjs/toolkit';
import { getBootstrapFromWindow } from '../api/portal.js';

function seedOrders() {
	const seed = getBootstrapFromWindow();
	return Array.isArray( seed?.orders ) ? seed.orders : [];
}

const ordersSlice = createSlice( {
	name: 'orders',
	initialState: {
		items: seedOrders(),
	},
	reducers: {
		setOrders( state, action ) {
			state.items = Array.isArray( action.payload ) ? action.payload : [];
		},
		applyBootstrapOrders( state, action ) {
			if ( Array.isArray( action.payload ) ) {
				state.items = action.payload;
			}
		},
	},
} );

export const { setOrders, applyBootstrapOrders } = ordersSlice.actions;

export const selectOrders = ( state ) => state.orders.items;

export default ordersSlice.reducer;
