import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { SliderNavButton } from './SliderNavButton.jsx';
import {
	UpcomingBoxesTrack,
	UPCOMING_BOX_GAP,
	getUpcomingVisibleCount,
} from './UpcomingBoxesTrack.jsx';
import { buildUpcomingBoxesFromDate } from '../utils/upcomingBoxes.js';
import { __ } from '@stayilo/design-system/i18n';

function getNextBoxIndex( items ) {
	if ( ! items?.length ) {
		return 0;
	}
	const nextIndex = items.findIndex( ( item ) => item.isNext );
	return nextIndex >= 0 ? nextIndex : 0;
}

function getOffsetForIndex( index, cardWidth ) {
	return Math.round( index * ( cardWidth + UPCOMING_BOX_GAP ) );
}

function getMaxScrollIndex( itemCount, viewportWidth ) {
	const visible = getUpcomingVisibleCount( viewportWidth );
	return Math.max( 0, itemCount - visible );
}

/**
 * Upcoming order date carousel with timeline dots.
 * Native horizontal scroll (drag / swipe / trackpad) plus arrow controls.
 *
 * Visible cards: 1 (<640), 2 (≥640), 3 (≥768), 4 (≥1024).
 *
 * @param {object} props
 * @param {string} [props.title='Your upcoming subscriptions']
 * @param {boolean} [props.showTitle=true]
 * @param {Array<{ id: string, day: string, date: string, month: string, isNext?: boolean }>} [props.items]
 * @param {string} [props.className]
 */
