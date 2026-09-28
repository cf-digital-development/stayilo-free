import { ContentHeader } from '../ContentHeader.jsx';
import { NextDeliveryBanner } from '../NextDeliveryBanner.jsx';
import { CardStatusBadge } from './CardStatusBadge.jsx';

export function MediaCardBody( {
	title,
	description,
	imageAlt,
	displayImageUrl,
	isPlaceholder,
	paymentFailed,
	isCanceled,
	isPaused,
	nextDelivery,
	onOpenDelivery,
	actions,
} ) {
	return (
		<>
			<div
				className={ [
					'portal-card-media',
					! isPlaceholder ? 'portal-card-media--cover' : '',
				]
					.filter( Boolean )
					.join( ' ' ) }
			>
				<img src={ displayImageUrl } alt={ imageAlt || title } />
				<CardStatusBadge
					paymentFailed={ paymentFailed }
					isCanceled={ isCanceled }
					isPaused={ isPaused }
				/>
			</div>

			<div className="portal-card-body">
				<ContentHeader
					variant="card"
					title={ title }
					subtitle={ description }
				/>
				<NextDeliveryBanner
					variant="summary"
					embedded
					onOpen={ onOpenDelivery }
					{ ...nextDelivery }
				/>
				{ actions }
			</div>
		</>
	);
}
