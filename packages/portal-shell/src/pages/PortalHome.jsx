import { useMemo, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Banner } from '../components/Banner.jsx';
import { ReactivateSubscriptionPopup } from '../components/ReactivateSubscriptionPopup.jsx';
import { SubscriptionOverview } from './sections/SubscriptionOverview.jsx';
import { PAYMENT_FAILED_BANNER, REACTIVATE_BANNER } from '../data/banners.js';
import { VIEW_BOX_PATH } from '../routes.js';
import { useAccount } from '../store/useAccount.js';
import { useSubscriptions } from '../store/useSubscriptions.js';
import {
	handleReactivateSubscription,
	reactivateActionLabel,
} from '../utils/createSubscription.js';
import { isPortalActionEnabled } from '../utils/portalActions.js';
import { subscriptionLocation } from '../utils/subscriptionNavigation.js';
import {
	goToSubscriptionPaymentCheckout,
	isSubscriptionCanceled,
	resolvePaymentFailedSubscription,
	resolvePrimarySubscription,
} from '../utils/subscriptionOverview.js';
import { readPreferredSubscriptionId } from '../store/useResolvedSubscription.js';
import { HomeLayout } from '../templates/layouts/HomeLayout.jsx';
import { useTemplateRecipe } from '../templates/TemplateProvider.jsx';
import { __, sprintf } from '@stayilo/design-system/i18n';

/**
 * Default portal home — order overview from live subscriptions.
 */
export function PortalHome() {
	const navigate = useNavigate();
	const location = useLocation();
	const [ searchParams ] = useSearchParams();
	const { id: templateId } = useTemplateRecipe();
	const isClassic = templateId === 'classic';
	const { firstName } = useAccount();
	const {
		subscriptions,
		activeCount,
		skipDelivery,
		rescheduleDelivery,
		reactivateSubscription,
	} = useSubscriptions();
	const [ reactivating, setReactivating ] = useState( false );
	const [ reactivateOpen, setReactivateOpen ] = useState( false );

	const preferredId = readPreferredSubscriptionId(
		undefined,
		location.state,
		searchParams
	);

	const primary = useMemo(
		() => resolvePrimarySubscription( subscriptions, preferredId ),
		[ subscriptions, preferredId ]
	);
	const paymentFailedSubscription = useMemo(
		() => resolvePaymentFailedSubscription( subscriptions, preferredId ),
		[ preferredId, subscriptions ]
	);
	const showReactivateBanner = isSubscriptionCanceled( primary?.status );
	// Cancel / reactivate messaging wins when the plan is cancelled.
	const showPaymentFailedBanner =
		! showReactivateBanner && Boolean( paymentFailedSubscription );
	const canReactivate = isPortalActionEnabled( 'reactivate' );
	const reactivationEnabled =
		canReactivate && primary?.lifecycleAction === 'reactivate';

	const banner = useMemo( () => {
		if ( showPaymentFailedBanner ) {
			return {
				...PAYMENT_FAILED_BANNER,
				actions: [
					{
						...PAYMENT_FAILED_BANNER.actions[ 0 ],
						onClick: () =>
							goToSubscriptionPaymentCheckout( paymentFailedSubscription ),
					},
				],
			};
		}

		if ( showReactivateBanner ) {
			const actions = [
				{
					label: __( 'Review your subscription', 'stayilo' ),
					variant: 'secondary',
					onClick: () =>
						navigate(
							subscriptionLocation( VIEW_BOX_PATH, primary?.id )
						),
				},
			];

			if ( reactivationEnabled ) {
				actions.unshift( {
					label: reactivateActionLabel( reactivating ),
					variant: 'primary',
					disabled: reactivating,
					onClick: async () => {
						if ( ! primary?.id || reactivating ) {
							return;
						}
						if ( isClassic ) {
							setReactivateOpen( true );
							return;
						}
						setReactivating( true );
						try {
							await handleReactivateSubscription(
								reactivateSubscription,
								primary.id
							);
						} finally {
							setReactivating( false );
						}
					},
				} );
			}

			return {
				...REACTIVATE_BANNER,
				title: firstName
					? sprintf( __( 'Welcome back, %s!', 'stayilo' ), firstName )
					: __( 'Welcome back!', 'stayilo' ),
				subtitle: reactivationEnabled
					? __( 'Your subscription is cancelled. Reactivate to start a fresh subscription at today’s pricing.', 'stayilo' )
					: __( 'Your subscription is cancelled. Reactivation is not available — contact us if you need help.', 'stayilo' ),
				actions,
			};
		}

		return {
			...REACTIVATE_BANNER,
			title: firstName ? sprintf( __( 'Welcome, %s!', 'stayilo' ), firstName ) : __( 'Welcome!', 'stayilo' ),
			subtitle: primary?.nextDelivery?.date
				? sprintf( __( 'Your next order is %s.', 'stayilo' ), primary.nextDelivery.date )
				: __( 'Here is an overview of your current subscription.', 'stayilo' ),
			backgroundColor: 'var(--stayilo-banner-bg)',
			textTone: 'brand',
			actions: [],
		};
	}, [
		showPaymentFailedBanner,
		paymentFailedSubscription,
		showReactivateBanner,
		reactivationEnabled,
		firstName,
		primary,
		navigate,
		reactivateSubscription,
		reactivating,
		isClassic,
	] );

	return (
		<>
			<HomeLayout
				hero={ <Banner { ...banner } /> }
				detail={
					<SubscriptionOverview
						subscription={ primary }
						subscriptionId={ primary?.id }
						activeCount={ activeCount }
						skipDelivery={ skipDelivery }
						rescheduleDelivery={ rescheduleDelivery }
						sliderSubtitle={
							primary?.description ||
							__( "We picked items we thought you'd like.", 'stayilo' )
						}
					/>
				}
			/>
			{ isClassic ? (
				<ReactivateSubscriptionPopup
					open={ reactivateOpen }
					onClose={ () => setReactivateOpen( false ) }
					subscriptionId={ primary?.id || '' }
					subscriptionTitle={ primary?.title || '' }
					onReactivate={ reactivateSubscription }
				/>
			) : null }
		</>
	);
}
