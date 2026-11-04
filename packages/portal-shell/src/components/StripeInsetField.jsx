import { useEffect, useRef, useState } from 'react';

/**
 * Stripe Element mounted inside the same inset chrome as {@link Field}.
 *
 * @param {object} props
 * @param {string} props.label
 * @param {import('@stripe/stripe-js').StripeElement|null} props.element
 * @param {string} [props.error]
 * @param {string} [props.className]
 */
export function StripeInsetField( { label, element, error = '', className = '' } ) {
	const mountRef = useRef( null );
	const [ empty, setEmpty ] = useState( true );
	const [ focused, setFocused ] = useState( false );
	const hasError = Boolean( error );
	const showEmpty = empty && ! focused;
	const inputId = `stripe-${ label.replace( /\W+/g, '-' ).toLowerCase() }`;

	useEffect( () => {
		const mount = mountRef.current;
		if ( ! element || ! mount ) {
			return undefined;
		}

		element.mount( mount );

		const onChange = ( event ) => {
			setEmpty( Boolean( event.empty ) );
		};
		const onFocus = () => setFocused( true );
		const onBlur = () => setFocused( false );

		element.on( 'change', onChange );
		element.on( 'focus', onFocus );
		element.on( 'blur', onBlur );

		return () => {
			element.off( 'change', onChange );
			element.off( 'focus', onFocus );
			element.off( 'blur', onBlur );
			try {
				element.unmount();
			} catch {
				// Parent may already have destroyed the Element.
			}
		};
	}, [ element ] );

	return (
		<div className={ [ 'w-full text-left', className ].filter( Boolean ).join( ' ' ) }>
			<label
				htmlFor={ inputId }
				className={ [
					'portal-field-inset',
					showEmpty ? 'portal-field-inset--empty' : '',
					hasError ? 'portal-field-inset--error' : '',
				]
					.filter( Boolean )
					.join( ' ' ) }
			>
				<span className="portal-field-inset__label">{ label }</span>
				<div
					id={ inputId }
					ref={ mountRef }
					className="portal-field-inset__input portal-stripe-element"
				/>
			</label>
			{ hasError ? (
				<span
					id={ `${ inputId }-error` }
					className="mt-1.5 block text-left text-sm leading-5 text-[#C00808] input-error"
					role="alert"
				>
					{ error }
				</span>
			) : null }
		</div>
	);
}
