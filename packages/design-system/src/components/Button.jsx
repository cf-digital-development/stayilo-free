/**
 * Minimal shared button — expand as the design system grows.
 */
export function Button( {
	children,
	variant = 'primary',
	type = 'button',
	className = '',
	...props
} ) {
	const base =
		'inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50';
	const variants = {
		primary:
			'bg-stayilo-ink text-white hover:bg-black focus-visible:ring-stayilo-ink',
		secondary:
			'bg-white text-stayilo-ink border border-stayilo-border hover:bg-stayilo-surface focus-visible:ring-stayilo-muted',
		ghost: 'bg-transparent text-stayilo-muted hover:bg-white/10 hover:text-white',
	};

	return (
		<button
			type={ type }
			className={ [ base, variants[ variant ] || variants.primary, className ]
				.filter( Boolean )
				.join( ' ' ) }
			{ ...props }
		>
			{ children }
		</button>
	);
}
