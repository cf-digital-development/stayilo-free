import { ReactComponent as ClockCountdownIcon } from '@stayilo/design-system/assets/svg/ClockCountdown.svg';
import { ReactComponent as FireIcon } from '@stayilo/design-system/assets/svg/FireIcon.svg';
import { ReactComponent as HandFistIcon } from '@stayilo/design-system/assets/svg/HandFist.svg';

const STAT_ICONS = {
	timer: ClockCountdownIcon,
	flame: FireIcon,
	protein: HandFistIcon,
};

/**
 * Card stat row item (time, calories, protein).
 *
 * @param {object} props
 * @param {'timer'|'flame'|'protein'|import('react').ComponentType} [props.icon]
 * @param {string} props.label
 */
export function CardStatItem( { icon, label } ) {
	const Icon = typeof icon === 'string' ? STAT_ICONS[ icon ] : icon;

	return (
		<span className="inline-flex items-center gap-[6px] text-base font-normal leading-4">
			{ Icon ? (
				<span className="inline-flex shrink-0">
					<Icon width={ 20 } height={ 20 } aria-hidden="true" />
				</span>
			) : null }
			{ label }
		</span>
	);
}
