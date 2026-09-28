import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ReactComponent as EditBoxIcon } from '@stayilo/design-system/assets/svg/editbox.svg';
import { ReactComponent as SimplificationIcon } from '@stayilo/design-system/assets/svg/Simplification.svg';
import { ReactComponent as ActionEditBoxIcon } from '@stayilo/design-system/assets/svg/action-edit-box.svg';
import { ReactComponent as ActionPauseSubIcon } from '@stayilo/design-system/assets/svg/action-pause-sub.svg';
import { ReactComponent as SkipForwardIcon } from '@stayilo/design-system/assets/svg/action-skip-delivery.svg';
import { ReactComponent as CancelIcon } from '@stayilo/design-system/assets/svg/action-cancel-sub.svg';
import { ActionPageHero } from '../components/ActionPageHero.jsx';
import { ActionPromptCard } from '../components/ActionPromptCard.jsx';
import { CancelSubscriptionPopup } from '../components/CancelSubscriptionPopup.jsx';
import {
	CLASSIC_SUBSCRIPTION_ACTION_COPY,
	SUBSCRIPTION_ACTION_CARDS,
	SUBSCRIPTION_ACTIONS_HEADER,
} from '../data/subscriptionActions.js';
import { __ } from '@stayilo/design-system/i18n';
import {
	ACCOUNT_SUBSCRIPTION_PATH,
	EDIT_BOX_PATH,
} from '../routes.js';
import { PortalActionSlot } from '../slots/PortalActionSlot.jsx';
import { getStayiloRegistry } from '@stayilo/extension-sdk';
import { useResolvedSubscription } from '../store/useResolvedSubscription.js';
import { useTemplateRecipe } from '../templates/TemplateProvider.jsx';
import { subscriptionLocation } from '../utils/subscriptionNavigation.js';
import {
	hasPortalActionNonce,
	isPortalActionEnabled,
	usePortalPremiumRevision,
} from '../utils/portalActions.js';

const ACTION_CARD_CLASS = 'portal-action-prompt-grid__item';

const ACTION_ICONS = {
	'edit-box': <EditBoxIcon width={ 96 } height={ 96 } aria-hidden="true" />,
	'cancel-subscription': (
		<SimplificationIcon width={ 96 } height={ 96 } aria-hidden="true" />
	),
};

const CLASSIC_ACTION_ICONS = {
	'edit-box': <ActionEditBoxIcon  aria-hidden="true" />,
	'pause-subscription': (
		<ActionPauseSubIcon aria-hidden="true" />
	),
	'skip-delivery': (
		<SkipForwardIcon aria-hidden="true" />
	),
	'cancel-subscription': (
		<CancelIcon aria-hidden="true" />
	),
};

function resolveCard( card, id ) {
	if ( id !== 'classic' ) {
		return card;
	}
	return {
		...card,
		...( CLASSIC_SUBSCRIPTION_ACTION_COPY[ card.actionKey ] || {} ),
	};
}

/**
 * Subscription actions — help cards opened from Manage Subscription.
 * Skip and cancel ship with Free. Paid plugins register extra cards.
 * Cards are hidden when unavailable (not shown disabled).
 */
