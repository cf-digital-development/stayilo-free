import { ReactComponent as CheckIcon } from '@stayilo/design-system/assets/svg/CheckCircle.svg';
import { decodeMoney } from '../utils/decodeMoney.js';
import {
	DEFAULT_THUMB_IMAGE,
	resolveMediaUrl,
} from '../utils/mediaPlaceholders.js';
import { Button } from './Button.jsx';
import { __, sprintf } from '@stayilo/design-system/i18n';

const STATUS_CONFIG = {
	delivered: {
		label: __( 'Delivered', 'stayilo' ),
		className: 'portal-order-status portal-order-status--delivered',
		Icon: CheckIcon,
	},
};

/**
 * Horizontal past-order row — thumbnail, price, meta, status, optional View Order CTA.
 *
 * @param {object} props
 * @param {string} props.title
 * @param {string} [props.price]
 * @param {string} [props.orderNumber]
 * @param {string} [props.dateLabel]
 * @param {'delivered'|string} [props.status='delivered']
 * @param {string} [props.statusLabel]
 * @param {string} [props.imageUrl]
 * @param {string} [props.imageAlt]
 * @param {string} [props.actionLabel='View Order']
 * @param {() => void} [props.onView]
 * @param {boolean} [props.showDivider=false]
 * @param {'card'|'row'} [props.variant='card']
 * @param {string} [props.className]
 */
export function OrderHistoryCard( {
	title,
	price,
	orderNumber,
	dateLabel,
	status = 'delivered',
	statusLabel,
	imageUrl,
	imageAlt = '',
	actionLabel = 'View Order',
	onView,
	showDivider = false,
	variant = 'card',
	className = '',
} ) {
	const statusConfig = STATUS_CONFIG[ status ] ?? {
		label: statusLabel || status,
		className: 'portal-order-status',
	};
	const StatusIcon = statusConfig.Icon;
	const displayImageUrl = resolveMediaUrl( imageUrl, DEFAULT_THUMB_IMAGE );

	const metaParts = [
		orderNumber ? sprintf( __( 'Order #%s', 'stayilo' ), orderNumber ) : null,
		dateLabel,
	].filter( Boolean );

	return (
		<article
			className={ [
				variant === 'row' ? 'portal-order-history--row' : 'portal-order-history',
				showDivider ? 'portal-order-history--divided' : '',
				className,
			].filter( Boolean ).join( ' ' ) }
		>
			<div className="portal-order-history-media">
				<img
					src={ displayImageUrl }
					alt={ imageAlt || title }
					className="h-full w-full object-cover"
				/>
			</div>

			<div className="portal-order-history__body">
				<h3 className="portal-order-history__title">{ title }</h3>
				{ price ? (
					<p className="portal-order-history__price">
						{ decodeMoney( price ) }
					</p>
				) : null }

				<div className="portal-order-history__meta">
					{ metaParts.length > 0 ? (
						<p className="portal-order-history__meta-text">
							{ metaParts.map( ( part, index ) => (
								<span key={ `${ part }-${ index }` }>
									{ index > 0 ? (
										<span className="portal-order-history__dot" aria-hidden="true">
											•
										</span>
									) : null }
									{ part }
								</span>
							) ) }
						</p>
					) : null }

					<span className={ statusConfig.className }>
						{ StatusIcon ? (
							<StatusIcon width={ 16 } height={ 16 } aria-hidden="true" />
						) : null }
						<span>{ statusLabel || statusConfig.label }</span>
					</span>
				</div>
			</div>

			<div className="portal-order-history__action-wrap">
				<Button
					label={ actionLabel }
					variant="secondary"
					className="portal-order-history__action"
					onClick={ typeof onView === 'function' ? onView : undefined }
					disabled={ typeof onView !== 'function' }
				/>
			</div>
		</article>
	);
}
