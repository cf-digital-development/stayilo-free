import { ReactComponent as TruckIcon } from '@stayilo/design-system/assets/svg/Truck.svg';
import { ReactComponent as CaretRightIcon } from '../assets/images/CaretRight.svg';
import { BrandedIcon } from './BrandedIcon.jsx';
import { Button } from './Button.jsx';
import { __ } from '@stayilo/design-system/i18n';

function CircleArrowButton( { onClick, label = 'Open order details' } ) {
	return (
		<button
			type="button"
			aria-label={ label }
			onClick={ onClick }
			className="portal-circle-action"
		>
			<BrandedIcon name="caret" width={ 20 } height={ 20 } className="text-current mt-[-3px]">
				<CaretRightIcon
					width={ 20 }
					height={ 20 }
					className="text-current mt-[-3px]"
					aria-hidden="true"
				/>
			</BrandedIcon>
		</button>
	);
}

function ActionButtons( { actions } ) {
	if ( ! actions.length ) {
		return null;
	}

	return (
		<div className="   flex flex-col w-full sm:w-auto sm:flex-row md:ml-6 ml-0 shrink-0 flex-wrap items-center md:justify-end justify-start gap-2 sm:gap-3">
			{ actions.map( ( action, index ) => (
				<Button
					key={ `${ action.label }-${ index }` }
					label={ action.label }
					variant="chip"
					onClick={ action.onClick }
					disabled={ action.disabled }
					icon={
						<BrandedIcon name="caret" width={ 20 } height={ 20 } className="text-current">
							<CaretRightIcon
								width={ 20 }
								height={ 20 }
								className="text-current"
								aria-hidden="true"
							/>
						</BrandedIcon>
					}
				/>
			) ) }
		</div>
	);
}

/**
 * Dynamic next-delivery banner — one component for both layouts:
 * - `summary`: label + date + circular arrow
 * - `actions`: date + action chips (Change date is paid; inject via parent)
 *
 * @param {object} props
 * @param {'summary'|'actions'} [props.variant='summary']
 * @param {string} [props.label='Next order']
 * @param {string} [props.date='Friday, 16 may 2027']
 * @param {Array<{ label: string, onClick?: Function, disabled?: boolean }>} [props.actions]
 * @param {() => void} [props.onOpen]
 * @param {string} [props.backgroundColor]
 * @param {import('react').ReactNode} [props.icon]
 * @param {boolean} [props.embedded=false] - Compact strip for nesting inside a card.
 * @param {string} [props.className]
 * @param {string} [props.dateClassName] - Extra classes for the date line.
 */
export function NextDeliveryBanner( {
	variant = 'summary',
	label = 'Next order',
	date = 'Friday, 16 may 2027',
	actions = [],
	onOpen,
	backgroundColor,
	icon,
	embedded = false,
	className = '',
	dateClassName = '',
} ) {
	const isActions = variant === 'actions';
	const resolvedActions = isActions ? actions : [];

	const shellClasses = embedded
		? [
			'portal-delivery-strip',
			! backgroundColor ? 'portal-surface-cream' : '',
			className,
		]
		: [
			'portal-full-bleed overflow-hidden rounded-t-2xl',
			! backgroundColor ? 'portal-surface-cream' : '',
			className,
		];

	return (
		<section
			className={ shellClasses.filter( Boolean ).join( ' ' ) }
			style={ backgroundColor ? { backgroundColor } : undefined }
			aria-label={ label || __( 'Next order', 'stayilo' ) }
		>
			<div
				className={ [
					'portal-delivery-strip__inner relative flex w-full',
					embedded
						? [
							'px-3 py-3',
							isActions ? '  flex-col md:flex-row gap-3  items-start md:items-center md:gap-4' : ' items-center gap-[14px]',
						].join( ' ' )
						: 'py-3 sm:py-4 items-center',
				].join( ' ' ) }
			>
				{ embedded ? (
					<>
						<span className="inline-flex delivery-icon shrink-0">
							{ icon ?? (
								<BrandedIcon name="truck" width={ 32 } height={ 32 } className="shrink-0">
									<TruckIcon width={ 32 } height={ 32 } aria-hidden="true" className="shrink-0" />
								</BrandedIcon>
							) }
						</span>
						<div
							className={ [
								'min-w-0',
								isActions ? 'shrink-0' : 'flex-1',
							].join( ' ' ) }
						>
							{ ! isActions && label ? (
								<p className="m-0 text-sm font-normal text-[#101010CC] leading-5">
									{ label }
								</p>
							) : null }
							<p
								className={ [
									'm-0 text-base font-semibold leading-6',
									dateClassName,
								]
									.filter( Boolean )
									.join( ' ' ) }
							>
								{ date }
							</p>
						</div>
						{ ( isActions && resolvedActions.length > 0 ) || onOpen ? (
							<div
								className={ [
									'shrink-0',
									isActions ? 'w-full md:w-auto' : '',
								].filter( Boolean ).join( ' ' ) }
							>
								{ isActions ? (
									<ActionButtons actions={ resolvedActions } />
								) : (
									<CircleArrowButton onClick={ onOpen } />
								) }
							</div>
						) : null }
					
					</>
				) : (
					<>
						<div className="min-w-0 flex-1 px-6">
							<div className="portal-content flex items-center gap-3 sm:gap-4">
								<span className="inline-flex shrink-0">
									{ icon ?? (
										<BrandedIcon name="truck" width={ 28 } height={ 28 } className="shrink-0">
											<TruckIcon width={ 28 } height={ 28 } aria-hidden="true" className="shrink-0" />
										</BrandedIcon>
									) }
								</span>
								<div className="min-w-0">
									{ ! isActions && label ? (
										<p className="m-0 text-sm font-normal leading-5 text-stayilo-muted">
											{ label }
										</p>
									) : null }
									<p className="m-0 text-base font-bold leading-6 sm:text-lg">
										{ date }
									</p>
								</div>
							</div>
						</div>
						<div className="relative z-[1] shrink-0 pr-4 sm:pr-6">
							{ isActions ? (
								<ActionButtons actions={ resolvedActions } />
							) : onOpen ? (
								<CircleArrowButton onClick={ onOpen } />
							) : null }
						</div>
					</>
				) }
			</div>
		</section>
	);
}
