import { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ReactComponent as XIcon } from '@stayilo/design-system/assets/svg/X.svg';
import { getCheckoutUrl, getShopUrl } from '../api/portal.js';
import { useWcCart } from '../store/useWcCart.js';
import { formatCartMoney } from '../utils/cartLines.js';
import { lockBodyScroll } from '../utils/lockBodyScroll.js';
import { useTemplateRecipe } from '../templates/TemplateProvider.jsx';
import { brandingStyle, readPortalBranding } from '../utils/branding.js';
import { Button } from './Button.jsx';
import { CartLineList } from './CartLineList.jsx';
import { __ } from '@stayilo/design-system/i18n';

/**
 * Stayilo mini-cart drawer — previous fixed-height + scroll design.
 * Content is synced to the WooCommerce session cart.
 *
 * @param {object} props
 * @param {boolean} props.open
 * @param {() => void} props.onClose
 * @param {{
 *   lines: Array<object>,
 *   subtotal: number,
 *   currency: string,
 *   loading?: boolean,
 *   refresh?: () => Promise<unknown>,
 *   updateQuantity?: (key: string, quantity: number) => Promise<unknown>,
 *   removeLine?: (key: string) => Promise<unknown>,
 * }} [props.cart]
 */
export function CartDrawer( { open, onClose, cart: cartProp } ) {
	const { id: templateId } = useTemplateRecipe();
	const titleId = useId();
	const closeBtnRef = useRef( null );
	const listRef = useRef( null );
	const listWrapRef = useRef( null );
	const localCart = useWcCart( { enabled: ! cartProp } );
	const {
		lines,
		subtotal,
		currency,
		loading,
		refresh,
		updateQuantity,
		removeLine,
	} = cartProp || localCart;
	const [ checkingOut, setCheckingOut ] = useState( false );
	const [ mutating, setMutating ] = useState( false );

	useEffect( () => {
		if ( ! open ) {
			return undefined;
		}
		refresh?.().catch( () => {} );
		return lockBodyScroll();
	}, [ open, refresh ] );

	useEffect( () => {
		if ( ! open ) {
			return undefined;
		}

		const previouslyFocused = document.activeElement;
		closeBtnRef.current?.focus();

		const onKeyDown = ( event ) => {
			if ( event.key === 'Escape' ) {
				onClose?.();
			}
		};

		window.addEventListener( 'keydown', onKeyDown );
		return () => {
			window.removeEventListener( 'keydown', onKeyDown );
			if (
				previouslyFocused &&
				typeof previouslyFocused.focus === 'function'
			) {
				previouslyFocused.focus();
			}
		};
	}, [ open, onClose ] );

	useEffect( () => {
		const list = listRef.current;
		const wrap = listWrapRef.current;
		if ( ! list || ! wrap ) {
			return undefined;
		}

		const VISIBLE_LINES = 3;

		const clipToVisibleLines = () => {
			if ( lines.length <= VISIBLE_LINES ) {
				wrap.style.maxHeight = '';
				return;
			}

			const items = list.children;
			let height = 0;
			const count = Math.min( VISIBLE_LINES, items.length );
			for ( let index = 0; index < count; index += 1 ) {
				height += items[ index ].getBoundingClientRect().height;
			}

			const footerReserve = 220;
			const headerReserve = 88;
			const viewportCap = Math.max(
				160,
				window.innerHeight - headerReserve - footerReserve
			);

			wrap.style.maxHeight = `${ Math.min( Math.ceil( height ), viewportCap ) }px`;
		};

		clipToVisibleLines();

		if ( open ) {
			wrap.scrollTop = 0;
		}

		const observer = new ResizeObserver( clipToVisibleLines );
		observer.observe( list );
		window.addEventListener( 'resize', clipToVisibleLines );

		return () => {
			observer.disconnect();
			window.removeEventListener( 'resize', clipToVisibleLines );
		};
	}, [ lines, open ] );

	const handleQuantityChange = async ( id, quantity ) => {
		if ( ! updateQuantity || mutating ) {
			return;
		}
		setMutating( true );
		try {
			await updateQuantity( id, quantity );
		} catch {
			await refresh?.().catch( () => {} );
		} finally {
			setMutating( false );
		}
	};

	const handleRemove = async ( id ) => {
		if ( ! removeLine || mutating ) {
			return;
		}
		setMutating( true );
		try {
			await removeLine( id );
		} catch {
			await refresh?.().catch( () => {} );
		} finally {
			setMutating( false );
		}
	};

	const goToShop = () => {
		onClose?.();
		if ( typeof window !== 'undefined' ) {
			window.location.assign( getShopUrl() );
		}
	};

	const goToCheckout = () => {
		if ( ! lines.length || checkingOut ) {
			return;
		}
		setCheckingOut( true );
		if ( typeof window === 'undefined' ) {
			setCheckingOut( false );
			return;
		}
		window.location.assign( getCheckoutUrl() );
	};

	if ( typeof document === 'undefined' ) {
		return null;
	}

	const drawer = (
		<div
			className={ [
				'portal-cart-drawer',
				open ? 'portal-cart-drawer--open' : '',
			]
				.filter( Boolean )
				.join( ' ' ) }
			aria-hidden={ ! open }
			data-template={ templateId }
			style={ brandingStyle( readPortalBranding(), templateId ) }
		>
			<div
				className="portal-cart-drawer__overlay"
				role="presentation"
				onClick={ onClose }
			/>

			<aside
				id="portal-cart-drawer"
				className="portal-cart-drawer__panel"
				role="dialog"
				aria-modal={ open ? 'true' : undefined }
				aria-labelledby={ titleId }
				inert={ ! open ? '' : undefined }
				onClick={ ( event ) => event.stopPropagation() }
			>
				<header className="portal-cart-drawer__header">
					<h2 id={ titleId } className="portal-cart-drawer__title">
						{ __( 'Your cart', 'stayilo' ) }
					</h2>
					<button
						ref={ closeBtnRef }
						type="button"
						className="portal-cart-drawer__close"
						aria-label={ __( 'Close cart', 'stayilo' ) }
						onClick={ onClose }
					>
						<XIcon
							width={ 20 }
							height={ 20 }
							aria-hidden="true"
							className="text-[#101010] [&_path]:stroke-current"
						/>
					</button>
				</header>

				<div
					ref={ listWrapRef }
					className={ [
						'portal-cart-drawer__body',
						lines.length > 3 ? 'portal-cart-drawer__body--scroll' : '',
					]
						.filter( Boolean )
						.join( ' ' ) }
				>
					{ loading && lines.length === 0 ? (
						<p className="m-0 px-1 py-8 text-center text-sm text-stayilo-muted">
							{ __( 'Loading cart…', 'stayilo' ) }
						</p>
					) : (
						<CartLineList
							lines={ lines }
							currency={ currency }
							onQuantityChange={ handleQuantityChange }
							onRemove={ handleRemove }
							emptyMessage={ __( 'Your cart is empty.', 'stayilo' ) }
							emptyClassName="!rounded-2xl !px-4 cartline-empty-state"
							emptyAction={
								<Button
									label={ __( 'Add items', 'stayilo' ) }
									variant="primary"
									onClick={ goToShop }
									className="portal-btn-block portal-cart-drawer__add-items !py-3 !text-sm"
								/>
							}
							asList
							listRef={ listRef }
							listClassName="portal-cart-drawer__list"
						/>
					) }
				</div>

				<footer className="portal-cart-drawer__footer">
					<div className="portal-cart-drawer__subtotal">
						<span>{ __( 'Total', 'stayilo' ) }</span>
						<span>{ formatCartMoney( subtotal, currency ) }</span>
					</div>
					<div className="portal-cart-drawer__actions">
						<Button
							label={ __( 'Checkout', 'stayilo' ) }
							variant="primary"
							onClick={ goToCheckout }
							disabled={ lines.length === 0 || mutating }
							loading={ checkingOut }
							className="portal-btn-block !py-3 !text-sm"
						/>
					</div>
				</footer>
			</aside>
		</div>
	);

	return createPortal( drawer, document.body );
}
