import { ReactComponent as DeliveryIcon } from '@stayilo/design-system/assets/svg/delivery-truck.svg';
import { ReactComponent as NavArrowRightIcon } from '@stayilo/design-system/assets/svg/nav-arrow-right.svg';
import { BoxTotalCard } from '../../components/BoxTotalCard.jsx';
import { CartLineList } from '../../components/CartLineList.jsx';
import { ContentHeader } from '../../components/ContentHeader.jsx';
import { NextDeliveryBanner } from '../../components/NextDeliveryBanner.jsx';
import { PortalActionSlot } from '../../slots/PortalActionSlot.jsx';
import { UpcomingBoxesSlider } from '../../components/UpcomingBoxesSlider.jsx';
import {
	ORDER_DETAILS_HEADER,
	VIEW_BOX_NEXT_CARD,
} from '../../data/commerce.js';
import { UPCOMING_BOXES_HEADER } from '../../data/upcomingBoxes.js';
import { EDIT_BOX_PATH } from '../../routes.js';
import { subscriptionLocation } from '../../utils/subscriptionNavigation.js';
import { __, sprintf } from '@stayilo/design-system/i18n';

export function StackViewBody( {
	boxSectionRef,
	subscription,
	subscriptionId,
	navigate,
	changeWindowLabel,
	upcomingItems,
	nextDate,
	deliveryActions,
	canManageDelivery,
	canEditItems,
	displayLines,
	currency,
	updateQuantity,
	removeLine,
	boxTotal,
} ) {
	return (
		<div className="w-full">
			<section className="portal-content portal-section--padded !max-w-[1080px] !pb-8">
				<ContentHeader
					variant="section"
					title={ ORDER_DETAILS_HEADER.title }
					subtitle={
						subscription?.title
							? sprintf( __( 'Details for %s', 'stayilo' ), subscription.title )
							: ORDER_DETAILS_HEADER.subtitle
					}
				/>
			</section>
			<UpcomingBoxesSlider
				title={ UPCOMING_BOXES_HEADER.title }
				items={ upcomingItems }
				className="max-w-[1080px] mx-auto left-align"
			/>
			<div className="background_container">
				<div className="portal-content portal-section--padded !max-w-[1128px] sm:!pb-[110px] !pb-10 px-6">
					<div className="flex flex-col gap-4">
						<article className="rounded-3xl bg-white p-5 sm:p-6">
							<ContentHeader
								title={ VIEW_BOX_NEXT_CARD.title }
								subtitle={ changeWindowLabel }
								titleClassName="!text-base !font-semibold !leading-[100%] sm:!text-2xl sm:!leading-[100%]"
								subtitleClassName="!text-sm !leading-[100%] sm:!text-base sm:!leading-6"
								actions={ [
									{
										label: VIEW_BOX_NEXT_CARD.viewActionLabel,
										variant: 'secondary',
										showIcon: true,
										icon: (
											<NavArrowRightIcon
												width={ 24 }
												height={ 24 }
											/>
										),
										onClick: () =>
											boxSectionRef.current?.scrollIntoView( {
												behavior: 'smooth',
												block: 'start',
											} ),
										className: 'portal-btn box-btn padding',
									},
								] }
							/>
							<NextDeliveryBanner
								variant="actions"
								embedded
								date={ nextDate }
								actions={ deliveryActions }
								dateClassName="sm:!text-[20px] sm:!leading-7 !text-[#101010] !font-semibold"
								icon={
									<DeliveryIcon
										width={ 40 }
										height={ 40 }
										aria-hidden="true"
										className="shrink-0 text-[#101010] [&_path]:stroke-current"
									/>
								}
								className="!bg-[#FAF8F2] !rounded-2xl px-3 py-3"
							/>
						</article>
						<PortalActionSlot
							actionId="update-address"
							shipping={ subscription?.shipping }
							estimateLabel={ nextDate }
							actionsEnabled={ canManageDelivery }
							descriptionClassName="!font-normal !text-base !leading-6 !mt-4"
						/>
						<section
							ref={ boxSectionRef }
							className="portal-order-box"
							aria-label={ __( 'Items in your subscription', 'stayilo' ) }
						>
							<ContentHeader
								title={ __( 'What’s in your subscription', 'stayilo' ) }
								className="!items-center sm:!items-center"
								titleClassName="!m-0 !text-base !font-semibold !leading-6 md:!text-xl md:!leading-6"
								actions={
									canEditItems
										? [
												{
													label: VIEW_BOX_NEXT_CARD.editBoxActionLabel,
													variant: 'secondary',
													showIcon: true,
													icon: (
														<NavArrowRightIcon
															width={ 24 }
															height={ 24 }
														/>
													),
													onClick: () =>
														navigate(
															subscriptionLocation(
																EDIT_BOX_PATH,
																subscriptionId
															)
														),
													className:
														'portal-btn box-btn padding',
												},
										  ]
										: []
								}
							/>
							<CartLineList
								lines={ displayLines }
								currency={ currency }
								onQuantityChange={
									canEditItems ? updateQuantity : undefined
								}
								onRemove={ canEditItems ? removeLine : undefined }
								emptyClassName="!rounded-none bg-transparent py-4"
							/>
						</section>
						<BoxTotalCard defaultOpen { ...boxTotal } />
					</div>
				</div>
			</div>
		</div>
	);
}
