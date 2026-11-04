/**
 * Inline notice bar used on settings steps (cancellation, emails, etc.).
 *
 * @param {object} props
 * @param {import('react').ReactNode} [props.icon]
 * @param {import('react').ReactNode} props.children
 * @param {string} [props.className]
 */
export default function StepNotice( { icon, children, className = '' } ) {
	const classes = [
		'stayilo-pill-notice self-start -mt-4 [&_img]:block [&_img]:w-3 [&_img]:h-3 [&_img]:shrink-0 [&_svg]:block [&_svg]:w-3 [&_svg]:h-3 [&_svg]:shrink-0',
		className,
	]
		.filter( Boolean )
		.join( ' ' );

	return (
		<div className={ classes }>
			{ icon ? <span aria-hidden="true">{ icon }</span> : null }
			{ children }
		</div>
	);
}
