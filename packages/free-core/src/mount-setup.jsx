import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@stayilo/design-system/styles/styles.css';
import './styles.css';
import FreePlanWizard from './free-setup/FreePlanWizard.jsx';
import { SETUP_MOUNT_ID } from './mount-config.js';

/**
 * Mount the Free onboarding wizard into a DOM node (WordPress setup page or local mock).
 *
 * @param {HTMLElement|string} [target] — element or selector; defaults to #SETUP_MOUNT_ID
 */
export function mountStayiloFreeSetup( target ) {
	const el =
		target != null
			? typeof target === 'string'
				? document.querySelector( target )
				: target
			: document.getElementById( SETUP_MOUNT_ID );
	if ( ! el ) {
		throw new Error(
			`Stayilo free setup mount target not found (id="${ SETUP_MOUNT_ID }")`
		);
	}

	document.body.classList.add( 'stayilo-free-setup-page' );

	createRoot( el ).render(
		<StrictMode>
			<div className="stayilo-free-setup">
				<FreePlanWizard />
			</div>
		</StrictMode>
	);
}
