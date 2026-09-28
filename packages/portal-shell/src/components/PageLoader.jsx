/**
 * Inline page loading indicator.
 *
 * @param {object} props
 * @param {string} [props.message='Loading…']
 * @param {string} [props.className]
 */
export function PageLoader( { message = 'Loading…', className = '' } ) {
	return (
		<div
			className={ [
				'flex flex-col items-center justify-center gap-3 rounded-2xl bg-white px-5 py-12',
				className,
			]
				.filter( Boolean )
				.join( ' ' ) }
			role="status"
			aria-live="polite"
			aria-busy="true"
		>
			<span className="portal-spinner" aria-hidden="true" />
			<p className="m-0 text-base font-medium leading-6 text-stayilo-muted">
				{ message }
			</p>
		</div>
	);
}
