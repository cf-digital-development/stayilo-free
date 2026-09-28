import { LockedFeature } from '../LockedFeature.jsx';

export function ChartCard( {
	title,
	subtitle,
	legend,
	actions,
	locked = false,
	lockTier = 'growth',
	className = '',
	children,
} ) {
	const body = (
		<>
			<div className="flex items-start justify-between gap-4 px-5 pt-5">
				<div className="min-w-0">
					<h2 className="m-0 text-sm font-semibold uppercase text-[#474C57] leading-5 ">
						{ title }
					</h2>
					{ subtitle ? (
						<p className="mt-0.5 text-xs leading-4  text-[#7C8494]">
							{ subtitle }
						</p>
					) : null }
				</div>
				<div className="flex shrink-0 flex-wrap items-center justify-end gap-4">
					{ legend }
					{ actions }
				</div>
			</div>
			{ children }
		</>
	);

	if ( locked ) {
		return (
			<LockedFeature
				tier={ lockTier }
				className={ [ 'rounded-2xl border border-[#0D111714] bg-white', className ]
					.filter( Boolean )
					.join( ' ' ) }
			>
				{ body }
			</LockedFeature>
		);
	}

	return (
		<div
			className={ [
				'overflow-hidden rounded-2xl border border-[#0D111714] bg-white',
				className,
			]
				.filter( Boolean )
				.join( ' ' ) }
		>
			{ body }
		</div>
	);
}
