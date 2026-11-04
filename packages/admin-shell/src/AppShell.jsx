import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import defaultLogoUrl from '@stayilo/design-system/assets/svg/Logo.svg';
import './styles/admin-modals.css';
import { ProBadge } from '@stayilo/design-system';
import { getStayiloRegistry } from '@stayilo/extension-sdk';
import { readAdminBranding } from './branding.js';
import { isNavItemLocked, navItemLabel, NAV_ITEMS } from './nav-config.js';
import { SidebarNavIcon } from './nav-icons.jsx';
import { SidebarPlanCard } from './components/SidebarPlanCard.jsx';
import { getMerchantTier, subscribePremium } from './premium.js';
import { openUpgrade } from './utils/upgradeUrl.js';

const SIDEBAR_TIER_PREVIEW_SLOT = 'sidebar-tier-preview';

/** Pro registers the Core/Growth preview switch into this slot. Free ships nothing. */
function SidebarTierPreview( { tier } ) {
	useSyncExternalStore( subscribePremium, getMerchantTier, () => 'free' );
	const Registered = getStayiloRegistry().getDashboardWidget(
		SIDEBAR_TIER_PREVIEW_SLOT
	);
	return Registered ? <Registered tier={ tier } /> : null;
}

function getWpAdminUrl() {
	if ( typeof window === 'undefined' ) {
		return '/wp-admin/';
	}
	const admin = window.stayiloAdmin || {};
	if ( admin.wpAdminUrl ) {
		return admin.wpAdminUrl;
	}
	if ( admin.ajaxUrl ) {
		try {
			return new URL( admin.ajaxUrl ).pathname.replace(
				/admin-ajax\.php$/,
				''
			);
		} catch {
			// fall through
		}
	}
	return '/wp-admin/';
}

const SIDEBAR_ITEMS = NAV_ITEMS.filter( ( item ) => item.sidebar !== false );

function navItemClassName( isActive, locked = false ) {
	return [
		'flex items-center justify-between gap-3 rounded-[10px] px-4 py-3 text-base leading-6 font-medium no-underline transition-colors',
		locked
			? 'cursor-not-allowed text-white/20'
			: isActive
				? 'group bg-[#FFFFFF0F] !rounded-[10px] !text-white hover:!text-white focus:!text-white active:!text-white visited:!text-white'
				: 'group !text-[#F7F8FA66] hover:bg-[#FFFFFF0F] hover:!text-white focus:!text-white active:!text-white visited:!text-white/80',
	].join( ' ' );
}

function NavItemContent( { item, active = false, showBadge = false, tier = 'growth' } ) {
	return (
		<>
			<span className="flex min-w-0 items-center gap-3">
				<SidebarNavIcon id={ item.id } active={ active } />
				<span className="truncate">{ navItemLabel( item, tier ) }</span>
			</span>
			{ showBadge ? <ProBadge>{ item.tier }</ProBadge> : null }
		</>
	);
}

function HamburgerIcon() {
	return (
		<svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
			<path
				d="M4 7h16M4 12h16M4 17h16"
				stroke="currentColor"
				strokeWidth="1.5"
				strokeLinecap="round"
			/>
		</svg>
	);
}

function CloseIcon() {
	return (
		<svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
			<path
				d="M6 6l12 12M18 6L6 18"
				stroke="currentColor"
				strokeWidth="1.5"
				strokeLinecap="round"
			/>
		</svg>
	);
}

