import { useState } from 'react';
import { ChartCard } from './ChartCard.jsx';
import { RangeSelector } from './RangeSelector.jsx';
import { CHART_GREEN, CHART_PURPLE } from './chart-theme.js';

const FUNNEL = {
	attempts: 87,
	offers: 72,
	saves: 51,
};

function pct( part, whole ) {
	if ( ! whole ) {
		return '0%';
	}
	return `${ ( ( part / whole ) * 100 ).toFixed( 1 ) }%`;
}

function dropoff( from, to ) {
	if ( ! from ) {
		return '0%';
	}
	return `${ Math.round( ( ( from - to ) / from ) * 100 ) }%`;
}

function FunnelRow( { label, value, max, color, dropLabel } ) {
	const width = max ? Math.max( 8, ( value / max ) * 100 ) : 0;

	return (
		<div className="grid items-center gap-3 sm:grid-cols-[160px_1fr_auto]">
			<p className="m-0 text-sm text-stayilo-ink">{ label }</p>
			<div className="flex min-w-0 items-center gap-3">
				<div className="h-3 flex-1 overflow-hidden rounded-full bg-[#F3F4F6]">
					<div
						className="h-3 rounded-full"
						style={ { width: `${ width }%`, backgroundColor: color } }
					/>
				</div>
				{ dropLabel ? (
					<span className="shrink-0 text-xs text-stayilo-muted">{ dropLabel }</span>
				) : null }
			</div>
			<span className="text-right text-sm font-semibold text-stayilo-ink">{ value }</span>
		</div>
	);
}

export function CancellationFunnel( { locked = false, className = '' } ) {
	const [ range, setRange ] = useState( '15d' );
	const { attempts, offers, saves } = FUNNEL;

	return (
		<ChartCard
			title="Cancellation funnel"
			subtitle="Cancel attempts → offers shown → subscriptions saved"
			actions={ <RangeSelector value={ range } onChange={ setRange } /> }
			locked={ locked }
			className={ className }
		>
			<div className="space-y-4 px-5 py-5">
				<FunnelRow
					label="Cancel attempts"
					value={ attempts }
					max={ attempts }
					color={ CHART_PURPLE }
				/>
				<FunnelRow
					label="Offers shown"
					value={ offers }
					max={ attempts }
					color={ CHART_PURPLE }
					dropLabel={ `↓ ${ dropoff( attempts, offers ) } drop-off` }
				/>
				<FunnelRow
					label="Saves"
					value={ saves }
					max={ attempts }
					color={ CHART_GREEN }
					dropLabel={ `↓ ${ dropoff( offers, saves ) } drop-off` }
				/>

				<div className="grid gap-4 border-t border-stayilo-border pt-5 sm:grid-cols-3">
					<div>
						<p className="m-0 text-2xl font-bold tracking-tight text-stayilo-ink">
							{ pct( saves, attempts ) }
						</p>
						<p className="mt-1 text-xs text-stayilo-muted">Overall save rate</p>
					</div>
					<div>
						<p className="m-0 text-2xl font-bold tracking-tight text-stayilo-ink">
							{ pct( offers, attempts ) }
						</p>
						<p className="mt-1 text-xs text-stayilo-muted">Offer show rate</p>
					</div>
					<div>
						<p className="m-0 text-2xl font-bold tracking-tight text-stayilo-ink">
							{ pct( saves, offers ) }
						</p>
						<p className="mt-1 text-xs text-stayilo-muted">Offer acceptance rate</p>
					</div>
				</div>
			</div>
		</ChartCard>
	);
}
