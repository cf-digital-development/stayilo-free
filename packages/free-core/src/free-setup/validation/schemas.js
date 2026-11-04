import * as Yup from 'yup';
import { __ } from '@stayilo/design-system/i18n';
import { validateStep } from '@stayilo/design-system/validation';
import { FREE_PLAN_STEP_INDEX } from '../config/constants';
import { storeUrlSchema } from './storeUrl';

export const connectStoreSchema = Yup.object( {
	storeUrl: storeUrlSchema,
	adminEmail: Yup.string()
		.trim()
		.email( __( 'Enter a valid email', 'stayilo' ) )
		.required( __( 'Admin alert email is required', 'stayilo' ) ),
	marketingOptIn: Yup.boolean(),
	storeConnected: Yup.boolean().oneOf(
		[ true ],
		__( 'Connect your store to continue', 'stayilo' )
	),
} );

export const modeSchema = Yup.object( {
	mode: Yup.string()
		.oneOf( [ 'single', 'multiple' ], __( 'Choose a subscription mode', 'stayilo' ) )
		.required( __( 'Choose a subscription mode', 'stayilo' ) ),
} );

export const STEP_SCHEMAS = {
	[ FREE_PLAN_STEP_INDEX.connect ]: connectStoreSchema,
	[ FREE_PLAN_STEP_INDEX.mode ]: modeSchema,
};

export {
	errorsToTouched,
	getFieldError,
	yupToFormikErrors,
} from '@stayilo/design-system/validation';

export async function validateFreePlanStep( stepIndex, values ) {
	return validateStep( stepIndex, values, STEP_SCHEMAS );
}
