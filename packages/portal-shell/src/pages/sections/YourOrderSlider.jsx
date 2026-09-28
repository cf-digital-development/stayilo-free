import { useRef } from 'react';
import { __ } from '@stayilo/design-system/i18n';
import { ReactComponent as NavArrowRightIcon } from '@stayilo/design-system/assets/svg/nav-arrow-right.svg';
import { Card } from '../../components/Card.jsx';
import { ContentHeader } from '../../components/ContentHeader.jsx';
import { EmptyState } from '../../components/EmptyState.jsx';
import { SliderNavButton } from '../../components/SliderNavButton.jsx';
import { DEFAULT_ORDER_CARDS } from '../../data/orderCards.js';


export function YourOrderSlider( {
	title = __( 'What’s in your subscription', 'stayilo' ),
	subtitle = __( 'Review the meals scheduled for your next order below.', 'stayilo' ),
	items = DEFAULT_ORDER_CARDS,
	actionsEnabled = false,
	onEditBox,
	editBoxEnabled,
	onViewBox,
	className = '',
} ) {
	const trackRef = useRef( null );
	const canEditBox =
		editBoxEnabled != null
			? Boolean( editBoxEnabled )
			: actionsEnabled && typeof onEditBox === 'function';
	const hasItems = items.length > 0;

	const scrollByCard = ( direction ) => {
		const track = trackRef.current;
		if ( ! track ) {
			return;
		}

		const card = track.querySelector( '[data-order-card]' );
		const styles = window.getComputedStyle( track );
		const gap = Number.parseFloat( styles.columnGap || styles.gap || '16' ) || 16;
		const amount = card ? card.getBoundingClientRect().width + gap : track.clientWidth;
		track.scrollBy( { left: direction === 'next' ? amount : -amount, behavior: 'smooth' } );
	};

	const classes = [
		'portal-section--padded-order',
		className,
	]
		.filter( Boolean )
		.join( ' ' );

	return (
		<section className={ classes } aria-label={ title }>
			<div className="grid w-full grid-cols-[auto_minmax(0,1400px)_auto] items-center justify-center gap-x-2 sm:gap-x-3 md:gap-x-5">
				<div className="col-start-2 row-start-1 mb-8 min-w-0">
					<ContentHeader
						variant="section"
						title={ title }
						subtitle={ subtitle }
						actions={ [
							...( canEditBox
								? [
										{
											label: __( 'Edit Subscription', 'stayilo' ),
											variant: 'primary',
											showIcon: false,
											onClick: onEditBox,
											className:
												'w-full sm:w-auto portal-action-ready-edit-box',
										},
								  ]
								: [] ),
							{
								label: __( 'View Subscription', 'stayilo' ),
								variant: 'secondary',
								showIcon: true,
								icon: <NavArrowRightIcon width={ 24 } height={ 24 } />,
								onClick: onViewBox,
								disabled: ! onViewBox || ! hasItems,
								className: 'portal-btn mt-5 sm:mt-0 w-full sm:w-auto !border-[#101010] !pl-8 !pr-[22px]' ,
							},
						] }
					/>
				</div>

				{ hasItems ? (
					<>
						<div className="col-start-1 row-start-2 self-center justify-self-end">
							<SliderNavButton
								direction="prev"
								label={ __( 'Previous meals', 'stayilo' ) }
								onClick={ () => scrollByCard( 'prev' ) }
							/>
						</div>

						<div
							ref={ trackRef }
							className="portal-scroll-hide col-start-2 row-start-2 flex min-w-0 gap-4 md:gap-7 snap-x snap-mandatory"
						>
							{ items.map( ( item ) => (
								<div
									key={ item.id }
									data-order-card
									className="w-full min-w-0 shrink-0 snap-start basis-full md:basis-[calc((100%-2rem)/2)] lg:basis-[calc((100%-3.2rem)/3)]"
								>
									<Card
										title={ item.title }
										description={ item.description }
										imageUrl={ item.imageUrl }
										imageAlt={ item.imageAlt }
										stats={ item.stats }
										boxStatus={ item.boxStatus }
										onClick={ item.onClick }
										titleClassName="!text-[26px] font-bold !leading-[32px]"
										className="h-full"
									/>
								</div>
							) ) }
						</div>

						<div className="col-start-3 row-start-2 self-center justify-self-start">
							<SliderNavButton
								direction="next"
								label={ __( 'Next meals', 'stayilo' ) }
								onClick={ () => scrollByCard( 'next' ) }
							/>
						</div>
					</>
				) : (
					<div className="col-start-2 row-start-2 min-w-0">
						<EmptyState message={ __( 'No order is present.', 'stayilo' ) } />
					</div>
				) }
			</div>
		</section>
	);
}
