import { useMemo } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { ReactComponent as DeliveryIcon } from '@stayilo/design-system/assets/svg/delivery-truck.svg';
import { Banner } from '../components/Banner.jsx';
import { BoxTotalCard } from '../components/BoxTotalCard.jsx';
import { ContentHeader } from '../components/ContentHeader.jsx';
import { CreateSubscriptionBanner } from '../components/CreateSubscriptionBanner.jsx';
import { EmptyState } from '../components/EmptyState.jsx';
import { OrderMetaCard } from '../components/OrderMetaCard.jsx';
import { ProductSummaryCard } from '../components/ProductSummaryCard.jsx';
import { PortalActionSlot } from '../slots/PortalActionSlot.jsx';
import {
	CREATE_SUBSCRIPTION_BANNER,
	ORDER_DETAILS_BANNER,
	ORDER_DETAILS_HEADER,
} from '../data/commerce.js';
import { ClassicOrderBody } from './order-details/ClassicOrderBody.jsx';
import { useOrders } from '../store/useOrders.js';
import { useSubscriptions } from '../store/useSubscriptions.js';
import { useTemplateRecipe } from '../templates/TemplateProvider.jsx';
import {
	buildBoxTotalProps,
	formatCartMoney,
	normalizeCartLines,
} from '../utils/cartLines.js';
import { startCreateSubscription } from '../utils/createSubscription.js';
import { formatDeliveryBannerDate } from '../utils/monthCalendar.js';
import { getPortal } from '../api/portal.js';
import { getPortalCurrency } from '../utils/portalCurrency.js';
import { __, sprintf } from '@stayilo/design-system/i18n';

/**
 * Weekday + date for the order delivery card, e.g. "Friday, 30 Sep 2027".
 *
 * @param {object|null|undefined} order
 * @param {object|null|undefined} subscription
 * @returns {string}
 */
function formatOrderDeliveryDate( order, subscription ) {
	const raw =
		order?.dateId ||
		order?.date ||
		order?.deliveryDate ||
		subscription?.nextDelivery?.dateId ||
		order?.dateLabel ||
		subscription?.nextDelivery?.date ||
		'';
	return formatDeliveryBannerDate( raw ) || raw || '—';
}

/**
 * Single order details — prefer routed order line items, else subscription items.
 * Does not read or write the live Redux cart.
 */
