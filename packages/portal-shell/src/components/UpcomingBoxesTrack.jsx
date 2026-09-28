import { UpcomingBoxCard } from './UpcomingBoxCard.jsx';
import { TimelineDot } from './TimelineDot.jsx';

export const UPCOMING_BOX_GAP = 24;

/**
 * How many upcoming-box cards fit in the viewport.
 *
 * @param {number} width
 * @returns {number}
 */
export function getUpcomingVisibleCount( width ) {
	if ( width >= 1024 ) {
		return 4;
	}
	if ( width >= 768 ) {
		return 3;
	}
	if ( width >= 640 ) {
		return 2;
	}
	return 1;
}

/**
 * Track of upcoming box cards + timeline dots.
 * Native horizontal scroll for free multi-card drag / swipe.
 *
 * @param {object} props
 * @param {Array<object>} props.items
 * @param {number} props.nextBoxIndex - Index of the real next order
 * @param {number} props.cardWidth
 * @param {import('react').MutableRefObject<HTMLElement|null>} props.trackRef
 * @param {import('react').MutableRefObject<(HTMLElement|null)[]>} props.cardRefs
 */
export function UpcomingBoxesTrack( {
	items,
	nextBoxIndex,
	cardWidth,
	trackRef,
	cardRefs,
} ) {
	return (
		<div
			ref={ trackRef }
			className="portal-upcoming-slider__viewport portal-scroll-hide relative z-[1] flex touch-pan-x snap-x snap-mandatory"
			style={ { gap: `${ UPCOMING_BOX_GAP }px` } }
		>
			{ items.map( ( item, index ) => {
				const isNext = Boolean( item.isNext ) || index === nextBoxIndex;

				return (
					<div
						key={ item.id }
						ref={ ( node ) => {
							cardRefs.current[ index ] = node;
						} }
						data-upcoming-box
						className="relative shrink-0 snap-start"
						style={ { width: `${ cardWidth }px` } }
					>
						<div className="relative z-[1] mb-5 flex h-6 items-center justify-center">
							<TimelineDot active={ isNext } />
							{ /* Dashed connector: timeline dot → box card */ }
							<span
								aria-hidden="true"
								className="pointer-events-none absolute left-1/2 top-[calc(50%+6px)] z-0 h-[24px] w-px -translate-x-1/2"
								style={ {
									backgroundImage:
										'repeating-linear-gradient(to bottom, #EFEADE 0 2px, transparent 4px 4px)',
								} }
							/>
						</div>
						<UpcomingBoxCard
							variant={ isNext ? 'next' : 'upcoming' }
							day={ item.day }
							date={ item.date }
							month={ item.month }
						/>
					</div>
				);
			} ) }
		</div>
	);
}
