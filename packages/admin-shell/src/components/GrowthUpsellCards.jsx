import { ReactComponent as LockIcon } from '@stayilo/design-system/assets/svg/Lock.svg';
import { seriesToPoints, smoothLinePath } from '../utils/smooth-path.js';
import { RETENTION_OVERLAY_SERIES } from './charts/RetentionTrendChart.jsx';
import { CHART_PURPLE } from './charts/chart-theme.js';

const CARDS = [
	{
		id: 'reporting',
		title: 'Reporting dashboard',
		minTier: 'free',
	},
	{
		id: 'rules',
		title: 'Rules engine',
		minTier: 'free',
	},
	{
		id: 'activity',
		title: 'Activity log',
		minTier: 'core',
	},
];

const TIER_RANK = {
	free: 0,
	core: 1,
	growth: 2,
};

const SHARP_MASK =
	'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.55) 28%, black 55%, black 100%)';
const BLUR_MASK =
	'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.45) 22%, black 48%, black 78%, transparent 100%)';
const FROST =
	'linear-gradient(to bottom, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.28) 42%, rgba(255,255,255,0.72) 100%)';

const BLUR_BLEED = 24;

/**
 * Same compact 15d current curve as RetentionTrendChart on the dashboard —
 * edge-to-edge, no axes/tooltip.
 */
function RetentionTrendOverlay() {
	const values = RETENTION_OVERLAY_SERIES;
	const w = 400;
	const h = 160;
	const padY = 10;
	const chartH = h - padY * 2;
	const yMin = Math.min( ...values ) - 6;
	const yMax = Math.max( ...values ) + 4;

	const toX = ( i, len ) => ( i / ( len - 1 ) ) * w;
	const toY = ( v ) => padY + ( ( yMax - v ) / ( yMax - yMin ) ) * chartH;
	const points = seriesToPoints( values, { toX, toY } );
	const linePath = smoothLinePath( points );
	const lastX = toX( values.length - 1, values.length );
	const areaPath = `${ linePath } L ${ lastX.toFixed( 1 ) } ${ h } L 0 ${ h } Z`;

	return (
		<svg
			className="pointer-events-none h-full w-full"
			viewBox={ `0 0 ${ w } ${ h }` }
			preserveAspectRatio="none"
			aria-hidden="true"
		>
			<path d={ areaPath } fill={ CHART_PURPLE } fillOpacity="0.08" />
			<path
				d={ linePath }
				fill="none"
				stroke={ CHART_PURPLE }
				strokeWidth="2.5"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	);
}

function ProgressiveSparkline() {
	return (
		<div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
			<div
				className="absolute inset-x-[-8%] top-[12%] h-[62%] opacity-15"
				style={ {
					maskImage: SHARP_MASK,
					WebkitMaskImage: SHARP_MASK,
				} }
			>
				<RetentionTrendOverlay />
			</div>

			<div
				className="absolute opacity-55"
				style={ {
					top: `calc(12% - ${ BLUR_BLEED }px)`,
					right: -BLUR_BLEED,
					bottom: `calc(26% - ${ BLUR_BLEED }px)`,
					left: -BLUR_BLEED,
					filter: 'blur(18px)',
					maskImage: BLUR_MASK,
					WebkitMaskImage: BLUR_MASK,
				} }
			>
				<div className="h-full w-full" style={ { padding: BLUR_BLEED } }>
					<RetentionTrendOverlay />
				</div>
			</div>

			<div className="absolute inset-0" style={ { background: FROST } } />
		</div>
	);
}
function UpsellCard( { title, onUpgrade } ) {
    return (
        <div className=" w-full relative flex flex-col items-center justify-center overflow-hidden rounded-2xl border border-[#E0E1E3] bg-[#FFFFFFB2] px-[50px] py-[30px] text-center">
            <ProgressiveSparkline />

            <div className="relative z-10 flex flex-col items-center w-full">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0D11170D] border border-[#0D111714]">
                    <LockIcon width={ 20 } height={ 20 } viewBox="0 0 14 14" aria-hidden="true" />
                </div>
              
                <h3 className="mt-2 text-sm font-semibold leading-5 text-stayilo-ink">{ title }</h3>
                <p className="mt-1 text-xs text-[#7C8494] leading-4 font-medium">Available on the Growth plan</p> 

                <button
                    type="button"
                    onClick={ onUpgrade }
                    className="mt-2 inline-flex w-full justify-center  items-center  rounded-xl  bg-[#9810FA] px-5 py-2.5 text-base leading-6 font-semibold text-[#F7F8FA] transition-opacity hover:opacity-90"
                >
                    Upgrade now
                </button>
            </div>
        </div>
    );
}

/**
 * Growth upsell cards shown on Free/Core dashboards.
 * Free → reporting + rules. Core → all three. Growth → none.
 */
export function GrowthUpsellCards( { tier = 'free', onUpgrade } ) {
	if ( tier === 'growth' ) {
		return null;
	}

	const visible = CARDS.filter(
		( card ) => TIER_RANK[ tier ] >= TIER_RANK[ card.minTier ]
	);

	return (
		<div className="grid gap-5 xl:grid-cols-3 mt-5 w-full xl:w-[89%]">
			{ visible.map( ( card ) => (
				<UpsellCard
					key={ card.id }
					title={ card.title }
					onUpgrade={ onUpgrade }
				/>
			) ) }
		</div>
	);
}