export function OrderDetails() {
	const { orderId } = useParams();
	const location = useLocation();
	const { id } = useTemplateRecipe();
	const { getOrder } = useOrders();
	const { subscriptions, activeCount } = useSubscriptions();
	const orderFromState = location.state?.order;
	const order = orderFromState || getOrder( orderId );
	const subscription = useMemo( () => {
		const preferredId = location.state?.subscriptionId;
		if ( preferredId ) {
			const match = subscriptions.find(
				( sub ) => String( sub.id ) === String( preferredId )
			);
			if ( match ) {
				return match;
			}
		}
		if ( order?.id ) {
			const byParent = subscriptions.find(
				( sub ) =>
					String( sub.parentOrderId || '' ) === String( order.id )
			);
			if ( byParent ) {
				return byParent;
			}
		}
		return (
			subscriptions.find( ( sub ) => sub.status === 'active' ) ||
			subscriptions[ 0 ]
		);
	}, [ location.state?.subscriptionId, order?.id, subscriptions ] );
	const currency = getPortalCurrency(
		order?.currency || subscription?.currency
	);

	const boxItems = useMemo( () => {
		if ( Array.isArray( order?.lineItems ) && order.lineItems.length > 0 ) {
			return normalizeCartLines( order.lineItems );
		}
		return normalizeCartLines(
			( subscription?.lineItems || [] ).filter(
				( line ) => line?.recurring !== false
			)
		);
	}, [ order, subscription ] );

	const boxTotal = useMemo(
		() =>
			buildBoxTotalProps( boxItems, {
				currency,
				label: __( 'Subscription total', 'stayilo' ),
				orderSummary: order?.orderSummary || subscription?.orderSummary,
				shippingTotal:
					order?.orderSummary?.shippingTotal ??
					order?.shippingTotal ??
					subscription?.orderSummary?.shippingTotal ??
					subscription?.shippingTotal ??
					0,
				shippingLabel:
					order?.orderSummary?.shippingLabel ||
					subscription?.orderSummary?.shippingLabel,
				discountTotal:
					order?.orderSummary?.discountTotal ??
					subscription?.orderSummary?.discountTotal ??
					0,
				discountPercent: order
					? 0
					: subscription?.retentionDiscount?.percent || 0,
			} ),
		[ boxItems, currency, order, subscription ]
	);

	const shipping = order?.shipping || subscription?.shipping || {};
	const deliveryDate = formatOrderDeliveryDate( order, subscription );
	const estimateLabel =
		order?.dateLabel || subscription?.nextDelivery?.date || '';
	const orderLinkedToSubscription = Boolean(
		order?.hasSubscription ||
			( order?.id &&
				subscriptions.some(
					( sub ) =>
						String( sub.parentOrderId || '' ) === String( order.id )
				) )
	);
	const showConvertBanner =
		getPortal().subscriptionMode === 'multiple' &&
		! orderLinkedToSubscription;

	if ( id === 'classic' ) {
		return (
			<div className="w-full">
				<Banner
					{ ...ORDER_DETAILS_BANNER }
					showDecorations={ id === 'minimal' }
					paddingClassName={'py-6 md:py-[48px]'}
				/>
				<section className="portal-content portal-section--padded">
					<ClassicOrderBody
						order={ order }
						boxItems={ boxItems }
						currency={ currency }
						boxTotal={ boxTotal }
						shipping={ shipping }
						deliveryDate={ deliveryDate }
						orderStatus={ order?.status || subscription?.status }
						estimateLabel={ estimateLabel }
						showConvertBanner={ showConvertBanner }
					/>
				</section>
			</div>
		);
	}

	return (
		<div className="w-full">
			<section className="portal-content portal-section--padded !max-w-[1080px] !pb-10">
				<ContentHeader
					variant="section"
					title={ ORDER_DETAILS_HEADER.title }
					subtitle={
						order
							? sprintf( __( 'Order #%1$s · %2$s', 'stayilo' ), order.orderNumber, order.dateLabel )
							: ORDER_DETAILS_HEADER.subtitle
					}
				/>
				{ activeCount === 0 ? (
					<CreateSubscriptionBanner
						{ ...CREATE_SUBSCRIPTION_BANNER }
						onAction={ startCreateSubscription }
					/>
				) : null }
			</section>

			<div className="background_container">
				<div className="portal-content portal-section--padded !max-w-[1128px] sm:!pb-[110px] !pb-10 px-6">
					<div className="flex flex-col gap-4">
						<OrderMetaCard
							label={ __( 'Order date', 'stayilo' ) }
							icon={
								<DeliveryIcon
									width={ 40 }
									height={ 40 }
									className="text-[#101010] [&_path]:stroke-current"
								/>
							}
						value={ deliveryDate }
							status={ order?.status || subscription?.status }
							labelPlacement="above"
							bodyAlign="center"
						/>

						<PortalActionSlot
							actionId="update-address"
							shipping={ shipping }
							estimateLabel={
								order?.dateLabel ||
								subscription?.nextDelivery?.date ||
								''
							}
							descriptionClassName="!font-normal !text-base !leading-[24px] !mt-4"
						/>
					</div>

					<section
						className="portal-order-box mt-4"
						aria-label={ __( 'Items in your subscription', 'stayilo' ) }
					>
						<h2 className="m-0 text-xl font-semibold leading-[100%] sm:text-2xl sm:leading-8">
							{ __( 'In your order', 'stayilo' ) }
						</h2>
						<div className="mt-5 grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
							{ boxItems.length === 0 ? (
								<div className="sm:col-span-2 lg:col-span-3">
									<EmptyState message={ __( 'No products are present.', 'stayilo' ) } />
								</div>
							) : (
								boxItems.map( ( item ) => (
									<ProductSummaryCard
										key={ item.id }
										title={ item.title }
										quantity={ item.quantity }
										price={
											item.price != null
												? formatCartMoney(
														item.price,
														currency
												  )
												: undefined
										}
										imageUrl={ item.imageUrl }
										className="!shadow-none"
									/>
								) )
							) }
						</div>
					</section>

					<BoxTotalCard className="mt-4" defaultOpen { ...boxTotal } />
				</div>
			</div>
		</div>
	);
}
