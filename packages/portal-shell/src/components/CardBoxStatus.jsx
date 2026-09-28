import { ReactComponent as CheckIcon } from '@stayilo/design-system/assets/svg/Check.svg';

/**
 * Card footer box status with check icon — pinned to bottom via parent flex.
 *
 * @param {object} props
 * @param {string} props.status
 * @param {string} [props.className]
 */
export function CardBoxStatus( { status, className = '' } ) {
	if ( ! status ) {
		return null;
	}

	return (
		<div
			className={ [
				'inline-flex items-center justify-end gap-1.5 self-end text-base font-normal text-[#101010]',
				className,
			]
				.filter( Boolean )
				.join( ' ' ) }
		>
			<CheckIcon
				className="block h-4 w-4 shrink-0"
				aria-hidden="true"
			/>
			<span className="leading-none">{ status }</span>
		</div>
	);
}
