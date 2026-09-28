import { useState } from 'react';
import { ChartCard } from './ChartCard.jsx';
import { RangeSelector } from './RangeSelector.jsx';
import { CHART_GREEN, CHART_PREV } from './chart-theme.js';

const MONTHS = [
	{ label: 'Apr', attempts: 14, recovered: 12 },
	{ label: 'May', attempts: 18, recovered: 15 },
	{ label: 'Jun', attempts: 12, recovered: 10 },
	{ label: 'Jul', attempts: 16, recovered: 14 },
	{ label: 'Aug', attempts: 15, recovered: 13 },
	{ label: 'Sep', attempts: 20, recovered: 17 },
	{ label: 'Oct', attempts: 17, recovered: 14 },
	{ label: 'Nov', attempts: 16, recovered: 11 },
	{ label: 'Dec', attempts: 19, recovered: 16 },
	{ label: 'Jan', attempts: 14, recovered: 12 },
	{ label: 'Feb', attempts: 13, recovered: 11 },
	{ label: 'Mar', attempts: 18, recovered: 15 },
];

function LegendDot( { color, label } ) {
	return (
		<span className="inline-flex items-center gap-1.5 text-xs text-stayilo-muted">
			<span
				className="inline-block h-2 w-2 rounded-full"
				style={ { backgroundColor: color } }
			/>
			{ label }
		</span>
	);
}

export function PaymentRecoveryChart( { locked = false, className = '' } ) {
	const [ range, setRange ] = useState( '15d' );
	const [ active, setActive ] = useState( 7 );
	const max = Math.max( ...MONTHS.map( ( row ) => row.attempts ) );
	const attemptsTotal = MONTHS.reduce( ( sum, row ) => sum + row.attempts, 0 );
	const recoveredTotal = MONTHS.reduce( ( sum, row ) => sum + row.recovered, 0 );
	const recoveryRate = attemptsTotal
		? ( ( recoveredTotal / attemptsTotal ) * 100 ).toFixed( 1 )
		: '0.0';

	return (
		<ChartCard
			title="Payment recovery"
			subtitle="Failed charges vs successfully recovered — by month"
			actions={ <RangeSelector value={ range } onChange={ setRange } /> }
			locked={ locked }
			className={ className }
		>
			<div className="px-5 pb-5 pt-4">
				<div className="flex h-52">
					<div className="flex h-full flex-col justify-between pr-3 text-[10px] text-stayilo-muted">
						{ [ max, Math.round( max * 0.75 ), Math.round( max * 0.5 ), Math.round( max * 0.25 ), 0 ].map(
							( tick ) => (
								<span key={ tick }>{ tick }</span>
							)
						) }
					</div>
					<div className="relative min-w-0 flex-1">
						<div className="pointer-events-none absolute inset-0 flex flex-col justify-between">
							{ [ 0, 1, 2, 3, 4 ].map( ( i ) => (
								<div key={ i } className="border-t border-dashed border-stayilo-border" />
							) ) }
						</div>
						<div className="relative flex h-full items-end gap-2">
							{ MONTHS.map( ( row, index ) => {
								const isActive = index === active;
								return (
									<button
										key={ row.label }
										type="button"
										onMouseEnter={ () => setActive( index ) }
										onFocus={ () => setActive( index ) }
										className="relative flex h-full min-w-0 flex-1 items-end justify-center gap-0.5 border-0 bg-transparent p-0"
									>
										<span
											className="w-1.5 rounded-sm sm:w-2"
											style={ {
												height: `${ ( row.attempts / max ) * 100 }%`,
												backgroundColor: CHART_PREV,
											} }
										/>
										<span
											className="w-1.5 rounded-sm sm:w-2"
											style={ {
												height: `${ ( row.recovered / max ) * 100 }%`,
												backgroundColor: CHART_GREEN,
											} }
										/>
										{ isActive ? (
											<span className="absolute -top-2 left-1/2 z-10 w-28 -translate-x-1/2 -translate-y-full rounded-lg border border-stayilo-border bg-white px-2.5 py-2 text-left shadow-stayilo-xs">
												<p className="m-0 text-[11px] font-semibold text-stayilo-ink">
													{ row.label }
												</p>
												<p className="mt-1 m-0 text-[10px] text-stayilo-muted">
													Recovered: { row.recovered }
												</p>
												<p className="m-0 text-[10px] text-stayilo-muted">
													Attempts: { row.attempts }
												</p>
											</span>
										) : null }
									</button>
								);
							} ) }
						</div>
					</div>
				</div>
				<div className="mt-3 flex justify-between pl-8 text-[10px] text-stayilo-muted">
					{ MONTHS.map( ( row ) => (
						<span key={ row.label } className="min-w-0 flex-1 text-center">
							{ row.label }
						</span>
					) ) }
				</div>

				<div className="mt-5 flex flex-wrap items-center justify-between gap-3">
					<div className="flex items-center gap-4">
						<LegendDot color={ CHART_PREV } label="Attempts" />
						<LegendDot color={ CHART_GREEN } label="Recovered" />
					</div>
					<p className="m-0 text-sm text-stayilo-muted">
						Recovery rate:{ ' ' }
						<span className="font-semibold text-stayilo-ink">{ recoveryRate }%</span>
						<span className="ml-2 text-xs font-medium text-[#DC2626]">-1.2%</span>
					</p>
				</div>
			</div>
		</ChartCard>
	);
}
