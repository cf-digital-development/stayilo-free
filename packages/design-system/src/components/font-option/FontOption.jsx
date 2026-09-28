import { ReactComponent as CheckIcon } from '../../assets/svg/Check.svg';

/**
 * Reusable selectable font preview row.
 *
 * @param {object} props
 * @param {string} props.label
 * @param {string} [props.value]
 * @param {string} [props.preview='Aa Bb 123']
 * @param {string} [props.fontFamily]
 * @param {'serif'|'sans-serif'|'monospace'} [props.fallback='sans-serif']
 * @param {boolean} [props.selected=false]
 * @param {(value: string) => void} [props.onSelect]
 * @param {boolean} [props.disabled=false]
 * @param {string} [props.className]
 */
export default function FontOption( {
	label,
	value = label,
	preview = 'Aa Bb 123',
	fontFamily = label,
	fallback = 'sans-serif',
	selected = false,
	onSelect,
	disabled = false,
	className = '',
} ) {
	const classes = [
		'stayilo-option-row',
		selected ? 'stayilo-option-row--selected' : '',
		className,
	]
		.filter( Boolean )
		.join( ' ' );

	const labelClasses = [
		'overflow-hidden text-ellipsis whitespace-nowrap font-semibold',
		selected
			? 'text-base leading-6 text-stayilo-ink'
			: 'text-base leading-6 text-[#474C57]',
	].join( ' ' );

	const previewClasses = [
		'whitespace-nowrap font-medium text-stayilo-muted',
		selected ? 'text-sm leading-5' : 'text-[11px] leading-[16.5px]',
	].join( ' ' );

	return (
		<button
			type="button"
			className={ classes }
			style={ {
				'--stayilo-option-font': `"${ fontFamily }", ${ fallback }`,
				fontFamily: 'var(--stayilo-option-font)',
			} }
			aria-pressed={ selected }
			disabled={ disabled }
			onClick={ () => onSelect?.( value ) }
		>
			<span className={ labelClasses }>{ label }</span>
			<span className={ previewClasses }>{ preview }</span>
			{ selected ? (
				<CheckIcon
					className="block h-4 w-4 shrink-0 text-stayilo-ink"
					aria-hidden="true"
				/>
			) : null }
		</button>
	);
}
