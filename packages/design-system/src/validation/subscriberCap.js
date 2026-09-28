/** Unlimited. The free plugin does not cap subscribers or read a paid licence. */
export const FREE_SUBSCRIBER_CAP = 0;

export function hasPaidSubscriberLicense() {
	return false;
}

/**
 * @returns {number} 0 means unlimited.
 */
export function resolveSubscriberCap() {
	return 0;
}

export function isSubscriberCapLocked() {
	return false;
}
