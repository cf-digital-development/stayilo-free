import { Button } from '../buttons';

/**
 * Reusable subscription management card.
 *
 * @param {object} props
 * @param {string} props.title
 * @param {string|number} [props.quantity]
 * @param {string} [props.status]
 * @param {'success'|'warning'|'neutral'} [props.statusVariant='success']
 * @param {import('react').ReactNode} [props.details]
 * @param {string} [props.nextDelivery]
 * @param {string} [props.price]
 * @param {string} [props.billingPeriod]
 * @param {string|number} [props.subscriptionId]
 * @param {Array<{ id?: string, label: string, onClick?: () => void, disabled?: boolean }>} [props.actions]
 * @param {(actionId: string, subscriptionId?: string|number) => void} [props.onActionChange]
 * @param {string} [props.saveLabel]
 * @param {() => void} [props.onSave]
 * @param {boolean} [props.saveDisabled=false]
 * @param {string} [props.cancelLabel]
 * @param {() => void} [props.onCancel]
 * @param {boolean} [props.cancelDisabled=false]
 * @param {string} [props.backToStoreLabel]
 * @param {() => void} [props.onBackToStore]
 * @param {boolean} [props.backToStoreDisabled=false]
 * @param {boolean} [props.hideHeader=false]
 * @param {string} [props.className]
 */
export default function SubscriptionCard( {
	title,
	quantity,
	status,
	statusVariant = 'success',
	hideHeader = false,
	details,
	nextDelivery,
	price,
	billingPeriod,
	subscriptionId,
	actions = [],
	onActionChange,
	saveLabel,
	onSave,
	saveDisabled = false,
	cancelLabel,
	onCancel,
	cancelDisabled = false,
	backToStoreLabel,
	onBackToStore,
	backToStoreDisabled = false,
	className = '',
} ) {
	const classes = [
		'stayilo-subscription-card w-full box-border p-[15px] rounded-[15.25px] border border-stayilo-border bg-white font-inter text-[#6A7282]',
		className,
	]
		.filter( Boolean )
		.join( ' ' );

	const statusVariantClasses = {
		success: 'bg-stayilo-accent text-white',
		warning: 'bg-amber-100 text-amber-500',
		neutral: 'bg-gray-200 text-[#6A7282]',
	};

	const statusClasses = [
		'stayilo-subscription-card__status',
		`stayilo-subscription-card__status--${ statusVariant }`,
		'shrink-0 py-0.5 px-2 rounded-full text-xs font-bold leading-4 cursor-pointer',
		statusVariantClasses[ statusVariant ] ?? statusVariantClasses.success,
	].join( ' ' );

	const hasStructuredDetails = nextDelivery || price || billingPeriod;
	const detailParts = [
		nextDelivery ? `Next delivery: ${ nextDelivery }` : null,
		price,
		billingPeriod,
	].filter( Boolean );

	const handleActionClick = ( action ) => {
		action.onClick?.();
		onActionChange?.( action.id ?? action.label, subscriptionId );
	};

	return (
		<article className={ classes }>
			{ ! hideHeader ? (
				<div className="flex items-center justify-between gap-4">
					<h3 className="min-w-0 m-0 text-sm font-bold leading-5 text-[#1E2939]">
						{ title }
						{ quantity !== undefined && quantity !== null ? (
							<span className="whitespace-nowrap">
								{ ` \u00D7${ quantity }` }
							</span>
						) : null }
					</h3>

					{ status ? <span className={ statusClasses }>{ status }</span> : null }
				</div>
			) : null }

			{ details || hasStructuredDetails ? (
				<div className="stayilo-subscription-card__details mt-3 text-xs font-medium leading-4 text-[#6A7282]">
					{ details ?? detailParts.map( ( part, index ) => (
						<span key={ part }>
							{ index > 0 ? (
								<span aria-hidden="true">{ ' · ' }</span>
							) : null }
							{ part }
						</span>
					) ) }
				</div>
			) : null }

			{ actions.length > 0 ? (
				<div className="stayilo-subscription-card__actions grid grid-cols-2 gap-2 mt-3 max-[480px]:grid-cols-1">
					{ actions.map( ( action, index ) => (
						<Button
							key={ `${ action.label }-${ index }` }
							text={ action.label }
							variant="text"
							active={ ! action.disabled }
							disabled={ action.disabled }
							className="stayilo-subscription-card__action w-full min-h-[30px] py-1.5 px-3 rounded-lg border border-stayilo-border text-xs font-medium leading-4 text-[#4A5565] cursor-pointer"
							onClick={ () => handleActionClick( action ) }
						/>
					) ) }
				</div>
			) : null }

			{ saveLabel ? (
				<Button
					text={ saveLabel }
					active={ ! saveDisabled }
					disabled={ saveDisabled }
					className={ `stayilo-subscription-card__save w-full min-h-[30px] mt-3 py-[7.5px] px-3 rounded-[11.25px] border-0 text-[10px] font-bold leading-[15px] text-white cursor-pointer ${
						saveDisabled ? 'bg-[#474C57]' : 'bg-stayilo-ink'
					}` }
					onClick={ onSave }
				/>
			) : null }

			{ backToStoreLabel ? (
				<Button
					text={ backToStoreLabel }
					variant="text"
					active={ ! backToStoreDisabled }
					disabled={ backToStoreDisabled }
					className="stayilo-subscription-card__back-to-store w-full min-h-[30px] mt-2 py-[7.5px] px-3 rounded-[11.25px] border border-stayilo-border bg-white text-[10px] font-bold leading-[15px] text-[#474C57] cursor-pointer"
					onClick={ onBackToStore }
				/>
			) : null }

			{ cancelLabel ? (
				<Button
					text={ cancelLabel }
					variant="text"
					active={ ! cancelDisabled }
					disabled={ cancelDisabled }
					className={ `stayilo-subscription-card__cancel block mx-auto mt-3 p-1 border-0 bg-transparent text-[9px] font-normal leading-[13.5px] underline cursor-pointer ${
						cancelDisabled ? 'text-[#FF6467]' : 'text-[#FF4D4F]'
					}` }
					onClick={ onCancel }
				/>
			) : null }
		</article>
	);
}
