import sparkIconUrl from '../../assets/svg/spark.svg';
import './setting-toggle-card.css';

/**
 * Reusable card for boolean settings and locked premium features.
 *
 * @param {object} props
 * @param {string} props.title
 * @param {string} [props.description]
 * @param {boolean} [props.checked=false]
 * @param {(checked: boolean) => void} [props.onChange]
 * @param {boolean} [props.disabled=false]
 * @param {boolean} [props.showStatus=false]
 * @param {boolean} [props.showUncheckedBadge=false]
 * @param {string} [props.uncheckedBadge='Off']
 * @param {import('react').ReactNode} [props.badge]
 * @param {boolean} [props.showBadgeIcon=true]
 * @param {string} [props.className]
 * @param {string} [props.paddingClassName='py-4 px-5'] - Card padding (e.g. `px-4 py-3`)
 * @param {string} [props.descriptionClassName='text-[#7C8494]'] - Description color (e.g. `text-[#474C57]`)
 * @param {string} [props.titleClassName='font-semibold'] - Title weight (e.g. `font-medium`)
 */
export default function SettingToggleCard( {
	title,
	description,
	checked = false,
	onChange,
	disabled = false,
	showStatus = false,
	showUncheckedBadge = false,
	uncheckedBadge = 'Off',
	badge,
	showBadgeIcon = true,
	className = '',
	paddingClassName = 'py-4 px-5',
	descriptionClassName = 'text-[#7C8494]',
	titleClassName = 'font-semibold',
} ) {
	const classes = [
		'flex items-center gap-[12px] w-full box-border rounded-xl border bg-white font-inter',
		paddingClassName,
		disabled
			? 'border-stayilo-pro-soft bg-[#6366F108] opacity-70'
			: 'border-stayilo-ink-alpha',
		className,
	]
		.filter( Boolean )
		.join( ' ' );

	const toggleClasses = [
		'stayilo-setting-toggle-card__toggle',
		checked ? 'stayilo-setting-toggle-card__toggle--checked' : '',
	]
		.filter( Boolean )
		.join( ' ' );

	const textColor = disabled ? 'text-stayilo-muted' : 'text-stayilo-ink';

	const statusClasses = ( on ) =>
		on ? 'stayilo-pill-status-on' : 'stayilo-pill-status-off';

	return (
		<div className={ classes }>
			<button
				type="button"
				className={ toggleClasses }
				role="switch"
				aria-checked={ checked }
				aria-label={ `${ checked ? 'Disable' : 'Enable' } ${ title }` }
				disabled={ disabled }
				onClick={ () => onChange?.( ! checked ) }
			>
				<span className="stayilo-setting-toggle-card__toggle-knob" />
			</button>

			<div className="flex-1 min-w-0">
				<div className="flex flex-wrap items-center gap-2">
					<span className={ `text-base leading-6 ${ titleClassName } ${ textColor }` }>
						{ title }
					</span>
					{ badge ? (
						<span className="stayilo-pill-pro">
							{ showBadgeIcon ? (
								<img src={ sparkIconUrl } alt="" aria-hidden="true" className="block h-3 w-3" />
							) : null }
							{ badge }
						</span>
					) : null }
				</div>

				{ description ? (
					<p className={ `mt-0.5 text-sm font-normal leading-5 ${ descriptionClassName }` }>
						{ description }
					</p>
				) : null }
			</div>

			{ showStatus ? (
				<span className={ statusClasses( checked ) }>{ checked ? 'On' : 'Off' }</span>
			) : null }
			{ showUncheckedBadge && ! checked && ! disabled ? (
				<span className={ statusClasses( false ) }>{ uncheckedBadge }</span>
			) : null }
		</div>
	);
}
