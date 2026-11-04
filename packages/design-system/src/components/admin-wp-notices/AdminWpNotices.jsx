import { useEffect, useRef } from '@wordpress/element';
import './admin-wp-notices.css';

/**
 * Host for WordPress admin notices inside the Stayilo UI.
 * Moves #wpbody-content .notice nodes into this slot (full width, not in StepHeader flex).
 */
export default function AdminWpNotices() {
	const hostRef = useRef( null );

	useEffect( () => {
		const host = hostRef.current;
		if ( ! host ) {
			return;
		}

		const moveNotices = () => {
			document.querySelectorAll( '#wpbody-content .notice' ).forEach( ( notice ) => {
				if ( notice.classList.contains( 'inline' ) ) {
					return;
				}
				if ( host.contains( notice ) ) {
					return;
				}
				host.appendChild( notice );
			} );
		};

		moveNotices();

		const observer = new MutationObserver( moveNotices );
		const root = document.getElementById( 'wpbody-content' );
		if ( root ) {
			observer.observe( root, { childList: true, subtree: true } );
		}

		return () => observer.disconnect();
	}, [] );

	return (
		<div
			ref={ hostRef }
			id="stayilo-wp-notices"
			className="stayilo-wp-notices"
			aria-live="polite"
		/>
	);
}
