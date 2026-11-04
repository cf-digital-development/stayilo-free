import { useId, useMemo, useState } from 'react';
import {
	buildRetentionTrend,
	subscriptionsHaveRetentionDates,
} from '../../domain/retention.js';
import { seriesToPoints, smoothLinePath } from '../../utils/smooth-path.js';
import { ChartCard } from './ChartCard.jsx';
import { RangeSelector } from './RangeSelector.jsx';
import { CHART_LABEL, CHART_PREV, CHART_PURPLE, CHART_PURPLE_LIGHT } from './chart-theme.js';

/** Decorative fallback when live subscription dates are unavailable. */
const FALLBACK_SERIES = {
	'7d': {
		dates: [ 'Apr 9', 'Apr 10', 'Apr 11', 'Apr 12', 'Apr 13', 'Apr 14', 'Apr 15' ],
		current: [ 78, 82, 86, 88, 91, 93, 95 ],
		previous: [ 54, 60, 58, 61, 59, 63, 62 ],
		tipIndex: 1,
	},
	'15d': {
		dates: [ 'Apr 1', 'Apr 3', 'Apr 5', 'Apr 7', 'Apr 9', 'Apr 10', 'Apr 12', 'Apr 15' ],
		current: [ 42, 48, 52, 58, 68, 82, 88, 94 ],
		previous: [ 38, 44, 42, 48, 52, 60, 58, 64 ],
		tipIndex: 5,
	},
	'30d': {
		dates: [ 'Mar 17', 'Mar 22', 'Mar 27', 'Apr 1', 'Apr 6', 'Apr 10', 'Apr 15' ],
		current: [ 46, 51, 55, 62, 74, 82, 91 ],
		previous: [ 40, 44, 47, 51, 56, 60, 63 ],
		tipIndex: 5,
	},
	'90d': {
		dates: [ 'Jan', 'Feb', 'Mar', 'Apr' ],
		current: [ 61, 68, 74, 86 ],
		previous: [ 52, 58, 61, 64 ],
		tipIndex: 3,
	},
	'12m': {
		dates: [ 'May', 'Jul', 'Sep', 'Nov', 'Jan', 'Mar' ],
		current: [ 58, 64, 71, 76, 84, 91 ],
		previous: [ 49, 54, 58, 61, 63, 66 ],
		tipIndex: 4,
	},
	ytd: {
		dates: [ 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun' ],
		current: [ 58, 64, 71, 76, 84, 91 ],
		previous: [ 49, 54, 58, 61, 63, 66 ],
		tipIndex: 5,
	},
};

/** Compact overlay curve used by GrowthUpsellCards (decorative). */
export const RETENTION_OVERLAY_SERIES = FALLBACK_SERIES[ '15d' ].current;

const TOOLTIP_SHADOW = [
	'0px 3px 3px -1.5px var(--ColorsEffectsShadowsshadow-xl03, rgba(10, 13, 18, 0.04))',
	'0px 8px 8px -4px var(--ColorsEffectsShadowsshadow-xl02, rgba(10, 13, 18, 0.03))',
	'0px 20px 24px -4px var(--ColorsEffectsShadowsshadow-xl01, rgba(10, 13, 18, 0.08))',
].join( ', ' );

function RetentionTooltip( { date, current, previous, leftPct, topPct } ) {
	return (
		<div
			className="pointer-events-none absolute z-10 flex flex-col items-center"
			style={ {
				left: `${ leftPct }%`,
				top: `${ topPct }%`,
				transform: 'translate(-50%, calc(-100% - 14px))',
			} }
		>
			<div
				className="min-w-[107px] rounded-lg border border-[#F2F2F2] bg-white"
				style={ { boxShadow: TOOLTIP_SHADOW } }
			>
				<div className=" px-2  pt-2 pb-0.5">
					<p
						className="m-0 text-xs  text-[#7C8494] leading-4"
						style={ { fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace' } }
					>
						{ date }
					</p>
				</div>
				<div className="flex flex-col gap-0.5 px-2 pb-2">
					<div className="flex items-center gap-1">
						<span
							className="inline-block h-[6.5px] w-[6.5px] shrink-0 rounded-full"
							style={ { backgroundColor: CHART_PURPLE } }
						/>
						<span className="text-xs font-medium leading-[19px] text-[#474C57] tracking-[0.4%]">
							Current : { current }%
						</span>
					</div>
					<div className="flex items-center gap-1">
						<span
							className="inline-block h-[6.5px] w-[6.5px] shrink-0 rounded-full"
							style={ { backgroundColor: CHART_PREV } }
						/>
						<span className="text-xs  leading-[19px] text-[#474C57] tracking-[0.4%]">
							Previous : { previous }%
						</span>
					</div>
				</div>
			</div>
			<svg
				width="14"
				height="8"
				viewBox="0 0 14 8"
				className="-mt-px block overflow-visible"
				aria-hidden="true"
			>
				<path
					d="M1 0.5 H13 L7.7 6.3 Q7 7.2 6.3 6.3 Z"
					fill="white"
					stroke="white"
					strokeWidth="1"
					strokeLinejoin="round"
				/>
			</svg>
		</div>
	);
}

function yTicks( min, max ) {
	const steps = 4;
	const safeMin = Number.isFinite( min ) ? min : 0;
	const safeMax = Number.isFinite( max ) && max > safeMin ? max : safeMin + 5;
	return Array.from( { length: steps + 1 }, ( _, i ) =>
		Math.round( safeMax - ( ( safeMax - safeMin ) * i ) / steps )
	);
}

function resolveSeries( subscriptions, rangeId, { locked = false } = {} ) {
	// Free / locked: decorative placeholder only — never live retention math.
	if ( locked ) {
		return FALLBACK_SERIES[ '30d' ];
	}
	if ( subscriptionsHaveRetentionDates( subscriptions ) ) {
		return buildRetentionTrend( subscriptions, rangeId );
	}
	// Live dashboard always passes an array (possibly empty) — never fake demo points.
	if ( Array.isArray( subscriptions ) ) {
		return buildRetentionTrend( subscriptions, rangeId );
	}
	return FALLBACK_SERIES[ rangeId ] || FALLBACK_SERIES[ '15d' ];
}

function RetentionPlot( { series, compact } ) {
	const uid = useId();
	const [ tipIndex, setTipIndex ] = useState(
		() => series.tipIndex ?? Math.max( 0, ( series.dates?.length || 1 ) - 1 )
	);

	const dates = series.dates?.length ? series.dates : [ '—' ];
	const current = series.current?.length ? series.current : [ 0 ];
	const previous = series.previous?.length ? series.previous : [ 0 ];
	const safeTip = Math.min(
		Math.max( 0, tipIndex ),
		Math.max( 0, dates.length - 1 )
	);

	const w = compact ? 640 : 860;
	const h = compact ? 220 : 260;
	const left = 56;
	const right = 20;
	const top = 20;
	const xAxisGap = 16;
	const bottom = xAxisGap + 16;
	const chartW = w - left - right;
	const chartH = h - top - bottom;
	const values = [ ...current, ...previous ].filter( ( v ) => Number.isFinite( v ) );
	const peak = values.length ? Math.max( ...values ) : 0;
	const floor = values.length ? Math.min( ...values ) : 0;
	const yMax = Math.ceil( Math.max( peak, 5 ) / 5 ) * 5;
	const yMin = Math.max( 0, Math.floor( floor / 5 ) * 5 - 10 );
	const ticks = yTicks( yMin, yMax );
	const ySpan = yMax - yMin || 1;

	const toX = ( i, len ) => left + ( i / Math.max( 1, len - 1 ) ) * chartW;
	const toY = ( v ) => {
		const clamped = Math.min( yMax, Math.max( yMin, Number( v ) || 0 ) );
		return top + ( ( yMax - clamped ) / ySpan ) * chartH;
	};

	const currentPoints = seriesToPoints( current, { toX, toY } );
	const prevPoints = seriesToPoints( previous, { toX, toY } );
	const currentPath = smoothLinePath( currentPoints );
	const prevPath = smoothLinePath( prevPoints );
	const lastX = toX( current.length - 1, current.length );
	const baseY = ( top + chartH ).toFixed( 1 );
	const areaPath = currentPath
		? `${ currentPath } L ${ lastX.toFixed( 1 ) } ${ baseY } L ${ left } ${ baseY } Z`
		: '';
	const prevLastX = toX( previous.length - 1, previous.length );
	const prevAreaPath = prevPath
		? `${ prevPath } L ${ prevLastX.toFixed( 1 ) } ${ baseY } L ${ left } ${ baseY } Z`
		: '';

	const tipX = toX( safeTip, dates.length );
	const tipY = toY( current[ safeTip ] );
	const fillId = `${ uid }-fill`;
	const prevFillId = `${ uid }-prev-fill`;

	const onMove = ( event ) => {
		const svg = event.currentTarget;
		const rect = svg.getBoundingClientRect();
		if ( ! rect.width ) {
			return;
		}
		const x = ( ( event.clientX - rect.left ) / rect.width ) * w;
		let nearest = 0;
		let best = Infinity;
		for ( let i = 0; i < dates.length; i++ ) {
			const dx = Math.abs( toX( i, dates.length ) - x );
			if ( dx < best ) {
				best = dx;
				nearest = i;
			}
		}
		setTipIndex( nearest );
	};

	return (
		<div className="relative w-full overflow-visible">
			<svg
				viewBox={ `0 0 ${ w } ${ h }` }
				className="block w-full"
				style={ { aspectRatio: `${ w } / ${ h }` } }
				preserveAspectRatio="xMidYMid meet"
				role="img"
				aria-label="Retention trend chart"
				onMouseMove={ onMove }
				onMouseLeave={ () =>
					setTipIndex( series.tipIndex ?? Math.max( 0, dates.length - 1 ) )
				}
			>
			<defs>
				<linearGradient id={ fillId } x1="0" y1="0" x2="0" y2="1">
					<stop offset="0%" stopColor={ CHART_PURPLE } stopOpacity="0.22" />
					<stop offset="100%" stopColor={ CHART_PURPLE } stopOpacity="0" />
				</linearGradient>
				<linearGradient id={ prevFillId } x1="0" y1="0" x2="0" y2="1">
					<stop offset="0%" stopColor={ CHART_PREV } stopOpacity="0.35" />
					<stop offset="100%" stopColor={ CHART_PREV } stopOpacity="0" />
				</linearGradient>
			</defs>

			{ ticks.map( ( tick, i ) => {
				const y = top + ( i / Math.max( 1, ticks.length - 1 ) ) * chartH;
				return (
					<g key={ `tick-${ tick }-${ i }` }>
						<line
							x1={ left }
							y1={ y }
							x2={ w - right }
							y2={ y }
							stroke="#E5E7EB"
							strokeWidth="1"
							strokeDasharray="4 4"
						/>
						<text
							x={ left - 8 }
							y={ y + 3 }
							textAnchor="end"
							fill={ CHART_LABEL }
							style={ { fontSize: 12, fontWeight: 400 ,lineHeight: '16px',color: '#7C8494',fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace'} }
						>
							{ tick }%
						</text>
					</g>
				);
			} ) }

			{ dates.map( ( label, i ) => {
				const isFirst = i === 0;
				const isLast = i === dates.length - 1;
				return (
					<text
						key={ `${ label }-${ i }` }
						x={ toX( i, dates.length ) }
						y={ top + chartH + xAxisGap + 10 }
						textAnchor={ isFirst ? 'start' : isLast ? 'end' : 'middle' }
						fill={ CHART_LABEL }
						style={ { fontSize: 12, fontWeight: 400, lineHeight: '16px', color: '#7C8494', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace' } }
					>
						{ label }
					</text>
				);
			} ) }

			{ prevAreaPath ? <path d={ prevAreaPath } fill={ `url(#${ prevFillId })` } /> : null }
			{ areaPath ? <path d={ areaPath } fill={ `url(#${ fillId })` } /> : null }
			{ prevPath ? (
				<path
					d={ prevPath }
					fill="none"
					stroke={ CHART_PREV }
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
			) : null }
			{ currentPath ? (
				<path
					d={ currentPath }
					fill="none"
					stroke={ CHART_PURPLE }
					strokeWidth="2.5"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
			) : null }

			<line
				x1={ tipX }
				y1={ tipY }
				x2={ tipX }
				y2={ top + chartH }
				stroke={ CHART_PURPLE_LIGHT}
				strokeWidth="4"
				opacity="0.8"
				strokeLinecap="round"
				strokeDasharray="10 8"
			/>
		</svg>
			<div
				className="pointer-events-none absolute z-[9]"
				style={ {
					left: `${ ( tipX / w ) * 100 }%`,
					top: `${ ( tipY / h ) * 100 }%`,
					width: 12,
					height: 12,
					transform: 'translate(-50%, -50%)',
				} }
			>
				<svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
					<circle
						cx="6"
						cy="6"
						r="4.5"
						fill="white"
						stroke={ CHART_PURPLE }
						strokeWidth="3"
					/>
				</svg>
			</div>
			<RetentionTooltip
				date={ dates[ safeTip ] }
				current={ current[ safeTip ] ?? 0 }
				previous={ previous[ safeTip ] ?? 0 }
				leftPct={ ( tipX / w ) * 100 }
				topPct={ ( tipY / h ) * 100 }
			/>
		</div>
	);
}

function TrendLegend() {
	return (
		<div className="flex items-center gap-3 text-sm leading-5  text-[#7C8494]">
			<span className="inline-flex items-center gap-1.5">
				<span
					className="inline-block h-0.5 w-5 rounded-full"
					style={ { backgroundColor: CHART_PURPLE } }
				/>
				Current
			</span>
			<span className="inline-flex items-center gap-1.5">
				<span
					className="inline-block h-0.5 w-5 rounded-full"
					style={ { backgroundColor: CHART_PREV } }
				/>
				Previous
			</span>
		</div>
	);
}

/**
 * Retention trend — current vs previous period.
 *
 * @param {object} props
 * @param {boolean} [props.compact]
 * @param {boolean} [props.locked]
 * @param {string} [props.lockTier]
 * @param {string} [props.className]
 * @param {string} [props.rangeId] Controlled range (dashboard header). When set, hides RangeSelector.
 * @param {object[]} [props.subscriptions] Serialized subscriptions with start/end dates.
 */
export function RetentionTrendChart( {
	compact = false,
	locked = false,
	lockTier = 'growth',
	className = '',
	rangeId: rangeIdProp,
	subscriptions,
} ) {
	const [ internalRange, setInternalRange ] = useState( '15d' );
	const rangeId = locked
		? '30d'
		: rangeIdProp ?? ( compact ? '30d' : internalRange );
	const series = useMemo(
		() => resolveSeries( subscriptions, rangeId, { locked } ),
		[ subscriptions, rangeId, locked ]
	);

	return (
		<ChartCard
			title="Retention trend"
			subtitle={
				compact
					? 'Current vs previous period'
					: 'Rolling retention rate — this period vs previous period'
			}
			legend={ compact ? <TrendLegend /> : null }
			actions={
				compact || rangeIdProp ? null : (
					<RangeSelector value={ internalRange } onChange={ setInternalRange } />
				)
			}
			locked={ locked }
			lockTier={ lockTier }
			className={ [ 'overflow-visible', className ].filter( Boolean ).join( ' ' ) }
		>
			<div className="w-full px-3 pb-3 pt-1 sm:px-0">
				<RetentionPlot
					key={ `${ rangeId }-${ series.dates.join( '|' ) }-${ series.latest ?? 0 }` }
					series={ series }
					compact={ compact }
				/>
			</div>
		</ChartCard>
	);
}
