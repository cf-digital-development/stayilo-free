import { LockedBadge } from '@stayilo/design-system';

/**
 * Locked overlay for dashboard cards (Licence-card style).
 * Covers from the title down: light blur + frost at the top,
 * stronger toward the bottom. Badge stays sharp on top.
 *
 * Uses content `filter: blur()` (not backdrop-filter) for WP admin.
 */
export const LOCKED_CARD_SHADOW =
	'0 12px 40px rgba(15, 23, 42, 0.07), 0 4px 12px rgba(15, 23, 42, 0.04)';

/** Soft teaser still faintly visible at the very top (title). */
const TOP_MASK =
	'linear-gradient(to bottom, black 0%, rgba(0,0,0,0.55) 18%, transparent 42%)';

/** Stronger blur takes over quickly below the title. */
const BLUR_MASK =
	'linear-gradient(to bottom, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.65) 18%, black 40%, black 100%)';

/** White frost ~70% toward the bottom. */
const FROST =
	'linear-gradient(to bottom, rgba(255,255,255,0.38) 0%, rgba(255,255,255,0.55) 28%, rgba(255,255,255,0.72) 70%, rgba(255,255,255,0.78) 100%)';

const BLUR_BLEED = 20;

export function LockedFeature( {
	tier = 'growth',
	children,
	className = '',
	softShadow = true,
	overlay,
} ) {
	return (
		<div
			className={ `relative overflow-hidden ${ className }` }
			style={ softShadow ? { boxShadow: LOCKED_CARD_SHADOW } : undefined }
		>
			{ /* Faint sharp teaser — title still slightly readable */ }
			<div
				className="pointer-events-none select-none"
				aria-hidden="true"
				style={ {
					maskImage: TOP_MASK,
					WebkitMaskImage: TOP_MASK,
				} }
			>
				{ children }
			</div>

			{ /* Light blur across the whole card from the title */ }
			<div
				className="pointer-events-none absolute select-none"
				aria-hidden="true"
				style={ {
					top: -BLUR_BLEED,
					right: -BLUR_BLEED,
					bottom: -BLUR_BLEED,
					left: -BLUR_BLEED,
					filter: 'blur(2px)',
					opacity: 0.9,
				} }
			>
				<div style={ { padding: BLUR_BLEED } }>{ children }</div>
			</div>

			{ /* Stronger progressive blur toward the bottom */ }
			<div
				className="pointer-events-none absolute select-none"
				aria-hidden="true"
				style={ {
					top: -BLUR_BLEED,
					right: -BLUR_BLEED,
					bottom: -BLUR_BLEED,
					left: -BLUR_BLEED,
					filter: 'blur(10px)',
					maskImage: BLUR_MASK,
					WebkitMaskImage: BLUR_MASK,
				} }
			>
				<div style={ { padding: BLUR_BLEED } }>{ children }</div>
			</div>

			{ /* Frosted white overlay */ }
			<div
				className="pointer-events-none absolute inset-0 rounded-2xl"
				style={ { background: FROST } }
			/>

			<div
				className={ [
					'absolute inset-0 z-10 flex items-center justify-center',
					overlay ? 'p-6' : '',
				].join( ' ' ) }
			>
				{ overlay ?? <LockedBadge>{ tier }</LockedBadge> }
			</div>
		</div>
	);
}
