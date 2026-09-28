import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ReactComponent as ArrowLeftIcon } from '@stayilo/design-system/assets/svg/ArrowLeft.svg';
import { fetchShopProducts } from '../api/wc.js';
import { getPortal } from '../api/portal.js';
import { Banner } from '../components/Banner.jsx';
import { BoxTotalCard } from '../components/BoxTotalCard.jsx';
import { CartLineList } from '../components/CartLineList.jsx';
import { EmptyState } from '../components/EmptyState.jsx';
import { PageLoader } from '../components/PageLoader.jsx';
import { ADD_MORE_PRODUCTS } from '../data/addMoreProducts.js';
import { EDIT_BOX_BANNER } from '../data/banners.js';
import { ClassicEditBody } from './edit-box/ClassicEditBody.jsx';
import { VIEW_BOX_PATH } from '../routes.js';
import { useBoxTotalProps } from '../store/useCartLines.js';
import { useSaveSubscriptionBox } from '../store/useSaveSubscriptionBox.js';
import { useTemplateRecipe } from '../templates/TemplateProvider.jsx';
import { findCartLineForProduct } from '../utils/cartLines.js';
import { getPortalCurrency } from '../utils/portalCurrency.js';
import { mapStoreProductsToCatalog } from '../utils/shopProducts.js';
import { subscriptionLocation } from '../utils/subscriptionNavigation.js';
import { __ } from '@stayilo/design-system/i18n';

/**
 * Edit your subscription — tabbed banner, editable cart lines, collapsible box total.
 * Add more items lists live WooCommerce shop products from wp-admin.
 * Qty / add / remove are saved onto the WooCommerce subscription.
 */
