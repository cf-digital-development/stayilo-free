import { useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { PortalActionSlot } from '../slots/PortalActionSlot.jsx';
import { VIEW_BOX_NEXT_CARD } from '../data/commerce.js';
import { EDIT_BOX_PATH } from '../routes.js';
import { useBoxTotalProps } from '../store/useCartLines.js';
import { useSaveSubscriptionBox } from '../store/useSaveSubscriptionBox.js';
import { useTemplateRecipe } from '../templates/TemplateProvider.jsx';
import { subscriptionLocation } from '../utils/subscriptionNavigation.js';
import {
	formatChangeWindowLabel,
	resolveNextDeliveryDate,
} from '../utils/delivery/index.js';
import {
	formatDeliveryBannerDate,
	parseDateId,
	toDateId,
} from '../utils/monthCalendar.js';
import { getPortalCurrency } from '../utils/portalCurrency.js';
import { getStayiloRegistry } from '@stayilo/extension-sdk';
import {
	hasPortalActionNonce,
	isPortalActionEnabled,
	usePortalPremiumRevision,
} from '../utils/portalActions.js';
import { oneTimeLinesFromSubscription } from '../utils/cartLines.js';
import { useUpcomingBoxItems } from '../utils/useUpcomingBoxItems.js';
import { VIEW_LAYOUTS } from './view-box/layouts.js';
import { __ } from '@stayilo/design-system/i18n';

/**
 * View box / upcoming order details — timeline, next box, address, lines.
 * Change date and frequency are paid actions registered via PortalActionSlot.
 */

export function ViewBox() {
	const navigate = useNavigate();
	usePortalPremiumRevision();
	const location = useLocation();
	const recipe = useTemplateRecipe();
	const {
		subscription,
		subscriptionId,
		lines,
		saveState,
		updateQuantity,
		removeLine,
	} = useSaveSubscriptionBox( location.state?.subscriptionId );
	const boxSectionRef = useRef( null );
	const [ changeDateBannerAction, setChangeDateBannerAction ] =
		useState( null );
	const [ frequencyDeliveryAction, setFrequencyDeliveryAction ] =
		useState( null );
	const currency = getPortalCurrency( subscription?.currency );
	const oneTimeLines = useMemo(
		() => oneTimeLinesFromSubscription( subscription ),
		[ subscription ]
	);
	const displayLines = useMemo(
		() => [ ...lines, ...oneTimeLines ],
		[ lines, oneTimeLines ]
	);
	const boxTotal = useBoxTotalProps( {
		currency,
		lines: displayLines,
		orderSummary: subscription?.orderSummary,
		shippingTotal:
			subscription?.orderSummary?.shippingTotal ??
			subscription?.shippingTotal ??
			0,
		shippingLabel: subscription?.orderSummary?.shippingLabel,
		discountTotal: subscription?.orderSummary?.discountTotal || 0,
		discountPercent: subscription?.retentionDiscount?.percent || 0,
	} );

	const changeWindowLabel = useMemo( () => {
		const dateRef = resolveNextDeliveryDate( subscription );
		return (
			formatChangeWindowLabel( dateRef ) ||
			VIEW_BOX_NEXT_CARD.changeWindowLabel
		);
	}, [ subscription ] );
	const selectedDateId = useMemo( () => {
		const parsed = parseDateId( resolveNextDeliveryDate( subscription ) );
		return parsed ? toDateId( parsed ) : '';
	}, [ subscription ] );
	const nextDate =
		subscription?.nextDelivery?.date ||
		( selectedDateId ? formatDeliveryBannerDate( selectedDateId ) : '' );
	const upcomingItems = useUpcomingBoxItems( subscription, nextDate );
	const canManageDelivery = subscription?.status === 'active';
	const canEditItems =
		canManageDelivery &&
		Boolean( getStayiloRegistry().getPortalRoute?.( 'edit-box' ) ) &&
		isPortalActionEnabled( 'edit-items' ) &&
		hasPortalActionNonce( 'editItemsNonce' );
	const deliveryActions = useMemo( () => {
		const actions = [];
		if ( changeDateBannerAction ) {
			actions.push( {
				...changeDateBannerAction,
				disabled:
					Boolean( changeDateBannerAction.disabled ) ||
					! canManageDelivery,
			} );
		}
		if ( frequencyDeliveryAction ) {
			actions.push( {
				...frequencyDeliveryAction,
				label:
					frequencyDeliveryAction.label ||
					__( 'Order frequency', 'stayilo' ),
				disabled:
					Boolean( frequencyDeliveryAction.disabled ) ||
					! canManageDelivery,
			} );
		}
		return actions;
	}, [ changeDateBannerAction, frequencyDeliveryAction, canManageDelivery ] );
	const splitDeliveryActions = useMemo( () => {
		const actions = [];
		if ( frequencyDeliveryAction ) {
			actions.push( {
				...frequencyDeliveryAction,
				label:
					frequencyDeliveryAction.label ||
					__( 'Delivery frequency', 'stayilo' ),
				disabled:
					Boolean( frequencyDeliveryAction.disabled ) ||
					! canManageDelivery,
			} );
		}
		if ( changeDateBannerAction ) {
			actions.push( {
				...changeDateBannerAction,
				label: changeDateBannerAction.label || __( 'Change date', 'stayilo' ),
				disabled:
					Boolean( changeDateBannerAction.disabled ) ||
					! canManageDelivery,
			} );
		}
		return actions;
	}, [ changeDateBannerAction, frequencyDeliveryAction, canManageDelivery ] );

	const goToEditBox = ( tab ) => {
		if ( ! canEditItems || ! subscriptionId ) {
			return;
		}
		navigate(
			subscriptionLocation(
				EDIT_BOX_PATH,
				subscriptionId,
				tab ? { editBoxTab: tab } : {}
			)
		);
	};

	const layout = recipe?.view === 'split' ? 'split' : 'stack';
	const Body = VIEW_LAYOUTS[ layout ];
	const bodyProps = {
		boxSectionRef,
		subscription,
		subscriptionId,
		navigate,
		changeWindowLabel,
		upcomingItems,
		nextDate,
		deliveryActions:
			layout === 'split' ? splitDeliveryActions : deliveryActions,
		canManageDelivery,
		canEditItems,
		displayLines,
		currency,
		updateQuantity,
		removeLine,
		boxTotal,
		saveState,
		onEditBox: () => goToEditBox(),
		onAddMore: () => goToEditBox( 'add-more' ),
	};

	return (
		<>
			<Body { ...bodyProps } />
			<PortalActionSlot
				actionId="change-delivery-date"
				subscriptionId={ subscriptionId }
				selectedDateId={ selectedDateId }
				registerBannerAction={ setChangeDateBannerAction }
			/>
			<PortalActionSlot
				actionId="change-frequency"
				subscriptionId={ subscriptionId }
				registerDeliveryAction={ setFrequencyDeliveryAction }
			/>
		</>
	);
}
