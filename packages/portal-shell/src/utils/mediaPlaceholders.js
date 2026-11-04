/** Shared fallback images when Woo/API media is missing. */

import placeholderImage from '../assets/images/placeholder_img.jpg';

export const DEFAULT_MEAL_IMAGE = placeholderImage;

export const DEFAULT_THUMB_IMAGE = placeholderImage;					

/**
 * @param {string|null|undefined} url
 * @param {string} [fallback=DEFAULT_MEAL_IMAGE]
 * @returns {string}
 */
export function resolveMediaUrl( url, fallback = DEFAULT_MEAL_IMAGE ) {
	if ( typeof url === 'string' && url.trim() ) {
		return url.trim();
	}
	return fallback;
}
