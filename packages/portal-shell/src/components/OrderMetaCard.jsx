import { ReactComponent as CheckCircleIcon } from '@stayilo/design-system/assets/svg/CheckCircle.svg';
import { ReactComponent as HouseLineIcon } from '@stayilo/design-system/assets/svg/HouseLine.svg';
import { Button } from './Button.jsx';
import { NavArrowIcon } from './NavArrowIcon.jsx';
import { __ } from '@stayilo/design-system/i18n';

const BODY_ALIGN_CLASSES = {
	start: 'items-start',
	center: 'items-center',
};

/**
 * Order details meta card — order date or address block.
 *
 * @param {object} props
 * @param {string} props.label
 * @param {import('react').ReactNode} [props.icon]
 * @param {string|import('react').ReactNode} [props.value]
 * @param {string[]} [props.lines] - Multi-line content (e.g. address).
 * @param {'delivered'|string} [props.status]
 * @param {string} [props.statusLabel]
 * @param {string} [props.actionLabel]
 * @param {() => void} [props.onAction]
 * @param {boolean} [props.actionDisabled=false]
 * @param {'above'|'inline'} [props.labelPlacement='above']
 *   - `above`: label sits above the icon row (order date card).
 *   - `inline`: label aligns with the icon (address card).
 * @param {'start'|'center'} [props.bodyAlign='center'] - Vertical alignment of icon + content row.
 * @param {string} [props.className]
 */
export function OrderMetaCard( {
	label,
	icon,
	value,
	lines = [],
	status,
	statusLabel,
	actionLabel,
	onAction,
	actionDisabled = false,
	labelPlacement = 'above',
	bodyAlign = 'center',
	className = '',
} ) {
	const showDelivered = status === 'delivered' || statusLabel === 'Delivered';
	const hasTrailing = showDelivered || Boolean( actionLabel );
	const isInlineLabel = labelPlacement === 'inline';

	const content = (
		<>
			{ value ? (
				<p className="m-0 text-base font-semibold leading-6 sm:text-xl sm:leading-7">
					{ value }
				</p>
			) : null }

			{ lines.length > 0 ? (
				<div className="space-y-0.5">
					{ lines.map( ( line ) => (
						<p
							key={ line }
							className="m-0 text-base font-medium leading-6"
						>
							{ line }
						</p>
					) ) }
				</div>
			) : null }
		</>
	);

	return (
		<article
			className={ [
				'portal-order-meta',
				hasTrailing ? 'portal-order-meta--has-trailing' : '',
				isInlineLabel ? 'portal-order-meta--label-inline' : '',
				className,
			].filter( Boolean ).join( ' ' ) }
		>
			{ isInlineLabel ? (
				<div
					className={ [
						'portal-order-meta__body block sm:flex gap-4',
						BODY_ALIGN_CLASSES[ bodyAlign ] ?? BODY_ALIGN_CLASSES.start,
					].join( ' ' ) }
				>
					{ icon ? (
						<div className="portal-order-meta__icon" aria-hidden="true">
							{ icon }
						</div>
					) : null }

					<div className="min-w-0 flex-1">
						<p className="portal-order-meta__label">{ label }</p>
						{ value || lines.length > 0 ? (
							<div className="mt-2">{ content }</div>
						) : null }
					</div>
				</div>
			) : (
				<>
					<p className="portal-order-meta__label">{ label }</p>

					<div
						className={ [
							'portal-order-meta__body mt-3 block sm:flex gap-4',
							BODY_ALIGN_CLASSES[ bodyAlign ] ?? BODY_ALIGN_CLASSES.center,
						].join( ' ' ) }
					>
						{ icon ? (
							<div className="portal-order-meta__icon" aria-hidden="true">
								{ icon }
							</div>
						) : null }

						<div className="min-w-0 flex-1">{ content }</div>
					</div>
				</>
			) }

			{ showDelivered ? (
				<span
					className="portal-order-meta__trailing portal-order-status portal-order-status--delivered"
				>
					<CheckCircleIcon width={ 16 } height={ 16 } aria-hidden="true" />
					<span>{ statusLabel || __( 'Delivered', 'stayilo' ) }</span>
				</span>
			) : null }

			{ actionLabel ? (
				<Button
					label={ actionLabel }
					variant="secondary"
					showIcon
					icon={
						<NavArrowIcon
							className="text-current"
						/>
					}
					disabled={ actionDisabled }
					className="portal-order-meta__trailing portal-order-meta__action"
					onClick={ onAction }
				/>
			) : null }
		</article>
	);
}

function HomeIcon( { className = '' } ) {
	return (
		<HouseLineIcon
			aria-hidden="true"
			className={ [ 'text-[#101010] [&_path]:stroke-current', className ].filter( Boolean ).join( ' ' ) }
		/>
	);
}

OrderMetaCard.HomeIcon = HomeIcon;
