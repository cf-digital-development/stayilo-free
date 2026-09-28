import { ContentHeader } from './ContentHeader.jsx';
import { NavArrowIcon } from './NavArrowIcon.jsx';
import patternSrc from '../assets/images/lemoonboots-pattern-6854140.ai.png';
import { __ } from '@stayilo/design-system/i18n';

function DeliveryDecoration() {
	return (
		<img
			src={ patternSrc }
			alt=""
			aria-hidden="true"
			className="h-auto w-[360px] object-cover sm:w-[360px] md:w-[465px]"
		/>
	);
}

/**
 * Upcoming delivery status banner with edit action and botanical decoration.
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
 * @param {import('react').ReactNode} [props.decoration]
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
	decoration,
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
			{/* <div
				className="pointer-events-none absolute bottom-0 right-0 z-0 hidden md:block"
				aria-hidden="true"
			>
				{ decoration ?? <DeliveryDecoration /> }
			</div> */}

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
