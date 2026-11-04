import { __, _n, sprintf } from '@stayilo/design-system/i18n';
import { ReactComponent as ArrowLeftIcon } from '@stayilo/design-system/assets/svg/ArrowLeft.svg';
import { ReactComponent as DeliveryIcon } from '@stayilo/design-system/assets/svg/delivery-truck.svg';
import { BrandedIcon } from '../../components/BrandedIcon.jsx';
import { Button } from '../../components/Button.jsx';
import { CartLineList } from '../../components/CartLineList.jsx';
import { ContentHeader } from '../../components/ContentHeader.jsx';
import { NextDeliveryBanner } from '../../components/NextDeliveryBanner.jsx';
import { PortalActionSlot } from '../../slots/PortalActionSlot.jsx';
import { MY_SUBSCRIPTION_PATH } from '../../routes.js';
import {
	DEFAULT_MEAL_IMAGE,
	resolveMediaUrl,
} from '../../utils/mediaPlaceholders.js';
import { formatCartMoney } from '../../utils/cartLines.js';
import {
	isSubscriptionCanceled,
	isSubscriptionPaused,
} from '../../utils/subscriptionOverview.js';

function formatViewCadence( subscription, currency ) {
	const interval = Math.max( 1, Number( subscription?.billingInterval ) || 1 );
	const period = String( subscription?.billingPeriod || 'week' );
	const amount = formatCartMoney( subscription?.total, currency );
	const cadence = billingCadenceLabel( period, interval );
	return sprintf(
		/* translators: 1: billing cadence, such as "Every week". 2: formatted price. */
		__( '%1$s · %2$s / delivery', 'stayilo' ),
		cadence,
		amount
	);
}

function billingCadenceLabel( period, interval ) {
	if ( interval === 1 ) {
		switch ( period ) {
			case 'day':
				return __( 'Every day', 'stayilo' );
			case 'month':
				return __( 'Every month', 'stayilo' );
			case 'year':
				return __( 'Every year', 'stayilo' );
			default:
				return __( 'Every week', 'stayilo' );
		}
	}

	switch ( period ) {
		case 'day':
			return sprintf(
				/* translators: %d: number of days. */
				__( 'Every %d days', 'stayilo' ),
				interval
			);
		case 'month':
			return sprintf(
				/* translators: %d: number of months. */
				__( 'Every %d months', 'stayilo' ),
				interval
			);
		case 'year':
			return sprintf(
				/* translators: %d: number of years. */
				__( 'Every %d years', 'stayilo' ),
				interval
			);
		default:
			return sprintf(
				/* translators: %d: number of weeks. */
				__( 'Every %d weeks', 'stayilo' ),
				interval
			);
	}
}

function statusCopy( status ) {
	if ( isSubscriptionCanceled( status ) ) {
		return { label: __( 'Cancelled', 'stayilo' ), tone: 'canceled' };
	}
	if ( isSubscriptionPaused( status ) ) {
		return { label: __( 'Paused', 'stayilo' ), tone: 'paused' };
	}
	if ( status === 'active' ) {
		return { label: __( 'Active subscription', 'stayilo' ), tone: 'active' };
	}
	return null;
}

function formatBoxSubtitle( items ) {
	if ( ! items.length ) {
		return '';
	}
	const kinds = new Set( items.map( ( item ) => item.title ).filter( Boolean ) )
		.size;
	const qty = items.reduce(
		( sum, item ) => sum + ( Number( item.quantity ) || 0 ),
		0
	);
	return sprintf(
		_n( '%1$d item · %2$d total', '%1$d items · %2$d total', kinds, 'stayilo' ),
		kinds,
		qty
	);
}

function savingsNote( boxTotal ) {
	const discount = ( boxTotal?.lines || [] ).find(
		( line ) => line.tone === 'discount'
	);
	if ( ! discount?.value ) {
		return '';
	}
	const amount = String( discount.value ).replace( /^-/, '' );
	return sprintf( __( 'You save %s vs buying separately', 'stayilo' ), amount );
}

