import * as Yup from 'yup';
import { personNameField } from './commonSchema.js';

const digitsOnly = ( value ) => String( value ?? '' ).replace( /\D/g, '' );

export const addPaymentCardSchema = Yup.object( {
	name: personNameField( 'Name' ),
} );

/**
 * @param {string} cardNumber
 * @returns {string}
 */
export function cardLast4( cardNumber ) {
	const digits = digitsOnly( cardNumber );
	return digits.slice( -4 );
}

/**
 * Card brand for WC_Payment_Token_CC — derived from BIN, never stored as PAN.
 *
 * @param {string} cardNumber
 * @returns {string}
 */
export function cardBrandFromNumber( cardNumber ) {
	const digits = digitsOnly( cardNumber );
	if ( /^3[47]/.test( digits ) ) {
		return 'amex';
	}
	if ( /^(5[1-5]|2[2-7])/.test( digits ) ) {
		return 'mastercard';
	}
	if ( /^(6011|65|64[4-9]|622)/.test( digits ) ) {
		return 'discover';
	}
	if ( /^3(?:0[0-5]|[68])/.test( digits ) ) {
		return 'diners';
	}
	if ( /^35/.test( digits ) ) {
		return 'jcb';
	}
	if ( /^62/.test( digits ) ) {
		return 'unionpay';
	}
	return 'visa';
}
