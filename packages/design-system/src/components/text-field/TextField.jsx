import { useRef } from '@wordpress/element';
import { getFieldControlClasses } from './field-classes.js';

let fieldSeq = 0;

/**
 * Label (optional) + text input.
 * Pair with Button separately for actions like Validate.
 *
 * @param {object} props
 * @param {string} [props.label] - Optional; omit or leave empty to hide label
 * @param {boolean} [props.showLabel] - Force hide even if label is set
 * @param {string} [props.value]
 * @param {Function} [props.onChange]
 * @param {string} [props.placeholder]
 * @param {string} [props.type='text']
 * @param {string} [props.name]
 * @param {string} [props.id]
 * @param {boolean} [props.disabled=false]
 * @param {boolean} [props.required=false]
 * @param {boolean} [props.success=false]
 * @param {boolean} [props.invalid=false] - Error styling (border/text), like success
 * @param {string} [props.error]
 * @param {boolean} [props.showErrorMessage=true]
 * @param {string} [props.className]
 * @param {string} [props.inputClassName] - Extra classes appended to the input (use a leading `!` to override, e.g. `!pl-10`)
 * @param {string} [props.labelClassName] - Extra classes appended to the label (use a leading `!` to override)
 * @param {'mono'|'inter'} [props.typography='mono'] - Input value font. `inter` is 14/20 normal (Wording fields).
 * @param {string} [props.inputPadding] - CSS padding, e.g. `12px 16px`
 * @param {string} [props.inputHeight] - CSS height, e.g. `50px`
 * @param {import('@wordpress/element').ReactNode} [props.startIcon] - Icon rendered inside the input on the left
 * @param {object} [props.inputProps]
 */
export default function TextField( {
	label,
	showLabel,
	value,
	onChange,
	placeholder,
	type = 'text',
	name,
	id,
	disabled = false,
	required = false,
	success = false,
	invalid = false,
	error,
	showErrorMessage = true,
	className = '',
	inputClassName = '',
	labelClassName = '',
	typography = 'mono',
	inputPadding,
	inputHeight,
	startIcon,
	inputProps = {},
} ) {
	const autoId = useRef( null );
	if ( ! autoId.current ) {
		fieldSeq += 1;
		autoId.current = `stayilo-field-${ fieldSeq }`;
	}

	const inputId = id || name || autoId.current;
	const hasLabel = Boolean( label ) && showLabel !== false;
	const hasError = invalid || Boolean( error );
	const hasStartIcon = Boolean( startIcon );

	const wrapperClasses = [ 'flex w-full min-w-0 flex-col gap-2 box-border', className ]
		.filter( Boolean )
		.join( ' ' );

	const { style: inputStyle, ...restInputProps } = inputProps;

	const input = (
		<input
			id={ inputId }
			name={ name }
			type={ type }
			className={ getFieldControlClasses( {
				success,
				invalid: hasError,
				typography,
				className: [
					hasStartIcon ? 'stayilo-text-field__input--with-start' : '',
					inputClassName,
				]
					.filter( Boolean )
					.join( ' ' ),
			} ) }
			value={ value }
			onChange={ onChange }
			placeholder={ placeholder }
			disabled={ disabled }
			required={ required }
			aria-invalid={ hasError || undefined }
			aria-label={
				! hasLabel ? ( label || placeholder || name || 'Text field' ) : undefined
			}
			style={ {
				...( inputPadding
					? { '--stayilo-text-field-padding': inputPadding }
					: {} ),
				...( inputHeight
					? {
						'--stayilo-text-field-height': inputHeight,
						'--stayilo-text-field-min-height': inputHeight,
					}
					: {} ),
				...inputStyle,
			} }
			{ ...restInputProps }
		/>
	);

	return (
		<div className={ wrapperClasses }>
			{ hasLabel ? (
				<label
					className={ `stayilo-type-label-caps block ${ labelClassName }` }
					htmlFor={ inputId }
				>
					{ label }
					{ required ? (
						<span className="text-red-600" aria-hidden="true"> *</span>
					) : null }
				</label>
			) : null }

			{ hasStartIcon ? (
				<div className="relative w-full min-w-0">
					<span
						className="pointer-events-none absolute left-[18px] top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center text-[#474C57]"
						aria-hidden="true"
					>
						{ startIcon }
					</span>
					{ input }
				</div>
			) : (
				input
			) }

			{ error && showErrorMessage ? (
				<p className="m-0 text-xs leading-4 text-red-600">{ error }</p>
			) : null }
		</div>
	);
}
