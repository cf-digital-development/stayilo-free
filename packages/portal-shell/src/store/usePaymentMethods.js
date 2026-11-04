import { useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
	addPortalPaymentMethod,
	deletePortalPaymentMethod,
	setDefaultPortalPaymentMethod,
	syncWindowBootstrap,
} from '../api/portal.js';
import { __ } from '@stayilo/design-system/i18n';
import {
	selectPaymentHistory,
	selectPaymentMethods,
	setPaymentMethods,
} from './paymentSlice.js';

/**
 * Payment methods + history. Mutations persist via WC_Payment_Tokens.
 */
export function usePaymentMethods() {
	const dispatch = useDispatch();
	const methods = useSelector( selectPaymentMethods );
	const history = useSelector( selectPaymentHistory );
	const [ error, setError ] = useState( '' );

	const applyMethods = useCallback(
		( next ) => {
			if ( ! Array.isArray( next ) ) {
				return;
			}
			dispatch( setPaymentMethods( next ) );
			syncWindowBootstrap( { paymentMethods: next } );
		},
		[ dispatch ]
	);

	const makeDefault = useCallback(
		async ( methodId ) => {
			setError( '' );
			try {
				const data = await setDefaultPortalPaymentMethod( methodId );
				applyMethods( data?.paymentMethods );
			} catch ( err ) {
				setError( err?.message || __( 'Could not update default card', 'stayilo' ) );
			}
		},
		[ applyMethods ]
	);

	const removeMethod = useCallback(
		async ( methodId ) => {
			setError( '' );
			try {
				const data = await deletePortalPaymentMethod( methodId );
				applyMethods( data?.paymentMethods );
			} catch ( err ) {
				setError( err?.message || __( 'Could not remove card', 'stayilo' ) );
			}
		},
		[ applyMethods ]
	);

	const addMethod = useCallback(
		async ( values ) => {
			setError( '' );
			const data = await addPortalPaymentMethod( {
				name: values.name,
				setup_intent: values.setup_intent || '',
				payment_method: values.payment_method || '',
			} );
			applyMethods( data?.paymentMethods );
		},
		[ applyMethods ]
	);

	return {
		methods,
		history,
		error,
		makeDefault,
		removeMethod,
		addMethod,
		readOnly: false,
	};
}
