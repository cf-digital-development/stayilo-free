import { useClickableSurface } from '../../hooks/useClickableSurface';

/**
 * Reusable card with an icon, supporting text, and an action button.
 * The whole card is clickable when `onAction` is provided and not disabled.
 *
 * @param {object} props
 * @param {string} props.title
 * @param {string} [props.description]
 * @param {import('react').ReactNode} [props.icon]
 * @param {string} props.actionLabel
 * @param {() => void} [props.onAction]
 * @param {boolean} [props.disabled=false]
 * @param {boolean} [props.selected=false]
 * @param {string} [props.className]
 */
export default function ActionCard( {
	title,
	description,
	icon,
	actionLabel,
	onAction,
	disabled = false,
	selected = false,
	className = '',
} ) {
	const { isClickable, rootProps } = useClickableSurface( {
		onActivate: onAction,
		disabled,
		fallbackRole: undefined,
	} );

	const classes = [
		'stayilo-card flex flex-col justify-between w-full min-h-[222px] p-4 font-inter',
		selected ? 'stayilo-action-card--selected border-stayilo-ink bg-[#0D11170A]' : '',
		isClickable
			? 'stayilo-card--clickable focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#7467f0] focus-visible:outline-offset-2'
			: '',
		disabled ? 'opacity-50 cursor-not-allowed' : '',
		className,
	]
		.filter( Boolean )
		.join( ' ' );

	return (
		<div className={ classes } { ...rootProps }>
			{ icon ? (
				<div
					className="stayilo-action-card__icon inline-flex items-center justify-center w-10 h-10 mb-3 rounded-xl border border-transparent bg-stayilo-chip [&_img]:block [&_img]:w-5 [&_img]:h-5 [&_svg]:block [&_svg]:w-5 [&_svg]:h-5"
					aria-hidden="true"
				>
					{ icon }
				</div>
			) : null }

			<div className="flex-1">
				<h3 className="stayilo-action-card__title stayilo-type-title-sm">{ title }</h3>
				{ description ? (
					<p className="stayilo-type-body-muted mt-0.5 mb-3">{ description }</p>
				) : null }
			</div>

			<span
				className="stayilo-action-card__button inline-flex items-center justify-center w-full min-h-[36px] px-4 py-1.5 border border-stayilo-ink-alpha rounded-xl box-border bg-stayilo-chip text-stayilo-ink text-xs font-bold leading-[18px] text-center"
				aria-hidden="true"
			>
				{ actionLabel }
			</span>
		</div>
	);
}
