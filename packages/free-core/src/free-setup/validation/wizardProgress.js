import { FREE_PLAN_STEP_INDEX, FREE_PLAN_STEP_COUNT } from '../config/constants';

const STORAGE_PREFIX = 'stayilo.freeWizard.step';
const MAX_STEP = FREE_PLAN_STEP_COUNT - 1;

/**
 * @param {object} [admin]
 * @returns {string}
 */
function storageKey( admin = window.stayiloAdmin || {} ) {
	const site = admin.siteUrl || admin.ajaxUrl || '';
	return `${ STORAGE_PREFIX }:${ site }`;
}

/**
 * @param {number} value
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
function clamp( value, min, max ) {
	return Math.max( min, Math.min( value, max ) );
}

/**
 * Earliest step to resume at (progress already earned from server state).
 *
 * @param {object} [values]
 * @returns {number}
 */
export function deriveFreeWizardMinStep( values = {} ) {
	if ( ! values.storeConnected ) {
		return FREE_PLAN_STEP_INDEX.environment;
	}

	return FREE_PLAN_STEP_INDEX.preview;
}

/**
 * Latest step allowed before required fields are complete.
 *
 * @param {object} [values]
 * @returns {number}
 */
export function deriveFreeWizardMaxStep( values = {} ) {
	if ( ! values.storeConnected ) {
		return FREE_PLAN_STEP_INDEX.connect;
	}

	return MAX_STEP;
}

/**
 * @param {object} [admin]
 * @returns {number|null}
 */
export function readFreeWizardStep( admin = window.stayiloAdmin || {} ) {
	if ( typeof window === 'undefined' || ! window.localStorage ) {
		return null;
	}

	try {
		const raw = window.localStorage.getItem( storageKey( admin ) );
		if ( raw === null || raw === '' ) {
			return null;
		}
		const step = Number.parseInt( raw, 10 );
		if ( ! Number.isInteger( step ) || step < 0 || step > MAX_STEP ) {
			return null;
		}
		return step;
	} catch {
		return null;
	}
}

/**
 * @param {number} step
 * @param {object} [admin]
 */
export function writeFreeWizardStep( step, admin = window.stayiloAdmin || {} ) {
	if ( typeof window === 'undefined' || ! window.localStorage ) {
		return;
	}

	if ( ! Number.isInteger( step ) || step < 0 || step > MAX_STEP ) {
		return;
	}

	try {
		window.localStorage.setItem( storageKey( admin ), String( step ) );
	} catch {
		// Private mode / quota — resume falls back to derived step.
	}
}

/**
 * @param {object} [admin]
 */
export function clearFreeWizardStep( admin = window.stayiloAdmin || {} ) {
	if ( typeof window === 'undefined' || ! window.localStorage ) {
		return;
	}

	try {
		window.localStorage.removeItem( storageKey( admin ) );
	} catch {
		// Ignore.
	}
}

/**
 * Resume where the merchant left off, without skipping required steps.
 *
 * @param {object} [admin]
 * @param {object} [values]
 * @returns {number}
 */
export function resolveFreeWizardStep(
	admin = window.stayiloAdmin || {},
	values = {}
) {
	const minStep = deriveFreeWizardMinStep( values );
	const maxStep = deriveFreeWizardMaxStep( values );
	const saved = readFreeWizardStep( admin );
	const target = saved === null ? minStep : saved;

	return clamp( target, minStep, maxStep );
}
