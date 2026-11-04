import { ReactComponent as NavArrowRightIcon } from '@stayilo/design-system/assets/svg/nav-arrow-right.svg';

/**
 * Prev/next control used by portal carousels.
 *
 * @param {object} props
 * @param {'prev'|'next'} props.direction
 * @param {string} props.label
 * @param {() => void} [props.onClick]
 * @param {boolean} [props.disabled]
 */
export function SliderNavButton( { direction, onClick, label, disabled } ) {
	return (
		<button
			type="button"
			aria-label={ label }
			onClick={ onClick }
			disabled={ disabled }
			className="portal-slider-nav--responsive"
		>
			<NavArrowRightIcon
				width={ 24 }
				height={ 24 }
				aria-hidden="true"
				className={ direction === 'prev' ? 'rotate-180' : undefined }
			/>
		</button>
	);
}
