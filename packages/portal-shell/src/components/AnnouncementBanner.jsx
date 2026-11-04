/**
 * Site-wide announcement strip from Templates & Branding settings.
 * Renders above the white portal header when enabled.
 */
export function AnnouncementBanner( {
	enabled = true,
	text = '',
	color = '#0D1117',
	link = '',
} ) {
	const label = text?.trim() || '';
	if ( ! enabled || ! label ) {
		return null;
	}

	const background = color || '#0D1117';
	const className = 'portal-announcement-banner';

	if ( link ) {
		return (
			<a
				href={ link }
				className={ className }
				style={ { background } }
				target="_blank"
				rel="noopener noreferrer"
			>
				{ label }
			</a>
		);
	}

	return (
		<div className={ className } style={ { background } } role="status">
			{ label }
		</div>
	);
}