export function UpcomingBoxesSlider( {
	title = 'Your upcoming subscriptions',
	showTitle = true,
	items,
	className = '',
} ) {
	const boxItems = useMemo(
		() =>
			items?.length > 0
				? items
				: buildUpcomingBoxesFromDate( new Date() ),
		[ items ]
	);
	const trackRef = useRef( null );
	const cardRefs = useRef( [] );
	const nextBoxIndex = useMemo(
		() => getNextBoxIndex( boxItems ),
		[ boxItems ]
	);
	/** First visible card index — scroll only, never drives "Next box". */
	const [ scrollIndex, setScrollIndex ] = useState( 0 );
	const [ cardWidth, setCardWidth ] = useState( 184 );
	const [ maxScrollIndex, setMaxScrollIndex ] = useState( 0 );

	useEffect( () => {
		setScrollIndex( 0 );
		const track = trackRef.current;
		if ( track ) {
			track.scrollLeft = 0;
		}
	}, [ boxItems ] );

	const syncScrollIndex = useCallback( () => {
		const track = trackRef.current;
		if ( ! track ) {
			return;
		}
		const step = cardWidth + UPCOMING_BOX_GAP;
		if ( step <= 0 ) {
			return;
		}
		const index = Math.round( track.scrollLeft / step );
		setScrollIndex( Math.max( 0, Math.min( maxScrollIndex, index ) ) );
	}, [ cardWidth, maxScrollIndex ] );

	const updateLayout = useCallback( () => {
		const track = trackRef.current;
		if ( ! track ) {
			return;
		}

		const viewportWidth = window.innerWidth;
		const visible = getUpcomingVisibleCount( viewportWidth );
		const nextWidth =
			( track.clientWidth - ( visible - 1 ) * UPCOMING_BOX_GAP ) / visible;
		const width = Math.max( nextWidth, 0 );
		const maxIndex = getMaxScrollIndex( boxItems.length, viewportWidth );
		setCardWidth( width );
		setMaxScrollIndex( maxIndex );

		const step = width + UPCOMING_BOX_GAP;
		if ( step > 0 ) {
			const index = Math.round( track.scrollLeft / step );
			const clamped = Math.max( 0, Math.min( maxIndex, index ) );
			track.scrollLeft = getOffsetForIndex( clamped, width );
			setScrollIndex( clamped );
		}
	}, [ boxItems.length ] );

	useEffect( () => {
		updateLayout();

		const track = trackRef.current;
		const onResize = () => updateLayout();
		window.addEventListener( 'resize', onResize );

		if ( ! track || typeof ResizeObserver === 'undefined' ) {
			return () => window.removeEventListener( 'resize', onResize );
		}

		const observer = new ResizeObserver( onResize );
		observer.observe( track );
		return () => {
			observer.disconnect();
			window.removeEventListener( 'resize', onResize );
		};
	}, [ updateLayout ] );

	useEffect( () => {
		const track = trackRef.current;
		if ( ! track ) {
			return undefined;
		}
		const onScroll = () => syncScrollIndex();
		track.addEventListener( 'scroll', onScroll, { passive: true } );
		return () => track.removeEventListener( 'scroll', onScroll );
	}, [ syncScrollIndex ] );

	// Mouse click-drag scrolls the track; touch / pen keep native swipe.
	useEffect( () => {
		const track = trackRef.current;
		if ( ! track ) {
			return undefined;
		}

		let drag = null;

		const onPointerDown = ( event ) => {
			if ( event.pointerType !== 'mouse' || event.button !== 0 ) {
				return;
			}
			drag = {
				pointerId: event.pointerId,
				startX: event.clientX,
				startScroll: track.scrollLeft,
			};
			track.classList.add( 'portal-upcoming-slider__viewport--dragging' );
			track.setPointerCapture( event.pointerId );
		};

		const onPointerMove = ( event ) => {
			if ( ! drag || drag.pointerId !== event.pointerId ) {
				return;
			}
			track.scrollLeft = drag.startScroll - ( event.clientX - drag.startX );
		};

		const endDrag = ( event ) => {
			if ( ! drag || drag.pointerId !== event.pointerId ) {
				return;
			}
			drag = null;
			track.classList.remove( 'portal-upcoming-slider__viewport--dragging' );
			if ( track.hasPointerCapture?.( event.pointerId ) ) {
				track.releasePointerCapture( event.pointerId );
			}
		};

		track.addEventListener( 'pointerdown', onPointerDown );
		track.addEventListener( 'pointermove', onPointerMove );
		track.addEventListener( 'pointerup', endDrag );
		track.addEventListener( 'pointercancel', endDrag );
		return () => {
			track.removeEventListener( 'pointerdown', onPointerDown );
			track.removeEventListener( 'pointermove', onPointerMove );
			track.removeEventListener( 'pointerup', endDrag );
			track.removeEventListener( 'pointercancel', endDrag );
		};
	}, [ boxItems ] );

	const scrollByCard = ( direction ) => {
		const track = trackRef.current;
		if ( ! track ) {
			return;
		}
		const amount = cardWidth + UPCOMING_BOX_GAP;
		track.scrollBy( {
			left: direction === 'next' ? amount : -amount,
			behavior: 'smooth',
		} );
	};

	const classes = [ 'w-full', className ].filter( Boolean ).join( ' ' );
	const exists = classes.includes("left-align");
	return (
		<section className={ classes } aria-label={ title }>
			<div className={`portal-content-narrow mb-10 ${exists ? '!ml-0' : ''}`}>
				{ showTitle ? (
					<h2 className="text-[24px] font-semibold leading-[100%]">
						{ title }
					</h2>
				) : null }

				<div className={ `relative grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-3 overflow-visible md:gap-x-8${ showTitle ? ' mt-4' : '' }` }>
					<div className="relative z-[1] justify-self-end">
						<SliderNavButton
							direction="prev"
							label={ __( 'Previous upcoming subscriptions', 'stayilo' ) }
							disabled={ scrollIndex <= 0 }
							onClick={ () => scrollByCard( 'prev' ) }
						/>
					</div>

					<div className="relative min-w-0 overflow-visible">
						{ /* Timeline spans into arrow gutters; fade starts at the arrows. */ }
						<span
							className="pointer-events-none absolute top-[21px] z-0 h-[2px] left-[calc(-1*(3rem+0.75rem))] right-[calc(-1*(3rem+0.75rem))] md:left-[calc(-1*(3rem+2rem))] md:right-[calc(-1*(3rem+2rem))]"
							style={ {
								background:
									'linear-gradient(90deg, rgba(239, 234, 222, 0) 0%, rgba(239, 234, 222, 0) 1.25rem, #EFEADE 3rem, #EFEADE calc(100% - 3rem), rgba(239, 234, 222, 0) calc(100% - 1.25rem), rgba(239, 234, 222, 0) 100%)',
							} }
							aria-hidden="true"
						/>
						<UpcomingBoxesTrack
							items={ boxItems }
							nextBoxIndex={ nextBoxIndex }
							cardWidth={ cardWidth }
							trackRef={ trackRef }
							cardRefs={ cardRefs }
						/>
					</div>

					<div className="relative z-[1] justify-self-start">
						<SliderNavButton
							direction="next"
							label={ __( 'Next upcoming subscriptions', 'stayilo' ) }
							disabled={ scrollIndex >= maxScrollIndex }
							onClick={ () => scrollByCard( 'next' ) }
						/>
					</div>
				</div>
			</div>
		</section>
	);
}
