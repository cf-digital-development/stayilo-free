import { ReactComponent as CalendarPlusIcon } from '@stayilo/design-system/assets/svg/calendar-plus.svg';
import { ReactComponent as CalendarDotsIcon } from '@stayilo/design-system/assets/svg/CalendarDots.svg';
import { ReactComponent as BoxIsoIcon } from '@stayilo/design-system/assets/svg/box-iso.svg';
import { QuickActionCard } from '../../QuickActionCard.jsx';

/**
 * Root manage-delivery step — reschedule / skip / change subscription size.
 * Cards are omitted when the action is not available.
 */
export function ManageStep( {
	onReschedule,
	onSkip,
	onChangeBoxSize,
	allowReschedule = true,
	allowSkip = true,
	allowChangeBoxSize = true,
} ) {
	return (
		<div className="portal-delivery-actions">
			{ allowReschedule ? (
				<QuickActionCard
					icon={
						<CalendarPlusIcon
							width={ 40 }
							height={ 40 }
							aria-hidden="true"
						/>
					}
					lines={ [ 'Reschedule', 'order' ] }
					onClick={ onReschedule }
				/>
			) : null }
			{ allowSkip ? (
				<QuickActionCard
					icon={
						<CalendarDotsIcon
							width={ 40 }
							height={ 40 }
							aria-hidden="true"
						/>
					}
					lines={ [ 'Skip this', 'week' ] }
					onClick={ onSkip }
				/>
			) : null }
			{ allowChangeBoxSize ? (
				<QuickActionCard
					icon={
						<BoxIsoIcon
							width={ 40 }
							height={ 40 }
							aria-hidden="true"
						/>
					}
					lines={ [ 'Change', 'subscription size' ] }
					onClick={ onChangeBoxSize }
				/>
			) : null }
		</div>
	);
}
