import { Formik, Form } from 'formik';
import { Button } from './Button.jsx';
import { Field } from './Field.jsx';
import { PortalPopup } from './PortalPopup.jsx';
import { editAddressSchema } from '../utils/validation/editAddressSchema.js';
import { useTemplateRecipe } from '../templates/TemplateProvider.jsx';
import { __, sprintf } from '@stayilo/design-system/i18n';

function formatCountryName( code ) {
	const trimmed = String( code || '' ).trim();
	if ( ! trimmed ) {
		return '';
	}
	if ( trimmed.length === 2 ) {
		try {
			return (
				new Intl.DisplayNames( [ 'en' ], { type: 'region' } ).of(
					trimmed.toUpperCase()
				) || trimmed
			);
		} catch {
			return trimmed;
		}
	}
	return trimmed;
}

/**
 * Edit delivery address popup — Formik + Yup.
 *
 * @param {object} props
 * @param {boolean} props.open
 * @param {() => void} props.onClose
 * @param {string} [props.estimateLabel]
 * @param {{
 *   name: string,
 *   addressLine1: string,
 *   addressLine2?: string,
 *   city: string,
 *   postcode: string,
 *   country?: string,
 * }} props.initialValues
 * @param {(values: object) => void} [props.onSave]
 * @param {string} [props.descriptionClassName] - Override description styles; omit to keep `.portal-popup__description`.
 */
export function EditAddressPopup( {
	open,
	onClose,
	estimateLabel = 'Sun, Aug 17',
	initialValues,
	onSave,
	descriptionClassName = '',
} ) {
	const { id } = useTemplateRecipe();
	const isClassic = id === 'classic';
	const countryName = formatCountryName( initialValues?.country );

	return (
		<PortalPopup
			open={ open }
			onClose={ onClose }
			title={ isClassic ? __( 'Edit delivery address', 'stayilo' ) : __( 'Edit your address', 'stayilo' ) }
			description={ sprintf( __( 'Your order is estimated to arrive on %s', 'stayilo' ), estimateLabel ) }
			descriptionClassName={ descriptionClassName }
			className={ isClassic ? 'portal-popup-overlay--address' : '' }
			contentClassName="portal-popup--address"
		>
			<Formik
				initialValues={ {
					name: initialValues?.name ?? '',
					addressLine1: initialValues?.addressLine1 ?? '',
					addressLine2: initialValues?.addressLine2 ?? '',
					city: initialValues?.city ?? '',
					postcode: initialValues?.postcode ?? '',
				} }
				enableReinitialize
				validationSchema={ editAddressSchema }
				onSubmit={ ( values, helpers ) => {
					onSave?.( values );
					helpers.setSubmitting( false );
					onClose?.();
				} }
			>
				{ ( { isSubmitting } ) => (
					<Form
						className={ [
							'portal-edit-address-form w-full',
							isClassic
								? 'portal-edit-address-form--classic'
								: 'mt-6',
						]
							.filter( Boolean )
							.join( ' ' ) }
						noValidate
					>
						<div
							className={
								isClassic
									? 'portal-edit-address-card'
									: 'flex w-full flex-col gap-4'
							}
						>
							<Field
								name="name"
								label={ __( 'Name', 'stayilo' ) }
								variant="inset"
								autoComplete="name"
							/>
							<Field
								name="addressLine1"
								label={ __( 'Address line 1', 'stayilo' ) }
								variant="inset"
								autoComplete="address-line1"
							/>
							<Field
								name="addressLine2"
								label={ __( 'Address line 2 (Optional)', 'stayilo' ) }
								variant="inset"
								autoComplete="address-line2"
								placeholder={
									isClassic ? __( 'Enter address', 'stayilo' ) : undefined
								}
							/>
							<Field
								name="city"
								label={ __( 'City', 'stayilo' ) }
								variant="inset"
								autoComplete="address-level2"
							/>
							<Field
								name="postcode"
								label={ __( 'Postcode', 'stayilo' ) }
								variant="inset"
								autoComplete="postal-code"
							/>
							
						</div>

						{ isClassic ? (
							<div className="portal-popup__actions portal-edit-address-form__actions">
								<Button
									type="submit"
									label={ __( 'Save changes', 'stayilo' ) }
									variant="primary"
									disabled={ isSubmitting }
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
							<div className="mt-4 w-full">
								<Button
									type="submit"
									label={ __( 'Save Changes', 'stayilo' ) }
									variant="primary"
									showIcon={ false }
									disabled={ isSubmitting }
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
