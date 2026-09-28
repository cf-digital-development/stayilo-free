import { useState } from 'react';
import { __ } from '@stayilo/design-system/i18n';
import securityPassIconUrl from '@stayilo/design-system/assets/svg/security-pass.svg';
import globeIconUrl from '@stayilo/design-system/assets/svg/Globe.svg';
import PlanFeaturesCard from '../components/PlanFeaturesCard';
import { completeFreeSetup } from '../api/completeFreeSetup';

/** Wider step card when the live portal success screen is shown. */
export const LIVE_PORTAL_STEP_CARD_CLASS = 'max-w-[886px]';

/**
 * @param {string} storeUrl
 * @returns {string}
 */
function buildPortalUrl( storeUrl ) {
	const base = String( storeUrl || '' ).replace( /\/$/, '' );
	if ( ! base ) {
		return 'yourstore.com/my-account';
	}
	try {
		const url = new URL( base.startsWith( 'http' ) ? base : `https://${ base }` );
		return `${ url.host }/my-account`;
	} catch {
		return `${ base.replace( /^https?:\/\//, '' ) }/my-account`;
	}
}

/**
 * Final onboarding screen — "You're live on Free!"
 *
 * @param {object} props
 * @param {string} [props.storeUrl]
 * @param {string} [props.dashboardUrl]
 * @param {string} [props.plansUrl]
 * @param {'single'|'multiple'} [props.subscriptionMode]
 * @param {boolean} [props.storeConnected]
 * @param {number|null} [props.subscriberCount]
 * @param {string} [props.adminEmail]
 * @param {boolean} [props.marketingOptIn]
 */
export default function LivePortalStep( {
	storeUrl = '',
	dashboardUrl = window.stayiloAdmin?.dashboardUrl || '/wp-admin/admin.php?page=stayilo',
	plansUrl = window.stayiloAdmin?.plansUrl || window.stayiloAdmin?.upgradeUrl || '',
	subscriptionMode = 'single',
	storeConnected = true,
	subscriberCount = window.stayiloAdmin?.subscriberCount ?? null,
	adminEmail = '',
	marketingOptIn = false,
} ) {
	const [ copied, setCopied ] = useState( false );
	const portalUrl = buildPortalUrl( storeUrl );

	const copyPortalUrl = async () => {
		try {
			const fullUrl = portalUrl.includes( '://' ) ? portalUrl : `https://${ portalUrl }`;
			await navigator.clipboard.writeText( fullUrl );
			setCopied( true );
			setTimeout( () => setCopied( false ), 2000 );
		} catch {
			setCopied( false );
		}
	};

	const openPlans = () => {
		if ( plansUrl ) {
			window.open( plansUrl, '_blank', 'noopener,noreferrer' );
		}
	};

	const openDashboard = async () => {
		try {
			const nextUrl = await completeFreeSetup( {
				storeUrl,
				storeConnected,
				subscriberCount,
				subscriptionMode,
				adminEmail,
				marketingOptIn,
			} );
			window.location.assign( nextUrl );
		} catch {
			window.location.assign( dashboardUrl );
		}
	};

	return (
		<div className="flex flex-col items-center text-center">
			<div
				className="flex h-20 w-20 items-center justify-center rounded-3xl bg-stayilo-ink text-white [&_img]:h-12 [&_img]:w-12"
				aria-hidden="true"
				style={{ boxShadow: '0px 20px 25px -5px #0000001A' }}
			>
				<img src={ securityPassIconUrl } alt="" />
			</div>

			<h2 className="mt-4 mb-2 font-inter  mx-auto text-[32px] font-black leading-[44px] text-stayilo-ink max-[600px]:text-2xl max-[600px]:leading-8">
				{ __( "You're live on Free!", 'stayilo' ) }
			</h2>
			<p className="stayilo-type-body-muted m-0">{ __( 'Your portal is active at:', 'stayilo' ) }</p>

			<div className="mt-3 grid w-full max-w-[480px] grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2.5 rounded-xl border border-stayilo-ink-alpha bg-stayilo-surface-soft px-4 py-3 text-left">
				<img src={ globeIconUrl } alt="" aria-hidden="true" className="block h-5 w-5" />
				<code className=" !p-0 overflow-hidden text-ellipsis bg-transparent whitespace-nowrap font-mono text-base font-medium leading-6 text-stayilo-ink max-[600px]:text-sm">
					{ portalUrl }
				</code>
				<button
					type="button"
					className="border-0 bg-transparent p-0 font-inter text-sm font-semibold leading-5 text-[#6366F1] cursor-pointer"
					onClick={ copyPortalUrl }
				>
					{ copied ? __( 'Copied', 'stayilo' ) : __( 'Copy', 'stayilo' ) }
				</button>
			</div>

			<PlanFeaturesCard
				className="mt-6"
				title={ __( 'Want more? Upgrade your plan', 'stayilo' ) }
				actionLabel={ __( 'View plans', 'stayilo' ) }
				onAction={ openPlans }
			/>

			<button
				type="button"
				className="mt-5 border-0 bg-transparent font-inter text-sm leading-5 text-stayilo-muted underline cursor-pointer"
				onClick={ openDashboard }
			>
				{ __( 'Skip to dashboard', 'stayilo' ) }
			</button>
		</div>
	);
}
