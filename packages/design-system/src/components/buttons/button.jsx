import arrowRightUrl from '../../assets/svg/ArrowRight.svg';
import arrowLeftUrl from '../../assets/svg/ArrowLeft.svg';

/** Right arrow icon from assets. */
export function ArrowRightIcon() {
	return <img src={ arrowRightUrl } alt="" aria-hidden="true" width={ 20 } height={ 20 } />;
}

/** Left arrow icon from assets. */
export function ArrowLeftIcon() {
	return <img src={ arrowLeftUrl } alt="" aria-hidden="true" width={ 16 } height={ 16 } />;
}

/**
 * Dynamic button component.
 *
 * @param {object} props
 * @param {string} [props.text]       - Optional label
 * @param {import('react').ReactNode} [props.icon] - Optional icon (omit for text-only)
 * @param {'next'|'back'} [props.direction] - Built-in arrow: 'next' = right arrow on right, 'back' = left arrow on left
 * @param {'left'|'right'} [props.iconPosition='right'] - Icon side relative to text
 * @param {'filled'|'text'} [props.variant='filled'] - filled = background, text = no background
 * @param {boolean} [props.active=true] - false = inactive/disabled styling
 * @param {boolean} [props.disabled=false]
 * @param {() => void} [props.onClick]
 * @param {'button'|'submit'|'reset'} [props.type='button']
 * @param {string} [props.className]
 */
export default function Button( {
	text,
	icon,
	direction,
	iconPosition,
	variant = 'filled',
	active = true,
	disabled = false,
	onClick,
	type = 'button',
	className = '',
} ) {
	const isDisabled = disabled || ! active;

	let resolvedIcon = icon;
	let resolvedPosition = iconPosition ?? 'right';

	if ( resolvedIcon === undefined && direction === 'next' ) {
		resolvedIcon = <ArrowRightIcon />;
	} else if ( resolvedIcon === undefined && direction === 'back' ) {
		resolvedIcon = <ArrowLeftIcon />;
		resolvedPosition = iconPosition ?? 'left';
	}

	const hasIcon = resolvedIcon !== undefined && resolvedIcon !== null && resolvedIcon !== false;

	const classes = [
		'stayilo-btn',
		variant === 'text' ? 'stayilo-btn--text' : 'stayilo-btn--filled',
		isDisabled ? 'stayilo-btn--inactive' : 'stayilo-btn--active',
		className,
	]
		.filter( Boolean )
		.join( ' ' );

	return (
		<button
			type={ type }
			className={ classes }
			disabled={ isDisabled }
			onClick={ onClick }
			aria-disabled={ isDisabled }
		>
			{ hasIcon && resolvedPosition === 'left' ? (
				<span className="stayilo-btn__icon">{ resolvedIcon }</span>
			) : null }
			{ text ? <span className="stayilo-btn__label">{ text }</span> : null }
			{ hasIcon && resolvedPosition === 'right' ? (
				<span className="stayilo-btn__icon">{ resolvedIcon }</span>
			) : null }
		</button>
	);
}
