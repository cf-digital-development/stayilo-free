import { useMemo, useState } from 'react';
import { ReactComponent as CalendarRotateIcon } from '@stayilo/design-system/assets/svg/calendar-rotate.svg';
import { ActionPromptCard } from '../components/ActionPromptCard.jsx';
import { ManageDeliveryPopup } from '../components/ManageDeliveryPopup/index.js';
import { SUBSCRIPTION_ACTION_CARDS } from '../data/subscriptionActions.js';
import { useResolvedSubscription } from '../store/useResolvedSubscription.js';
import { getManageDeliveryPopupProps } from '../utils/delivery/index.js';
import { isPortalActionEnabled } from '../utils/portalActions.js';
import { __ } from '@stayilo/design-system/i18n';

const SKIP_CARD = SUBSCRIPTION_ACTION_CARDS.find(
	( card ) => card.actionKey === 'skip-delivery'
);

/**
 * Free portal action — skip next order (confirm popup only).
 * Reschedule lives on Manage Delivery / Change Date, not this card.
 */
export function SkipDeliveryAction( {
	subscriptionId: preferredId,
	className = '',
	icon,
	title = SKIP_CARD?.title,
	description = SKIP_CARD?.description,
	actionLabel = SKIP_CARD?.actionLabel,
	descriptionClassName = '',
} = {} ) {
	const { subscription, subscriptionId, skipDelivery } =
		useResolvedSubscription( preferredId );
	const [ open, setOpen ] = useState( false );
	const popupProps = useMemo(
		() => getManageDeliveryPopupProps( subscription ),
		[ subscription ]
	);

	if ( ! isPortalActionEnabled( 'skip-delivery' ) ) {
		return null;
	}

	return (
		<div className={ className || 'h-full min-h-0 w-full' }>
			<ActionPromptCard
				icon={
					icon ?? (
						<CalendarRotateIcon
							width={ 96 }
							height={ 96 }
							aria-hidden="true"
						/>
					)
				}
				title={ title }
				description={ description }
				actionLabel={ actionLabel }
				onAction={ () => setOpen( true ) }
				className="h-full !max-w-none"
			/>
			<ManageDeliveryPopup
				open={ open }
				initialStep="skip-confirm"
				onClose={ () => setOpen( false ) }
				{ ...popupProps }
				allowSkip
				allowReschedule={ false }
				allowChangeBoxSize={ false }
				descriptionClassName={ descriptionClassName }
				onSkip={ async () => {
					if ( ! subscriptionId ) {
						throw new Error( __( 'Missing subscription for skip.', 'stayilo' ) );
					}
					return skipDelivery( subscriptionId );
				} }
			/>
		</div>
	);
}
