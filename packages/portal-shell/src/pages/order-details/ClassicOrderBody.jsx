import { useState } from 'react';
import { ReactComponent as DeliveryIcon } from '@stayilo/design-system/assets/svg/delivery-truck.svg';
import { BrandedIcon } from '../../components/BrandedIcon.jsx';
import {
	getCheckoutUrl,
	orderAgainCheckout,
	orderSubscribeCheckout,
} from '../../api/portal.js';
import { Button } from '../../components/Button.jsx';
import { CartLineList } from '../../components/CartLineList.jsx';
import { ContentHeader } from '../../components/ContentHeader.jsx';
import { OrderMetaCard } from '../../components/OrderMetaCard.jsx';
import { ORDER_CONVERT_BANNER } from '../../data/commerce.js';
import { PortalActionSlot } from '../../slots/PortalActionSlot.jsx';
import { __, _n, sprintf } from '@stayilo/design-system/i18n';

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

/**
 * Prepare cart server-side, then send the customer to checkout.
 *
 * @param {(id: string|number) => Promise<{ checkoutUrl?: string }>} prepareFn
 * @param {string|number|undefined} orderId
 * @param {(busy: boolean) => void} setBusy
 */
async function redirectToOrderCheckout( prepareFn, orderId, setBusy ) {
	if ( ! orderId || typeof window === 'undefined' ) {
		return;
	}

	setBusy( true );
	try {
		const data = await prepareFn( orderId );
		window.location.assign( data?.checkoutUrl || getCheckoutUrl() );
	} catch ( err ) {
		setBusy( false );
		window.alert(
			err?.message || __( 'Could not start checkout.', 'stayilo' )
		);
	}
}

export function ClassicOrderBody( {
	order,
	boxItems,
	currency,
	boxTotal,
	shipping,
	deliveryDate,
	orderStatus,
	estimateLabel,
	showConvertBanner = false,
} ) {
	const [ againBusy, setAgainBusy ] = useState( false );
	const [ subscribeBusy, setSubscribeBusy ] = useState( false );
	const orderId = order?.id;
	const checkoutBusy = againBusy || subscribeBusy;

	return (
		<div className="portal-order-details">
			<div className="portal-order-details__grid">
				<div className="portal-order-details__main">
					<section
						className="portal-order-details__items"
						aria-label={ __( 'What\'s in your box', 'stayilo' ) }
					>
						<ContentHeader
							title={ __( 'What\'s in your box', 'stayilo' ) }
							subtitle={ formatBoxSubtitle( boxItems ) }
							className="portal-order-details__items-header"
						/>
						<CartLineList
							lines={ boxItems }
							currency={ currency }
							layout="row"
							showUnitPrice
							compactMeta
							showQuantity={ false }
							emptyMessage={ __( 'No products are present.', 'stayilo' ) }
							emptyClassName="!rounded-none bg-transparent py-4"
						/>
					</section>

					{ showConvertBanner ? (
						<section
							className="portal-order-details__convert"
							aria-label={ ORDER_CONVERT_BANNER.title }
						>
							<h2 className="portal-order-details__convert-title">
								{ ORDER_CONVERT_BANNER.title }
							</h2>
							<p className="portal-order-details__convert-body">
								{ ORDER_CONVERT_BANNER.subtitle }
							</p>
							<Button
								label={
									subscribeBusy
										? __( 'Starting checkout…', 'stayilo' )
										: ORDER_CONVERT_BANNER.actionLabel
								}
								variant="success"
								className="portal-order-details__convert-btn"
								disabled={ checkoutBusy || ! orderId }
								loading={ subscribeBusy }
								onClick={ () =>
									redirectToOrderCheckout(
										orderSubscribeCheckout,
										orderId,
										setSubscribeBusy
									)
								}
							/>
						</section>
					) : null }

					<OrderMetaCard
						label={ __( 'Order delivery date', 'stayilo' ) }
						icon={
							<BrandedIcon name="truck" width={ 32 } height={ 32 } className="shrink-0">
								<DeliveryIcon
									width={ 32 }
									height={ 32 }
									className="text-[#101010] [&_path]:stroke-current"
								/>
							</BrandedIcon>
						}
						value={ deliveryDate }
						status={ orderStatus }
						labelPlacement="above"
						bodyAlign="center"
						className="portal-order-details__date"
					/>

					<PortalActionSlot
						actionId="update-address"
						shipping={ shipping }
						estimateLabel={ estimateLabel }
						label={ __( 'Delivery address', 'stayilo' ) }
						actionLabel={ __( 'Edit address', 'stayilo' ) }
						className="portal-order-details__address"
						descriptionClassName="!font-normal !text-base !leading-6 !mt-4"
					/>
				</div>

				<section
					className="portal-order-details__summary"
					aria-label={ __( 'Order summary', 'stayilo' ) }
				>
					<h2 className="portal-order-details__summary-title">
						{ __( 'Order summary', 'stayilo' ) }
					</h2>
					<ul className="portal-order-details__summary-lines" role="list">
						{ ( boxTotal?.lines || [] ).map( ( line ) => (
							<li
								key={ line.id }
								className={ [
									'portal-order-details__summary-line',
									line.tone === 'discount'
										? 'portal-order-details__summary-line--discount'
										: '',
									line.tone === 'total'
										? 'portal-order-details__summary-line--total'
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
					{ order?.orderAgainUrl ? (
						<Button
							label={
								againBusy
									? __( 'Starting checkout…', 'stayilo' )
									: __( 'Order again', 'stayilo' )
							}
							variant="success"
							className="portal-order-details__again"
							disabled={ checkoutBusy || ! orderId }
							loading={ againBusy }
							onClick={ () =>
								redirectToOrderCheckout(
									orderAgainCheckout,
									orderId,
									setAgainBusy
								)
							}
						/>
					) : null }
				</section>
			</div>
		</div>
	);
}
