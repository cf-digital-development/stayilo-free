import { ReactComponent as DeliveryIcon } from '@stayilo/design-system/assets/svg/box_truck.svg';
import { ReactComponent as CalendarCheckIcon } from '@stayilo/design-system/assets/svg/calendar-check.svg';
import { __ } from '@stayilo/design-system/i18n';

/**
 * Single upcoming order date card for UpcomingBoxesSlider.
 *
 * @param {object} props
 * @param {'upcoming' | 'next'} [props.variant='upcoming']
 * @param {string} props.day - Day of week, e.g. "Wednesday"
 * @param {string} props.date - Day number, e.g. "03"
 * @param {string} props.month - Month name, e.g. "September"
 * @param {string} [props.className]
 */
export function UpcomingBoxCard( {
	variant = 'upcoming',
	day,
	date,
	month,
	className = '',
} ) {
	const label = `${ day }, ${ date } ${ month }`;

	if ( variant === 'next' ) {
		return (
			<article
				aria-label={ label }
				className={ [
					'flex h-[168px] w-full flex-col overflow-hidden rounded-[19px] border border-[#101010] bg-transparent',
					className,
				].filter( Boolean ).join( ' ' ) }
			>
				<div
					className="flex flex-1 flex-col justify-center px-5"
					style={ {
						background: 'var(--stayilo-accent)',
						color: 'var(--stayilo-accent-contrast)',
					} }
				>
					<p className="m-0 text-base font-normal leading-7 font-inter-display">{ day }</p>
					<div className="mt-4 flex items-end gap-2">
						<span className="text-[36px] font-bold leading-[44px] font-inter-display">{ date }</span>
						<span className="text-lg font-medium leading-7 font-inter-display">{ month }</span>
					</div>
				</div>
				<div className="flex h-10 shrink-0 items-center justify-center gap-2 bg-white px-5 py-2">
					<DeliveryIcon  width={ 24 } height={ 24 } aria-hidden="true" className="shrink-0" />
					<span className="text-sm font-semibold leading-5">{ __( 'Next order', 'stayilo' ) }</span>
				</div>
			</article>
		);
	}

	return (
		<article
			aria-label={ label }
			className={ [
				'portal-card-plain flex h-[168px] w-full flex-col  px-5 py-5',
				className,
			].filter( Boolean ).join( ' ' ) }
		>
			<CalendarCheckIcon width={ 32 } height={ 32 } aria-hidden="true" className="shrink-0" />
			<p className="mt-2 text-base font-normal leading-6">{ day }</p>
			<div className="mt-5 flex items-end gap-1">
				<span className="text-[36px] font-bold leading-[44px]">{ date }</span>
				<span className="pb-1 text-base font-medium leading-[26px]">{ month }</span>
			</div>
		</article>
	);
}
