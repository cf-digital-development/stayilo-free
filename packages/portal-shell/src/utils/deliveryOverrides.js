import { getPortal } from '../api/portal.js';
import {
	readStorageJson,
	writeStorageJson,
} from './localStorageState.js';
import { applyDeliveryOverrideToCard } from './delivery/patch.js';

export const DELIVERY_OVERRIDES_STORAGE_KEY =
	'portal-shell:delivery-overrides';

/**
 * Scope overrides to the logged-in customer on shared computers.
 *
 * @returns {string}
 */
function deliveryOverridesStorageKey() {
	const customerId = String( getPortal().customerId || '0' );
	return `${ DELIVERY_OVERRIDES_STORAGE_KEY }:${ customerId }`;
}

/**
 * @returns {Record<string, { dateId?: string, dateLabel?: string }>}
 */
export function readDeliveryOverrides() {
	const raw = readStorageJson( deliveryOverridesStorageKey() );
	if ( ! raw || typeof raw !== 'object' || Array.isArray( raw ) ) {
		return {};
	}
	return raw;
}

/**
 * @param {Record<string, { dateId?: string, dateLabel?: string }>} overrides
 */
export function writeDeliveryOverrides( overrides ) {
	writeStorageJson( deliveryOverridesStorageKey(), overrides || {} );
}

/**
 * @param {string} subscriptionId
 * @param {{ dateId?: string, dateLabel?: string }} override
 */
export function setDeliveryOverride( subscriptionId, override ) {
	const id = String( subscriptionId || '' );
	if ( ! id || ! override ) {
		return;
	}
	const next = {
		...readDeliveryOverrides(),
		[ id ]: {
			dateId: override.dateId || '',
			dateLabel: override.dateLabel || '',
		},
	};
	writeDeliveryOverrides( next );
}

/**
 * @param {string} subscriptionId
 */
export function clearDeliveryOverride( subscriptionId ) {
	const id = String( subscriptionId || '' );
	if ( ! id ) {
		return;
	}
	const next = { ...readDeliveryOverrides() };
	if ( ! next[ id ] ) {
		return;
	}
	delete next[ id ];
	writeDeliveryOverrides( next );
}

/**
 * Apply saved date overrides onto subscription cards (survives refresh).
 *
 * @param {Array<object>} cards
 * @returns {Array<object>}
 */
export function mergeDeliveryOverrides( cards ) {
	if ( ! Array.isArray( cards ) || cards.length === 0 ) {
		return cards;
	}
	const overrides = readDeliveryOverrides();
	return cards.map( ( card ) =>
		applyDeliveryOverrideToCard(
			card,
			overrides[ String( card.id ) ] || {}
		)
	);
}
