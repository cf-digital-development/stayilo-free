import { useMemo } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Banner } from '../components/Banner.jsx';
import { SubscriptionOverview } from './sections/SubscriptionOverview.jsx';
import { UpcomingBoxesSlider } from '../components/UpcomingBoxesSlider.jsx';
import { PAYMENT_FAILED_BANNER } from '../data/banners.js';
import { UPCOMING_BOXES_HEADER } from '../data/upcomingBoxes.js';
import { VIEW_BOX_PATH } from '../routes.js';
import { useResolvedSubscription } from '../store/useResolvedSubscription.js';
import { useTemplateRecipe } from '../templates/TemplateProvider.jsx';
import { subscriptionLocation } from '../utils/subscriptionNavigation.js';
import {
	goToSubscriptionPaymentCheckout,
	subscriptionHasPaymentFailed,
} from '../utils/subscriptionOverview.js';
import { useUpcomingBoxItems } from '../utils/useUpcomingBoxItems.js';
import { HomeLayout } from '../templates/layouts/HomeLayout.jsx';

function viewBoxRedirect( location, subscriptionId ) {
	const loc = subscriptionLocation( VIEW_BOX_PATH, subscriptionId );
	const next = new URLSearchParams( loc.search );
	new URLSearchParams( location.search ).forEach( ( value, key ) => {
		if ( ! next.has( key ) ) {
			next.set( key, value );
		}
	} );
	const search = next.toString();
	return {
		pathname: loc.pathname,
		search: search ? `?${ search }` : '',
		state: loc.state,
	};
}

/**
 * Manage subscription — order overview widgets for an active plan.
 * Classic (split view) uses view-box instead.
 */
export function ManageSubscription() {
	const location = useLocation();
	const recipe = useTemplateRecipe();
	const {
		subscription,
		subscriptionId,
		activeCount,
		skipDelivery,
		rescheduleDelivery,
	} = useResolvedSubscription( location.state?.subscriptionId );
	const upcomingItems = useUpcomingBoxItems( subscription );
	const showPaymentFailedBanner = subscriptionHasPaymentFailed( subscription );

	const paymentFailedBanner = useMemo( () => {
		if ( ! showPaymentFailedBanner ) {
			return null;
		}
		return {
			...PAYMENT_FAILED_BANNER,
			actions: [
				{
					...PAYMENT_FAILED_BANNER.actions[ 0 ],
					onClick: () => goToSubscriptionPaymentCheckout( subscription ),
				},
			],
		};
	}, [ showPaymentFailedBanner, subscription ] );

	if ( recipe?.view === 'split' ) {
		const to = viewBoxRedirect( location, subscriptionId );
		return (
			<Navigate
				to={ { pathname: to.pathname, search: to.search } }
				state={ to.state }
				replace
			/>
		);
	}

	return (
		<HomeLayout
			hero={
				paymentFailedBanner ? <Banner { ...paymentFailedBanner } /> : null
			}
			detail={
				<div className="pt-8">
					<UpcomingBoxesSlider
						title={ UPCOMING_BOXES_HEADER.title }
						showTitle={ false }
						items={ upcomingItems }
					/>
					<SubscriptionOverview
						subscription={ subscription }
						subscriptionId={ subscriptionId }
						activeCount={ activeCount }
						skipDelivery={ skipDelivery }
						rescheduleDelivery={ rescheduleDelivery }
						sliderSubtitle={
							subscription
								? subscription.description
								: "We picked meals we thought you'd like."
						}
					/>
				</div>
			}
		/>
	);
}
