/**
 * Shared empty / placeholder panel (matches Edit Subscription empty style).
 *
 * @param {object} props
 * @param {string} props.message
 * @param {import('react').ReactNode} [props.action]
 * @param {string} [props.className]
 */
export function EmptyState( { message, action = null, className = '' } ) {
	return (
		<div
			className={ [
				'm-0 rounded-2xl bg-white px-5 py-8 text-center',
				className,
			]
				.filter( Boolean )
				.join( ' ' ) }
			role="status"
		>
			<p className="m-0 text-base font-medium leading-6 text-stayilo-muted">
				{ message }
			</p>
			{ action ? <div className="mt-4 flex justify-center">{ action }</div> : null }
		</div>
	);
}
