import { useEffect, useRef, useState } from 'react';
import { useField } from 'formik';
import { ReactComponent as EyeIcon } from '@stayilo/design-system/assets/svg/Eye.svg';
import { __ } from '@stayilo/design-system/i18n';

/**
 * Shared portal form field — Formik-connected label + input.
 *
 * @param {object} props
 * @param {string} props.name - Formik field name.
 * @param {string} props.label
 * @param {string} [props.type='text']
 * @param {string} [props.autoComplete]
 * @param {string} [props.placeholder]
 * @param {'default'|'inset'} [props.variant='default']
 *   - `default`: label above the input.
 *   - `inset`: label stacked inside the bordered field (edit-address popup).
 * @param {boolean} [props.showPasswordToggle] - Override; defaults true for type=password.
 * @param {string} [props.className]
 * @param {string} [props.inputClassName]
 * @param {(value: string, previousValue: string) => string} [props.formatValue]
 *   Transform input on change (e.g. MM / YY mask). Receives the previous formatted value as the second argument.
 */
export function Field( {
	name,
	label,
	type = 'text',
	autoComplete,
	placeholder,
	variant = 'default',
	showPasswordToggle,
	className = '',
	inputClassName = '',
	formatValue,
	...rest
} ) {
	const [ field, meta ] = useField( { name, type, ...rest } );
	const previousValueRef = useRef( field.value );
	const [ passwordVisible, setPasswordVisible ] = useState( false );

	useEffect( () => {
		previousValueRef.current = field.value;
	}, [ field.value ] );
	const hasError = Boolean( meta.touched && meta.error );
	const inputId = rest.id || name;
	const isPassword = type === 'password';
	const canToggle = isPassword && showPasswordToggle !== false;
	const inputType = canToggle && passwordVisible ? 'text' : type;
	const isInset = variant === 'inset';
	const isEmpty = String( field.value ?? '' ).length === 0;

	const handleChange = formatValue
		? ( event ) => {
			const value = formatValue(
				event.target.value,
				String( previousValueRef.current ?? '' )
			);
			previousValueRef.current = value;
			field.onChange( {
				...event,
				target: { ...event.target, name: field.name, value },
			} );
		}
		: field.onChange;

	const input = (
		<input
			{ ...field }
			onChange={ handleChange }
			id={ inputId }
			type={ inputType }
			placeholder={ placeholder }
			autoComplete={ autoComplete }
			aria-invalid={ hasError || undefined }
			aria-describedby={ hasError ? `${ inputId }-error` : undefined }
			className={ [
				isInset ? 'portal-field-inset__input' : 'portal-account-field',
				! isInset && canToggle ? 'portal-account-field--with-toggle' : '',
				! isInset && hasError ? 'portal-account-field--error' : '',
				inputClassName,
			].filter( Boolean ).join( ' ' ) }
		/>
	);

	const toggle = canToggle ? (
		<button
			type="button"
			className="portal-account-field__toggle"
			aria-label={ passwordVisible ? __( 'Hide password', 'stayilo' ) : __( 'Show password', 'stayilo' ) }
			aria-pressed={ passwordVisible }
			onClick={ () => setPasswordVisible( ( prev ) => ! prev ) }
		>
			<EyeIcon
				width={ 20 }
				height={ 20 }
				aria-hidden="true"
				className={ [
					'[&_path]:stroke-current',
					passwordVisible ? 'opacity-100' : 'opacity-50',
				].join( ' ' ) }
			/>
		</button>
	) : null;

	const error = hasError ? (
		<span
			id={ `${ inputId }-error` }
			className="mt-1.5 block text-left text-sm leading-5 text-[#C00808] input-error"
			role="alert"
		>
			{ meta.error }
		</span>
	) : null;

	if ( isInset ) {
		return (
			<div className={ [ 'w-full text-left', className ].filter( Boolean ).join( ' ' ) }>
				<label
					htmlFor={ inputId }
					className={ [
						'portal-field-inset',
						isEmpty ? 'portal-field-inset--empty' : '',
						hasError ? 'portal-field-inset--error' : '',
					].filter( Boolean ).join( ' ' ) }
				>
					<span className="portal-field-inset__label">{ label }</span>
					{ input }
				</label>
				{ error }
			</div>
		);
	}

	return (
		<label className={ [ 'block', className ].filter( Boolean ).join( ' ' ) } htmlFor={ inputId }>
			<span className="mb-1.5 block text-sm font-normal leading-5 text-[#101010]">{ label }</span>
			<div className="relative">
				{ input }
				{ toggle }
			</div>
			{ error }
		</label>
	);
}
