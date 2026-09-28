import * as Yup from 'yup';
import { addressFieldsSchema, personNameField } from './commonSchema.js';

export const editAddressSchema = Yup.object( {
	name: personNameField( 'Name' ),
	...addressFieldsSchema,
} );

/**
 * Build display lines from structured address form values.
 *
 * @param {{ name: string, addressLine1: string, addressLine2?: string, city: string, postcode: string }} address
 * @returns {string[]}
 */
export function addressToLines( address ) {
	if ( ! address ) {
		return [];
	}
	return [
		address.name,
		address.addressLine1,
		address.addressLine2,
		address.city,
		address.postcode,
	].filter( Boolean );
}
