import { SETUP_MOUNT_ID } from './mount-config.js';
import { mountStayiloFreeSetup } from './mount-setup.jsx';

const root = document.getElementById( SETUP_MOUNT_ID );
if ( root ) {
	mountStayiloFreeSetup( root );
} else {
	console.warn(
		`[stayilo/free-core] Setup mount skipped — no element with id="${ SETUP_MOUNT_ID }". ` +
			'Add that div to the page or set window.stayiloAdmin.setupMountId before setup.js loads.'
	);
}