export function SubscriptionActions() {
	const navigate = useNavigate();
	usePortalPremiumRevision();
	const location = useLocation();
	const { id } = useTemplateRecipe();
	const {
		subscriptionId,
		subscription,
		cancelSubscription,
		refresh,
		applySubscriptionCard,
	} = useResolvedSubscription( location.state?.subscriptionId );
	const [ cancelOpen, setCancelOpen ] = useState( false );

	const visibleCards = [
		...SUBSCRIPTION_ACTION_CARDS,
		...( getStayiloRegistry().getPortalActionCards?.() || [] ),
	].filter( ( card ) => {
		if ( id !== 'classic' && card.actionKey === 'pause-subscription' ) {
			return false;
		}
		if ( ! isPortalActionEnabled( card.actionKey ) ) {
			return false;
		}
		return ! card.nonceKey || hasPortalActionNonce( card.nonceKey );
	} );

	const handleAction = ( actionKey ) => {
		if ( actionKey === 'edit-box' ) {
			navigate(
				subscriptionLocation( EDIT_BOX_PATH, subscriptionId, {
					activeNavId: location.state?.activeNavId ?? 'account',
				} )
			);
			return;
		}

		if ( actionKey === 'cancel-subscription' ) {
			setCancelOpen( true );
		}
	};

	const cards = visibleCards.map( ( raw ) => {
		const card = resolveCard( raw, id );
		const icon =
			card.icon ||
			( id === 'classic'
				? CLASSIC_ACTION_ICONS[ card.actionKey ]
				: ACTION_ICONS[ card.actionKey ] );
		const actionVariant = 'secondary';
		const className = ACTION_CARD_CLASS;

		if ( card.actionKey === 'skip-delivery' ) {
			return (
				<PortalActionSlot
					key={ card.id }
					actionId="skip-delivery"
					subscriptionId={ subscriptionId }
					icon={ icon }
					title={ card.title }
					description={ card.description }
					actionLabel={ card.actionLabel }
					className={ className }
					descriptionClassName={ {
						'skip-confirm': __( ' !mt-4', 'stayilo' ),
						'success-skip': __( ' !mt-4 !mb-9', 'stayilo' ),
					} }
				/>
			);
		}

		if ( card.actionKey === 'pause-subscription' ) {
			return (
				<PortalActionSlot
					key={ card.id }
					actionId="pause"
					subscriptionId={ subscriptionId }
					icon={ icon }
					title={ card.title }
					description={ card.description }
					actionLabel={ card.actionLabel }
					className={ className }
				/>
			);
		}

		return (
			<ActionPromptCard
				key={ card.id }
				icon={ icon }
				title={ card.title }
				description={ card.description }
				actionLabel={ card.actionLabel }
				actionVariant={ actionVariant }
				onAction={ () => handleAction( card.actionKey ) }
				className={ className }
			/>
		);
	} );

	return (
		<>
			{ id === 'classic' ? (
				<div className="portal-subscription-actions w-full">
					<section className="portal-content portal-section--padded">
						<header className="portal-subscription-actions__header">
							<h1 className="portal-subscription-actions__title">
								{ SUBSCRIPTION_ACTIONS_HEADER.title }
							</h1>
							<p className="portal-subscription-actions__subtitle">
								{ SUBSCRIPTION_ACTIONS_HEADER.subtitle }
							</p>
						</header>
						<div className="portal-action-prompt-grid">{ cards }</div>
					</section>
				</div>
			) : (
				<ActionPageHero
					title={ SUBSCRIPTION_ACTIONS_HEADER.title }
					subtitle={ SUBSCRIPTION_ACTIONS_HEADER.subtitle }
					subtitleClassName="mx-auto mt-4 max-w-[1080px] text-lg font-normal leading-[26px] line-clamp-2"
					bandClassName="action_bg_band lg:min-h-[340px] pt-12 pb-12 lg:pt-[83px] lg:pb-5 pb-10 px-5"
					contentClassName="portal-content portal-action-prompt-grid relative z-[1] !max-w-7xl mx-auto mt-10 lg:mt-[-124px]"
				>
					{ cards }
				</ActionPageHero>
			) }

			<CancelSubscriptionPopup
				open={ cancelOpen }
				initialStep="confirm"
				subscriptionId={ subscriptionId }
				subscription={ subscription }
				onClose={ () => setCancelOpen( false ) }
				onCanceled={ async ( meta ) => {
					await cancelSubscription( subscriptionId, meta );
				} }
				onCancelComplete={ () => {
					setCancelOpen( false );
					navigate( ACCOUNT_SUBSCRIPTION_PATH, {
						state: {
							activeNavId: 'account',
							subscriptionId,
							subscriptionStatus: 'canceled',
						},
					} );
				} }
				onKept={ async ( result ) => {
					try {
						if ( result?.subscription ) {
							applySubscriptionCard?.( result.subscription );
						}
						await refresh?.();
					} catch ( _err ) {
						// Offer already applied; stale list is non-blocking.
					}
				} }
			/>
		</>
	);
}
