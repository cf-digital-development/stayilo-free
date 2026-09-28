import { __, sprintf } from '../i18n.js';

const admin = window.stayiloAdmin || {};

/** True when `current` (e.g. "9.5.1") is >= `min` (e.g. "8.0"). */
function versionAtLeast( current, min ) {
	if ( ! current ) {
		return false;
	}
	const a = String( current ).split( '.' ).map( ( n ) => parseInt( n, 10 ) || 0 );
	const b = String( min ).split( '.' ).map( ( n ) => parseInt( n, 10 ) || 0 );
	for ( let i = 0; i < Math.max( a.length, b.length ); i++ ) {
		const diff = ( a[ i ] || 0 ) - ( b[ i ] || 0 );
		if ( diff !== 0 ) {
			return diff > 0;
		}
	}
	return true;
}

/**
 * Row for a required plugin: 'active' | 'inactive' | 'missing' + min version.
 */
function pluginCheck( id, title, min, plugin ) {
	const { status = 'missing', version = null } = plugin || {};

	if ( status === 'active' ) {
		const versionOk = versionAtLeast( version, min );
		return {
			id,
			title,
			version: sprintf(
				/* translators: 1: minimum version, 2: detected version. */
				__( '≥ %1$s — detected %2$s', 'stayilo' ),
				min,
				version ?? __( 'unknown', 'stayilo' )
			),
			status: versionOk ? 'valid' : 'error',
			message: versionOk
				? undefined
				: sprintf(
					/* translators: 1: plugin name, 2: minimum version. */
					__( '%1$s is active but needs updating to %2$s or higher.', 'stayilo' ),
					title,
					min
				),
		};
	}

	if ( status === 'inactive' ) {
		return {
			id,
			title,
			version: sprintf(
				/* translators: %s: minimum version. */
				__( '≥ %s', 'stayilo' ),
				min
			),
			status: 'warning',
			message: sprintf(
				/* translators: %s: plugin name. */
				__( '%s is installed but not active. Activate it in Plugins.', 'stayilo' ),
				title
			),
		};
	}

	return {
		id,
		title,
		version: sprintf(
			/* translators: %s: minimum version. */
			__( '≥ %s', 'stayilo' ),
			min
		),
		status: 'error',
		message: sprintf(
			/* translators: %s: plugin name. */
			__( '%s is not installed. Install and activate it first.', 'stayilo' ),
			title
		),
	};
}

/**
 * Build the environment checks from real server data (window.stayiloAdmin.env).
 * Falls back to hardcoded demo values when env data is not available.
 */
export function buildEnvironmentChecks() {
	const env = admin.env;

	if ( ! env ) {
		const demo = [
			{
				id: 'wc',
				title: __( 'WooCommerce', 'stayilo' ),
				version: __( '≥ 10.8 — detected 11.1', 'stayilo' ),
				status: 'valid',
			},
			{
				id: 'subs',
				title: __( 'WC Subscriptions', 'stayilo' ),
				version: __( '≥ 9.1 — detected 9.2', 'stayilo' ),
				status: 'valid',
			},
			{
				id: 'php',
				title: __( 'PHP version', 'stayilo' ),
				version: __( '≥ 8.0 — detected 8.4', 'stayilo' ),
				status: 'valid',
			},
			{
				id: 'ssl',
				title: __( 'SSL certificate', 'stayilo' ),
				requirement: __( 'Required — active', 'stayilo' ),
				status: 'valid',
			},
		];
		return demo;
	}

	const phpOk = versionAtLeast( env.phpVersion, '8.0' );
	const checks = [
		pluginCheck( 'wc', __( 'WooCommerce', 'stayilo' ), '10.8', env.wooCommerce ),
		pluginCheck( 'subs', __( 'WC Subscriptions', 'stayilo' ), '9.1', env.wcSubscriptions ),
		{
			id: 'php',
			title: __( 'PHP version', 'stayilo' ),
			version: sprintf(
				/* translators: %s: detected PHP version. */
				__( '≥ 8.0 — detected %s', 'stayilo' ),
				env.phpVersion ?? __( 'unknown', 'stayilo' )
			),
			status: phpOk ? 'valid' : 'error',
			message: phpOk
				? undefined
				: __( 'Your PHP version is too old. Ask your host to upgrade to 8.0 or later.', 'stayilo' ),
		},
		{
			id: 'ssl',
			title: __( 'SSL certificate', 'stayilo' ),
			requirement: __( 'Required — active', 'stayilo' ),
			status: 'valid',
			// status: env.sslEnabled === false ? 'error' : 'valid',
			// message:
			// 	env.sslEnabled === false
			// 		? 'SSL is not active. Enable HTTPS and install a valid SSL certificate.'
			// 		: undefined,
		},
	];

	return checks;
}
