import { useLocation, useNavigate } from 'react-router-dom';
import { isLicensedPaid, setPreviewMerchantTier } from '../premium.js';

const GROWTH_PATHS = [
	'/reports',
	'/rules',
	'/flows',
	'/activity',
	'/integrations',
];

/**
 * Temporary Core/Growth switch for licensed paid installs.
 * Not shown on Free. Session-only — clears when the tab closes.
 */
export function DevTierSwitch( { tier } ) {
	const navigate = useNavigate();
	const location = useLocation();

	if ( ! isLicensedPaid() ) {
		return null;
	}

	const select = ( next ) => {
		setPreviewMerchantTier( next );
		if (
			next === 'core' &&
			GROWTH_PATHS.some( ( path ) => location.pathname.startsWith( path ) )
		) {
			navigate( '/' );
		}
	};

	return (
		<div className="mb-5 rounded-[10px] border border-amber-300/25 bg-[#FFFFFF0F] px-4 py-2">
			<p className="mb-3 text-sm font-medium uppercase  text-amber-400">
				Temp plan preview
			</p>			
			<div className="grid grid-cols-2 gap-1">
				{ [ 'core', 'growth' ].map( ( option ) => {
					const active = tier === option;
					return (
						<button
							key={ option }
							type="button"
							onClick={ () => select( option ) }
							className={ [
								'rounded-[10px] px-4 py-2 text-xs font-medium leading-4 capitalize transition-colors',
								active
									? 'bg-[#FFFFFF0F] text-white'
									: 'text-[#FFFFFF]/70 hover:bg-[#FFFFFF0F] hover:text-white',
							].join( ' ' ) }
						>
							{ option }
						</button>
					);
				} ) }
			</div>
		</div>
	);
}
