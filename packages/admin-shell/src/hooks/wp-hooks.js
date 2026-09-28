const filters = new Map();
const actions = new Map();

function getHooks() {
	if ( typeof window !== 'undefined' && window.wp?.hooks ) {
		return window.wp.hooks;
	}
	return { addFilter, applyFilters, addAction, doAction };
}

export function addFilter( hook, namespace, callback, priority = 10 ) {
	if ( ! filters.has( hook ) ) {
		filters.set( hook, [] );
	}
	filters.get( hook ).push( { namespace, callback, priority } );
	filters.get( hook ).sort( ( a, b ) => a.priority - b.priority );
}

export function applyFilters( hook, value, ...args ) {
	const external = typeof window !== 'undefined' ? window.wp?.hooks : null;
	let current = value;

	if ( external?.applyFilters ) {
		current = external.applyFilters( hook, value, ...args );
	}

	const local = filters.get( hook ) || [];
	for ( const { callback } of local ) {
		current = callback( current, ...args );
	}

	return current;
}

export function addAction( hook, namespace, callback, priority = 10 ) {
	if ( ! actions.has( hook ) ) {
		actions.set( hook, [] );
	}
	actions.get( hook ).push( { namespace, callback, priority } );
	actions.get( hook ).sort( ( a, b ) => a.priority - b.priority );
}

export function doAction( hook, ...args ) {
	const external = typeof window !== 'undefined' ? window.wp?.hooks : null;
	external?.doAction?.( hook, ...args );

	const local = actions.get( hook ) || [];
	for ( const { callback } of local ) {
		callback( ...args );
	}
}

export { getHooks };
