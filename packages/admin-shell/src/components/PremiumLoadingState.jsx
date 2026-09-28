/**
 * Shown while a paid bundle is expected but has not registered yet.
 *
 * @param {{ title?: string }} props
 */
export function PremiumLoadingState( { title = 'Loading' } ) {
	return (
		<div className="mx-auto max-w-3xl space-y-3">
			<h1 className="text-2xl font-semibold tracking-tight text-stayilo-ink">
				{ title }
			</h1>
			<p className="text-sm text-stayilo-muted">
				Loading your Stayilo plan features…
			</p>
			<div
				className="mt-6 rounded-lg border border-dashed border-stayilo-border bg-white p-10 text-center text-sm text-stayilo-muted"
				role="status"
				aria-live="polite"
			>
				Please wait a moment.
			</div>
		</div>
	);
}
