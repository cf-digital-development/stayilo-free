import { __ } from '@stayilo/design-system/i18n';
/**
 * Timeline marker for UpcomingBoxesSlider.
 *
 * @param {object} props
 * @param {boolean} [props.active=false] - Reached / selected (green border).
 * @param {string} [props.className]
 */
export function TimelineDot( { active = false, className = '' } ) {
	return (
		<span
			className={ [
				'relative z-[1] mt-[-1px] inline-flex h-4 w-4 items-center justify-center rounded-full bg-white',
				active
					? 'border-[3px] border-[#669A11]'
					: 'border-[3px] border-[#101010]',
				className,
			].filter( Boolean ).join( ' ' ) }
			aria-hidden="true"
		/>
	);
}
