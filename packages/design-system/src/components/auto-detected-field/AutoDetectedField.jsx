import { useEffect, useRef, useState } from '@wordpress/element';
import './auto-detected-field.css';

let fieldSequence = 0;

function toColorInputValue( value ) {
	if ( /^#[0-9a-f]{6}$/i.test( value ) ) {
		return value;
	}

	if ( /^#[0-9a-f]{3}$/i.test( value ) ) {
		const [ r, g, b ] = value.slice( 1 ).split( '' );
		return `#${ r }${ r }${ g }${ g }${ b }${ b }`;
	}

	return '#ffffff';
}

/**
 * Reusable field that hides its detection status after manual editing.
 *
 * @param {object} props
 * @param {string} props.label
 * @param {string} props.value
 * @param {(event: Event) => void} props.onChange
 * @param {boolean} [props.isAutoDetected=false]
 * @param {boolean} [props.showColorPicker=false]
 * @param {string} [props.detectedLabel='Auto-detected']
 * @param {string} [props.id]
 * @param {string} [props.name]
 * @param {string} [props.placeholder]
 * @param {boolean} [props.disabled=false]
 * @param {string} [props.className]
 * @param {string} [props.error]
 */
export default function AutoDetectedField( {
	label,
	value,
	onChange,
	isAutoDetected = false,
	showColorPicker = false,
	detectedLabel = 'Auto-detected',
	id,
	name,
	placeholder,
	disabled = false,
	className = '',
	error,
} ) {
	const [ manuallyEdited, setManuallyEdited ] = useState( false );
	const autoId = useRef( null );

	if ( ! autoId.current ) {
		fieldSequence += 1;
		autoId.current = `stayilo-auto-field-${ fieldSequence }`;
	}

	useEffect( () => {
		if ( isAutoDetected ) {
			setManuallyEdited( false );
		}
	}, [ isAutoDetected ] );

	const inputId = id || name || autoId.current;
	const classes = [ 'w-full font-inter', className ].filter( Boolean ).join( ' ' );
	const hasSelectedColor = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test( value || '' );
	const validColor = toColorInputValue( value );
	const showDetectedStatus = isAutoDetected && ! manuallyEdited;

	const rowClasses = [
		'grid items-center gap-3',
		showColorPicker
			? 'grid-cols-[48px_minmax(0,1fr)_auto]'
			: 'grid-cols-[minmax(0,1fr)_auto]',
	].join( ' ' );

	const handleChange = ( event ) => {
		setManuallyEdited( true );
		onChange?.( event );
	};

	return (
		<div className={ classes }>
			<label className="stayilo-type-body-muted mb-2 block" htmlFor={ inputId }>
				{ label }
			</label>

			<div className={ rowClasses }>
				{ showColorPicker ? (
					<div
						className={ [
							'stayilo-color-swatch',
							hasSelectedColor ? 'stayilo-color-swatch--filled' : '',
						]
							.filter( Boolean )
							.join( ' ' ) }
						style={
							hasSelectedColor
								? { backgroundColor: validColor }
								: undefined
						}
					>
						<input
							type="color"
							className="stayilo-auto-detected-field__picker"
							value={ validColor }
							disabled={ disabled }
							aria-label={ `Choose ${ label.toLowerCase() }` }
							onChange={ handleChange }
						/>
					</div>
				) : null }

				<input
					id={ inputId }
					name={ name }
					type="text"
					className="stayilo-input-soft !min-h-[48px]"
					value={ value }
					placeholder={ placeholder }
					disabled={ disabled }
					onChange={ handleChange }
				/>

				{ showDetectedStatus ? (
					<span className="whitespace-nowrap text-[11px] font-normal leading-[16.5px] text-stayilo-muted max-[480px]:col-start-2 max-[480px]:col-end-[-1]">
						{ detectedLabel }
					</span>
				) : null }
			</div>

			{ error ? <p className="mt-2 mb-0 text-xs leading-4 text-red-600">{ error }</p> : null }
		</div>
	);
}
