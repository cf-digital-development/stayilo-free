import { LockedFeature, LOCKED_CARD_SHADOW } from './LockedFeature.jsx';
import { ReactComponent as TrendUpIcon } from '../assets/svg/TrendUp.svg';

/**
 * Dashboard metric card — matches Figma free/core dashboard KPIs.
 */
export function StatCard( {
	label,
	subtitle,
	value,
	trendValue,
	trendSuffix,
	trendTone = 'positive',
	dark = false,
	locked = false,
	lockTier = 'growth',
	trendAsPill = false,
} ) {
	const toneClass =
		trendTone === 'positive' ? 'text-stayilo-accent' : 'text-stayilo-muted';

	const card = (
		<div
			className={ [
				'flex h-full flex-col rounded-2xl border p-5',
				locked ? '' : 'shadow-sm',
				dark
					? 'border-[#0D1117] bg-[#0D1117] text-white'
					: 'border-[#0D11171A] bg-white',
			].filter( Boolean ).join( ' ' ) }
		>
			<p
				className={ [
					'text-sm font-semibold  leading-5 uppercase',
					dark ? 'text-[#FFFFFFB2]' : 'text-[#474C57]',
				].join( ' ' ) }
			>
				{ label }
			</p>
			{ subtitle ? (
				<p
					className={ [
						'mt-0.5 text-xs leading-4 ',
						dark ? 'text-[#FFFFFF80]' : 'text-[#7C8494]',
					].join( ' ' ) }
				>
					{ subtitle }
				</p>
			) : null }

			<p
				className={ [
					'mt-3 text-[40px] leading-[46px] font-medium tracking-[-1px] font-mono',
					dark ? 'text-white' : 'text-[#0D1117]',
				].join( ' ' ) }
			>
				{ value }
			</p>

			{ trendValue != null ? (
				<div className="mt-3 flex items-center gap-1.5">
					{ trendAsPill ? (
						<>
							<span className=" font-mono inline-flex items-center gap-1 rounded-full bg-[#16A34A33] px-2 py-0.5 text-xs leading-4 font-medium text-[#16A34A]">
								<TrendUpIcon width={ 12 } height={ 12 } aria-hidden="true" />
								{ trendValue }
							</span>
							{ trendSuffix ? (
								<span
									className={ [
										'text-xs leading-4 font-inter',
										dark ? 'text-[#FFFFFF99]' : 'text-[#16A34A]',
									].join( ' ' ) }
								>
									{ trendSuffix }
								</span>
							) : null }
						</>
					) : (
						<span className={ `inline-flex items-center gap-1 text-xs font-semibold ${ toneClass }` }>
							<TrendUpIcon width={ 12 } height={ 12 } aria-hidden="true" />
							{ trendValue }
							{ trendSuffix ? ` ${ trendSuffix }` : '' }
						</span>
					) }
				</div>
			) : null }
		</div>
	);

	if ( locked ) {
		return (
			<LockedFeature tier={ lockTier } className="h-full border rounded-2xl">
				{ card }
			</LockedFeature>
		);
	}

	return card;
}