export function AppShell( { tier = 'growth', storeName = 'Stayilo' } ) {
	const navigate = useNavigate();
	const location = useLocation();
	const [ mobileMenuOpen, setMobileMenuOpen ] = useState( false );
	const admin = typeof window !== 'undefined' ? window.stayiloAdmin || {} : {};
	const logoUrl = readAdminBranding( admin ).logoUrl;

	const noticeSlotRef = useRef( null );
	const [ hasAdminNotices, setHasAdminNotices ] = useState( false );

	useEffect( () => {
		// Core's common.js moves .notice/.error/.updated to after the first h1.
		// below-h2 opts out of that move. Do not add the class "inline":
		// the admin bundle's .inline utility is display:inline and pulls the
		// boxes out over the sidebar.
		const selector = [
			'#wpbody-content .notice',
			'#wpbody-content .updated',
			'#wpbody-content .error',
			'#wpbody-content .update-nag',
			'#wpbody-content > .stayilo-upgrade-banner',
		].join( ', ' );

		const moveNotices = () => {
			const slot = noticeSlotRef.current;
			const pending = document.querySelectorAll( selector );

			if ( ! slot ) {
				if ( pending.length ) {
					setHasAdminNotices( true );
				}
				return;
			}

			pending.forEach( ( node ) => {
				if ( slot.contains( node ) ) {
					return;
				}
				// Core's "WordPress x is available" nag is a .notice.update-nag.inline.
				// That inline class only stops core from parking it under the heading.
				// Other .inline notices belong next to a form field, so leave those.
				if (
					node.classList.contains( 'inline' ) &&
					! node.classList.contains( 'update-nag' )
				) {
					return;
				}
				slot.appendChild( node );
				node.classList.add( 'below-h2' );
			} );

			const placed = slot.querySelector(
				'.notice, .updated, .error, .update-nag, .stayilo-upgrade-banner'
			);
			setHasAdminNotices( Boolean( placed ) );
		};

		moveNotices();

		const root = document.getElementById( 'wpbody-content' );
		if ( ! root || typeof MutationObserver === 'undefined' ) {
			return undefined;
		}

		const observer = new MutationObserver( moveNotices );
		observer.observe( root, { childList: true, subtree: true } );
		return () => observer.disconnect();
	}, [ hasAdminNotices ] );

	useEffect( () => {
		setMobileMenuOpen( false );
	}, [ location.pathname ] );

	useEffect( () => {
		if ( ! mobileMenuOpen ) {
			return undefined;
		}

		const previousOverflow = document.body.style.overflow;
		document.body.style.overflow = 'hidden';

		return () => {
			document.body.style.overflow = previousOverflow;
		};
	}, [ mobileMenuOpen ] );

	const isWpEmbed =
		typeof window !== 'undefined' && Boolean( window.stayiloAdmin );
	const wpAdminUrl = getWpAdminUrl();
	const handleUpgrade = () => {
		openUpgrade( 'sidebar' );
	};

	return (
		<div className="flex h-screen max-h-screen overflow-hidden bg-stayilo-surface font-inter text-stayilo-ink">
			{ mobileMenuOpen ? (
				<button
					type="button"
					className="fixed inset-0 z-40 bg-black/50 min-[768px]:hidden"
					aria-label="Close menu"
					onClick={ () => setMobileMenuOpen( false ) }
				/>
			) : null }

			<aside
				className={ [
					'flex h-full w-[280px] shrink-0 flex-col bg-stayilo-sidebar text-white',
					'max-[767px]:fixed max-[767px]:inset-y-0 max-[767px]:left-0 max-[767px]:z-50',
					'max-[767px]:transition-transform max-[767px]:duration-300 max-[767px]:ease-in-out',
					mobileMenuOpen
						? 'max-[767px]:translate-x-0'
						: 'max-[767px]:-translate-x-full',
					'min-[768px]:relative min-[768px]:translate-x-0',
				].join( ' ' ) }
			>
				<div className="flex items-center justify-end px-4 pt-4 min-[768px]:hidden">
					<button
						type="button"
						className="flex h-10 w-10 items-center justify-center rounded-[10px] border-0 bg-transparent p-0 text-white/80 transition-colors hover:bg-[#FFFFFF0F] hover:text-white"
						aria-label="Close menu"
						onClick={ () => setMobileMenuOpen( false ) }
					>
						<CloseIcon />
					</button>
				</div>
				{ isWpEmbed ? (
					<a
						href={ wpAdminUrl }
						className="flex items-center gap-2 px-6 pt-6 text-base !text-white/60 no-underline transition-colors hover:!text-white focus:!text-white active:!text-white"
					>
						<svg
							width="16"
							height="16"
							viewBox="0 0 16 16"
							fill="none"
							aria-hidden="true"
							className="shrink-0"
						>
							<path
								d="M10 3L5 8l5 5"
								stroke="currentColor"
								strokeWidth="1.5"
								strokeLinecap="round"
								strokeLinejoin="round"
							/>
						</svg>
						<span>Back to WordPress</span>
					</a>
				) : null }

				<div className="px-5 pb-5 pt-6">
					{ logoUrl ? (
						<img
							src={ logoUrl }
							alt="Stayilo"
							className="h-8 w-auto max-w-[140px] object-contain"
						/>
					) : (
						<img
							src={ defaultLogoUrl }
							alt="Stayilo"
							className="h-8 w-auto brightness-0 invert"
						/>
					) }
					<div className="mt-6 rounded-[10px] bg-[#FFFFFF0F] px-4 py-2">
						<p className="text-xs font-medium uppercase text-[#F7F8FA66] leading-4">
							Store
						</p>
						<p className="mt-0.5 font-medium text-sm text-[#F7F8FA] leading-5">{ storeName }</p>
					</div>
				</div>

				<nav
					className="min-h-0 flex-1 overflow-y-auto px-5 pb-5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
					aria-label="Admin"
				>
					{ SIDEBAR_ITEMS.map( ( item ) => {
						const locked = isNavItemLocked( item, tier );
						const showBadge = locked && item.tier !== 'free';

						if ( locked ) {
							return (
								<span
									key={ item.id }
									aria-disabled="true"
									className={ navItemClassName( false, true ) }
								>
									<NavItemContent
										item={ item }
										tier={ tier }
										showBadge={ showBadge }
									/>
								</span>
							);
						}

						return (
							<NavLink
								key={ item.id }
								to={ item.path }
								end={ item.path === '/' }
								className={ ( { isActive } ) =>
									navItemClassName( isActive )
								}
							>
								{ ( { isActive } ) => (
									<NavItemContent
										item={ item }
										tier={ tier }
										active={ isActive }
										showBadge={ showBadge }
									/>
								) }
							</NavLink>
						);
					} ) }
				</nav>

				<div className="mt-auto shrink-0 p-5">
					<SidebarTierPreview tier={ tier } />
					<SidebarPlanCard tier={ tier } onUpgrade={ handleUpgrade } />
				</div>
			</aside>

			<div className="relative min-h-0 min-w-0 flex-1 overflow-hidden">
				{ ! mobileMenuOpen ? (
					<button
						type="button"
						className="absolute left-4 top-4 z-30 flex h-10 w-10 items-center justify-center rounded-[10px] border-0 bg-white p-0 text-stayilo-ink shadow-sm transition-colors hover:bg-stayilo-surface min-[768px]:hidden"
						aria-label="Open menu"
						aria-expanded={ mobileMenuOpen }
						onClick={ () => setMobileMenuOpen( true ) }
					>
						<HamburgerIcon />
					</button>
				) : null }
				<main className="min-h-0 h-full overflow-y-auto bg-[#F7F8FAE5] [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
					{ /*
					  Anchor so WordPress inserts notices here, not under the
					  Dashboard heading. The bar itself is not shown.
					*/ }
					<hr className="wp-header-end" />
					<div
						id="stayilo-admin-notices"
						ref={ noticeSlotRef }
						className={
							! hasAdminNotices
								? 'hidden'
								: ! mobileMenuOpen
									? 'max-[767px]:!pl-[68px]'
									: ''
						}
					/>
					<div
						className={
							! hasAdminNotices && ! mobileMenuOpen
								? 'max-[767px]:[&>:first-child]:pl-[68px]'
								: ''
						}
					>
						<Outlet />
					</div>
				</main>
			</div>
		</div>
	);
}
