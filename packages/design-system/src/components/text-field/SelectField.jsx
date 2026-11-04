import { useEffect, useRef, useState } from '@wordpress/element';
import { getFieldControlClasses } from './field-classes.js';

let fieldSeq = 0;

function ChevronIcon() {
	return (
		<svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
			<path
				d="M3 4.5L6 7.5L9 4.5"
				stroke="currentColor"
				strokeWidth="1.25"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	);
}

/**
 * Label (optional) + select, using the same chrome as TextField.
 * Pass `customMenu` for a Stayilo listbox (opens downward, capped width, inner scroll).
 *
 * @param {object} props
 * @param {string} [props.label]
 * @param {boolean} [props.showLabel]
 * @param {string} [props.value]
 * @param {Function} [props.onChange]
 * @param {{ value: string, label: string }[]} props.options
 * @param {string} [props.name]
 * @param {string} [props.id]
 * @param {boolean} [props.disabled=false]
 * @param {boolean} [props.required=false]
 * @param {boolean} [props.success=false]
 * @param {boolean} [props.invalid=false]
 * @param {string} [props.error]
 * @param {boolean} [props.showErrorMessage=true]
 * @param {string} [props.className]
 * @param {string} [props.inputClassName]
 * @param {string} [props.labelClassName]
 * @param {import('@wordpress/element').ReactNode} [props.icon]
 * @param {boolean} [props.customMenu=false]
 * @param {object} [props.inputProps]
 */
export default function SelectField( {
	label,
	showLabel,
	value,
	onChange,
	options = [],
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
	icon,
	customMenu = false,
	inputProps = {},
} ) {
	const autoId = useRef( null );
	const rootRef = useRef( null );
	const [ open, setOpen ] = useState( false );
	const [ raised, setRaised ] = useState( false );

	if ( ! autoId.current ) {
		fieldSeq += 1;
		autoId.current = `stayilo-select-${ fieldSeq }`;
	}

	const inputId = id || name || autoId.current;
	const hasLabel = Boolean( label ) && showLabel !== false;
	const hasError = invalid || Boolean( error );
	const selected = options.find(
		( option ) => String( option.value ) === String( value )
	);

	useEffect( () => {
		if ( disabled ) {
			setOpen( false );
		}
	}, [ disabled ] );

	useEffect( () => {
		if ( open ) {
			setRaised( true );
		}
	}, [ open ] );

	useEffect( () => {
		if ( ! customMenu || ! open ) {
			return undefined;
		}

		const onPointer = ( event ) => {
			if ( rootRef.current && ! rootRef.current.contains( event.target ) ) {
				setOpen( false );
			}
		};
		const onKey = ( event ) => {
			if ( event.key === 'Escape' ) {
				setOpen( false );
			}
		};

		document.addEventListener( 'mousedown', onPointer );
		document.addEventListener( 'keydown', onKey );
		return () => {
			document.removeEventListener( 'mousedown', onPointer );
			document.removeEventListener( 'keydown', onKey );
		};
	}, [ customMenu, open ] );

	const wrapperClasses = [
		'flex w-full min-w-0 flex-col gap-2 box-border',
		customMenu && raised ? 'relative z-50' : '',
		className,
	]
		.filter( Boolean )
		.join( ' ' );

	const controlClassName = getFieldControlClasses( {
		success,
		invalid: hasError,
		className: [
			'stayilo-text-field__input--select appearance-none !h-auto !min-h-0 !pr-10',
			inputClassName,
		]
			.filter( Boolean )
			.join( ' ' ),
	} );

	const emitChange = ( nextValue ) => {
		if ( typeof onChange !== 'function' ) {
			return;
		}
		onChange( {
			target: { value: nextValue, name: name || inputId },
			currentTarget: { value: nextValue, name: name || inputId },
		} );
	};

	const caret = (
		<span
			className={ [
				'pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#7C8494] transition-transform duration-300 ease-out',
				customMenu && open ? 'rotate-[-180deg]' : '',
			]
				.filter( Boolean )
				.join( ' ' ) }
			aria-hidden="true"
		>
			{ icon ?? <ChevronIcon /> }
		</span>
	);

	return (
		<div className={ wrapperClasses } ref={ rootRef }>
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

			<div className="relative w-full min-w-0">
				{ customMenu ? (
					<>
						<button
							id={ inputId }
							type="button"
							disabled={ disabled }
							aria-haspopup="listbox"
							aria-expanded={ open }
							aria-invalid={ hasError || undefined }
							aria-label={
								! hasLabel ? ( label || name || 'Select field' ) : undefined
							}
							className={ `${ controlClassName } stayilo-select-trigger` }
							{ ...inputProps }
							onClick={ () => {
								if ( ! disabled ) {
									setOpen( ( prev ) => ! prev );
								}
							} }
						>
							<span className="min-w-0 flex-1 truncate text-left">
								{ selected?.label || '' }
							</span>
						</button>
						{ caret }
						<div
							className={ [
								'stayilo-select-menu',
								open ? 'is-open' : '',
							]
								.filter( Boolean )
								.join( ' ' ) }
							aria-hidden={ ! open }
							onTransitionEnd={ ( event ) => {
								if ( event.propertyName !== 'grid-template-rows' ) {
									return;
								}
								if ( ! open ) {
									setRaised( false );
								}
							} }
						>
							<div className="stayilo-select-menu__clip">
								<ul
									role="listbox"
									className="stayilo-select-menu__list"
									aria-labelledby={ inputId }
								>
									{ options.map( ( option ) => {
										const isSelected =
											String( option.value ) === String( value );
										return (
											<li
												key={ option.value }
												className="stayilo-select-menu__item"
											>
												<button
													type="button"
													role="option"
													aria-selected={ isSelected }
													tabIndex={ open ? 0 : -1 }
													className={ [
														'stayilo-select-menu__option',
														isSelected ? 'is-selected' : '',
													]
														.filter( Boolean )
														.join( ' ' ) }
													onClick={ () => {
														emitChange( option.value );
														setOpen( false );
													} }
												>
													{ option.label }
												</button>
											</li>
										);
									} ) }
								</ul>
							</div>
						</div>
					</>
				) : (
					<>
						<select
							id={ inputId }
							name={ name }
							value={ value }
							onChange={ onChange }
							disabled={ disabled }
							required={ required }
							aria-invalid={ hasError || undefined }
							aria-label={
								! hasLabel ? ( label || name || 'Select field' ) : undefined
							}
							className={ controlClassName }
							{ ...inputProps }
						>
							{ options.map( ( option ) => (
								<option key={ option.value } value={ option.value }>
									{ option.label }
								</option>
							) ) }
						</select>
						{ caret }
					</>
				) }
			</div>

			{ error && showErrorMessage ? (
				<p className="m-0 text-xs leading-4 text-red-600">{ error }</p>
			) : null }
		</div>
	);
}
