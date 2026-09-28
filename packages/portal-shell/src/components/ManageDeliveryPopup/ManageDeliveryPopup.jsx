import { useEffect, useMemo, useRef, useState } from 'react';
import { ReactComponent as DateConfirmIcon } from '@stayilo/design-system/assets/svg/date_confirm.svg';
import { ReactComponent as SkipForwardIcon } from '@stayilo/design-system/assets/svg/action-skip-delivery.svg';
import { PortalPopup } from '../PortalPopup.jsx';
import { CancelPackageIcon, SuccessCheckIcon } from '../PortalPopupIcons.jsx';
import {
	MANAGE_DELIVERY_ESTIMATE,
	SKIP_DELIVERY_WINDOW,
} from '../../data/popupContent.js';
import { useTemplateRecipe } from '../../templates/TemplateProvider.jsx';
import {
	buildRescheduleDateRange,
	findDateIndex,
	formatDeliverySkipLabel,
	formatEditUntilLabel,
	formatShortDeliveryDate,
	formatWeekdayLong,
	gmtToDeliveryFields,
	resolveCurrentDeliveryDate,
	resolveDeliveryDateParts,
	shiftDeliveryDateParts,
	todayDateId,
} from '../../utils/delivery/index.js';
import {
	earliestSelectableDeliveryDateId,
	parseDateId,
} from '../../utils/monthCalendar.js';
import { buildConfirmActions } from './confirmActions.js';
import { ManageStep } from './steps/ManageStep.jsx';
import { RescheduleStep } from './steps/RescheduleStep.jsx';
import { __, sprintf } from '@stayilo/design-system/i18n';

/**
 * Per-step description classes. Empty keeps `.portal-popup__description`.
 * Override any step here, or pass `descriptionClassName` as a string / map.
 */
const STEP_DESCRIPTION_CLASSNAME = {
	manage: '',
	reschedule: '',
	'skip-confirm': '',
	confirm: '',
	success: '',
	'success-skip': '',
	error: '',
};

/**
 * @param {string} step
 * @param {string|Record<string, string>} [override]
 * @returns {string}
 */
function resolveDescriptionClassName( step, override ) {
	if ( override && typeof override === 'object' ) {
		return (
			override[ step ] ??
			override.default ??
			STEP_DESCRIPTION_CLASSNAME[ step ] ??
			''
		);
	}
	if ( typeof override === 'string' && override ) {
		return override;
	}
	return STEP_DESCRIPTION_CLASSNAME[ step ] ?? '';
}

function withClassicActionClass( actions, isClassic ) {
	if ( ! isClassic ) {
		return actions;
	}
	return actions.map( ( action ) => ( {
		...action,
		className: [
			action.className,
			action.variant === 'secondary'
				? 'portal-popup__action--classic-secondary'
				: 'portal-popup__action--classic-primary',
		]
			.filter( Boolean )
			.join( ' ' ),
	} ) );
}

/**
 * Manage delivery multi-step popup.
 *
 * manage → reschedule → confirm → success | error
 * manage → skip-confirm → success-skip | error
 *
 * Dates before today are locked. Moving an order later does not
 * lock earlier upcoming days.
 *
 * @param {object} props
 * @param {boolean} props.open
 * @param {() => void} props.onClose
 * @param {string} [props.estimateLabel] - Fallback when no current date is known.
 * @param {Array<{ id: string, weekday: string, day: number|string, month: string }>} [props.dates]
 * @param {string} [props.currentDeliveryDateId] - Scheduled delivery id within `dates`.
 * @param {string} [props.skipDeliveryLabel] - Fallback skip copy when no current date is known.
 * @param {'manage'|'reschedule'|'confirm'|'skip-confirm'|'success'|'success-skip'|'error'} [props.initialStep='manage']
 * @param {() => void} [props.onSkip]
 * @param {() => void} [props.onChangeBoxSize]
 * @param {(date: object) => void|Promise<void>} [props.onRescheduleConfirm]
 * @param {boolean} [props.allowReschedule=true]
 * @param {boolean} [props.allowSkip=true]
 * @param {boolean} [props.allowChangeBoxSize=true]
 * @param {string|Record<string, string>} [props.descriptionClassName] - String applies to every step. Object keys: `manage`, `reschedule`, `skip-confirm`, `confirm`, `success`, `success-skip`, `error`. Omit to use `STEP_DESCRIPTION_CLASSNAME`.
 */
