import { normalizeColor, normalizeHex } from '../../branding.js';
import { HEX_INPUT_CLASS } from './constants.js';

function pickerHex( value ) {
	const match = String( value || '' ).match(
		/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i
	);
	if ( ! match ) {
		return normalizeHex( value, '#000000' );
	}
	return (
		'#' +
		[ match[ 1 ], match[ 2 ], match[ 3 ] ]
			.map( ( part ) => Number( part ).toString( 16 ).padStart( 2, '0' ) )
			.join( '' )
	).toUpperCase();
}

function applyPicker( current, nextHex ) {
	// A picked banner color is stored solid. Keeping the default 0.5 alpha
	// made every new color a wash over the page.
	void current;
	return normalizeHex( nextHex, '#000000' );
}

export function ColorSwatch( { label, value, disabled, onChange } ) {
	const hex = pickerHex( value );

	return (
		<label className="relative h-8 w-8 shrink-0 cursor-pointer overflow-hidden rounded-[10px] disabled:cursor-not-allowed">
			<span
				className="block h-full w-full rounded-[10px]"
				style={ { background: value || hex } }
				aria-hidden="true"
			/>
			<input
				type="color"
				value={ hex }
				aria-label={ label }
				disabled={ disabled }
				onChange={ ( event ) => onChange( applyPicker( value, event.target.value ) ) }
				className="absolute inset-0 h-full w-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
			/>
		</label>
	);
}

export function HexField( { label, value, disabled, onChange, onCommit } ) {
	return (
		<input
			type="text"
			value={ value }
			spellCheck={ false }
			disabled={ disabled }
			aria-label={ label }
			onChange={ ( event ) => onChange( event.target.value ) }
			onBlur={ ( event ) => onCommit( event.target.value ) }
			className={ HEX_INPUT_CLASS }
		/>
	);
}

export function ColorRow( { label, hint, value, onChange, onCommit } ) {
	return (
		<div className="flex items-center justify-between gap-3 p-3">
			<div className="min-w-0">
				<p className="text-sm font-medium text-stayilo-ink leading-5">{ label }</p>
				{ hint ? <p className="text-xs text-[#7C8494] leading-4">{ hint }</p> : null }
			</div>
			<div className="flex shrink-0 items-center gap-2 min-w-0  max-w-[94px]">
				<ColorSwatch label={ label } value={ value } onChange={ onChange } />
				<HexField
					label={ `${ label } hex` }
					value={ value }
					onChange={ onChange }
					onCommit={ onCommit }
				/>
			</div>
		</div>
	);
}
