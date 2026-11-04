import * as Yup from 'yup';
import { personNameField } from './commonSchema.js';

export const accountProfileSchema = Yup.object( {
	fullName: personNameField( 'Full name' ),
	email: Yup.string()
		.trim()
		.required( 'Email address is required' )
		.max( 254, 'Email address is too long' )
		.email( 'Enter a valid email address' ),
} );

export const accountPasswordSchema = Yup.object( {
	currentPassword: Yup.string()
		.required( 'Current password is required' ),
	newPassword: Yup.string()
		.required( 'New password is required' )
		.min( 8, 'New password must be at least 8 characters' )
		.max( 128, 'New password must be at most 128 characters' )
		.matches( /[a-z]/, 'New password must include a lowercase letter' )
		.matches( /[A-Z]/, 'New password must include an uppercase letter' )
		.matches( /\d/, 'New password must include a number' )
		.matches(
			/[^A-Za-z0-9]/,
			'New password must include a special character'
		)
		.notOneOf(
			[ Yup.ref( 'currentPassword' ) ],
			'New password must be different from current password'
		),
	confirmPassword: Yup.string()
		.required( 'Confirm your new password' )
		.oneOf( [ Yup.ref( 'newPassword' ) ], 'Passwords must match' ),
} );