export function EditBox() {
	const { id } = useTemplateRecipe();
	const location = useLocation();
	const navigate = useNavigate();
	const [ activeTabId, setActiveTabId ] = useState(
		location.state?.editBoxTab === 'add-more'
			? 'add-more'
			: EDIT_BOX_BANNER.activeTabId ?? 'in-box'
	);
	const [ shopProducts, setShopProducts ] = useState( [] );
	const [ catalogStatus, setCatalogStatus ] = useState( 'idle' );
	const {
		lines,
		subscription,
		saveState,
		updateQuantity,
		removeLine,
		addProduct,
	} = useSaveSubscriptionBox( location.state?.subscriptionId );
	const currency = getPortalCurrency( subscription?.currency );
	const boxTotal = useBoxTotalProps( {
		currency,
		lines,
		// Live qty edits — recompute from cart lines, keep WC shipping/discount.
		shippingTotal:
			subscription?.orderSummary?.shippingTotal ??
			subscription?.shippingTotal ??
			0,
		shippingLabel: subscription?.orderSummary?.shippingLabel,
		discountTotal: subscription?.orderSummary?.discountTotal || 0,
		discountPercent: subscription?.retentionDiscount?.percent || 0,
	} );
	const isAddMore = activeTabId === 'add-more';

	useEffect( () => {
		if ( ! isAddMore ) {
			return;
		}
		if ( catalogStatus === 'ready' || catalogStatus === 'error' ) {
			return;
		}

		const portal = getPortal();
		if ( ! portal.restUrl ) {
			setShopProducts( ADD_MORE_PRODUCTS );
			setCatalogStatus( 'ready' );
			return;
		}

		let cancelled = false;
		setCatalogStatus( 'loading' );

		fetchShopProducts()
			.then( ( data ) => {
				if ( cancelled ) {
					return;
				}
				setShopProducts( mapStoreProductsToCatalog( data ) );
				setCatalogStatus( 'ready' );
			} )
			.catch( () => {
				if ( cancelled ) {
					return;
				}
				setCatalogStatus( 'error' );
			} );

		return () => {
			cancelled = true;
		};
		// catalogStatus is used to skip a second fetch after success/error.
		// eslint-disable-next-line react-hooks/exhaustive-deps -- fetch once when the tab opens
	}, [ isAddMore ] );

	const catalogLines = useMemo(
		() =>
			shopProducts
				.filter( ( product ) => ! findCartLineForProduct( lines, product ) )
				.map( ( product ) => ( {
					...product,
					quantity: 0,
					price: product.unitPrice,
					unitPrice: product.unitPrice,
				} ) ),
		[ lines, shopProducts ]
	);

	const handleQuantityChange = ( id, quantity ) => {
		if ( isAddMore && quantity < 1 ) {
			return;
		}
		const existing = findCartLineForProduct( lines, { id } );
		if ( ! isAddMore || existing ) {
			updateQuantity( existing?.id ?? id, quantity );
			return;
		}
		const product = shopProducts.find(
			( item ) => String( item.id ) === String( id )
		);
		if ( product ) {
			addProduct( { ...product, quantity } );
		}
	};

	const handleRemove = ( id ) => {
		removeLine( id );
	};

	const goBack = () => {
		if ( location.key !== 'default' ) {
			navigate( -1 );
			return;
		}
		navigate(
			subscriptionLocation(
				VIEW_BOX_PATH,
				location.state?.subscriptionId || subscription?.id
			)
		);
	};

	if ( id === 'classic' ) {
		return (
			<div className="w-full">
				<Banner
					{ ...EDIT_BOX_BANNER }
					backgroundColor="var(--stayilo-banner-bg)"
					textTone="brand"
					showDecorations={ false }
					titleClassName=""
					activeTabId={ activeTabId }
					onTabChange={ setActiveTabId }
					className="portal-edit-box-banner"
					paddingClassName="py-10 portal-view-banner-inner"
					subtitleClassName="!mt-2"
					before={
						<button
							type="button"
							className="portal-view-back"
							onClick={ goBack }
						>
							<ArrowLeftIcon
								width={ 16 }
								height={ 16 }
								aria-hidden="true"
							/>
							{ __( 'Back', 'stayilo' ) }
						</button>
					}
				/>
				<section className="portal-content portal-edit-box-body portal-section--padded">
					<ClassicEditBody
						isAddMore={ isAddMore }
						displayLines={ isAddMore ? catalogLines : lines }
						boxLines={ lines }
						currency={ currency }
						boxTotal={ boxTotal }
						saveState={ saveState }
						catalogStatus={ catalogStatus }
						onQuantityChange={ handleQuantityChange }
						onRemove={ handleRemove }
						onBrowse={ () => setActiveTabId( 'add-more' ) }
					/>
				</section>
			</div>
		);
	}

	return (
		<div className="w-full">
			<div className="max-w-[1080px] mx-auto">
				<Banner
					{ ...EDIT_BOX_BANNER }
					activeTabId={ activeTabId }
					onTabChange={ setActiveTabId }
					paddingClassName="py-10"
					subtitleClassName="!mt-2"
				/>
			</div>

			<div className="background_container">
				<div className="portal-content portal-section--padded !max-w-[1128px] sm:!pb-[110px] !pb-10 !pt-8 px-6">
					<section
						className="overflow-hidden rounded-3xl bg-white px-4 sm:px-6 pt-1 pb-6"
						aria-label={ isAddMore ? __( 'Add more items', 'stayilo' ) : __( 'In your subscription', 'stayilo' ) }
					>
						{ isAddMore &&
						( catalogStatus === 'idle' || catalogStatus === 'loading' ) ? (
							<PageLoader
								message={ __( 'Loading shop products…', 'stayilo' ) }
								className="!rounded-none bg-transparent"
							/>
						) : isAddMore && catalogStatus === 'error' ? (
							<EmptyState
								message={ __( 'Could not load shop products.', 'stayilo' ) }
								className="!rounded-none bg-transparent py-8"
							/>
						) : (
							<CartLineList
								lines={ isAddMore ? catalogLines : lines }
								currency={ currency }
								onQuantityChange={ handleQuantityChange }
								onRemove={ handleRemove }
								minQuantity={ isAddMore ? 0 : 1 }
								emptyMessage={
									isAddMore
										? __( 'No shop products are available.', 'stayilo' )
										: __( 'Your subscription is empty.', 'stayilo' )
								}
								emptyClassName="!rounded-none bg-transparent py-8"
								emptyAction={
									isAddMore ? undefined : (
										<button
											type="button"
											className="text-base font-semibold underline"
											onClick={ () => setActiveTabId( 'add-more' ) }
										>
											{ __( 'Browse items to add', 'stayilo' ) }
										</button>
									)
								}
							/>
						) }
					</section>

					<BoxTotalCard
						className="mt-4"
						defaultOpen
						{ ...boxTotal }
					/>
					<BoxSaveStatus saveState={ saveState } />
				</div>
			</div>
		</div>
	);
}

/**
 * @param {{ saveState: { status: string, message: string } }} props
 */
function BoxSaveStatus( { saveState } ) {
	if ( saveState.status === 'pending' || saveState.status === 'saving' ) {
		return (
			<p className="mt-3 mb-0 text-sm text-[#101010]">
				{ __( 'Saving to your WooCommerce subscription…', 'stayilo' ) }
			</p>
		);
	}
	if ( saveState.status === 'saved' ) {
		return (
			<p className="mt-3 mb-0 text-sm text-[#101010]">
				{ __( 'Saved to your subscription.', 'stayilo' ) }
			</p>
		);
	}
	if ( saveState.status === 'error' ) {
		return (
			<p className="mt-3 mb-0 text-sm text-[#b42318]">
				{ saveState.message }
			</p>
		);
	}
	return null;
}
