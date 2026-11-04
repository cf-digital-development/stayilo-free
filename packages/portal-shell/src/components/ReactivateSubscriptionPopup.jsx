import { useState } from 'react';
import { PortalPopup } from './PortalPopup.jsx';
import { CancelPackageIcon } from './PortalPopupIcons.jsx';
import { handleReactivateSubscription } from '../utils/createSubscription.js';
import { ReactComponent as CancelIcon } from '@stayilo/design-system/assets/svg/ReceiptXPopup.svg';
import { __, sprintf } from '@stayilo/design-system/i18n';


/**
 * Classic-only reactivation confirm — opens before checkout redirect.
 *
 * @param {object} props
 * @param {boolean} props.open
 * @param {() => void} props.onClose
 * @param {string} [props.subscriptionId]
 * @param {string} [props.subscriptionTitle]
 * @param {(subscriptionId: string) => Promise<{ checkoutUrl?: string }>} [props.onReactivate]
 */
export function ReactivateSubscriptionPopup( {
	open,
	onClose,
	subscriptionId = '',
	subscriptionTitle = '',
	onReactivate,
} ) {
	const [ submitting, setSubmitting ] = useState( false );
	const name = String( subscriptionTitle || '' ).trim();
	const description = name
		? /subscription$/i.test( name )
			? sprintf( __( 'Your %s is ready to restart — same beans, same schedule, nothing to set up again.', 'stayilo' ), name )
			: sprintf( __( 'Your %s subscription is ready to restart — same beans, same schedule, nothing to set up again.', 'stayilo' ), name )
		: __( 'Your subscription is ready to restart — same beans, same schedule, nothing to set up again.', 'stayilo' );

	const handleConfirm = async () => {
		if ( ! subscriptionId || ! onReactivate || submitting ) {
			return;
		}
		setSubmitting( true );
		try {
			await handleReactivateSubscription( onReactivate, subscriptionId );
		} finally {
			setSubmitting( false );
		}
	};

	return (
		<PortalPopup
			open={ open }
			onClose={ submitting ? undefined : onClose }
			icon={ <CancelIcon size={ 64 } /> }
			title={ __( 'Ready to brew again?', 'stayilo' ) }
			description={ description }
			className="portal-popup-overlay--reactivate"
			contentClassName="portal-popup--reactivate"
			actions={ [
				{
					label: submitting ? __( 'Starting checkout…', 'stayilo' ) : __( 'Reactivate anytime', 'stayilo' ),
					variant: 'primary',
					disabled: submitting || ! subscriptionId,
					loading: submitting,
					onClick: handleConfirm,
					className: 'portal-popup__action--reactivate-confirm',
				},
			] }
		/>
	);
}
