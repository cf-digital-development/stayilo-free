import { useEffect, useMemo, useState } from 'react';
import { toDateParts } from '../utils/validation/deliveryDates.js';
import {
	earliestSelectableDeliveryDate,
	formatDeliveryBannerDate,
	parseDateId,
	toDateId,
} from '../utils/monthCalendar.js';
import { MonthCalendar } from './MonthCalendar.jsx';
import { PortalPopup } from './PortalPopup.jsx';
import { ensurePortalPopupStyles } from '../styles/ensurePortalPopupStyles.js';
import {
	readTemplateId,
	useTemplateRecipe,
} from '../templates/TemplateProvider.jsx';
import { getRecipe } from '../templates/recipes.js';
import { __ } from '@stayilo/design-system/i18n';

ensurePortalPopupStyles();

function formatClassicSelectedDate( dateId ) {
	const date = parseDateId( dateId );
	if ( ! date ) {
		return '';
	}
	return date.toLocaleDateString( ( typeof document !== 'undefined' && document.documentElement.lang ) || undefined, {
		weekday: 'short',
		month: 'short',
		day: 'numeric',
	} );
}

export function ChangeDatePopup( {
	open,
	onClose,
	selectedDateId = '',
	minDate,
	title = 'Order Date',
	description = 'Select a date to re-schedule your orders',
	onConfirm,
	submitting = false,
	className = '',
	descriptionClassName = '',
	theme = { color: 'green', applyLabel: 'Apply' },
} ) {
	const { id } = useTemplateRecipe();
	const isClassic =
		id === 'classic' || getRecipe( readTemplateId() ).id === 'classic';
	const accent = theme.color || 'green';
	const applyLabel = isClassic
		? __( 'Confirm new date', 'stayilo' )
		: theme.applyLabel || __( 'Apply', 'stayilo' );
	const floor = useMemo( () => {
		const earliest = earliestSelectableDeliveryDate();
		const override = parseDateId( minDate );
		return override && override > earliest ? override : earliest;
	}, [ minDate ] );
	const initialSelected = useMemo( () => {
		const parsed = parseDateId( selectedDateId );
		if ( parsed && parsed >= floor ) {
			return toDateId( parsed );
		}
		return toDateId( floor );
	}, [ selectedDateId, floor ] );

	const [ draftId, setDraftId ] = useState( initialSelected );
	const [ view, setView ] = useState( () => {
		const seed = parseDateId( initialSelected ) || floor;
		return { year: seed.getFullYear(), monthIndex: seed.getMonth() };
	} );

	useEffect( () => {
		if ( ! open ) {
			return;
		}
		setDraftId( initialSelected );
		const seed = parseDateId( initialSelected ) || floor;
		setView( {
			year: seed.getFullYear(),
			monthIndex: seed.getMonth(),
		} );
	}, [ open, initialSelected, floor ] );

	const canApply = Boolean( draftId ) && ! submitting;
	const selectedLabel = formatClassicSelectedDate( draftId );

	const handleConfirm = async () => {
		if ( submitting ) {
			return;
		}
		const date = parseDateId( draftId );
		if ( ! date || date < floor ) {
			return;
		}
		const parts = toDateParts( date );
		await onConfirm?.( {
			...parts,
			label: formatDeliveryBannerDate( date ),
		} );
	};

	const applyAction = {
		label: submitting ? __( 'Updating…', 'stayilo' ) : applyLabel,
		variant: isClassic
			? 'primary'
			: accent === 'black'
				? 'primary'
				: 'success',
		disabled: ! canApply,
		loading: submitting,
		onClick: handleConfirm,
		className:
			! isClassic && accent === 'black'
				? 'portal-popup__action--calendar-apply-black'
				: 'portal-popup__action--calendar-apply',
	};
	const cancelAction = {
		label: __( 'Cancel', 'stayilo' ),
		variant: 'secondary',
		showIcon: false,
		onClick: onClose,
		disabled: submitting,
		className: 'portal-popup__action--calendar-cancel',
	};

	return (
		<PortalPopup
			open={ open }
			onClose={ submitting ? undefined : onClose }
			title={ isClassic ? __( 'Change your date', 'stayilo' ) : title }
			description={ description }
			descriptionClassName={ descriptionClassName }
			className={ [
				isClassic
					? 'portal-popup-overlay--calendar'
					: 'portal-popup-overlay--center',
				className,
			]
				.filter( Boolean )
				.join( ' ' ) }
			contentClassName="portal-popup--calendar"
			actions={
				isClassic
					? [ applyAction, cancelAction ]
					: [ cancelAction, applyAction ]
			}
		>
			{ isClassic ? (
				<div className="portal-calendar-card">
					<p className="portal-calendar-card__label">{ __( 'Select date', 'stayilo' ) }</p>
					<p className="portal-calendar-card__date">{ selectedLabel }</p>
					<MonthCalendar
						year={ view.year }
						monthIndex={ view.monthIndex }
						onMonthChange={ setView }
						selectedDateId={ draftId }
						onSelect={ submitting ? undefined : setDraftId }
						minDate={ toDateId( floor ) }
						weekdayLabels={ [ 'S', 'M', 'T', 'W', 'T', 'F', 'S' ] }
						theme={ { color: accent } }
					/>
				</div>
			) : (
				<MonthCalendar
					year={ view.year }
					monthIndex={ view.monthIndex }
					onMonthChange={ setView }
					selectedDateId={ draftId }
					onSelect={ submitting ? undefined : setDraftId }
					minDate={ toDateId( floor ) }
					theme={ { color: accent } }
				/>
			) }
		</PortalPopup>
	);
}
