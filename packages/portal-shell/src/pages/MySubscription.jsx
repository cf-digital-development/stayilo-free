import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Banner } from '../components/Banner.jsx';
import { CancelSubscriptionPopup } from '../components/CancelSubscriptionPopup.jsx';
import { PageLoader } from '../components/PageLoader.jsx';
import { useAccount } from '../store/useAccount.js';
import { useSubscriptions } from '../store/useSubscriptions.js';
import { PAYMENT_FAILED_BANNER, WELCOME_BANNER } from '../data/banners.js';
import { formatActiveSubscriptionsSubtitle } from '../data/mealBox.js';
import {
	goToSubscriptionPaymentCheckout,
	resolvePaymentFailedSubscription,
} from '../utils/subscriptionOverview.js';
import { HomeLayout } from '../templates/layouts/HomeLayout.jsx';
import { Subscription } from './sections/Subscription.jsx';
import { useTemplateRecipe } from '../templates/TemplateProvider.jsx';
import { hasPortalActionNonce } from '../utils/portalActions.js';
import { __, sprintf } from '@stayilo/design-system/i18n';

/**
 * My Subscription page — welcome banner + subscription card grid.
 * Shows the canceled confirmation popup after completing cancel flow.
 */
export function MySubscription() {
	const location = useLocation();
	const { firstName } = useAccount();
	const { subscriptions, activeCount, loading, resumeSubscription, reactivateSubscription } =
		useSubscriptions();
	const canResume = hasPortalActionNonce( 'resumeNonce' );
	const [ cancelCompleteOpen, setCancelCompleteOpen ] = useState(
		Boolean( location.state?.showCancelComplete )
	);
	const { id } = useTemplateRecipe();

	useEffect( () => {
		if ( location.state?.showCancelComplete ) {
			setCancelCompleteOpen( true );
		}
	}, [ location.state ] );

	const paymentFailedSubscription = useMemo(
		() => resolvePaymentFailedSubscription( subscriptions ),
		[ subscriptions ]
	);

	const welcomeBanner = useMemo( () => {
		if ( paymentFailedSubscription ) {
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

		return {
			...WELCOME_BANNER,
			title: firstName ? sprintf( __( 'Welcome, %s!', 'stayilo' ), firstName ) : __( 'Welcome!', 'stayilo' ),
			subtitle: __( 'Manage your meal subscriptions and upcoming orders here.', 'stayilo' ),
		};
	}, [ firstName, paymentFailedSubscription ] );

	const isEmpty = ! loading && subscriptions.length === 0;

	return (
		<HomeLayout
			hero={
				isEmpty ? null : (
					<Banner { ...welcomeBanner } showDecorations={ id === 'minimal' } />
				)
			}
			list={
				loading && subscriptions.length === 0 ? (
					<section className="portal-content portal-section--padded">
						<PageLoader message={ __( 'Loading your subscriptions…', 'stayilo' ) } />
					</section>
				) : (
					<Subscription
						cards={ subscriptions }
						headerSubtitle={ formatActiveSubscriptionsSubtitle( activeCount ) }
						onReactivate={ reactivateSubscription }
						onResume={ canResume ? resumeSubscription : undefined }
					/>
				)
			}
		>
			<CancelSubscriptionPopup
				open={ cancelCompleteOpen }
				initialStep="canceled"
				onClose={ () => setCancelCompleteOpen( false ) }
			/>
		</HomeLayout>
	);
}
