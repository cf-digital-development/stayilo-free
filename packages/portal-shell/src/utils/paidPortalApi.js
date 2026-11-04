import { getStayiloRegistry } from '@stayilo/extension-sdk';
import { __ } from '@stayilo/design-system/i18n';

/**
 * Call a Pro-registered portal API. Free never ships the paid AJAX action strings;
 * Stayilo Pro registers handlers via registerPortalApi().
 *
 * @param {string} name
 * @param {...unknown} args
 * @returns {Promise<unknown>}
 */
export function callPaidPortalApi( name, ...args ) {
	const fn = getStayiloRegistry().getPortalApi?.( name );
	if ( typeof fn !== 'function' ) {
		throw new Error(
			__( 'This action requires Stayilo Pro.', 'stayilo' )
		);
	}
	return fn( ...args );
}
