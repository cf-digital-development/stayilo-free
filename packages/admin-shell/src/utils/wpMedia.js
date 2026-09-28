const IMAGE_MIMES = [ 'image/jpeg', 'image/png', 'image/svg+xml' ];

export function pickImage( {
	title = 'Select image',
	buttonText = 'Use image',
	types = IMAGE_MIMES,
} = {} ) {
	return new Promise( ( resolve, reject ) => {
		if ( typeof window === 'undefined' || ! window.wp?.media ) {
			reject( new Error( 'WordPress media library is not available.' ) );
			return;
		}

		const frame = window.wp.media( {
			title,
			button: { text: buttonText },
			library: { type: types },
			multiple: false,
		} );

		frame.on( 'select', () => {
			const attachment = frame.state().get( 'selection' ).first()?.toJSON();
			if ( ! attachment?.url ) {
				resolve( null );
				return;
			}

			const mime = attachment.mime || '';
			if ( mime && ! types.includes( mime ) ) {
				reject( new Error( 'Use an SVG, JPG, or PNG file.' ) );
				return;
			}

			resolve( {
				id: attachment.id,
				url: attachment.url,
				alt: attachment.alt || '',
			} );
		} );

		frame.open();
	} );
}
