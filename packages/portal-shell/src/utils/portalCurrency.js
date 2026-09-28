import { getPortal } from '../api/portal.js';
import { __ } from '@stayilo/design-system/i18n';

/**
 * Resolve display currency from a preferred code or the portal bootstrap.
 *
 * @param {string} [preferred]
 * @returns {string}
 */
export function getPortalCurrency( preferred ) {
	if ( preferred ) {
		return preferred;
	}
	return getPortal().currency || 'GBP';
}
