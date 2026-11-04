import { ReactComponent as PackageIcon } from '@stayilo/design-system/assets/svg/PackageIcon.svg';
import { ContentHeader } from '../ContentHeader.jsx';
import { NextDeliveryBanner } from '../NextDeliveryBanner.jsx';
import { CardStatusBadge } from './CardStatusBadge.jsx';
import { __ } from '@stayilo/design-system/i18n';

export function ChipCardBody( {
	category,
	title,
	description,
	paymentFailed,
	isCanceled,
	isPaused,
	nextDelivery,
	onOpenDelivery,
	actions,
} ) {
	const hasStatus = paymentFailed || isCanceled || isPaused;

	return (
		<div className="portal-card-chip-body">
			{ category || hasStatus ? (
				<div className="portal-card-chip-top">
					{ category ? (
						<span className="portal-card-chip">
							<PackageIcon
								width={ 22 }
								height={ 22 }
								aria-hidden="true"
								className="portal-card-chip-icon"
							/>
							{ category }
						</span>
					) : (
						<span />
					) }
					<CardStatusBadge
						paymentFailed={ paymentFailed }
						isCanceled={ isCanceled }
						isPaused={ isPaused }
						placement="inline"
					/>
				</div>
			) : null }
			<ContentHeader
				variant="card"
				title={ title }
				subtitle={ description }
			/>
			<div className="portal-card-chip-footer">
				<NextDeliveryBanner
					variant="summary"
					embedded
					onOpen={ onOpenDelivery }
					{ ...nextDelivery }
				/>
				<div className="portal-card-chip-actions">{ actions }</div>
			</div>
		</div>
	);
}
