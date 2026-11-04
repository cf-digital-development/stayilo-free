import { ReactComponent as DiscountIcon } from '@stayilo/design-system/assets/svg/Disocunt.svg';
import { ReactComponent as SimplificationIcon } from '@stayilo/design-system/assets/svg/Simplification.svg';
import { ReactComponent as SuccessIcon } from '@stayilo/design-system/assets/svg/Success.svg';

// Success.svg is the only non-square asset; `size` drives its height.
const SUCCESS_ASPECT_RATIO = 145 / 128;

/**
 * Cancel / canceled states.
 *
 * @param {object} props
 * @param {number} [props.size=56]
 */
export function CancelPackageIcon( { size = 96 } ) {
	return (
		<SimplificationIcon width={ size } height={ size } aria-hidden="true" />
	);
}

/**
 * Retention offer.
 *
 * @param {object} props
 * @param {number} [props.size=56]
 */
export function DiscountOfferIcon( { size = 128 } ) {
	return (
		<DiscountIcon width={ size } height={ size } aria-hidden="true" />
	);
}

/**
 * Subscription active.
 *
 * @param {object} props
 * @param {number} [props.size=64]
 */
export function SuccessCheckIcon( { size = 128 } ) {
	return (
		<SuccessIcon
			width={ Math.round( size * SUCCESS_ASPECT_RATIO ) }
			height={ size }
			aria-hidden="true"
		/>
	);
}
