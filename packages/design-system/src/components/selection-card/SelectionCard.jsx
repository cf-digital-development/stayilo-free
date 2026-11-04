import dotsUrl from '../../assets/svg/dots.svg';
import { useClickableSurface } from '../../hooks/useClickableSurface';

/**
 * Selection / option card (e.g. Single vs Multiple subscription).
 * The whole card is clickable when `onClick` is provided.
 *
 * @param {object} props
 * @param {string} props.title
 * @param {string} [props.description]
 * @param {import('react').ReactNode} [props.icon]
 * @param {boolean} [props.selected=false]
 * @param {() => void} [props.onClick]
 * @param {string} [props.className]
 */
export default function SelectionCard( {
	title,
	description,
	icon,
	selected = false,
	onClick,
	className = '',
} ) {
	const { isClickable, rootProps } = useClickableSurface( {
		onActivate: onClick,
		pressed: selected,
	} );

	const classes = [
		'flex flex-col items-center text-center relative flex-1 max-w-[301px] p-4 box-border border-2 rounded-[15px] transition-[border-color,background-color,box-shadow] duration-150 ease-[ease] hover:shadow-stayilo-xs',
		selected
			? 'stayilo-card--selected border-[rgba(13,17,23,1)] bg-[rgba(13,17,23,0.03)]'
			: 'border-stayilo-ink-alpha bg-white',
		isClickable ? 'stayilo-card--clickable focus-visible:outline-none' : '',
		className,
	]
		.filter( Boolean )
		.join( ' ' );

	const radioClasses = [
		'stayilo-radio self-start',
		selected ? 'bg-stayilo-ink' : '',
	]
		.filter( Boolean )
		.join( ' ' );

	return (
		<div className={ classes } { ...rootProps }>
			<div className="flex items-center justify-center mb-3 text-stayilo-ink" aria-hidden="true">
				{ icon ?? (
					<img src={ dotsUrl } alt="" width={ 26 } height={ 28} />
				) }
			</div>

			<div className="stayilo-type-title-sm">{ title }</div>

			{ description ? (
				<p className="stayilo-type-body-muted my-3">{ description }</p>
			) : null }

			<span className={ radioClasses } aria-hidden="true" />
		</div>
	);
}
