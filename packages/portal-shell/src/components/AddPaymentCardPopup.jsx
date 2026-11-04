import { useEffect, useRef, useState } from 'react';
import { Formik, Form } from 'formik';
import { Button } from './Button.jsx';
import { Field } from './Field.jsx';
import { PortalPopup } from './PortalPopup.jsx';
import { StripeInsetField } from './StripeInsetField.jsx';
import {
	createPortalPaymentSetupIntent,
	getAddPaymentMethodUrl,
} from '../api/portal.js';
import { addPaymentCardSchema } from '../utils/validation/addPaymentCardSchema.js';
import {
	getStripe,
	getStripeConfig,
	STRIPE_ELEMENT_STYLE,
} from '../utils/stripe.js';
import { useTemplateRecipe } from '../templates/TemplateProvider.jsx';
import { __ } from '@stayilo/design-system/i18n';

const EMPTY_VALUES = {
	name: '',
};

/**
 * Add payment card popup — classic stacked layout; card fields via Stripe Elements.
 *
 * @param {object} props
 * @param {boolean} props.open
 * @param {() => void} props.onClose
 * @param {(values: object) => void|Promise<void>} [props.onSave]
 */
export function AddPaymentCardPopup( { open, onClose, onSave } ) {
	const { id } = useTemplateRecipe();
	const isClassic = id === 'classic';
	const [ stripeFields, setStripeFields ] = useState( null );
	const [ stripeReady, setStripeReady ] = useState( false );
	const [ stripeInitError, setStripeInitError ] = useState( '' );
	const [ cardErrors, setCardErrors ] = useState( {
		cardNumber: '',
		expiry: '',
		cvv: '',
	} );
	const cardCompleteRef = useRef( {
		cardNumber: false,
		expiry: false,
		cvv: false,
	} );

	useEffect( () => {
		if ( ! open ) {
			setStripeFields( null );
			setStripeReady( false );
			setStripeInitError( '' );
			setCardErrors( { cardNumber: '', expiry: '', cvv: '' } );
			cardCompleteRef.current = {
				cardNumber: false,
				expiry: false,
				cvv: false,
			};
			return undefined;
		}

		const config = getStripeConfig();
		if ( ! config.available ) {
			const url = getAddPaymentMethodUrl();
			if ( url ) {
				window.location.assign( url );
			} else {
				setStripeInitError(
					'Stripe is not configured. Add a card with your payment provider instead.'
				);
			}
			return undefined;
		}

		let cancelled = false;
		let cardNumber;
		let cardExpiry;
		let cardCvc;
		let stripeInstance;

		( async () => {
			try {
				stripeInstance = await getStripe();
				if ( cancelled || ! stripeInstance ) {
					if ( ! cancelled ) {
						setStripeInitError(
							'Could not load Stripe. Please try again.'
						);
					}
					return;
				}

				const elements = stripeInstance.elements();
				const options = {
					style: STRIPE_ELEMENT_STYLE,
					placeholder: ' ',
				};

				cardNumber = elements.create( 'cardNumber', {
					...options,
					disableLink: true,
					showIcon: false,
				} );
				cardExpiry = elements.create( 'cardExpiry', options );
				cardCvc = elements.create( 'cardCvc', options );

				const bindComplete = ( key, element ) => {
					element.on( 'change', ( event ) => {
						cardCompleteRef.current[ key ] = Boolean(
							event.complete
						);
						setCardErrors( ( prev ) => ( {
							...prev,
							[ key ]: event.error?.message || '',
						} ) );
					} );
				};

				bindComplete( 'cardNumber', cardNumber );
				bindComplete( 'expiry', cardExpiry );
				bindComplete( 'cvv', cardCvc );

				if ( cancelled ) {
					cardNumber.destroy();
					cardExpiry.destroy();
					cardCvc.destroy();
					return;
				}

				setStripeFields( {
					stripe: stripeInstance,
					cardNumber,
					cardExpiry,
					cardCvc,
				} );
				setStripeReady( true );
			} catch ( err ) {
				if ( ! cancelled ) {
					setStripeInitError(
						err?.message || __( 'Could not load Stripe. Please try again.', 'stayilo' )
					);
				}
			}
		} )();

		return () => {
			cancelled = true;
			cardNumber?.destroy();
			cardExpiry?.destroy();
			cardCvc?.destroy();
			setStripeFields( null );
			setStripeReady( false );
		};
	}, [ open ] );

	return (
		<PortalPopup
			open={ open }
			onClose={ onClose }
			title={ __( 'Add a new card', 'stayilo' ) }
			description={ __( 'Enter your card and billing details to save this payment method.', 'stayilo' ) }
			className={ isClassic ? 'portal-popup-overlay--address' : '' }
			contentClassName="portal-popup--address"
		>
			<Formik
				initialValues={ EMPTY_VALUES }
				enableReinitialize
				validationSchema={ addPaymentCardSchema }
				onSubmit={ async ( values, helpers ) => {
					helpers.setStatus( undefined );
					try {
						if ( ! stripeFields?.stripe || ! stripeFields.cardNumber ) {
							throw new Error(
								stripeInitError ||
									__( 'Stripe is not ready. Please try again.', 'stayilo' )
							);
						}

						const nextErrors = {
							cardNumber: cardCompleteRef.current.cardNumber
								? ''
								: __( 'Card number is required', 'stayilo' ),
							expiry: cardCompleteRef.current.expiry
								? ''
								: __( 'Expiry is required', 'stayilo' ),
							cvv: cardCompleteRef.current.cvv
								? ''
								: __( 'CVV is required', 'stayilo' ),
						};
						setCardErrors( ( prev ) => ( {
							cardNumber: prev.cardNumber || nextErrors.cardNumber,
							expiry: prev.expiry || nextErrors.expiry,
							cvv: prev.cvv || nextErrors.cvv,
						} ) );
						if (
							! cardCompleteRef.current.cardNumber ||
							! cardCompleteRef.current.expiry ||
							! cardCompleteRef.current.cvv
						) {
							return;
						}

						const intent = await createPortalPaymentSetupIntent();
						const clientSecret = intent?.client_secret;
						if ( ! clientSecret ) {
							throw new Error(
								__( 'Could not start card setup. Please try again.', 'stayilo' )
							);
						}

						const result = await stripeFields.stripe.confirmCardSetup(
							clientSecret,
							{
								payment_method: {
									card: stripeFields.cardNumber,
									billing_details: {
										name: values.name.trim(),
									},
								},
							}
						);

						if ( result.error ) {
							throw new Error(
								result.error.message ||
									__( 'Could not save that card', 'stayilo' )
							);
						}

						const setupIntent = result.setupIntent;
						await onSave?.( {
							name: values.name.trim(),
							setup_intent: setupIntent?.id || '',
							payment_method:
								typeof setupIntent?.payment_method === 'string'
									? setupIntent.payment_method
									: setupIntent?.payment_method?.id || '',
						} );
						helpers.resetForm();
						onClose?.();
					} catch ( err ) {
						if ( err?.redirect ) {
							window.location.assign( err.redirect );
							return;
						}
						helpers.setStatus(
							err?.message || __( 'Could not save that card', 'stayilo' )
						);
					} finally {
						helpers.setSubmitting( false );
					}
				} }
			>
				{ ( { isSubmitting, status } ) => (
					<Form
						className={ [
							'portal-edit-address-form w-full',
							isClassic
								? 'portal-edit-address-form--classic'
								: 'mt-8',
						]
							.filter( Boolean )
							.join( ' ' ) }
						noValidate
					>
						{ status || stripeInitError ? (
							<p
								className="mb-3 text-sm font-medium text-[#C00808]"
								role="alert"
							>
								{ status || stripeInitError }
							</p>
						) : null }

						{ /* Classic: stacked white rows; default: spaced column */ }
						<div
							className={
								isClassic
									? 'portal-edit-address-card'
									: 'flex w-full flex-col gap-3'
							}
						>
							<Field
								name="name"
								label={ __( 'Name on card', 'stayilo' ) }
								variant="inset"
								autoComplete="cc-name"
							/>
							<StripeInsetField
								label={ __( 'Card number', 'stayilo' ) }
								element={ stripeFields?.cardNumber ?? null }
								error={ cardErrors.cardNumber }
							/>
							{ isClassic ? (
								<>
									<StripeInsetField
										label={ __( 'Expiry (MM / YY)', 'stayilo' ) }
										element={
											stripeFields?.cardExpiry ?? null
										}
										error={ cardErrors.expiry }
									/>
									<StripeInsetField
										label={ __( 'CVV', 'stayilo' ) }
										element={
											stripeFields?.cardCvc ?? null
										}
										error={ cardErrors.cvv }
									/>
								</>
							) : (
								<div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2">
									<StripeInsetField
										label={ __( 'Expiry (MM / YY)', 'stayilo' ) }
										element={
											stripeFields?.cardExpiry ?? null
										}
										error={ cardErrors.expiry }
									/>
									<StripeInsetField
										label={ __( 'CVV', 'stayilo' ) }
										element={
											stripeFields?.cardCvc ?? null
										}
										error={ cardErrors.cvv }
									/>
								</div>
							) }
						</div>

						{ isClassic ? (
							<div className="portal-popup__actions portal-edit-address-form__actions">
								<Button
									type="submit"
									label={ __( 'Save changes', 'stayilo' ) }
									variant="primary"
									disabled={
										isSubmitting ||
										! stripeReady ||
										Boolean( stripeInitError )
									}
									className="portal-popup__action portal-edit-address-form__save"
								/>
								<Button
									type="button"
									label={ __( 'Cancel', 'stayilo' ) }
									variant="secondary"
									showIcon={ false }
									disabled={ isSubmitting }
									onClick={ onClose }
									className="portal-popup__action portal-edit-address-form__cancel"
								/>
							</div>
						) : (
							<div className="mt-8 w-full">
								<Button
									type="submit"
									label={ __( 'Save Card', 'stayilo' ) }
									variant="primary"
									showIcon={ false }
									disabled={
										isSubmitting ||
										! stripeReady ||
										Boolean( stripeInitError )
									}
									className="portal-edit-address-form__submit"
								/>
							</div>
						) }
					</Form>
				) }
			</Formik>
		</PortalPopup>
	);
}
