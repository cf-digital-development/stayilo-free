import { useEffect, useState } from 'react';
import { ReactComponent as CaretDownIcon } from '../../assets/svg/CaretDown.svg';
import { portalFontStylesheets } from '@stayilo/design-system/portal-fonts';
import { PORTAL_FONT_SELECT } from '../../branding.js';

export function FontSelect( { value, onChange } ) {
	const [ open, setOpen ] = useState( false );

	useEffect( () => {
		Object.entries( portalFontStylesheets() ).forEach( ( [ name, href ] ) => {
			const id = `stayilo-brand-font-${ name.replace( /\s+/g, '-' ).toLowerCase() }`;
			if ( document.getElementById( id ) ) {
				return;
			}
			const link = document.createElement( 'link' );
			link.id = id;
			link.rel = 'stylesheet';
			link.href = href;
			document.head.appendChild( link );
		} );
	}, [] );

	return (
		<div className="relative">
			<button
				type="button"
				id="stayilo-portal-font"
				aria-haspopup="listbox"
				aria-expanded={ open }
				onClick={ () => setOpen( ( current ) => ! current ) }
				className="inline-flex items-center gap-1.5 rounded-lg border border-[#0D11171A] bg-white px-4 py-2 text-sm font-medium  leading-5 text-stayilo-ink"
				style={ {
					fontFamily: value === 'Inherit from theme' ? 'inherit' : value,
				} }
			>
				{ value }
				<CaretDownIcon width={ 16 } height={ 16 } aria-hidden="true" />
			</button>
			{ open ? (
				<div
					role="listbox"
					className="absolute right-0 z-20 mt-1 min-w-full overflow-hidden rounded-lg border border-[#0D11171A] bg-white py-1"
				>
					{ PORTAL_FONT_SELECT.map( ( font ) => (
						<button
							key={ font }
							type="button"
							role="option"
							aria-selected={ font === value }
							onClick={ () => {
								onChange( font );
								setOpen( false );
							} }
							className={ [
								'block w-full px-4 py-2 text-left text-sm font-medium leading-5',
								font === value
									? 'bg-stayilo-surface font-semibold text-stayilo-ink'
									: 'text-stayilo-ink hover:bg-stayilo-surface',
							].join( ' ' ) }
							style={ { fontFamily: font === 'Inherit from theme' ? 'inherit' : font } }
						>
							{ font }
						</button>
					) ) }
				</div>
			) : null }
		</div>
	);
}
