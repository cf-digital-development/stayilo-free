/**
 * Shared button-like click/keyboard props for whole-card surfaces.
 *
 * @param {object} options
 * @param {() => void} [options.onActivate]
 * @param {boolean} [options.disabled=false]
 * @param {boolean} [options.pressed]
 * @param {string} [options.fallbackRole='group'] - Role when not clickable
 * @returns {{ isClickable: boolean, rootProps: object }}
 */
export function useClickableSurface( {
	onActivate,
	disabled = false,
	pressed,
	fallbackRole = 'group',
} = {} ) {
	const isClickable = typeof onActivate === 'function' && ! disabled;

	function handleKeyDown( e ) {
		if ( e.key === 'Enter' || e.key === ' ' ) {
			e.preventDefault();
			onActivate();
		}
	}

	const rootProps = isClickable
		? {
			role: 'button',
			tabIndex: 0,
			onClick: onActivate,
			onKeyDown: handleKeyDown,
			...( pressed !== undefined ? { 'aria-pressed': pressed } : {} ),
		}
		: {
			...( fallbackRole ? { role: fallbackRole } : {} ),
			...( disabled ? { 'aria-disabled': true } : {} ),
		};

	return { isClickable, rootProps };
}
