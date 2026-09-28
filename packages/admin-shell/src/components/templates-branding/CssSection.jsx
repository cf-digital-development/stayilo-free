import { LockedBadge } from '@stayilo/design-system';

function CssEditor( { value, onChange, className = '' } ) {
	return (
		<div className={ [ 'overflow-hidden rounded-2xl border border-[#0D111714]', className ].join( ' ' ) }>
			<div className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-[#474C57] leading-4 font-mono">
				<span aria-hidden="true">{ '</>' }</span>
				custom.css
			</div>
			<textarea
				rows={ 7 }
				value={ value }
				onChange={ ( event ) => onChange( event.target.value ) }
				placeholder="/* Add custom portal styles */"
				className="w-full resize-y border-0 bg-[#0D1117] p-[10px] font-mono text-sm  leading-5 text-white outline-none placeholder:text-white/40"
			/>
		</div>
	);
}

function LockedCssEditor( { className = '' } ) {
	return (
		<div
			className={ [
				'relative overflow-hidden rounded-2xl border border-[#0D111714]',
				className,
			].join( ' ' ) }
		>
			<div className="bg-[#FFFFFFB2]">
				<div className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-[#474C57] leading-4 font-mono opacity-40">
					<span aria-hidden="true">{ '</>' }</span>
					custom.css
				</div>
				<div
					className="flex h-[180px] items-center justify-center"
					style={ { background: 'rgba(13,17,23,0.28)' } }
				>
					<LockedBadge>growth</LockedBadge>
				</div>
			</div>
		</div>
	);
}

export function CssSection( { hasGrowth, value, onChange } ) {
	return (
		<section className="!mt-5">
			<h2 className="text-sm font-semibold leading-5 text-stayilo-ink">Custom CSS</h2>
			{ hasGrowth ? (
				<CssEditor className="mt-3" value={ value } onChange={ onChange } />
			) : (
				<LockedCssEditor className="mt-3" />
			) }
		</section>
	);
}
