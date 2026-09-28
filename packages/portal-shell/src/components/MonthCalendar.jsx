import { useEffect, useMemo } from 'react';
import { ReactComponent as NavArrowRightIcon } from '@stayilo/design-system/assets/svg/nav-arrow-right.svg';
import {
	WEEKDAY_HEADERS,
	earliestSelectableDeliveryDateId,
	formatMonthTitle,
	getMonthGrid,
	parseDateId,
	toDateId,
} from '../utils/monthCalendar.js';
import { ensureCalendarStyles } from '../styles/ensureCalendarStyles.js';
import { __ } from '@stayilo/design-system/i18n';

/**
 * Resolve the earliest selectable YYYY-MM-DD.
 *
 * @param {string|Date|number|null|undefined} minDate
 * @returns {string}
 */
function resolveFloorId( minDate ) {
	const earliestId = earliestSelectableDeliveryDateId();
	const parsed = parseDateId( minDate );
	if ( ! parsed ) {
		return earliestId;
	}
	const overrideId = toDateId( parsed );
	return overrideId > earliestId ? overrideId : earliestId;
}


export function MonthCalendar( {
	year,
	monthIndex,
	onMonthChange,
	selectedDateId = '',
	onSelect,
	minDate,
	className = '',
	weekdayLabels = WEEKDAY_HEADERS,
	theme = { color: 'green' },
} ) {
	const accent = theme.color || 'green';
	const floorId = useMemo( () => resolveFloorId( minDate ), [ minDate ] );
	const floorDate = useMemo( () => parseDateId( floorId ), [ floorId ] );
	const weekdayHeaders =
		Array.isArray( weekdayLabels ) && weekdayLabels.length === 7
			? weekdayLabels
			: WEEKDAY_HEADERS;
	const cells = getMonthGrid( year, monthIndex );
	const canGoPrev = ( () => {
		const prevMonthEnd = new Date( year, monthIndex, 0 );
		return floorDate ? prevMonthEnd >= floorDate : true;
	} )();

	useEffect( () => {
		ensureCalendarStyles();
	}, [] );

	const goPrev = () => {
		if ( ! canGoPrev ) {
			return;
		}
		if ( monthIndex === 0 ) {
			onMonthChange?.( { year: year - 1, monthIndex: 11 } );
			return;
		}
		onMonthChange?.( { year, monthIndex: monthIndex - 1 } );
	};

	const goNext = () => {
		if ( monthIndex === 11 ) {
			onMonthChange?.( { year: year + 1, monthIndex: 0 } );
			return;
		}
		onMonthChange?.( { year, monthIndex: monthIndex + 1 } );
	};

	return (
		<div
			className={ [ 'portal-month-calendar', className ]
				.filter( Boolean )
				.join( ' ' ) }
			data-accent={ accent }
			data-min-date={ floorId }
		>
			<div className="portal-month-calendar__header">
				<button
					type="button"
					className="portal-month-calendar__nav"
					aria-label={ __( 'Previous month', 'stayilo' ) }
					disabled={ ! canGoPrev }
					onClick={ goPrev }
				>
					<NavArrowRightIcon
						width={ 24 }
						height={ 24 }
						className="rotate-180"
						aria-hidden="true"
					/>
				</button>
				<p className="portal-month-calendar__title">
					{ formatMonthTitle( year, monthIndex ) }
				</p>
				<button
					type="button"
					className="portal-month-calendar__nav"
					aria-label={ __( 'Next month', 'stayilo' ) }
					onClick={ goNext }
				>
					<NavArrowRightIcon
						width={ 24 }
						height={ 24 }
						className=""
						aria-hidden="true"
					/>
				</button>
			</div>

			<div className="portal-month-calendar__weekdays" aria-hidden="true">
				{ weekdayHeaders.map( ( label, index ) => (
					<span
						key={ `${ label }-${ index }` }
						className="portal-month-calendar__weekday"
					>
						{ label }
					</span>
				) ) }
			</div>

			<div
				className="portal-month-calendar__grid"
				role="grid"
				aria-label={ formatMonthTitle( year, monthIndex ) }
			>
				{ cells.map( ( cell ) => {
					// String compare on YYYY-MM-DD — avoids Date/timezone pitfalls.
					const isBeforeFloor = cell.id < floorId;
					const isOutside = ! cell.inMonth;
					const blocked = isBeforeFloor || isOutside;
					const isSelected =
						! blocked && cell.id === selectedDateId;
					const isToday =
						! blocked && cell.id === toDateId( new Date() );

					const cellClassName = [
						'portal-month-calendar__cell',
						blocked ? 'portal-month-calendar__cell--muted' : '',
						isSelected
							? accent === 'black'
								? 'portal-month-calendar__cell--selected-black'
								: 'portal-month-calendar__cell--selected'
							: '',
						isToday
							? accent === 'black'
								? 'portal-month-calendar__cell--today-black'
								: 'portal-month-calendar__cell--today'
							: '',
					]
						.filter( Boolean )
						.join( ' ' );

					const ariaLabel = cell.date.toLocaleDateString( ( typeof document !== 'undefined' && document.documentElement.lang ) || undefined, {
						weekday: 'long',
						day: 'numeric',
						month: 'long',
						year: 'numeric',
					} );

					// Blocked days are <span>{ __( ', not', 'stayilo' ) } <button> — cannot be focused or clicked.
					if ( blocked ) {
						return (
							<span
								key={ cell.key }
								role="gridcell"
								aria-label={ ariaLabel }
								aria-disabled="true"
								className={ cellClassName }
							>
								{ cell.day }
							</span>
						);
					}

					return (
						<button
							key={ cell.key }
							type="button"
							role="gridcell"
							aria-label={ ariaLabel }
							aria-selected={ isSelected }
							className={ cellClassName }
							onClick={ () => onSelect?.( cell.id ) }
						>
							{ cell.day }
						</button>
					);
				} ) }
			</div>
		</div>
	);
}
