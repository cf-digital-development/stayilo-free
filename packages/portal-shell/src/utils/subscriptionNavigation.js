/**
 * Build a portal path that stays scoped to one subscription.
 *
 * @param {string} path
 * @param {string|number} [subscriptionId]
 * @returns {string}
 */
export function subscriptionPath( path, subscriptionId ) {
	const base = String( path || '' ).replace( /\?.*$/, '' );
	const id = subscriptionId != null && subscriptionId !== ''
		? String( subscriptionId )
		: '';
	if ( ! id ) {
		return base;
	}
	const join = base.includes( '?' ) ? '&' : '?';
	return `${ base }${ join }subscription=${ encodeURIComponent( id ) }`;
}

/**
 * React Router navigate state + path for a subscription-scoped screen.
 *
 * @param {string} path
 * @param {string|number} subscriptionId
 * @param {object} [extraState]
 * @returns {{ pathname: string, search: string, state: object }}
 */
export function subscriptionLocation( path, subscriptionId, extraState = {} ) {
	const id = subscriptionId != null && subscriptionId !== ''
		? String( subscriptionId )
		: '';
	const [ pathname, existingSearch = '' ] = String( path || '' ).split( '?' );
	const params = new URLSearchParams( existingSearch );
	if ( id ) {
		params.set( 'subscription', id );
	}
	const search = params.toString();
	return {
		pathname,
		search: search ? `?${ search }` : '',
		state: {
			...extraState,
			...( id ? { subscriptionId: id } : {} ),
		},
	};
}
