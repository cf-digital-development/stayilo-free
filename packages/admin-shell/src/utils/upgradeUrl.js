const DEFAULT_UPGRADE_BASE = 'https://stayilo.com/upgrade/';

function readUpgradeBase() {
	if ( typeof window === 'undefined' ) {
		return DEFAULT_UPGRADE_BASE;
	}

	const admin = window.stayiloAdmin || {};
	return (
		admin.upgradeUrl ||
		admin.plansUrl ||
		admin.comparePlansUrl ||
		DEFAULT_UPGRADE_BASE
	);
}

/**
 * Upgrade / compare URL with placement tracking.
 * Example: https://stayilo.com/upgrade/?placement_id=account_cta
 *
 * @param {string} [placement='admin']
 * @returns {string}
 */
export function getUpgradeUrl( placement = 'admin' ) {
	const base = readUpgradeBase();
	const id = String( placement || 'admin' ).trim() || 'admin';

	try {
		const url = new URL( base, typeof window !== 'undefined' ? window.location.origin : 'https://stayilo.com' );
		url.searchParams.set( 'placement_id', id );
		return url.toString();
	} catch {
		const sep = String( base ).includes( '?' ) ? '&' : '?';
		return `${ base }${ sep }placement_id=${ encodeURIComponent( id ) }`;
	}
}

/**
 * @param {string} [placement='admin']
 */
export function openUpgrade( placement = 'admin' ) {
	if ( typeof window === 'undefined' ) {
		return;
	}
	window.location.assign( getUpgradeUrl( placement ) );
}
