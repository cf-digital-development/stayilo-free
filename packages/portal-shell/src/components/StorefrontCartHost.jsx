import { useEffect, useState } from 'react';
import { CartDrawer } from './CartDrawer.jsx';
import { useWcCart } from '../store/useWcCart.js';

const MINI_CART_SELECTORS = [
	'.wc-block-mini-cart__button',
	'.wc-block-mini-cart',
	'a.cart-contents',
	'.cart-contents',
	'.header-cart-link',
	'[data-toggle="drawer"][data-target*="cart"]',
	'.elementor-menu-cart__toggle',
].join( ', ' );

/**
 * Standalone WooCommerce cart drawer for shop / cart / checkout.
 * Intercepts theme + Blocks mini-cart opens and shows Stayilo's drawer instead.
 */
export function StorefrontCartHost() {
	const [ open, setOpen ] = useState( false );
	const wcCart = useWcCart();
	const refresh = wcCart.refresh;

	useEffect( () => {
		const openStayiloCart = ( event ) => {
			const target = event.target;
			if ( ! ( target instanceof Element ) ) {
				return;
			}
			const trigger = target.closest( MINI_CART_SELECTORS );
			if ( ! trigger ) {
				return;
			}
			// Allow real links to /cart/ through if they are not mini-cart toggles.
			if (
				trigger.matches( 'a[href]' ) &&
				! trigger.classList.contains( 'cart-contents' ) &&
				! trigger.classList.contains( 'wc-block-mini-cart__button' ) &&
				! trigger.closest( '.wc-block-mini-cart' )
			) {
				return;
			}
			event.preventDefault();
			event.stopPropagation();
			setOpen( true );
			refresh?.().catch( () => {} );
		};

		document.addEventListener( 'click', openStayiloCart, true );
		return () => {
			document.removeEventListener( 'click', openStayiloCart, true );
		};
	}, [ refresh ] );

	useEffect( () => {
		document.body.classList.add( 'stayilo-cart-override' );
		return () => {
			document.body.classList.remove( 'stayilo-cart-override' );
		};
	}, [] );

	return (
		<CartDrawer
			open={ open }
			onClose={ () => setOpen( false ) }
			cart={ wcCart }
		/>
	);
}
