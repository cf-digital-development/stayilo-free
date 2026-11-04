import { getCartUrl } from '../api/portal.js';

/**
 * Open the WooCommerce Blocks mini-cart drawer (default storefront cart UI).
 * Falls back to the cart page when the block is not on the page.
 *
 * Restores scroll + focus after close so returning focus to the hidden WC
 * trigger cannot jump the portal page.
 *
 * @return {boolean} True when the Blocks drawer was triggered.
 */
export function openWcMiniCart() {
	const button = document.querySelector( '.wc-block-mini-cart__button' );
	if ( ! button ) {
		const cartUrl = getCartUrl();
		if ( cartUrl ) {
			window.location.assign( cartUrl );
		}
		return false;
	}

	const trigger =
		document.activeElement instanceof HTMLElement
			? document.activeElement
			: null;
	const scrollX = window.scrollX;
	const scrollY = window.scrollY;

	button.click();

	const restore = () => {
		window.scrollTo( scrollX, scrollY );
		if ( trigger && typeof trigger.focus === 'function' ) {
			try {
				trigger.focus( { preventScroll: true } );
			} catch {
				trigger.focus();
			}
		}
	};

	const body = document.body;
	let opened = body.style.overflow === 'hidden';

	const observer = new MutationObserver( () => {
		const locked = body.style.overflow === 'hidden';
		if ( locked ) {
			opened = true;
			return;
		}
		if ( ! opened ) {
			return;
		}
		observer.disconnect();
		requestAnimationFrame( () => {
			requestAnimationFrame( restore );
		} );
	} );

	observer.observe( body, { attributes: true, attributeFilter: [ 'style' ] } );
	window.setTimeout( () => observer.disconnect(), 60000 );

	return true;
}
