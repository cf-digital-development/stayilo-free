import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import '@stayilo/design-system/styles/styles.css';
import './styles.css';
import App from './App.jsx';
import { ADMIN_MOUNT_ID } from './mount-config.js';

/**
 * Mount the Free admin SPA into a DOM node (WordPress admin page or local mock).
 *
 * @param {HTMLElement|string} [target] — element or selector; defaults to #ADMIN_MOUNT_ID
 */
export function mountStayiloFreeAdmin( target ) {
	const el =
		target != null
			? typeof target === 'string'
				? document.querySelector( target )
				: target
			: document.getElementById( ADMIN_MOUNT_ID );
	if ( ! el ) {
		throw new Error(
			`Stayilo free admin mount target not found (id="${ ADMIN_MOUNT_ID }")`
		);
	}

	// Prevent double-mount (e.g. Pro wizard fighting Free for the same node).
	if ( el.dataset.stayiloMounted === '1' ) {
		return;
	}
	el.dataset.stayiloMounted = '1';

	document.documentElement.classList.add( 'stayilo-fullscreen-admin' );
	document.body.classList.add( 'stayilo-free-admin-page' );

	createRoot( el ).render(
		<div className="stayilo-free-admin">
			<HashRouter>
				<App />
			</HashRouter>
		</div>
	);
}
