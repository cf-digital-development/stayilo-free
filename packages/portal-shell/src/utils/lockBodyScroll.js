/** Nested open popups / menus share one body scroll lock. */
let lockCount = 0;
let previousOverflow = '';
let previousPaddingRight = '';

/**
 * Lock document body scroll and compensate for the scrollbar so the
 * layout does not jump (full-screen flicker) when the bar disappears.
 *
 * @returns {() => void} Unlock function — call from effect cleanup.
 */
export function lockBodyScroll() {
	if ( typeof document === 'undefined' ) {
		return () => {};
	}

	const { body } = document;

	if ( lockCount === 0 ) {
		previousOverflow = body.style.overflow;
		previousPaddingRight = body.style.paddingRight;

		const scrollbarWidth =
			window.innerWidth - document.documentElement.clientWidth;

		body.style.overflow = 'hidden';
		if ( scrollbarWidth > 0 ) {
			body.style.paddingRight = `${ scrollbarWidth }px`;
		}
	}

	lockCount += 1;

	let released = false;
	return () => {
		if ( released ) {
			return;
		}
		released = true;
		lockCount = Math.max( 0, lockCount - 1 );

		if ( lockCount === 0 ) {
			body.style.overflow = previousOverflow;
			body.style.paddingRight = previousPaddingRight;
		}
	};
}
