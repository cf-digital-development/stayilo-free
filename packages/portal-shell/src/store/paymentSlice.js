import { createSlice } from '@reduxjs/toolkit';
import { getBootstrapFromWindow } from '../api/portal.js';

function seedPayment() {
	const seed = getBootstrapFromWindow();
	return {
		methods: Array.isArray( seed?.paymentMethods )
			? seed.paymentMethods
			: [],
		history: Array.isArray( seed?.paymentHistory )
			? seed.paymentHistory
			: [],
	};
}

const paymentSlice = createSlice( {
	name: 'payment',
	initialState: seedPayment(),
	reducers: {
		setPaymentMethods( state, action ) {
			state.methods = Array.isArray( action.payload ) ? action.payload : [];
		},
		setPaymentHistory( state, action ) {
			state.history = Array.isArray( action.payload ) ? action.payload : [];
		},
		makeDefaultMethod( state, action ) {
			const methodId = String( action.payload || '' );
			state.methods = state.methods.map( ( method ) => ( {
				...method,
				isDefault: String( method.id ) === methodId,
			} ) );
		},
		removePaymentMethod( state, action ) {
			const methodId = String( action.payload || '' );
			const next = state.methods.filter(
				( method ) => String( method.id ) !== methodId
			);
			if ( next.length === 0 || next.some( ( method ) => method.isDefault ) ) {
				state.methods = next;
				return;
			}
			state.methods = next.map( ( method, index ) => ( {
				...method,
				isDefault: index === 0,
			} ) );
		},
		addPaymentMethod( state, action ) {
			const method = action.payload;
			if ( ! method ) {
				return;
			}
			const next = method.isDefault
				? state.methods.map( ( item ) => ( { ...item, isDefault: false } ) )
				: state.methods;
			state.methods = [ ...next, method ];
		},
		applyBootstrapPayment( state, action ) {
			const data = action.payload || {};
			if ( Array.isArray( data.paymentMethods ) ) {
				state.methods = data.paymentMethods;
			}
			if ( Array.isArray( data.paymentHistory ) ) {
				state.history = data.paymentHistory;
			}
		},
	},
} );

export const {
	setPaymentMethods,
	setPaymentHistory,
	makeDefaultMethod,
	removePaymentMethod,
	addPaymentMethod,
	applyBootstrapPayment,
} = paymentSlice.actions;

export const selectPaymentMethods = ( state ) => state.payment.methods;
export const selectPaymentHistory = ( state ) => state.payment.history;

export default paymentSlice.reducer;
