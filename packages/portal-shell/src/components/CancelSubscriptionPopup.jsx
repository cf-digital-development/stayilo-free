import { useEffect, useMemo, useRef, useState } from 'react';
import { acceptPortalOffer } from '../api/portal.js';
import { useTemplateRecipe } from '../templates/TemplateProvider.jsx';
import { PortalPopup } from './PortalPopup.jsx';
import {
	CancelPackageIcon,
	DiscountOfferIcon,
	SuccessCheckIcon,
} from './PortalPopupIcons.jsx';
import { __ } from '@stayilo/design-system/i18n';
import {
	CANCEL_POPUP_STEPS,
	buildOfferAppliedStep,
	buildOfferConfigureStep,
	isFreeTextReasonId,
	listOffersForReasons,
	offerNeedsCustomerChoice,
	resolveOfferStep,
	shouldShowOfferAfterReasons,
} from '../data/popupContent.js';

const STEP_ICONS = {
	reasons: <CancelPackageIcon />,
	confirm: <CancelPackageIcon />,
	offer: <DiscountOfferIcon />,
	configure: <DiscountOfferIcon />,
	canceled: <CancelPackageIcon />,
	active: <SuccessCheckIcon />,
};

function resolveOpeningStep( initialStep, isClassic ) {
	if ( isClassic && initialStep === 'confirm' ) {
		return 'reasons';
	}
	return initialStep;
}

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
	const { id: templateId } = useTemplateRecipe();
	const isClassic = templateId === 'classic';
	const openingStep = resolveOpeningStep( initialStep, isClassic );
	const [ step, setStep ] = useState( openingStep );
	const [ selectedOptionIds, setSelectedOptionIds ] = useState( [] );
	const [ otherReason, setOtherReason ] = useState( '' );
	const [ offerIndex, setOfferIndex ] = useState( 0 );
	const [ configureChoiceIds, setConfigureChoiceIds ] = useState( [] );
	const [ appliedResult, setAppliedResult ] = useState( null );
	const [ submitting, setSubmitting ] = useState( false );
	const otherInputRef = useRef( null );

	useEffect( () => {
		if ( open ) {
			setStep( resolveOpeningStep( initialStep, isClassic ) );
			setSelectedOptionIds( [] );
			setOtherReason( '' );
			setOfferIndex( 0 );
			setConfigureChoiceIds( [] );
			setAppliedResult( null );
			setSubmitting( false );
		}
	}, [ open, initialStep, isClassic ] );

	const offerStep = useMemo(
		() => resolveOfferStep( selectedOptionIds, offerIndex ),
		[ selectedOptionIds, offerIndex ]
	);

	const configureStep = useMemo(
		() => buildOfferConfigureStep( offerStep.offer, subscription ),
		[ offerStep.offer, subscription ]
	);

	const activeStep = useMemo( () => {
		if ( step !== 'active' ) {
			return CANCEL_POPUP_STEPS.active;
		}
		return buildOfferAppliedStep( offerStep.offer, appliedResult?.applied );
	}, [ step, offerStep.offer, appliedResult ] );

	const config =
		step === 'offer'
			? offerStep
			: step === 'configure'
				? configureStep
				: step === 'active'
					? activeStep
					: CANCEL_POPUP_STEPS[ step ] ?? CANCEL_POPUP_STEPS.confirm;

	const classicReasons =
		isClassic && step === 'reasons' && ( config.options?.length ?? 0 ) > 0;

	const othersSelected = selectedOptionIds.some( ( id ) =>
		isFreeTextReasonId( id )
	);
	const hasValidReason =
		selectedOptionIds.length > 0 &&
		( ! othersSelected || otherReason.trim().length > 0 );

	const selectedConfigure = configureStep.options.find( ( option ) =>
		configureChoiceIds.includes( option.id )
	);

	useEffect( () => {
		if ( othersSelected ) {
			otherInputRef.current?.focus();
		}
	}, [ othersSelected ] );

	useEffect( () => {
		if ( step === 'configure' ) {
			setConfigureChoiceIds( [] );
		}
	}, [ step, offerIndex ] );

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
		if ( shouldShowOfferAfterReasons( selectedOptionIds ) ) {
			setOfferIndex( 0 );
			setStep( 'offer' );
			return;
		}
		await completeCancel();
	};

	const acceptCurrentOffer = async ( choices = {} ) => {
		if ( ! subscriptionId ) {
			throw new Error( __( 'Missing subscription for this offer.', 'stayilo' ) );
		}
		if ( ! offerStep.offer?.id && ! offerStep.offer?.type ) {
			throw new Error( __( 'This offer is not available. Please try again.', 'stayilo' ) );
		}

		const data = await acceptPortalOffer( subscriptionId, {
			offerId: offerStep.offer?.id || '',
			...choices,
		} );

		setAppliedResult( data );
		await onKept?.( {
			applied: data?.applied,
			subscription: data?.subscription,
		} );
		setStep( 'active' );
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

		if ( actionId === 'cancel-anyway' ) {
			const offers = listOffersForReasons( selectedOptionIds );
			const nextIndex = offerIndex + 1;
			if ( nextIndex < offers.length ) {
				setOfferIndex( nextIndex );
				setStep( 'offer' );
				return;
			}
			await completeCancel();
			return;
		}

		if ( actionId === 'keep' ) {
			if ( submitting ) {
				return;
			}
			if ( offerNeedsCustomerChoice( offerStep.offer ) ) {
				const next = buildOfferConfigureStep(
					offerStep.offer,
					subscription
				);
				if ( ! next.options.length ) {
					window.alert(
						next.description ||
							__( 'This offer can’t be applied to your subscription right now.', 'stayilo' )
					);
					return;
				}
				setStep( 'configure' );
				return;
			}
			setSubmitting( true );
			try {
				await acceptCurrentOffer();
			} catch ( err ) {
				window.alert( err?.message || __( 'Could not accept offer', 'stayilo' ) );
			} finally {
				setSubmitting( false );
			}
			return;
		}

		if ( actionId === 'apply-choice' ) {
			if ( submitting || ! selectedConfigure?.value ) {
				return;
			}
			setSubmitting( true );
			try {
				await acceptCurrentOffer( selectedConfigure.value );
			} catch ( err ) {
				window.alert( err?.message || __( 'Could not accept offer', 'stayilo' ) );
			} finally {
				setSubmitting( false );
			}
			return;
		}

		if ( actionId === 'back-to-offer' ) {
			setStep( 'offer' );
			return;
		}

		if ( actionId === 'continue' ) {
			if ( ! hasValidReason || submitting ) {
				return;
			}
			await goToOfferOrCancel();
		}
	};

	const actions = (() => {
		if ( step === 'configure' ) {
			return [
				{
					label: __( 'Cancel', 'stayilo' ),
					variant: 'secondary',
					disabled: submitting,
					onClick: () => handleAction( 'back-to-offer' ),
				},
				{
					label: configureStep.confirmLabel || __( 'Apply offer', 'stayilo' ),
					variant: 'success',
					disabled: submitting || ! selectedConfigure,
					loading: submitting,
					onClick: () => handleAction( 'apply-choice' ),
				},
			];
		}

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
			loading:
				submitting &&
				( action.id === 'continue' ||
					action.id === 'keep' ||
					action.id === 'cancel-anyway' ),
			onClick: () => handleAction( action.id ),
		} ) );
	} )();

	return (
		<PortalPopup
			open={ open }
			onClose={ handleClose }
			stepKey={ `${ step }-${ offerIndex }` }
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
			options={
				classicReasons
					? []
					: step === 'configure'
						? configureStep.options.map( ( option ) => ( {
								id: option.id,
								label: option.label,
						  } ) )
						: config.options ?? []
			}
			selectedOptionIds={
				step === 'configure' ? configureChoiceIds : selectedOptionIds
			}
			onOptionChange={
				step === 'configure'
					? setConfigureChoiceIds
					: ( ids ) => {
							setSelectedOptionIds( ids );
							if ( ! ids.some( ( id ) => isFreeTextReasonId( id ) ) ) {
								setOtherReason( '' );
							}
					  }
			}
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
												<span className={`block ${isClassic ? 'h-full w-full' : 'h-2.5 w-2.5'}  rounded-full bg-[#007943]`} />
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
