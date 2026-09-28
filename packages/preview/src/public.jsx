import { ProBadge } from '@stayilo/design-system';

/**
 * Static PRO teaser for Core merchants (preview-bundle.js later).
 */
export function ProTeaserCard( {
	title = 'Growth feature',
	description = 'Upgrade to unlock this screen.',
	tier = 'core',
} ) {
	return (
		<div className="mx-auto max-w-lg rounded-lg border border-stayilo-border bg-white p-6 shadow-sm">
			<div className="flex items-center gap-2">
				<h2 className="text-lg font-semibold text-stayilo-ink">{ title }</h2>
				<ProBadge children={tier} />
			</div>
			<p className="mt-2 text-sm text-stayilo-muted">{ description }</p>
		</div>
	);
}

export default ProTeaserCard;
