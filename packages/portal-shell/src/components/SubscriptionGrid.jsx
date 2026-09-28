import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
	MANAGE_SUBSCRIPTION_OVERVIEW_PATH,
	MANAGE_SUBSCRIPTION_PATH,
	PORTAL_HOME_PATH,
} from '../routes.js';
import {
	handleReactivateSubscription,
	reactivateActionLabel,
} from '../utils/createSubscription.js';
import { isSubscriptionCanceled } from '../utils/subscriptionOverview.js';
import { subscriptionLocation } from '../utils/subscriptionNavigation.js';
import { isPortalActionEnabled } from '../utils/portalActions.js';
import { useTemplateRecipe } from '../templates/TemplateProvider.jsx';
import { EmptySubscriptionsState } from './EmptySubscriptionsState.jsx';
import { MealBoxCard } from './MealBoxCard.jsx';
import { PageLoader } from './PageLoader.jsx';
import { ReactivateSubscriptionPopup } from './ReactivateSubscriptionPopup.jsx';
import { __ } from '@stayilo/design-system/i18n';

export function SubscriptionGrid( {
	cards = [],
	loading = false,
	loadingMessage = 'Loading your subscriptions…',
	emptyTitle,
	emptyDescription,
	emptyActionLabel,
	onReactivate,
	onResume,
	managePath = {
		manage: MANAGE_SUBSCRIPTION_PATH,
		view: MANAGE_SUBSCRIPTION_OVERVIEW_PATH,
	},
	manageNavId = 'subscription',
	className = '',
} ) {
	const navigate = useNavigate();
	const { id: templateId } = useTemplateRecipe();
	const isClassic = templateId === 'classic';
	const [ pendingId, setPendingId ] = useState( null );
	const [ reactivateTarget, setReactivateTarget ] = useState( null );
	const openScoped = ( path, subscriptionId ) =>
		navigate(
			subscriptionLocation( path, subscriptionId, {
				activeNavId: manageNavId,
			} )
		);
	const openManageView = ( subscriptionId ) =>
		openScoped( managePath.manage, subscriptionId );
	const openDeliveryView = ( card ) => {
		const path = isSubscriptionCanceled( card?.status )
			? PORTAL_HOME_PATH
			: managePath.view;
		openScoped( path, card.id );
	};
	const canReactivate = isPortalActionEnabled( 'reactivate' );

	const handleReactivate = async ( card ) => {
		if ( ! canReactivate || ! onReactivate || pendingId ) {
			return;
		}
		if ( card?.lifecycleAction !== 'reactivate' ) {
			return;
		}
		if ( isClassic ) {
			setReactivateTarget( card );
			return;
		}
		setPendingId( card.id );
		try {
			await handleReactivateSubscription( onReactivate, card.id );
		} finally {
			setPendingId( null );
		}
	};

	const handleResume = async ( subscriptionId ) => {
		if ( ! onResume || pendingId ) {
			return;
		}
		setPendingId( subscriptionId );
		try {
			await onResume( subscriptionId );
		} catch ( err ) {
			window.alert( err?.message || __( 'Could not resume subscription', 'stayilo' ) );
		} finally {
			setPendingId( null );
		}
	};

	if ( loading && cards.length === 0 ) {
		return (
			<div className={ className }>
				<div className="md:col-span-2">
					<PageLoader message={ loadingMessage } />
				</div>
			</div>
		);
	}

	if ( cards.length === 0 ) {
		return (
			<div className={ className }>
				<div className="md:col-span-2">
					<EmptySubscriptionsState
						title={ emptyTitle }
						description={ emptyDescription }
						actionLabel={ emptyActionLabel }
					/>
				</div>
			</div>
		);
	}

	return (
		<>
			<div className={ className }>
				{ cards.map( ( card ) => (
					<MealBoxCard
						key={ card.id }
						title={ card.title }
						description={ card.description }
						category={ card.category }
						imageUrl={ card.imageUrl }
						imageAlt={ card.imageAlt }
						status={ card.status }
						paymentFailed={ Boolean( card.paymentFailed ) }
						actionLabel={ card.actionLabel }
						nextDelivery={ card.nextDelivery }
						actionLoading={ pendingId === card.id }
						reactivateLabel={ reactivateActionLabel( false ) }
						loadingLabel={ reactivateActionLabel( true ) }
						onManage={ () => openManageView( card.id ) }
						onOpenDelivery={ () => openDeliveryView( card ) }
						onReactivate={
							canReactivate &&
							onReactivate &&
							card.lifecycleAction === 'reactivate'
								? () => handleReactivate( card )
								: undefined
						}
						onResume={ () => handleResume( card.id ) }
					/>
				) ) }
			</div>
			{ isClassic ? (
				<ReactivateSubscriptionPopup
					open={ Boolean( reactivateTarget ) }
					onClose={ () => setReactivateTarget( null ) }
					subscriptionId={ reactivateTarget?.id || '' }
					subscriptionTitle={ reactivateTarget?.title || '' }
					onReactivate={ onReactivate }
				/>
			) : null }
		</>
	);
}
