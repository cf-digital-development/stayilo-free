import { ReactComponent as CartIcon } from '@stayilo/design-system/assets/svg/ShoppingCartSimple.svg';
import { ReactComponent as AvatarIcon } from '@stayilo/design-system/assets/svg/Avatar.svg';
import { useNavigate } from 'react-router-dom';
import { BrandedIcon } from './BrandedIcon.jsx';
import { NotificationBell } from './NotificationBell.jsx';
import { __, _n, sprintf } from '@stayilo/design-system/i18n';

function HamburgerIcon() {
	return (
		<svg width={ 24 } height={ 24 } viewBox="0 0 24 24" fill="none" aria-hidden="true">
			<path
				d="M4 7H20M4 12H20M4 17H20"
				stroke="currentColor"
				strokeWidth="1.5"
				strokeLinecap="round"
			/>
		</svg>
	);
}

function CloseIcon() {
	return (
		<svg width={ 24 } height={ 24 } viewBox="0 0 24 24" fill="none" aria-hidden="true">
			<path
				d="M6 6L18 18M18 6L6 18"
				stroke="currentColor"
				strokeWidth="1.5"
				strokeLinecap="round"
			/>
		</svg>
	);
}

export function HeaderActions( {
	menuOpen,
	onOpenMenu,
	onCloseMenu,
	showNotification = true,
	showCart = true,
	onCartClick,
	cartCount = 0,
	avatarUrl,
	avatarAlt = 'Account',
} ) {
	const navigate = useNavigate();
	const onAvatarClick = () => {
		navigate( '/account-info' );
	};
	return (
		<div className="portal-header-actions">
			{ showNotification ? <NotificationBell /> : null }

			{ showCart ? (
				<button
					type="button"
					className="portal-icon-btn portal-header-tool"
					aria-label={
						cartCount > 0
							? sprintf( _n( 'Cart, %d item', 'Cart, %d items', cartCount, 'stayilo' ), cartCount )
							: __( 'Cart', 'stayilo' )
					}
					onClick={ onCartClick }
				>
					<BrandedIcon name="cart" width={ 24 } height={ 24 } className="portal-header-tool-icon">
						<CartIcon
							width={ 24 }
							height={ 24 }
							aria-hidden="true"
							className="portal-header-tool-icon"
						/>
					</BrandedIcon>
					{ cartCount > 0 ? (
						<span className="portal-cart-badge" aria-hidden="true">
							{ cartCount > 99 ? '99+' : cartCount }
						</span>
					) : null }
				</button>
			) : null }

			<button
				type="button"
				onClick={ onAvatarClick }
				aria-label={ avatarAlt }
				className="portal-header-avatar"
			>
				{ avatarUrl ? (
					<img
						src={ avatarUrl }
						alt=""
						className="portal-header-avatar-img"
					/>
				) : (
					<AvatarIcon
						width={ 40 }
						height={ 40 }
						className="portal-header-avatar-icon"
						aria-hidden="true"
					/>
				) }
			</button>

			{ menuOpen ? (
				<button
					type="button"
					className="portal-icon-btn portal-hamburger-btn"
					aria-label={ __( 'Close menu', 'stayilo' ) }
					aria-expanded={ true }
					aria-controls="portal-mobile-nav"
					onClick={ onCloseMenu }
				>
					<CloseIcon />
				</button>
			) : (
				<button
					type="button"
					className="portal-icon-btn portal-hamburger-btn"
					aria-label={ __( 'Open menu', 'stayilo' ) }
					aria-expanded={ false }
					aria-controls="portal-mobile-nav"
					onClick={ onOpenMenu }
				>
					<HamburgerIcon />
				</button>
			) }
		</div>
	);
}
