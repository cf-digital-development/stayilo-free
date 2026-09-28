import { useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ChangeFrequencyPopup } from '../components/ChangeFrequencyPopup.jsx';
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
	isPortalActionRegistered,
	usePortalPremiumRevision,
} from '../utils/portalActions.js';
import { oneTimeLinesFromSubscription } from '../utils/cartLines.js';
import { useUpcomingBoxItems } from '../utils/useUpcomingBoxItems.js';
import { VIEW_LAYOUTS } from './view-box/layouts.js';
import { __ } from '@stayilo/design-system/i18n';

/**
 * View box / upcoming order details — timeline, next box, address, lines.
 * Change date is a paid action (`portal-core` → PortalActionSlot).
 */

export function ViewBox() {
	const navigate = useNavigate();
	usePortalPremiumRevision();
	const location = useLocation();
	const recipe = useTemplateRecipe();
	const {
		subscription,
		subscriptionId,
		changeFrequency,
		lines,
		saveState,
		updateQuantity,
		removeLine,
	} = useSaveSubscriptionBox( location.state?.subscriptionId );
	const boxSectionRef = useRef( null );
	const [ changeDateBannerAction, setChangeDateBannerAction ] =
		useState( null );
	const [ changeFrequencyOpen, setChangeFrequencyOpen ] = useState( false );
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
	const canChangeFrequency =
		canManageDelivery &&
		isPortalActionRegistered( 'change-frequency' ) &&
		isPortalActionEnabled( 'change-frequency' ) &&
		hasPortalActionNonce( 'changeFrequencyNonce' );
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
		if ( canChangeFrequency ) {
			actions.push( {
				label: __( 'Order frequency', 'stayilo' ),
				disabled: false,
				onClick: () => setChangeFrequencyOpen( true ),
			} );
		}
		return actions;
	}, [ changeDateBannerAction, canChangeFrequency, canManageDelivery ] );
	const splitDeliveryActions = useMemo( () => {
		const actions = [];
		if ( canChangeFrequency ) {
			actions.push( {
				label: __( 'Delivery frequency', 'stayilo' ),
				disabled: false,
				onClick: () => setChangeFrequencyOpen( true ),
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
	}, [ changeDateBannerAction, canChangeFrequency, canManageDelivery ] );

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
			<ChangeFrequencyPopup
				open={ changeFrequencyOpen }
				onClose={ () => setChangeFrequencyOpen( false ) }
				subscription={ subscription }
				onConfirm={ async ( option ) => {
					if ( ! subscriptionId ) {
						return;
					}
					try {
						await changeFrequency( subscriptionId, {
							interval: option.interval,
							period: option.period,
						} );
						setChangeFrequencyOpen( false );
					} catch ( err ) {
						window.alert(
							err?.message || __( 'Could not change order frequency', 'stayilo' )
						);
					}
				} }
			/>
		</>
	);
}
