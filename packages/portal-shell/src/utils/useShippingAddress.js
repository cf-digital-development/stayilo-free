import { useEffect, useMemo, useState } from 'react';
import { useAccount } from '../store/useAccount.js';
import { isPortalActionEnabled } from './portalActions.js';
import { addressToLines } from './validation/editAddressSchema.js';
import { __ } from '@stayilo/design-system/i18n';

/**
 * @param {object} [shipping]
 * @returns {{
 *   name: string,
 *   addressLine1: string,
 *   addressLine2: string,
 *   city: string,
 *   postcode: string,
 * }}
 */
export function shippingToForm( shipping = {} ) {
	return {
		name: shipping.name || '',
		addressLine1: shipping.addressLine1 || shipping.address_1 || '',
		addressLine2: shipping.addressLine2 || shipping.address_2 || '',
		city: shipping.city || '',
		postcode: shipping.postcode || '',
		country: shipping.country || '',
	};
}

/**
 * Local address form state synced from a shipping object, with portal save.
 *
 * @param {object} [shipping]
 */
export function useShippingAddress( shipping = {} ) {
	const { saveAccount } = useAccount();
	const [ addressOpen, setAddressOpen ] = useState( false );
	const [ address, setAddress ] = useState( () => shippingToForm( shipping ) );

	useEffect( () => {
		setAddress( shippingToForm( shipping ) );
	}, [
		shipping.name,
		shipping.addressLine1,
		shipping.address_1,
		shipping.addressLine2,
		shipping.address_2,
		shipping.city,
		shipping.postcode,
		shipping.country,
	] );

	const addressLines = useMemo(
		() => addressToLines( address ),
		[ address ]
	);
	const canUpdateAddress = isPortalActionEnabled( 'update-address' );

	const saveAddress = async ( values ) => {
		setAddress( values );
		try {
			await saveAccount( {
				shipping: {
					name: values.name,
					addressLine1: values.addressLine1,
					addressLine2: values.addressLine2,
					city: values.city,
					postcode: values.postcode,
					country: values.country || address.country || '',
				},
			} );
		} catch ( err ) {
			window.alert( err?.message || __( 'Could not save address', 'stayilo' ) );
		}
	};

	return {
		address,
		addressLines,
		addressOpen,
		setAddressOpen,
		canUpdateAddress,
		saveAddress,
	};
}
