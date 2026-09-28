import { useState } from 'react';
import { ChartCard } from './ChartCard.jsx';
import { RangeSelector } from './RangeSelector.jsx';
import { CHART_PURPLE } from './chart-theme.js';
import { resolveRetentionRange } from '../../domain/retention.js';

const REASONS = [
	{ label: 'Too expensive', count: 31, color: '#4F46E5' },
	{ label: 'Not using it', count: 22, color: '#6366F1' },
	{ label: 'Found alternative', count: 15, color: '#818CF8' },
	{ label: 'Pausing spend', count: 11, color: '#A5B4FC' },
	{ label: 'Quality issue', count: 4, color: '#C4B5FD' },
	{ label: 'Other', count: 2, color: '#E5E7EB' },
];

const COMPACT_BASE = [
	{ label: 'Too expensive', value: 14 },
	{ label: 'Found alternative', value: 11 },
	{ label: 'Pausing spend', value: 8 },
	{ label: 'Missing feature', value: 6 },
	{ label: 'Not using it', value: 4 },
];

/** Scale decorative demo bars so each date range looks different. */
function scaleForRange( rangeId ) {
	switch ( rangeId ) {
		case '7d':
			return 0.35;
		case '90d':
			return 2.2;
		case 'ytd':
		case '12m':
			return 3.4;
		case '15d':
			return 0.7;
		case '30d':
		default:
			return 1;
	}
}

function CompactBars( { rangeId } ) {
	const scale = scaleForRange( rangeId );
	const rows = COMPACT_BASE.map( ( row ) => ( {
		...row,
		value: Math.max( 1, Math.round( row.value * scale ) ),
	} ) );
	const max = Math.max( 4, ...rows.map( ( row ) => row.value ) );
	const ticks = [ 0, Math.round( max / 4 ), Math.round( max / 2 ), Math.round( ( 3 * max ) / 4 ), max ];

	return (
		<div className="p-5">
			<div className="space-y-4">
				{ rows.map( ( row ) => (
					<div key={ row.label } className="grid items-center lg:grid-cols-2">
						<span className="w-36 shrink-0 truncate text-sm text-stayilo-ink leading-5 ">
							{ row.label }
						</span>
						<div className="h-5 flex-1 bg-[#F0F1F5]">
							<div
								className="h-5"
								style={ {
									width: `${ ( row.value / max ) * 100 }%`,
									backgroundColor: CHART_PURPLE,
								} }
							/>
						</div>
					</div>
				) ) }
			</div>
			<div
				className="my-5 flex w-[50%] justify-between text-[11px] text-[#7C8494] font-mono leading-[100%]"
				style={ { float: 'right' } }
			>
				{ ticks.map( ( n ) => (
					<span key={ n }>{ n }</span>
				) ) }
			</div>
		</div>
	);
}

function Breakdown( { rangeId } ) {
	const scale = scaleForRange( rangeId );
	const reasons = REASONS.map( ( row ) => ( {
		...row,
		count: Math.max( 1, Math.round( row.count * scale ) ),
	} ) );
	const total = reasons.reduce( ( sum, row ) => sum + row.count, 0 );

	return (
		<div className="px-5 pb-5 pt-4">
			<div className="flex h-2 overflow-hidden rounded-full">
				{ reasons.map( ( row ) => (
					<span
						key={ row.label }
						className="h-full"
						style={ {
							width: `${ ( row.count / total ) * 100 }%`,
							backgroundColor: row.color,
						} }
					/>
				) ) }
			</div>

			<ul className="m-0 mt-5 list-none space-y-3 p-0">
				{ reasons.map( ( row ) => {
					const percent = Math.round( ( row.count / total ) * 100 );
					return (
						<li key={ row.label } className="flex items-center gap-3">
							<span
								className="h-2 w-8 shrink-0 rounded-sm"
								style={ { backgroundColor: row.color } }
							/>
							<span className="min-w-0 flex-1 truncate text-sm text-stayilo-ink">
								{ row.label }
							</span>
							<span className="w-10 text-right text-sm font-semibold text-stayilo-ink">
								{ percent }%
							</span>
							<span className="w-8 text-right text-sm text-stayilo-muted">
								{ row.count }
							</span>
						</li>
					);
				} ) }
			</ul>
		</div>
	);
}

export function CancellationReasonsChart( {
	compact = false,
	locked = false,
	className = '',
	rangeId: rangeIdProp,
} ) {
	const [ internalRange, setInternalRange ] = useState( '15d' );
	const rangeId = locked
		? '30d'
		: rangeIdProp ?? ( compact ? '30d' : internalRange );
	const rangeLabel = resolveRetentionRange( rangeId ).label;

	return (
		<ChartCard
			title="Cancellation reasons"
			subtitle={
				compact
					? rangeLabel
					: 'Why customers cancelled — with free-text entries from the portal'
			}
			actions={
				compact || rangeIdProp ? null : (
					<RangeSelector value={ internalRange } onChange={ setInternalRange } />
				)
			}
			locked={ locked }
			className={ className }
		>
			{ compact ? <CompactBars rangeId={ rangeId } /> : <Breakdown rangeId={ rangeId } /> }
		</ChartCard>
	);
}
