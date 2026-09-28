import { __, sprintf } from '@stayilo/design-system/i18n';
import * as Yup from 'yup';

export const PERSON_NAME = /^[A-Za-z]+(?:[ '\-][A-Za-z]+)*$/;
export const UK_POSTCODE =
	/^([A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}|GIR\s*0AA)$/i;

/**
 * Shared person-name field (full name, cardholder name, etc.).
 *
 * @param {string} [label='Name']
 * @returns {Yup.StringSchema}
 */
export function personNameField( label = __( 'Name', 'stayilo' ) ) {
	return Yup.string()
		.trim()
		.required( sprintf( __( '%s is required', 'stayilo' ), label ) )
		.min( 2, sprintf( __( '%s must be at least 2 characters', 'stayilo' ), label ) )
		.max( 80, sprintf( __( '%s must be at most 80 characters', 'stayilo' ), label ) )
		.matches( PERSON_NAME, sprintf( __( 'Enter a valid %s', 'stayilo' ), label.toLowerCase() ) );
}

export const addressLine1Field = Yup.string()
	.trim()
	.required( __( 'Address line 1 is required', 'stayilo' ) )
	.min( 3, __( 'Address line 1 must be at least 3 characters', 'stayilo' ) )
	.max( 100, __( 'Address line 1 must be at most 100 characters', 'stayilo' ) );

export const addressLine2Field = Yup.string()
	.trim()
	.max( 100, __( 'Address line 2 must be at most 100 characters', 'stayilo' ) );

export const cityField = Yup.string()
	.trim()
	.required( __( 'City is required', 'stayilo' ) )
	.min( 2, __( 'City must be at least 2 characters', 'stayilo' ) )
	.max( 60, __( 'City must be at most 60 characters', 'stayilo' ) )
	.matches( PERSON_NAME, __( 'Enter a valid city name', 'stayilo' ) );

export const postcodeField = Yup.string()
	.trim()
	.required( __( 'Postcode is required', 'stayilo' ) )
	.matches( UK_POSTCODE, __( 'Enter a valid UK postcode', 'stayilo' ) );

/** Shared UK address fields used by edit-address and add-card schemas. */
export const addressFieldsSchema = {
	addressLine1: addressLine1Field,
	addressLine2: addressLine2Field,
	city: cityField,
	postcode: postcodeField,
};