export function SplitViewBody( {
	boxSectionRef,
	subscription,
	navigate,
	changeWindowLabel,
	nextDate,
	deliveryActions,
	canManageDelivery,
	canEditItems,
	displayLines,
	currency,
	updateQuantity,
	removeLine,
	boxTotal,
	saveState,
	onEditBox,
	onAddMore,
} ) {
	const title = subscription?.title || __( 'Subscription', 'stayilo' );
	const imageUrl = resolveMediaUrl(
		subscription?.imageUrl || displayLines[ 0 ]?.imageUrl,
		DEFAULT_MEAL_IMAGE
	);
	const status = statusCopy( subscription?.status );
	const saveNote = savingsNote( boxTotal );
	const saving = saveState?.status === 'saving' || saveState?.status === 'pending';

	return (
		<div className="portal-view-box">
			<div className="portal-view-banner">
				<div className="portal-view-banner-inner">
					<button
						type="button"
						className="portal-view-back"
						onClick={ () => navigate( MY_SUBSCRIPTION_PATH ) }
					>
						<ArrowLeftIcon width={ 16 } height={ 16 } aria-hidden="true" />
						{ __( 'Back to my subscription', 'stayilo' ) }
					</button>

					<header className="portal-view-hero">
						<div className="portal-view-hero-media">
							<img src={ imageUrl } alt={ title } />
						</div>
						<div className="portal-view-hero-copy">
							<div className="portal-view-hero-title-row">
								<h1 className="portal-view-hero-title">{ title }</h1>
								{ status ? (
									<span
										className={ `portal-view-status portal-view-status--${ status.tone }` }
									>
										{ status.label }
									</span>
								) : null }
							</div>
							<p className="portal-view-hero-meta">
								{ formatViewCadence( subscription, currency ) }
							</p>
						</div>
						{ canEditItems ? (
							<Button
								label={ __( 'Edit box', 'stayilo' ) }
								variant="primary"
								onClick={ onEditBox }
								className="portal-view-hero-edit"
							/>
						) : null }
					</header>
				</div>
			</div>

			<div className="portal-view-main">
				<article className="portal-view-next">
					<ContentHeader
						title={ __( 'Your next box', 'stayilo' ) }
						subtitle={ changeWindowLabel }
						className="portal-view-next-header"
					/>
					<NextDeliveryBanner
						variant="actions"
						embedded
						label=""
						date={ nextDate }
						actions={ deliveryActions }
						icon={
							<BrandedIcon name="truck" width={ 32 } height={ 32 } className="shrink-0">
								<DeliveryIcon
									width={ 32 }
									height={ 32 }
									aria-hidden="true"
									className="shrink-0 text-[#101010] [&_path]:stroke-current"
								/>
							</BrandedIcon>
						}
						className="portal-view-next-strip"
					/>
				</article>

				<div className="portal-view-grid">
					<section
						ref={ boxSectionRef }
						className="portal-view-items"
						aria-label={ __( 'What\'s in your box', 'stayilo' ) }
					>
						<ContentHeader
							title={ __( 'What\'s in your box', 'stayilo' ) }
							subtitle={ formatBoxSubtitle( displayLines ) }
							className="portal-view-items-header"
							actions={ [
								{
									label: (
										<>
											<span className="portal-view-chip-btn__full">
												{ __( 'View all items', 'stayilo' ) }
											</span>
											<span className="portal-view-chip-btn__short">
												{ __( 'View all', 'stayilo' ) }
											</span>
										</>
									),
									variant: 'secondary',
									showIcon: true,
									onClick: () =>
										boxSectionRef.current?.scrollIntoView( {
											behavior: 'smooth',
											block: 'start',
										} ),
									className: 'portal-view-chip-btn',
								},
							] }
						/>
						<CartLineList
							lines={ displayLines }
							currency={ currency }
							layout="row"
							showUnitPrice
							compactMeta
							onQuantityChange={
								canEditItems ? updateQuantity : undefined
							}
							onRemove={ canEditItems ? removeLine : undefined }
							emptyClassName="!rounded-none bg-transparent py-4"
						/>
						{ canEditItems ? (
							<Button
								label={ __( 'Add more items', 'stayilo' ) }
								variant="secondary"
								onClick={ onAddMore }
								className="portal-view-add"
							/>
						) : null }
					</section>

					<section className="portal-view-summary" aria-label={ __( 'Order summary', 'stayilo' ) }>
						<h2 className="portal-view-summary-title">{ __( 'Order summary', 'stayilo' ) }</h2>
						<ul className="portal-view-summary-lines" role="list">
							{ ( boxTotal?.lines || [] ).map( ( line ) => (
								<li
									key={ line.id }
									className={ [
										'portal-view-summary-line',
										line.tone === 'discount'
											? 'portal-view-summary-line--discount'
											: '',
										line.tone === 'total'
											? 'portal-view-summary-line--total'
											: '',
									]
										.filter( Boolean )
										.join( ' ' ) }
								>
									<span>{ line.label }</span>
									<span>{ line.value }</span>
								</li>
							) ) }
						</ul>
						{ saveNote ? (
							<p className="portal-view-summary-save">{ saveNote }</p>
						) : null }
						{ canEditItems ? (
							<Button
								label={ saving ? __( 'Saving…', 'stayilo' ) : __( 'Save changes', 'stayilo' ) }
								variant="primary"
								disabled={ saving }
								className="portal-view-summary-cta"
							/>
						) : null }
					</section>
				</div>

				<PortalActionSlot
					actionId="update-address"
					shipping={ subscription?.shipping }
					estimateLabel={ nextDate }
					actionsEnabled={ canManageDelivery }
					label={ __( 'Delivery address', 'stayilo' ) }
					actionLabel={ __( 'Edit address', 'stayilo' ) }
					className="portal-view-address"
					descriptionClassName="!font-normal !text-base !leading-6 !mt-4"
				/>
			</div>
		</div>
	);
}
