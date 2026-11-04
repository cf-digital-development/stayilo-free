import { NavArrowIcon } from './NavArrowIcon.jsx';

const VARIANT_CLASSES = {
	primary: 'portal-btn portal-btn--primary',
	secondary: 'portal-btn portal-btn--secondary',
	chip: 'portal-chip-action',
	success: 'portal-btn portal-btn--success',
	danger: 'portal-btn portal-btn--danger',
	dangerOutline: 'portal-btn portal-btn--danger-outline',
};

const VARIANT_ICON_CLASSES = {
	primary: 'text-white',
	secondary: 'text-current',
	chip: 'text-current',
	success: 'text-white',
	danger: 'text-white',
	dangerOutline: 'text-current',
};

/**
 * Portal action button with primary, secondary, chip, success, and danger variants.
 *
 * @param {object} props
 * @param {string} props.label - Button text.
 * @param {'primary'|'secondary'|'chip'|'success'|'danger'|'dangerOutline'} [props.variant='primary'] - Visual style.
 * @param {boolean} [props.showIcon=true] - Show trailing icon.
 * @param {import('react').ReactNode} [props.icon] - Custom icon; defaults to nav-arrow-right.
 * @param {() => void} [props.onClick]
 * @param {boolean} [props.disabled=false]
 * @param {boolean} [props.loading=false] - Show spinner and disable the button.
 * @param {'button'|'submit'|'reset'} [props.type='button']
 * @param {string} [props.className]
 */
export function Button( {
	label,
	variant = 'primary',
	showIcon = true,
	icon,
	onClick,
	disabled = false,
	loading = false,
	type = 'button',
	className = '',
} ) {
	const classes = [
		VARIANT_CLASSES[ variant ] ?? VARIANT_CLASSES.primary,
		loading ? 'portal-btn--loading' : '',
		className,
	]
		.filter( Boolean )
		.join( ' ' );

	const iconSize = variant === 'chip' ? 16 : 24;
	const resolvedIcon =
		icon ?? (
			<NavArrowIcon
				width={ iconSize }
				height={ iconSize }
				className={ VARIANT_ICON_CLASSES[ variant ] ?? VARIANT_ICON_CLASSES.primary }
			/>
		);

	return (
		<button
			type={ type }
			className={ classes }
			disabled={ disabled || loading }
			aria-busy={ loading || undefined }
			onClick={ onClick }
		>
			{ loading ? (
				<span className="portal-spinner portal-spinner--btn" aria-hidden="true" />
			) : null }
			<span>{ label }</span>
			{ showIcon && ! loading ? resolvedIcon : null }
		</button>
	);
}
