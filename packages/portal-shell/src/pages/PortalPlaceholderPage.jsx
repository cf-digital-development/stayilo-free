/**
 * Lightweight placeholder until dedicated portal screens are designed.
 *
 * @param {{ title: string, description?: string }} props
 */
export function PortalPlaceholderPage( { title, description } ) {
	return (
		<section
			className="portal-content portal-section--padded"
			aria-label={ title }
		>
			<h1 className="text-2xl font-bold tracking-tight text-portal-ink">
				{ title }
			</h1>
			{ description ? (
				<p className="mt-2 text-sm text-stayilo-muted">{ description }</p>
			) : null }
		</section>
	);
}
