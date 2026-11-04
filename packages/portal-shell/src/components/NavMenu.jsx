import { useEffect, useState } from 'react';
import { DEFAULT_NAV_ITEMS } from '../data/navItems.js';
import { __ } from '@stayilo/design-system/i18n';

function NavItem( { item, isActive, onSelect, variant } ) {
	const classes = [
		variant === 'mobile'
			? 'portal-nav-item portal-nav-item--mobile'
			: variant === 'sidebar'
				? 'portal-nav-item portal-nav-item--sidebar'
				: 'portal-nav-item',
		isActive ? 'portal-nav-item--active' : 'portal-nav-item--inactive',
	].join( ' ' );

	if ( item.href ) {
		return (
			<a
				href={ item.href }
				className={ classes }
				aria-current={ isActive ? 'page' : undefined }
				onClick={ ( event ) => {
					if ( onSelect ) {
						event.preventDefault();
						onSelect( item.id );
					}
				} }
			>
				{ item.label }
			</a>
		);
	}

	return (
		<button
			type="button"
			className={ classes }
			aria-current={ isActive ? 'page' : undefined }
			onClick={ () => onSelect?.( item.id ) }
		>
			{ item.label }
		</button>
	);
}

/**
 * Portal header navigation menu with active state.
 *
 * @param {object} props
 * @param {Array<{ id: string, label: string, href?: string }>} [props.navItems]
 * @param {string} [props.activeNavId='subscription']
 * @param {(navId: string) => void} [props.onNavChange]
 * @param {'desktop'|'mobile'|'sidebar'} [props.variant='desktop']
 * @param {string} [props.className]
 */
export function NavMenu( {
	navItems = DEFAULT_NAV_ITEMS,
	activeNavId = 'subscription',
	onNavChange,
	variant = 'desktop',
	className = '',
} ) {
	const [ internalActiveId, setInternalActiveId ] = useState( activeNavId );

	useEffect( () => {
		setInternalActiveId( activeNavId );
	}, [ activeNavId ] );

	const currentActiveId = onNavChange ? activeNavId : internalActiveId;

	const handleNavSelect = ( navId ) => {
		if ( ! onNavChange ) {
			setInternalActiveId( navId );
		}
		onNavChange?.( navId );
	};

	const variantClass =
		variant === 'mobile'
			? 'portal-nav portal-nav--mobile'
			: variant === 'sidebar'
				? 'portal-nav portal-nav--sidebar'
				: 'portal-nav';

	const classes = [ variantClass, className ].filter( Boolean ).join( ' ' );

	return (
		<nav
			className={ classes }
			aria-label={
				variant === 'mobile'
					? __( 'Portal mobile navigation', 'stayilo' )
					: variant === 'sidebar'
						? __( 'Portal sidebar navigation', 'stayilo' )
						: __( 'Portal navigation', 'stayilo' )
			}
		>
			{ navItems.map( ( item ) => (
				<NavItem
					key={ item.id }
					item={ item }
					isActive={ item.id === currentActiveId }
					onSelect={ handleNavSelect }
					variant={ variant }
				/>
			) ) }
		</nav>
	);
}
