import { useEffect, useRef, useState } from 'react';
import { getStayiloRegistry } from '@stayilo/extension-sdk';
import { useTemplateRecipe } from '../templates/TemplateProvider.jsx';
import { PortalPopup } from './PortalPopup.jsx';
import {
	CancelPackageIcon,
	SuccessCheckIcon,
} from './PortalPopupIcons.jsx';
import { __ } from '@stayilo/design-system/i18n';
import {
	CANCEL_POPUP_STEPS,
	isFreeTextReasonId,
} from '../data/popupContent.js';
import { usePortalPremiumRevision } from '../utils/portalActions.js';

const STEP_ICONS = {
	reasons: <CancelPackageIcon />,
	confirm: <CancelPackageIcon />,
	canceled: <CancelPackageIcon />,
	active: <SuccessCheckIcon />,
};

/** Pro registers RetentionOffers under this id (portal-core). */
const CANCEL_OFFERS_ACTION = 'retention-offers';

function resolveOpeningStep( initialStep, isClassic ) {
	if ( isClassic && initialStep === 'confirm' ) {
		return 'reasons';
	}
	return initialStep;
}

/**
 * Free cancel flow: reasons → confirm → canceled.
 * Growth retention offers render via registered `retention-offers` action.
 */
export function CancelSubscriptionPopup( {
	open,
	onClose,
	subscriptionId = '',
	subscription = null,
	initialStep = 'confirm',
	onCanceled,
	onCancelComplete,
	onKept,
	descriptionClassName = '',
} ) {
	usePortalPremiumRevision();
	const { id: templateId } = useTemplateRecipe();
	const isClassic = templateId === 'classic';
	const openingStep = resolveOpeningStep( initialStep, isClassic );
	const [ step, setStep ] = useState( openingStep );
	const [ selectedOptionIds, setSelectedOptionIds ] = useState( [] );
	const [ otherReason, setOtherReason ] = useState( '' );
	const [ submitting, setSubmitting ] = useState( false );
	const otherInputRef = useRef( null );

	const CancelOffers = getStayiloRegistry().getPortalAction?.(
		CANCEL_OFFERS_ACTION
	);

	useEffect( () => {
		if ( open ) {
			setStep( resolveOpeningStep( initialStep, isClassic ) );
			setSelectedOptionIds( [] );
			setOtherReason( '' );
			setSubmitting( false );
		}
	}, [ open, initialStep, isClassic ] );

	const config = CANCEL_POPUP_STEPS[ step ] ?? CANCEL_POPUP_STEPS.confirm;
	const classicReasons =
		isClassic && step === 'reasons' && ( config.options?.length ?? 0 ) > 0;

	const othersSelected = selectedOptionIds.some( ( id ) =>
		isFreeTextReasonId( id )
	);
	const hasValidReason =
		selectedOptionIds.length > 0 &&
		( ! othersSelected || otherReason.trim().length > 0 );

	useEffect( () => {
		if ( othersSelected ) {
			otherInputRef.current?.focus();
		}
	}, [ othersSelected ] );

	const handleClose = () => {
		if ( step === 'canceled' ) {
			onCancelComplete?.();
		}
		onClose?.();
	};

	const cancelMeta = () => ( {
		reasonIds: selectedOptionIds,
		otherReason: otherReason.trim(),
	} );

	const completeCancel = async () => {
		if ( submitting ) {
			return;
		}
		setSubmitting( true );
		try {
			await onCanceled?.( cancelMeta() );
			setStep( 'canceled' );
		} catch ( err ) {
			window.alert( err?.message || __( 'Could not cancel subscription', 'stayilo' ) );
		} finally {
			setSubmitting( false );
		}
	};

	const goToOfferOrCancel = async () => {
		if ( typeof CancelOffers === 'function' ) {
			setStep( 'offers' );
			return;
		}
		await completeCancel();
	};

	const handleAction = async ( actionId ) => {
		if ( actionId === 'keep-subscription' ) {
			onKept?.();
			onClose?.();
			return;
		}

		if ( actionId === 'yes-cancel' ) {
			setStep( 'reasons' );
			return;
		}

		if ( actionId === 'continue' ) {
			if ( ! hasValidReason || submitting ) {
				return;
			}
			await goToOfferOrCancel();
		}
	};

	if ( step === 'offers' && typeof CancelOffers === 'function' ) {
		return (
			<CancelOffers
				open={ open }
				onClose={ onClose }
				subscriptionId={ subscriptionId }
				subscription={ subscription }
				selectedOptionIds={ selectedOptionIds }
				otherReason={ otherReason.trim() }
				onCanceled={ onCanceled }
				onCancelComplete={ onCancelComplete }
				onKept={ onKept }
				onCancelAnyway={ completeCancel }
				descriptionClassName={ descriptionClassName }
			/>
		);
	}

	const actions = (() => {
		if ( classicReasons ) {
			return [
				{
					label: __( 'Continue', 'stayilo' ),
					variant: 'primary',
					disabled: submitting || ! hasValidReason,
					loading: submitting,
					className: 'portal-popup__action--cancel-continue',
					onClick: () => handleAction( 'continue' ),
				},
				{
					label: __( 'Cancel', 'stayilo' ),
					variant: 'secondary',
					showIcon: false,
					disabled: submitting,
					className: 'portal-popup__action--cancel-dismiss',
					onClick: () => handleClose(),
				},
			];
		}

		return ( config.actions ?? [] ).map( ( action ) => ( {
			label: action.label,
			variant: action.variant,
			disabled:
				submitting ||
				( step === 'reasons' &&
					action.id === 'continue' &&
					! hasValidReason ),
			loading: submitting && action.id === 'continue',
			onClick: () => handleAction( action.id ),
		} ) );
	} )();

	return (
		<PortalPopup
			open={ open }
			onClose={ handleClose }
			stepKey={ step }
			icon={ classicReasons ? null : STEP_ICONS[ step ] }
			title={ config.title }
			description={ config.description }
			descriptionClassName={ descriptionClassName }
			contentClassName={ [
				'portal-popup--cancel',
				classicReasons ? 'portal-popup--cancel-reasons' : '',
			]
				.filter( Boolean )
				.join( ' ' ) }
			options={ classicReasons ? [] : config.options ?? [] }
			selectedOptionIds={ selectedOptionIds }
			onOptionChange={ ( ids ) => {
				setSelectedOptionIds( ids );
				if ( ! ids.some( ( id ) => isFreeTextReasonId( id ) ) ) {
					setOtherReason( '' );
				}
			} }
			optionMode="single"
			actions={ actions }
		>
			{ classicReasons ? (
				<div className="mt-6 w-full rounded-lg bg-white p-2 text-left shadow-[0_2px_16px_0_#00000014]">
					<ul className="m-0 flex list-none flex-col gap-0.5 p-0" role="listbox">
						{ ( config.options ?? [] ).map( ( option ) => {
							const checked = selectedOptionIds.includes( option.id );
							return (
								<li key={ option.id }>
									<button
										type="button"
										role="option"
										aria-selected={ checked }
										className={ [
											'flex w-full cursor-pointer items-center gap-4 rounded border-[1.5px] border-transparent bg-transparent px-5 py-4 text-left',
											checked
												? 'border-[color:var(--stayilo-button,#007943)] bg-[var(--stayilo-button-tint,#e0ede6)]'
												: '',
										]
											.filter( Boolean )
											.join( ' ' ) }
										onClick={ () => {
											setSelectedOptionIds( [ option.id ] );
											if ( ! isFreeTextReasonId( option.id ) ) {
												setOtherReason( '' );
											}
										} }
									>
										<span
											className={ [
												'inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-[1.5px] border-[#10101033] bg-white',
												checked ? 'border-[#007943]' : '',
											]
												.filter( Boolean )
												.join( ' ' ) }
											aria-hidden="true"
										>
											{ checked ? (
												<span className={ `block ${ isClassic ? 'h-full w-full' : 'h-2.5 w-2.5' }  rounded-full bg-[#007943]` } />
											) : null }
										</span>
										<span className="text-base font-medium leading-6 text-[#101010]">
											{ option.label }
										</span>
									</button>
								</li>
							);
						} ) }
					</ul>
					<label className="mt-2 block w-full px-3 pb-3">
						<span className="sr-only">{ __( 'Tell us your reason', 'stayilo' ) }</span>
						<textarea
							ref={ otherInputRef }
							className="portal-popup__cancel-reason-input "
							rows={ 1 }
							placeholder={ __( 'Type your reason here...', 'stayilo' ) }
							value={ otherReason }
							disabled={ ! othersSelected }
							tabIndex={ othersSelected ? 0 : -1 }
							onChange={ ( event ) =>
								setOtherReason( event.target.value )
							}
						/>
					</label>
				</div>
			) : step === 'reasons' ? (
				<div
					className={ [
						'portal-popup__other-wrap',
						othersSelected ? 'portal-popup__other-wrap--open' : '',
					]
						.filter( Boolean )
						.join( ' ' ) }
					aria-hidden={ ! othersSelected }
				>
					<div className="portal-popup__other-inner">
						<label className="portal-popup__other w-full text-left">
							<span className="sr-only">{ __( 'Tell us your reason', 'stayilo' ) }</span>
							<textarea
								ref={ otherInputRef }
								className="portal-popup__other-input"
								rows={ 3 }
								placeholder={ __( 'Please tell us your reason…', 'stayilo' ) }
								value={ otherReason }
								disabled={ ! othersSelected }
								tabIndex={ othersSelected ? 0 : -1 }
								onChange={ ( event ) =>
									setOtherReason( event.target.value )
								}
							/>
						</label>
					</div>
				</div>
			) : null }
		</PortalPopup>
	);
}
