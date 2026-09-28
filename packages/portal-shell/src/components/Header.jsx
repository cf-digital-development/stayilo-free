import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import defaultLogoUrl from '@stayilo/design-system/assets/svg/Logo.svg';
import { DEFAULT_NAV_ITEMS } from '../data/navItems.js';
import { MY_SUBSCRIPTION_PATH } from '../routes.js';
import { useWcCart } from '../store/useWcCart.js';
import { lockBodyScroll } from '../utils/lockBodyScroll.js';
import { CartDrawer } from './CartDrawer.jsx';
import { HeaderActions } from './HeaderActions.jsx';
import { NavMenu } from './NavMenu.jsx';
import { __ } from '@stayilo/design-system/i18n';

export function Header( {
	brandName = '',
	logoUrl,
	navItems = DEFAULT_NAV_ITEMS,
	activeNavId = 'subscription',
	onNavChange,
	avatarUrl,
	avatarAlt = 'Account',
	onCartClick,
	showNotification = true,
	showCart = true,
	showDesktopNav = true,
	className = '',
} ) {
	const [ menuOpen, setMenuOpen ] = useState( false );
	const [ menuOverlay, setMenuOverlay ] = useState( false );
	const [ cartOpen, setCartOpen ] = useState( false );
	const wcCart = useWcCart( { enabled: showCart } );
	const itemCount = wcCart.itemCount;
	const resolvedLogoUrl = logoUrl || defaultLogoUrl;

	useEffect( () => {
		const media = window.matchMedia( '(min-width: 1024px)' );
		const closeOnDesktop = () => {
			if ( media.matches ) {
				setMenuOpen( false );
				setMenuOverlay( false );
			}
		};

		closeOnDesktop();
		media.addEventListener( 'change', closeOnDesktop );
		return () => media.removeEventListener( 'change', closeOnDesktop );
	}, [] );

	useEffect( () => {
		if ( ! menuOverlay ) {
			return undefined;
		}

		return lockBodyScroll();
	}, [ menuOverlay ] );

	const openMenu = () => {
		setCartOpen( false );
		setMenuOverlay( true );
		setMenuOpen( true );
	};

	const closeMenu = () => {
		setMenuOpen( false );
	};

	const openCart = () => {
		closeMenu();
		setMenuOverlay( false );
		setCartOpen( true );
		wcCart.refresh?.().catch( () => {} );
		onCartClick?.();
	};

	const closeCart = () => {
		setCartOpen( false );
	};

	const handleMobileNavTransitionEnd = ( event ) => {
		if ( event.propertyName !== 'grid-template-rows' ) {
			return;
		}

		if ( ! menuOpen ) {
			setMenuOverlay( false );
		}
	};

	const handleNavChange = ( navId ) => {
		closeMenu();
		closeCart();
		onNavChange?.( navId );
	};

	const classes = [
		'portal-header',
		menuOverlay ? 'portal-header--menu-open' : '',
		className,
	]
		.filter( Boolean )
		.join( ' ' );

	const mobileNavClasses = [
		'portal-mobile-nav',
		menuOpen ? 'portal-mobile-nav--open' : '',
	]
		.filter( Boolean )
		.join( ' ' );

	return (
		<>
			{ menuOverlay ? (
				<div className="portal-header-spacer" aria-hidden="true" />
			) : null }
			<header className={ classes }>
				<div className="portal-header-bar portal-content">
					<div className="portal-header-brand">
						<div className="portal-header-logo">
							<Link
								to={ MY_SUBSCRIPTION_PATH }
								className="portal-header-logo-link"
								aria-label={ brandName }
								onClick={ () => {
									closeMenu();
									closeCart();
								} }
							>
								{ resolvedLogoUrl ? (
									<img
										src={ resolvedLogoUrl }
										alt={ brandName || __( 'Store', 'stayilo' ) }
										className="portal-header-logo-img"
									/>
								) : (
									<span className="portal-header-logo-text">
										{ brandName || __( 'Store', 'stayilo' ) }
									</span>
								) }
							</Link>
						</div>

						{ showDesktopNav ? (
							<NavMenu
								navItems={ navItems }
								activeNavId={ activeNavId }
								onNavChange={ handleNavChange }
							/>
						) : null }
					</div>

					<HeaderActions
						menuOpen={ menuOpen }
						onOpenMenu={ openMenu }
						onCloseMenu={ closeMenu }
						showNotification={ showNotification }
						showCart={ showCart }
						onCartClick={ openCart }
						cartOpen={ cartOpen }
						cartCount={ itemCount }
						avatarUrl={ avatarUrl }
						avatarAlt={ avatarAlt }
					/>
				</div>

				<div
					id="portal-mobile-nav"
					className={ mobileNavClasses }
					aria-hidden={ ! menuOpen }
					inert={ ! menuOpen ? '' : undefined }
					onTransitionEnd={ handleMobileNavTransitionEnd }
				>
					<div className="portal-mobile-nav__inner">
						<NavMenu
							navItems={ navItems }
							activeNavId={ activeNavId }
							onNavChange={ handleNavChange }
							variant="mobile"
						/>
					</div>
				</div>
			</header>
			{ showCart ? (
				<CartDrawer
					open={ cartOpen }
					onClose={ closeCart }
					cart={ wcCart }
				/>
			) : null }
		</>
	);
}
