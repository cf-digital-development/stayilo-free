import { ActionPageHero } from '../components/ActionPageHero.jsx';
import { Banner } from '../components/Banner.jsx';
import { SubscriptionGrid } from '../components/SubscriptionGrid.jsx';
import {
	ACCOUNT_SUBSCRIPTION_BANNER,
	ACCOUNT_SUBSCRIPTION_HEADER,
} from '../data/mealBox.js';
import {
	MANAGE_SUBSCRIPTION_PATH,
	MANAGE_SUBSCRIPTION_OVERVIEW_PATH,
	VIEW_BOX_PATH,
} from '../routes.js';
import { useSubscriptions } from '../store/useSubscriptions.js';
import { useTemplateRecipe } from '../templates/TemplateProvider.jsx';
import { hasPortalActionNonce } from '../utils/portalActions.js';
import { __ } from '@stayilo/design-system/i18n';

/**
 * Account manage-subscriptions — list of plans opened from Account Info.
 */
export function AccountSubscription() {
	const { view, id } = useTemplateRecipe();
	const { subscriptions, loading, resumeSubscription, reactivateSubscription } =
		useSubscriptions();
	const canResume = hasPortalActionNonce( 'resumeNonce' );
	const isEmpty = subscriptions.length === 0;
	const grid = (
		<SubscriptionGrid
			cards={ subscriptions }
			loading={ loading }
			onReactivate={ reactivateSubscription }
			onResume={ canResume ? resumeSubscription : undefined }
			managePath={ {
				manage: MANAGE_SUBSCRIPTION_PATH,
				view:
					view === 'split'
						? VIEW_BOX_PATH
						: MANAGE_SUBSCRIPTION_OVERVIEW_PATH,
			} }
			manageNavId="account"
			className={
				id === 'classic'
					? isEmpty
						? 'grid grid-cols-1'
						: 'grid h-full grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3'
					: 'grid grid-cols-1 gap-6 md:grid-cols-2 p-6 rounded-3xl bg-white'
			}
		/>
	);

	if ( id === 'classic' ) {
		return (
			<div className="w-full">
				<Banner
					{ ...ACCOUNT_SUBSCRIPTION_BANNER }
					showDecorations={ id === 'minimal' }
				/>
				<section className="portal-content portal-section--padded">
					<div className={ isEmpty ? 'w-full' : 'w-full max-w-[1240px] m-auto' }>
						{ grid }
					</div>
				</section>
			</div>
		);
	}

	return (
		<ActionPageHero
			title={ ACCOUNT_SUBSCRIPTION_HEADER.title }
			subtitle={ ACCOUNT_SUBSCRIPTION_HEADER.subtitle }
			contentClassName="portal-content relative z-[1] !max-w-[1080px] mx-auto mt-10 lg:mt-[-124px] pb-16 md:pb-28"
		>
			{ grid }
		</ActionPageHero>
	);
}
