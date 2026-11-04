/**
 * Stylesheet URLs for the bundled portal families.
 * WordPress localizes these from the plugin font files. Empty outside wp-admin.
 */
export function portalFontStylesheets() {
	if ( typeof window === 'undefined' ) {
		return {};
	}

	const admin = window.stayiloAdmin && window.stayiloAdmin.fontStylesheets;
	const portal = window.stayiloPortal && window.stayiloPortal.fontStylesheets;
	const provided = admin && typeof admin === 'object' ? admin : portal;

	if ( provided && typeof provided === 'object' ) {
		return provided;
	}

	return {};
}
