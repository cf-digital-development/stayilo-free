import { ContentHeader } from '../../components/ContentHeader.jsx';
import { SubscriptionGrid } from '../../components/SubscriptionGrid.jsx';
import { MY_SUBSCRIPTION_HEADER } from '../../data/mealBox.js';
import {
	MANAGE_SUBSCRIPTION_OVERVIEW_PATH,
	MANAGE_SUBSCRIPTION_PATH,
	VIEW_BOX_PATH,
} from '../../routes.js';
import { useTemplateRecipe } from '../../templates/TemplateProvider.jsx';
import { __ } from '@stayilo/design-system/i18n';

/**
 * My subscription header + subscription card grid.
 *
 * @param {object} props
 * @param {Array<object>} [props.cards]
 * @param {string} [props.headerSubtitle]
 * @param {(subscriptionId: string) => Promise<{ checkoutUrl?: string }>} [props.onReactivate]
 * @param {(subscriptionId: string) => Promise<void>} [props.onResume]
 * @param {string} [props.className]
 */
export function Subscription( {
	cards = [],
	headerSubtitle = MY_SUBSCRIPTION_HEADER.subtitle,
	onReactivate,
	onResume,
	className = '',
} ) {
	const { view, id } = useTemplateRecipe();
	const isEmpty = cards.length === 0;
	const classes = [
		'portal-content portal-section--padded',
		className,
	]
		.filter( Boolean )
		.join( ' ' );

	return (
		<section
			className={ classes }
			aria-label={ MY_SUBSCRIPTION_HEADER.title }
		>
			<div className={ isEmpty ? 'w-full' : 'w-full max-w-[1240px]' }>
				{ ! isEmpty ? (
					<ContentHeader
						variant="section"
						title={ MY_SUBSCRIPTION_HEADER.title }
						subtitle={ headerSubtitle }
					/>
				) : null }
				<SubscriptionGrid
					emptyTitle={ __( 'No subscription found', 'stayilo' ) }
					cards={ cards }
					onReactivate={ onReactivate }
					onResume={ onResume }
					managePath={ {
						manage: MANAGE_SUBSCRIPTION_PATH,
						view:
							view === 'split'
								? VIEW_BOX_PATH
								: MANAGE_SUBSCRIPTION_OVERVIEW_PATH,
					} }
					manageNavId="subscription"
					className={
						isEmpty
							? 'grid grid-cols-1'
							: id === 'classic'
								? 'mt-8 grid h-full grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3'
								: 'mt-8 grid h-full grid-cols-1 gap-7 md:grid-cols-2'
					}
				/>
			</div>
		</section>
	);
}
