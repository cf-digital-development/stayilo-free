import * as Yup from 'yup';

/** Fallback when window width is unavailable (SSR / first paint). */
export const VISIBLE_DATES = 7;

/**
 * How many date badges fit in the reschedule slider track.
 *
 * Desktop (≥1024): 7 · Tablet (≥768): 4 · Small (≥640): 3 · Mobile: 2
 *
 * @param {number} width
 * @returns {number}
 */
export function getVisibleDateCount( width ) {
	if ( width >= 768 ) {
		return 7;
	}
	if ( width >= 540 ) {
		return 5;
	}
	if ( width >= 320 ) {
		return 3;
	}
	return 2;
}

export const rescheduleSchema = Yup.object( {
	selectedDateId: Yup.string()
		.trim()
		.required( 'Please select an order date' ),
} );
