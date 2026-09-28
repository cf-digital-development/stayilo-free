/**
 * Convert a Yup ValidationError into a Formik errors object.
 *
 * @param {import('yup').ValidationError} error
 * @returns {Record<string, unknown>}
 */
export function yupToFormikErrors( error ) {
	const errors = {};
	if ( ! error?.inner?.length ) {
		if ( error?.path ) {
			setPath( errors, error.path, error.message );
		}
		return errors;
	}
	error.inner.forEach( ( item ) => {
		if ( item.path && ! getPath( errors, item.path ) ) {
			setPath( errors, item.path, item.message );
		}
	} );
	return errors;
}

/**
 * Build a touched tree matching an errors object (nested-aware).
 *
 * @param {Record<string, unknown>} errors
 * @returns {Record<string, unknown>}
 */
export function errorsToTouched( errors ) {
	if ( ! errors || typeof errors !== 'object' ) {
		return {};
	}
	const touched = {};
	Object.keys( errors ).forEach( ( key ) => {
		const value = errors[ key ];
		touched[ key ] =
			value && typeof value === 'object' && ! Array.isArray( value )
				? errorsToTouched( value )
				: true;
	} );
	return touched;
}

/**
 * Validate values against a Yup schema and return Formik-style errors.
 *
 * @param {import('yup').AnySchema|undefined|null} schema
 * @param {object} values
 * @returns {Promise<Record<string, unknown>>}
 */
export async function validateWithSchema( schema, values ) {
	if ( ! schema ) {
		return {};
	}
	try {
		await schema.validate( values, { abortEarly: false } );
		return {};
	} catch ( error ) {
		return yupToFormikErrors( error );
	}
}

/**
 * Validate the active step against a step-indexed schema map.
 *
 * @param {number} stepIndex
 * @param {object} values
 * @param {Record<number, import('yup').AnySchema>} stepSchemas
 * @returns {Promise<Record<string, unknown>>}
 */
export async function validateStep( stepIndex, values, stepSchemas ) {
	return validateWithSchema( stepSchemas[ stepIndex ], values );
}

/**
 * Read a nested string error from Formik errors.
 *
 * @param {Record<string, unknown>} errors
 * @param {string} path
 * @returns {string|undefined}
 */
export function getFieldError( errors, path ) {
	const value = getPath( errors, path );
	return typeof value === 'string' ? value : undefined;
}

function getPath( obj, path ) {
	return path.split( '.' ).reduce( ( acc, key ) => ( acc == null ? acc : acc[ key ] ), obj );
}

function setPath( obj, path, value ) {
	const parts = path.split( '.' );
	let cursor = obj;
	parts.forEach( ( part, index ) => {
		if ( index === parts.length - 1 ) {
			cursor[ part ] = value;
			return;
		}
		if ( ! cursor[ part ] || typeof cursor[ part ] !== 'object' ) {
			cursor[ part ] = {};
		}
		cursor = cursor[ part ];
	} );
}
