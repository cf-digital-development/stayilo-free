import { ContentHeader } from './ContentHeader.jsx';
import { NavArrowIcon } from './NavArrowIcon.jsx';
import { __ } from '@stayilo/design-system/i18n';

/**
 * Upcoming delivery status banner with edit action.
 *
 * @param {object} props
 * @param {string} [props.eyebrow='Upcoming']
 * @param {string} [props.title='Sun, Aug 17']
 * @param {string} [props.actionLabel='Edit Order']
 * @param {() => void} [props.onEditDelivery]
 * @param {boolean} [props.actionDisabled]
 * @param {boolean} [props.actionsEnabled] - Active plan + products/orders → ready (white) style.
 * @param {string} [props.backgroundColor]
 * @param {string} [props.eyebrowColor]
 * @param {string} [props.className]
 * @param {string} [props.titleClassName] - Extra classes on the ContentHeader title.
 */
export function UpcomingDeliveryBanner( {
	eyebrow = 'Your next order',
	title = 'Sun, Aug 17',
	actionLabel = 'Change date',
	onEditDelivery,
	actionDisabled,
	actionsEnabled = false,
	backgroundColor,
	eyebrowColor,
	className = '',
	titleClassName = '',
} ) {
	const isDisabled =
		actionDisabled ?? ( ! actionsEnabled || typeof onEditDelivery !== 'function' );

	return (
		<section
			className={ [
				'portal-full-bleed',
				! backgroundColor ? 'portal-surface-cream' : '',
			].filter( Boolean ).join( ' ' ) }
			style={ backgroundColor ? { backgroundColor } : undefined }
			aria-label={ eyebrow }
		>
			<div className="px-6">
				<div
					className={ [
						'portal-content relative z-[1]',
						className,
					].filter( Boolean ).join( ' ' ) }
				>
					<ContentHeader
						variant="delivery"
						eyebrow={ eyebrow }
						title={ title }
						titleClassName={ titleClassName }
						eyebrowColor={ eyebrowColor }
						backgroundColor="transparent"
						showTopAccent={ false }
						className="!rounded-none !mt-0 !mb-3"
						innerClassName="relative z-[1] !px-0"
						actions={ [
							{
								label: actionLabel,
								variant: 'secondary',
								showIcon: true,
								icon: (
									<NavArrowIcon
										className={
											isDisabled
												? 'text-white/40'
												: 'text-[#101010]'
										}
									/>
								),
								disabled: isDisabled,
								onClick: isDisabled ? undefined : onEditDelivery,
								className: isDisabled
									? __( '!shrink-0 portal-muted-action', 'stayilo' )
									: __( '!shrink-0 portal-action-ready-delivery', 'stayilo' ),
							},
						] }
					/>
				</div>
			</div>
		</section>
	);
}
