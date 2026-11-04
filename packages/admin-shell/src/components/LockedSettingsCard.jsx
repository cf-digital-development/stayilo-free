import { LockedFeature } from './LockedFeature.jsx';

/**
 * Locked settings teaser — same overlay as dashboard StatCard.
 * Height is inline so it works when Core CSS is not loaded in WP Admin.
 */
export function LockedSettingsCard( { title, subtitle, value, tier = 'growth' } ) {
	const card = (
		<div className="flex h-full flex-col rounded-2xl border border-[#0D111714] bg-white p-5">
			<p className="text-sm  font-semibold uppercase text-stayilo-ink leading-5">
				{ title }
			</p>
			{ subtitle ? (
				<p className="mt-0.5 text-xs text-stayilo-muted opacity-70 leading-4">
					{ subtitle }
				</p>
			) : null }
			<p className="mt-4 text-sm  leading-5 text-stayilo-ink">
				{ value }
			</p>
		</div>
	);

	return (
		<div style={ { height: 168 } }>
			<LockedFeature tier={ tier } className="h-full rounded-2xl border">
				{ card }
			</LockedFeature>
		</div>
	);
}
