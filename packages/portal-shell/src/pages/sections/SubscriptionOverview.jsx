import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ManageDeliveryPopup } from '../../components/ManageDeliveryPopup/index.js';
import { UpcomingDeliveryBanner } from '../../components/UpcomingDeliveryBanner.jsx';
import { WeeklyDiscountBanner } from '../../components/WeeklyDiscountBanner.jsx';
import { UPCOMING_DELIVERY_BANNER } from '../../data/contentHeaders.js';
import { WEEKLY_DISCOUNT_BANNER } from '../../data/discounts.js';
import { EDIT_BOX_PATH, VIEW_BOX_PATH } from '../../routes.js';
import {
	formatEditUntilLabel,
	formatShortDeliveryDate,
	getManageDeliveryPopupProps,
	resolveDeliveryDateParts,
} from '../../utils/delivery/index.js';
import { getStayiloRegistry } from '@stayilo/extension-sdk';
import {
	canShowFreeSelfServeManageUi,
	hasPortalActionNonce,
	isPortalActionEnabled,
	usePortalPremiumRevision,
} from '../../utils/portalActions.js';
import { subscriptionLocation } from '../../utils/subscriptionNavigation.js';
import {
	isSubscriptionCanceled,
	subscriptionDiscountLabels,
	subscriptionHasDiscounts,
	toOrderSliderItems,
} from '../../utils/subscriptionOverview.js';
import { YourOrderSlider } from './YourOrderSlider.jsx';
import { __, sprintf } from '@stayilo/design-system/i18n';

export function SubscriptionOverview( {
	subscription,
	subscriptionId,
	activeCount = 0,
	skipDelivery,
	rescheduleDelivery,
	sliderSubtitle,
} ) {
	const navigate = useNavigate();
	usePortalPremiumRevision();
	const [ deliveryOpen, setDeliveryOpen ] = useState( false );
	const orderItems = useMemo(
		() => toOrderSliderItems( subscription ),
		[ subscription ]
	);
	const hasDiscounts = useMemo(
		() => subscriptionHasDiscounts( subscription ),
		[ subscription ]
	);
	const discountLabels = useMemo(
		() => subscriptionDiscountLabels( subscription ),
		[ subscription ]
	);
	const canManageBox =
		activeCount > 0 &&
		subscription?.status === 'active' &&
		! isSubscriptionCanceled( subscription?.status ) &&
		orderItems.length > 0;
	const canEditDelivery =
		canManageBox && canShowFreeSelfServeManageUi();
	const canEditItems =
		canManageBox &&
		Boolean( getStayiloRegistry().getPortalRoute?.( 'edit-box' ) ) &&
		isPortalActionEnabled( 'edit-items' ) &&
		hasPortalActionNonce( 'editItemsNonce' );
	const id = subscriptionId || subscription?.id;
	const goToBox = ( path ) => {
		if ( ! id ) {
			navigate( path );
			return;
		}
		navigate( subscriptionLocation( path, id ) );
	};
	const openDelivery = () => setDeliveryOpen( true );
	const openEditBox = () => goToBox( EDIT_BOX_PATH );
	const deliveryPopupProps = useMemo(
		() => getManageDeliveryPopupProps( subscription ),
		[ subscription ]
	);
	const deliveryBanner = useMemo( () => {
		const dateRef =
			subscription?.nextDelivery?.dateId ||
			subscription?.nextDelivery?.date;
		const parts = resolveDeliveryDateParts( dateRef );
		const title = parts
			? formatShortDeliveryDate( parts )
			: UPCOMING_DELIVERY_BANNER.title;
		const editUntil = dateRef ? formatEditUntilLabel( dateRef ) : '';
		const subtitle = editUntil
			? sprintf( __( 'Edit order by %s.', 'stayilo' ), editUntil.toLowerCase() )
			: UPCOMING_DELIVERY_BANNER.subtitle;

		return {
			...UPCOMING_DELIVERY_BANNER,
			title,
			subtitle,
		};
	}, [ subscription ] );

	const discountPrefix = useMemo( () => {
		if ( discountLabels.length === 0 ) {
			return WEEKLY_DISCOUNT_BANNER.prefix;
		}
		return `${ WEEKLY_DISCOUNT_BANNER.prefix } ${ discountLabels.join( ', ' ) }`;
	}, [ discountLabels ] );

	return (
		<>
			<UpcomingDeliveryBanner
				{ ...deliveryBanner }
				actionsEnabled={ canEditDelivery }
				onEditDelivery={ openDelivery }
				titleClassName="!font-[800]"
			/>
			{ hasDiscounts ? (
				<WeeklyDiscountBanner
					{ ...WEEKLY_DISCOUNT_BANNER }
					prefix={ discountPrefix }
					showViewAllLink={ discountLabels.length > 1 }
					onViewAll={
						discountLabels.length > 1
							? () => goToBox( VIEW_BOX_PATH )
							: undefined
					}
				/>
			) : null }
			<YourOrderSlider
				// subtitle={ sliderSubtitle }
				items={ orderItems }
				actionsEnabled={ canManageBox }
				onEditBox={ canEditItems ? openEditBox : undefined }
				editBoxEnabled={ canEditItems }
				onViewBox={ () => goToBox( VIEW_BOX_PATH ) }
			/>

			<ManageDeliveryPopup
				open={ deliveryOpen }
				descriptionClassName={{
					manage: '!font-normal !text-base !leading-[26px] !mt-4',
					reschedule: '!font-semibold !mt-8',
					confirm: ' !mt-4',
					success: ' !mt-4 !mb-9',
					'skip-confirm': __( ' !mt-4', 'stayilo' ),
					'success-skip': __( ' !mt-4 !mb-9', 'stayilo' ),
				}}
				onClose={ () => setDeliveryOpen( false ) }
				{ ...deliveryPopupProps }
				allowSkip={ isPortalActionEnabled( 'skip-delivery' ) }
				allowReschedule={
					isPortalActionEnabled( 'change-delivery-date' ) &&
					hasPortalActionNonce( 'changeDateNonce' )
				}
				allowChangeBoxSize={ canEditItems }
				onChangeBoxSize={
					canEditItems ? openEditBox : undefined
				}
				onRescheduleConfirm={ async ( date ) => {
					if ( ! id ) {
						throw new Error( __( 'Missing subscription for date change.', 'stayilo' ) );
					}
					if ( ! rescheduleDelivery ) {
						throw new Error( __( 'Change order date is not available.', 'stayilo' ) );
					}
					return rescheduleDelivery( id, date );
				} }
				onSkip={ async () => {
					if ( ! id ) {
						throw new Error( __( 'Missing subscription for skip.', 'stayilo' ) );
					}
					if ( ! skipDelivery ) {
						throw new Error( __( 'Skip order is not available.', 'stayilo' ) );
					}
					return skipDelivery( id );
				} }
			/>
		</>
	);
}