export function ManageDeliveryPopup( {
	open,
	onClose,
	estimateLabel = MANAGE_DELIVERY_ESTIMATE,
	skipDeliveryLabel = SKIP_DELIVERY_WINDOW,
	dates: datesProp,
	currentDeliveryDateId = todayDateId(),
	initialStep = 'manage',
	onSkip,
	onChangeBoxSize,
	onRescheduleConfirm,
	allowReschedule = true,
	allowSkip = true,
	allowChangeBoxSize = true,
	descriptionClassName = '',
} ) {
	const { id: templateId } = useTemplateRecipe();
	const isClassic = templateId === 'classic';
	/** Persists across open/close until parent passes a new currentDeliveryDateId. */
	const [ savedDeliveryDateId, setSavedDeliveryDateId ] = useState(
		() => currentDeliveryDateId || ''
	);
	const [ step, setStep ] = useState( initialStep );
	const [ selectedDateId, setSelectedDateId ] = useState(
		() => currentDeliveryDateId || ''
	);
	const [ startIndex, setStartIndex ] = useState( 0 );
	/** Date shown on success steps — captured at confirm so skip +7 is stable. */
	const [ successDate, setSuccessDate ] = useState( null );
	const [ errorMessage, setErrorMessage ] = useState( '' );
	const [ submitting, setSubmitting ] = useState( false );

	const carouselAnchorId = useMemo( () => {
		const current = parseDateId( currentDeliveryDateId );
		const saved = parseDateId( savedDeliveryDateId );
		if ( current && saved ) {
			return saved > current ? savedDeliveryDateId : currentDeliveryDateId;
		}
		return currentDeliveryDateId || savedDeliveryDateId || undefined;
	}, [ currentDeliveryDateId, savedDeliveryDateId ] );

	const carouselDates = useMemo( () => {
		if ( datesProp?.length ) {
			return datesProp;
		}
		return buildRescheduleDateRange( carouselAnchorId );
	}, [ datesProp, carouselAnchorId ] );

	const propCurrentDelivery = useMemo(
		() => resolveCurrentDeliveryDate( carouselDates, currentDeliveryDateId ),
		[ carouselDates, currentDeliveryDateId ]
	);
	const propCurrentDeliveryId = propCurrentDelivery?.id ?? carouselDates[ 0 ]?.id;

	useEffect( () => {
		setSavedDeliveryDateId( propCurrentDeliveryId );
	}, [ propCurrentDeliveryId ] );

	const wasOpenRef = useRef( false );
	useEffect( () => {
		const justOpened = open && ! wasOpenRef.current;
		wasOpenRef.current = open;
		if ( ! justOpened ) {
			return;
		}
		// Reset only on open — not when confirm updates delivery / carousel dates,
		// or the success step is wiped before it can show.
		setStep( initialStep );
		setSelectedDateId( savedDeliveryDateId );
		setStartIndex( findDateIndex( carouselDates, savedDeliveryDateId ) );
		setSuccessDate( null );
		setErrorMessage( '' );
		setSubmitting( false );
		// eslint-disable-next-line react-hooks/exhaustive-deps -- open transition only
	}, [ open, initialStep ] );

	const savedDeliveryDate = useMemo(
		() => resolveCurrentDeliveryDate( carouselDates, savedDeliveryDateId ),
		[ carouselDates, savedDeliveryDateId ]
	);

	const selectedDate = useMemo(
		() =>
			carouselDates.find( ( item ) => item.id === selectedDateId ) ??
			resolveCurrentDeliveryDate( carouselDates, selectedDateId ) ??
			savedDeliveryDate ??
			carouselDates[ 0 ],
		[ carouselDates, selectedDateId, savedDeliveryDate ]
	);

	const nextAfterSkip = useMemo(
		() => shiftDeliveryDateParts( savedDeliveryDate ?? carouselDates[ 0 ], 7 ),
		[ savedDeliveryDate, carouselDates ]
	);

	const displaySuccessDate = successDate ?? (
		step === 'success-skip' ? nextAfterSkip : selectedDate
	);

	const liveSkipLabel =
		formatDeliverySkipLabel( savedDeliveryDate ) || skipDeliveryLabel;

	const showError = ( err, fallback ) => {
		setErrorMessage( err?.message || fallback );
		setStep( 'error' );
	};

	const dateFromApiResult = ( result, fallbackDate ) => {
		const fromGmt = result?.next_payment_gmt
			? gmtToDeliveryFields( result.next_payment_gmt )
			: null;
		const dateId = fromGmt?.dateId || result?.dateId || '';
		if ( dateId ) {
			const fromCarousel = carouselDates.find( ( row ) => row.id === dateId );
			if ( fromCarousel ) {
				return fromCarousel;
			}
			const parts = resolveDeliveryDateParts( dateId );
			if ( parts ) {
				return parts;
			}
		}
		return fallbackDate;
	};

	const isClassicConfirmShell =
		isClassic &&
		( step === 'skip-confirm' ||
			step === 'success-skip' ||
			step === 'confirm' ||
			step === 'success' ||
			step === 'error' );

	let icon;
	let title;
	let description;
	let contentClassName = '';
	let overlayClassName = '';
	let actions = [];
	let children = null;

	if ( step === 'error' ) {
		icon = <CancelPackageIcon />;
		title = "Couldn't update order";
		description = errorMessage || __( 'Something went wrong. Please try again.', 'stayilo' );
		actions = withClassicActionClass(
			[
				{
					label: __( 'Close', 'stayilo' ),
					variant: 'secondary',
					showIcon: false,
					onClick: onClose,
				},
				{
					label: __( 'Try again', 'stayilo' ),
					variant: 'success',
					onClick: () => {
						setErrorMessage( '' );
						setStep(
							initialStep === 'skip-confirm'
								? 'skip-confirm'
								: 'reschedule'
						);
					},
				},
			],
			isClassic
		);
	} else if ( step === 'manage' ) {
		title = __( 'What would you like to do?', 'stayilo' );
		description = (
			<>
				{ __( 'Manage your upcoming order preferences below.', 'stayilo' ) }
			</>
		);
		contentClassName = 'portal-popup--wide';
		children = (
			<ManageStep
				allowReschedule={ allowReschedule }
				allowSkip={ allowSkip }
				allowChangeBoxSize={ allowChangeBoxSize }
				onReschedule={
					allowReschedule
						? () => {
								setStartIndex(
									findDateIndex( carouselDates, savedDeliveryDateId )
								);
								setSelectedDateId( savedDeliveryDateId );
								setStep( 'reschedule' );
						  }
						: undefined
				}
				onSkip={ allowSkip ? () => setStep( 'skip-confirm' ) : undefined }
				onChangeBoxSize={
					allowChangeBoxSize
						? () => {
								onChangeBoxSize?.();
								onClose?.();
						  }
						: undefined
				}
			/>
		);
	} else if ( step === 'reschedule' ) {
		title = __( 'Would you like to reschedule your order days?', 'stayilo' );
		description = 'Available order dates';
		contentClassName = 'portal-popup--wide';
		children = (
			<RescheduleStep
				dates={ carouselDates }
				initialDateId={ selectedDateId }
				minDateId={ earliestSelectableDeliveryDateId() }
				startIndex={ startIndex }
				onStartIndexChange={ setStartIndex }
				onCancel={ () => onClose?.() }
				onNext={ ( dateId ) => {
					setSelectedDateId( dateId );
					setStep( 'confirm' );
				} }
			/>
		);
	} else if ( step === 'skip-confirm' ) {
		icon = isClassic ? <SkipForwardIcon aria-hidden="true" /> : <DateConfirmIcon aria-hidden="true" />;
		title = __( 'Skip your order', 'stayilo' );
		description = sprintf( __( "This week's order is set to %s", 'stayilo' ), liveSkipLabel );
		{
			const skipConfirmActions = buildConfirmActions( {
				onBack: () =>
					initialStep === 'skip-confirm'
						? onClose?.()
						: setStep( 'manage' ),
				confirmLoading: submitting,
				loadingLabel: __( 'Skipping…', 'stayilo' ),
				onConfirm: async () => {
					if ( submitting ) {
						return;
					}
					if ( typeof onSkip !== 'function' ) {
						showError(
							new Error( __( 'Skip order is not available.', 'stayilo' ) ),
							'Could not skip order'
						);
						return;
					}
					setSubmitting( true );
					try {
						const result = await onSkip();
						const nextDate = dateFromApiResult( result, null );
						if ( ! nextDate?.id ) {
							throw new Error( __( 'Skip did not return a new order date.', 'stayilo' ) );
						}
						setSavedDeliveryDateId( nextDate.id );
						setSelectedDateId( nextDate.id );
						setSuccessDate( nextDate );
						setStep( 'success-skip' );
					} catch ( err ) {
						showError( err, 'Could not skip order' );
					} finally {
						setSubmitting( false );
					}
				},
			} );
			// Classic: Confirm left, Back right (matches other Classic confirm popups).
			actions = withClassicActionClass(
				isClassic
					? [ ...skipConfirmActions ].reverse()
					: skipConfirmActions,
				isClassic
			);
		}
	} else if ( step === 'confirm' ) {
		icon = isClassic ? <SkipForwardIcon aria-hidden="true" /> : <DateConfirmIcon aria-hidden="true" />;
		title = sprintf(
			__( 'This week’s order is set to %s', 'stayilo' ),
			formatDeliverySkipLabel( savedDeliveryDate ) || formatShortDeliveryDate( savedDeliveryDate )
		);
		description = (
			<>
				{ __( 'Would you like to change this order to', 'stayilo' ) }{ ' ' }
				<strong>{ formatWeekdayLong( selectedDate ) }</strong>?
			</>
		);
		actions = withClassicActionClass(
			buildConfirmActions( {
				onBack: () => setStep( 'reschedule' ),
				confirmLoading: submitting,
				loadingLabel: __( 'Updating…', 'stayilo' ),
				onConfirm: async () => {
					if ( submitting ) {
						return;
					}
					if ( typeof onRescheduleConfirm !== 'function' ) {
						showError(
							new Error( __( 'Change order date is not available.', 'stayilo' ) ),
							'Could not change order date'
						);
						return;
					}
					setSubmitting( true );
					try {
						const result = await onRescheduleConfirm( selectedDate );
						const nextDate = dateFromApiResult( result, null );
						if ( ! nextDate?.id ) {
							throw new Error( __( 'Order date was not updated.', 'stayilo' ) );
						}
						setSavedDeliveryDateId( nextDate.id );
						setSelectedDateId( nextDate.id );
						setSuccessDate( nextDate );
						setStep( 'success' );
					} catch ( err ) {
						showError( err, 'Could not change order date' );
					} finally {
						setSubmitting( false );
					}
				},
			} ),
			isClassic
		);
	} else if ( step === 'success-skip' && isClassic ) {
		icon = (
			<SkipForwardIcon
				width={ 64 }
				height={ 64 }
				aria-hidden="true"
				className="portal-popup__skip-icon"
			/>
		);
		title = __( 'Delivery skipped', 'stayilo' );
		description = sprintf(
			__( "You'll now receive your next box on %1$s. You can still make changes until %2$s.", 'stayilo' ),
			formatShortDeliveryDate( displaySuccessDate ),
			formatEditUntilLabel( displaySuccessDate )
		);
		actions = [
			{
				label: __( 'Back to my plan', 'stayilo' ),
				variant: 'primary',
				onClick: onClose,
				className: 'portal-popup__action--classic-primary',
			},
		];
	} else {
		const isSkip = step === 'success-skip';
		icon = <SuccessCheckIcon />;
		title = isSkip ? __( 'We have skipped your order', 'stayilo' ) : __( 'Success!', 'stayilo' );
		description = (
			<>
				Now you receive an order on{ ' ' }
				<strong>{ formatShortDeliveryDate( displaySuccessDate ) }</strong>. You can still
				edit your order until{ ' ' }
				<strong>{ formatEditUntilLabel( displaySuccessDate ) }</strong>.
			</>
		);
		if ( isClassic && step === 'success' ) {
			actions = [
				{
					label: __( 'Back to my plan', 'stayilo' ),
					variant: 'primary',
					onClick: onClose,
					className: 'portal-popup__action--classic-primary',
				},
			];
		}
	}

	if ( isClassicConfirmShell ) {
		overlayClassName = 'portal-popup-overlay--reactivate';
		contentClassName = [ contentClassName, 'portal-popup--reactivate' ]
			.filter( Boolean )
			.join( ' ' );
	}

	return (
		<PortalPopup
			open={ open }
			onClose={ submitting ? undefined : onClose }
			stepKey={ step }
			icon={ icon }
			title={ title }
			description={ description }
			descriptionClassName={ resolveDescriptionClassName(
				step,
				descriptionClassName
			) }
			className={ overlayClassName }
			contentClassName={ contentClassName }
			actions={ actions }
		>
			{ children }
		</PortalPopup>
	);
}
